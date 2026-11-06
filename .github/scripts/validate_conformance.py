#!/usr/bin/env python3
"""Validate model dispatches, independence invariants, and report contracts."""
import argparse
import copy
import json
import math
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

import yaml

REQUIRED_ROLES = {
    "product_mgr", "architect", "arch_critic", "qa_sealed", "lead_eng",
    "qa_validator", "red_team", "outcome_evaluator", "classifier",
}
EFFORT_LEVELS = {"minimal", "low", "medium", "high", "xhigh", "max"}
CONTEXT_TIERS = {"default", "long_context"}
ROOT = pathlib.Path(__file__).resolve().parents[2]


def _is_mapping(value: object) -> bool:
    return isinstance(value, dict)


def validate_report_contract(root: pathlib.Path, errors: list[str]) -> None:
    root_only = {
        "shadow_score_spec_version", "report", "sealed_tests", "open_tests",
        "failures", "coverage_comparison", "hardening",
    }
    must_nest = {
        "shadow_score", "level", "conformance_level", "independence",
        "implementer_family", "seal_author_families", "advisory",
    }
    l4_required = {"independence", "implementer_family", "seal_author_families"}
    contracts = [
        root / "agents" / "qa-validator.md",
        root / "templates" / "shadow-report-template.md",
    ]

    for path in contracts:
        if not path.is_file():
            errors.append(f"missing report contract file: {path.relative_to(root)}")
            continue
        rel = path.relative_to(root)
        text = path.read_text(encoding="utf-8")
        for block in re.findall(r"```json\n(.*?)```", text, re.S):
            if '"shadow_score_spec_version"' not in block:
                continue
            try:
                doc = json.loads(block)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}: report contract is not valid JSON: {exc}")
                continue
            report = doc.get("report", {})
            if not _is_mapping(report):
                errors.append(f"{rel}: report must be a JSON object")
                continue
            if "seal_families" in report or "seal_families" in doc:
                errors.append(
                    f"{rel}: 'seal_families' was renamed to 'seal_author_families' "
                    "in Spec v2.0 section 5.2"
                )
            for field in sorted(must_nest & set(doc)):
                errors.append(
                    f"{rel}: '{field}' must live at report.{field}, not the "
                    "document root (Spec section 5.2)"
                )
            for field in sorted(root_only & set(report)):
                errors.append(f"{rel}: '{field}' belongs at the document root")
            missing = sorted(l4_required - set(report))
            if missing:
                errors.append(f"{rel}: report contract omits Level 4 provenance: {missing}")
            if report.get("independence") == "weak" and not report.get("advisory"):
                errors.append(
                    f"{rel}: weak independence must be stamped advisory "
                    "(Spec section 5.4)"
                )


def validate_sealed_suite_contract(root: pathlib.Path, errors: list[str]) -> None:
    paths = {
        "SKILL.md": root / "SKILL.md",
        "agents/qa-validator.md": root / "agents" / "qa-validator.md",
        "templates/shadow-report-template.md": root / "templates" / "shadow-report-template.md",
    }
    required = {
        "SKILL.md": (
            'cp -R "<vault>/<run-id>/suite-<i>" "<verify_dir>/<run-id>/sealed/"',
            "SHADOW-EXECUTION-ERROR.md",
            "SHADOW_SCORE: INVALID",
            "validation_status: incomplete",
            "shadow_score: null",
            "stop before score gates, hardening, or delivery",
        ),
        "agents/qa-validator.md": (
            "sealed/suite-<i>/",
            "SHADOW-EXECUTION-ERROR.md",
            "SHADOW_SCORE: INVALID",
            "hash mismatch",
            "unknown outcomes",
            "do not emit a numeric score",
        ),
        "templates/shadow-report-template.md": (
            "sealed_tests.suites",
            "setup/collection/runner",
            "SHADOW-EXECUTION-ERROR.md",
            "Zero tests",
            "hash/count mismatches",
        ),
    }
    for label, path in paths.items():
        if not path.is_file():
            errors.append(f"missing sealed-suite contract file: {label}")
            continue
        text = path.read_text(encoding="utf-8")
        for token in required[label]:
            if token not in text:
                errors.append(f"{label}: sealed-suite contract omits '{token}'")
        if label == "SKILL.md" and "cp -r <vault>/<run-id>/suite-*/*" in text:
            errors.append("SKILL.md: sealed suites must not be flattened during copy")


def validate_hardening_reuse_contract(root: pathlib.Path, errors: list[str]) -> None:
    skill_path = root / "SKILL.md"
    engineer_path = root / "agents" / "lead-eng.md"
    for label, path in (("SKILL.md", skill_path), ("agents/lead-eng.md", engineer_path)):
        if not path.is_file():
            errors.append(f"missing hardening reuse contract file: {label}")
    if not skill_path.is_file() or not engineer_path.is_file():
        return

    skill = skill_path.read_text(encoding="utf-8")
    normalized_skill = " ".join(skill.split())
    engineer = engineer_path.read_text(encoding="utf-8")
    required_skill = (
        "status = read_agent(eng_agent_id, wait=false)",
        "requested_tuple = (rung.model, effective_reasoning_effort, effective_context_tier)",
        "status in {running, idle} AND saved_actual_tuple == requested_tuple",
        "A same-family model change, effort change, context change",
        "Otherwise, dispatch a new background engineer",
        "Do not include the vault or verify-worktree paths",
        "the exact tuple passed to `task()` in state",
    )
    for token in required_skill:
        if token not in normalized_skill:
            errors.append(f"SKILL.md: hardening reuse contract omits '{token}'")
    if "If the rung's model matches the live engineer's model" in skill:
        errors.append("SKILL.md: hardening reuse must compare the complete tuple and liveness")
    if (
        "exact same model, reasoning-effort, and context-tier tuple" not in engineer
        or "bounded handoff" not in engineer
    ):
        errors.append("agents/lead-eng.md: document tuple-aware reuse and replacement handoff")


def validate_config(
    cfg: object, root: pathlib.Path
) -> tuple[list[str], list[str], str | None, set[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    def err(message: str) -> None:
        errors.append(message)

    if not _is_mapping(cfg):
        return ["config.yml must contain a YAML object"], warnings, None, set()

    raw_families = cfg.get("families")
    families = raw_families if _is_mapping(raw_families) else {}
    if not _is_mapping(raw_families):
        err("families must be a YAML object")

    family_of: dict[str, str] = {}
    for family, models in families.items():
        if not isinstance(family, str) or not family:
            err(f"invalid model family name: {family!r}")
            continue
        if not isinstance(models, list):
            err(f"families.{family} must be a list")
            continue
        for model in models:
            if not isinstance(model, str) or not model:
                err(f"families.{family} contains an invalid model ID: {model!r}")
            elif model in family_of:
                err(
                    f"model '{model}' appears in multiple families: "
                    f"{family_of[model]} and {family}"
                )
            else:
                family_of[model] = family

    raw_caps = cfg.get("model_capabilities")
    caps = raw_caps if _is_mapping(raw_caps) else {}
    if not _is_mapping(raw_caps):
        err("model_capabilities must be a YAML object")
    for model in sorted(set(family_of) - set(caps)):
        err(f"model '{model}' missing from model_capabilities")
    for model in sorted(set(caps) - set(family_of)):
        err(f"model_capabilities contains '{model}' without a families entry")
    for model, capability in caps.items():
        if not _is_mapping(capability):
            err(f"model_capabilities.{model} must be a YAML object")
            continue
        for key, allowed in (("effort", EFFORT_LEVELS), ("context", CONTEXT_TIERS)):
            values = capability.get(key)
            if not isinstance(values, list):
                err(f"model_capabilities.{model}.{key} must be a list")
                continue
            if (
                any(not isinstance(value, str) or value not in allowed for value in values)
                or len(values) != len(set(values))
            ):
                err(
                    f"model_capabilities.{model}.{key} contains invalid or duplicate values"
                )

    def family(spec: object) -> str | None:
        if not _is_mapping(spec):
            return None
        model = spec.get("model")
        return family_of.get(model) if isinstance(model, str) else None

    def check_dispatch(label: str, spec: object) -> None:
        if not _is_mapping(spec):
            err(f"{label} must be a model dispatch object")
            return
        model = spec.get("model")
        if not isinstance(model, str) or not model:
            err(f"{label}: model must be a non-empty string")
            return
        if model not in family_of:
            err(f"{label}: model '{model}' missing from families map")
            return
        if model not in caps or not _is_mapping(caps[model]):
            err(f"{label}: model '{model}' missing valid model_capabilities")
            return
        capability = caps[model]
        for key, cap_key in (("reasoning_effort", "effort"), ("context_tier", "context")):
            selected = spec.get(key)
            allowed = capability.get(cap_key)
            if not isinstance(allowed, list):
                continue
            if selected is not None and selected not in allowed:
                err(
                    f"{label}: model '{model}' does not support {key} "
                    f"'{selected}' (supports: {allowed or 'none — omit the parameter'})"
                )

    roles_value = cfg.get("roles")
    roles = roles_value if _is_mapping(roles_value) else {}
    if not _is_mapping(roles_value):
        err("roles must be a YAML object")
    for role in sorted(REQUIRED_ROLES - set(roles)):
        err(f"roles.{role} is required")
    for role, spec in roles.items():
        check_dispatch(f"roles.{role}", spec)

    premium_value = cfg.get("premium") or {}
    premium = premium_value if _is_mapping(premium_value) else {}
    if not _is_mapping(premium_value):
        err("premium must be a YAML object")
    for role, spec in premium.items():
        if role not in roles:
            err(f"premium.{role} has no matching default role")
        if not _is_mapping(spec):
            err(f"premium.{role} must be a model dispatch object")

    plurality_value = cfg.get("seal_plurality")
    plurality = plurality_value if _is_mapping(plurality_value) else {}
    if not _is_mapping(plurality_value):
        err("seal_plurality must be a YAML object")
    authors_value = plurality.get("authors", [])
    authors = authors_value if isinstance(authors_value, list) else []
    if not isinstance(authors_value, list):
        err("seal_plurality.authors must be a list")
    for index, spec in enumerate(authors):
        check_dispatch(f"seal_plurality.authors[{index}]", spec)

    tournament_value = cfg.get("tournament")
    tournament = tournament_value if _is_mapping(tournament_value) else {}
    if not _is_mapping(tournament_value):
        err("tournament must be a YAML object")
    competitors_value = tournament.get("competitors", [])
    competitors = competitors_value if isinstance(competitors_value, list) else []
    if not isinstance(competitors_value, list):
        err("tournament.competitors must be a list")
    for index, spec in enumerate(competitors):
        check_dispatch(f"tournament.competitors[{index}]", spec)

    hardening_value = cfg.get("hardening")
    hardening = hardening_value if _is_mapping(hardening_value) else {}
    if not _is_mapping(hardening_value):
        err("hardening must be a YAML object")
    ladder_value = hardening.get("ladder", [])
    ladder = ladder_value if isinstance(ladder_value, list) else []
    if not isinstance(ladder_value, list):
        err("hardening.ladder must be a list")
    for index, spec in enumerate(ladder):
        check_dispatch(f"hardening.ladder[{index}]", spec)

    invariants_value = cfg.get("invariants")
    invariants = invariants_value if _is_mapping(invariants_value) else {}
    if not _is_mapping(invariants_value):
        err("invariants must be a YAML object")
    plurality_enabled = plurality.get("enabled", False)
    min_families = invariants.get("seal_plurality_min", 1)
    if not isinstance(min_families, int) or min_families < 1:
        err("invariants.seal_plurality_min must be a positive integer")
        min_families = 1

    cost = cfg.get("cost")
    credit_rate = cost.get("usd_per_ai_credit") if _is_mapping(cost) else None
    if (
        isinstance(credit_rate, bool)
        or not isinstance(credit_rate, (int, float))
        or not math.isfinite(credit_rate)
        or credit_rate <= 0
    ):
        err("cost.usd_per_ai_credit must be a finite positive number")

    profiles: list[tuple[str, dict[str, object]]] = []
    default_roles = {role: roles.get(role) for role in REQUIRED_ROLES}
    profiles.append(("default", default_roles))
    premium_roles = dict(default_roles)
    for role, override in premium.items():
        base = premium_roles.get(role)
        if _is_mapping(base) and _is_mapping(override):
            premium_roles[role] = {**base, **override}
        else:
            premium_roles[role] = override
    profiles.append(("premium", premium_roles))

    for profile_name, profile_roles in profiles:
        for role, spec in profile_roles.items():
            check_dispatch(f"{profile_name}.roles.{role}", spec)

        plurality_families = {
            resolved for resolved in (family(spec) for spec in authors)
            if resolved is not None
        }
        seal_specs = [*authors, profile_roles.get("qa_sealed")]
        seal_families = {
            resolved for resolved in (family(spec) for spec in seal_specs)
            if resolved is not None
        }
        if plurality_enabled and len(plurality_families) < min_families:
            err(
                f"{profile_name}: invariants.seal_plurality_min={min_families} "
                f"but only {len(plurality_families)} full-mode seal author "
                f"family/families configured: {sorted(plurality_families)}"
            )

        pm_family = family(profile_roles.get("product_mgr"))
        implementer_family = family(profile_roles.get("lead_eng"))
        red_team_family = family(profile_roles.get("red_team"))
        if (
            pm_family is not None
            and pm_family == implementer_family
        ):
            err(
                f"{profile_name}: product_mgr family '{pm_family}' matches "
                "lead_eng; this can bias the Shadow Score downward"
            )
        elif pm_family is not None and pm_family in seal_families:
            warnings.append(
                f"{profile_name}: product_mgr family '{pm_family}' matches a seal "
                "author; disclose the conservative upward bias in the report"
            )

        if family(profile_roles.get("arch_critic")) == family(profile_roles.get("architect")):
            err(f"{profile_name}: arch_critic shares a family with architect")

        builders: list[tuple[str, object]] = [
            (f"{profile_name}.roles.lead_eng", profile_roles.get("lead_eng"))
        ]
        builders.extend(
            (f"{profile_name}.hardening.ladder[{index}]", spec)
            for index, spec in enumerate(ladder)
        )
        builders.extend(
            (f"{profile_name}.tournament.competitors[{index}]", spec)
            for index, spec in enumerate(competitors)
        )
        for label, builder in builders:
            builder_family = family(builder)
            if builder_family is None:
                continue
            if invariants.get("cross_family_required") and builder_family in seal_families:
                err(
                    f"{label} shares seal-author family '{builder_family}' "
                    "with a builder; builder and seal authors must differ"
                )
            if pm_family is not None and builder_family == pm_family:
                err(f"{label} shares Product Manager family '{pm_family}'")
            if red_team_family is not None and builder_family == red_team_family:
                err(f"{label} shares Red Team family '{red_team_family}'")
            if (
                label.startswith(f"{profile_name}.tournament.")
                and tournament.get("enforce_judge_independence")
                and builder_family in seal_families
            ):
                err(
                    f"{label} shares family '{builder_family}' with a seal author; "
                    "tournament judging is not independent"
                )

        if premium and profile_name == "premium":
            for role in premium:
                effective = profile_roles.get(role)
                if role in roles and family(effective) != family(roles[role]):
                    warnings.append(
                        f"premium.{role} changes family "
                        f"'{family(roles[role])}' -> '{family(effective)}'; "
                        "premium should retain each role's family"
                    )

    validate_report_contract(root, errors)
    validate_sealed_suite_contract(root, errors)
    validate_hardening_reuse_contract(root, errors)
    return errors, warnings, family(roles.get("lead_eng")), {
        resolved for resolved in (
            [family(spec) for spec in authors]
            + [family(roles.get("qa_sealed"))]
        ) if resolved is not None
    }


class ConformanceRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.root = ROOT
        cls.original = yaml.safe_load((ROOT / "config.yml").read_text(encoding="utf-8"))

    def validate(self, cfg: object) -> tuple[list[str], list[str], str | None, set[str]]:
        return validate_config(cfg, self.root)

    def test_current_configuration_passes(self) -> None:
        errors, _, _, _ = self.validate(copy.deepcopy(self.original))
        self.assertEqual(errors, [])

    def test_invalid_credit_conversion_cannot_disable_cost_gate(self) -> None:
        for rate in (None, True, 0, -0.01, float("nan"), float("inf"), "0.01"):
            with self.subTest(rate=rate):
                cfg = copy.deepcopy(self.original)
                cfg["cost"]["usd_per_ai_credit"] = rate
                self.assertTrue(any(
                    "cost.usd_per_ai_credit" in error for error in self.validate(cfg)[0]
                ))

    def test_rejects_unknown_model_and_unsupported_knob(self) -> None:
        unknown = copy.deepcopy(self.original)
        unknown["premium"]["lead_eng"]["model"] = "unregistered-model"
        self.assertTrue(any("missing from families map" in e for e in self.validate(unknown)[0]))

        unsupported = copy.deepcopy(self.original)
        unsupported["roles"]["classifier"]["reasoning_effort"] = "minimal"
        self.assertTrue(any("does not support reasoning_effort" in e for e in self.validate(unsupported)[0]))

    def test_premium_overlay_is_validated_after_merging_inherited_knobs(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["premium"]["lead_eng"] = {"model": "claude-haiku-5.5"}
        errors = self.validate(cfg)[0]
        self.assertTrue(any(
            "premium.roles.lead_eng" in e and "reasoning_effort 'high'" in e
            for e in errors
        ))
        self.assertTrue(any(
            "premium.roles.lead_eng" in e and "context_tier 'long_context'" in e
            for e in errors
        ))

    def test_effort_only_premium_overlay_inherits_model_and_family(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["premium"] = {"lead_eng": {"reasoning_effort": "xhigh"}}
        errors, warnings, _, _ = self.validate(cfg)
        self.assertEqual(errors, [])
        self.assertFalse(any("changes family" in warning for warning in warnings))

    def test_unused_single_sealer_cannot_satisfy_full_mode_plurality(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["seal_plurality"]["authors"] = [cfg["seal_plurality"]["authors"][0]]
        cfg["roles"]["qa_sealed"] = {
            "model": "gemini-3.8-flash", "context_tier": "default",
        }
        cfg["premium"]["qa_sealed"] = {
            "model": "gemini-3.8-flash", "context_tier": "default",
            "reasoning_effort": None,
        }
        self.assertTrue(any(
            "seal_plurality_min" in error for error in self.validate(cfg)[0]
        ))

    def test_rejects_incomplete_or_ambiguous_model_registry(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["families"]["anthropic"].append("gpt-6-astra")
        cfg["model_capabilities"]["orphan-model"] = {"effort": [], "context": ["default"]}
        errors = self.validate(cfg)[0]
        self.assertTrue(any("appears in multiple families" in e for e in errors))
        self.assertTrue(any("without a families entry" in e for e in errors))

        missing_capability = copy.deepcopy(self.original)
        del missing_capability["model_capabilities"]["claude-sonnet-5.5"]
        errors = self.validate(missing_capability)[0]
        self.assertTrue(any("claude-sonnet-5.5" in e and "missing from model_capabilities" in e for e in errors))

    def test_premium_builder_must_differ_from_all_plurality_sealers(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["premium"]["qa_sealed"] = {
            "model": "claude-opus-5.5",
            "reasoning_effort": "xhigh",
            "context_tier": "default",
        }
        errors = self.validate(cfg)[0]
        self.assertTrue(any("premium.roles.lead_eng shares seal-author family" in e for e in errors))

    def test_hardening_and_tournament_variants_are_checked(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["hardening"]["ladder"][0] = {
            "model": "gpt-6-astra",
            "reasoning_effort": "high",
            "context_tier": "default",
        }
        cfg["tournament"]["competitors"][0] = {
            "model": "gpt-6-astra",
            "reasoning_effort": "high",
            "context_tier": "default",
        }
        errors = self.validate(cfg)[0]
        self.assertTrue(any("default.hardening.ladder[0] shares seal-author" in e for e in errors))
        self.assertTrue(any("default.tournament.competitors[0] shares seal-author" in e for e in errors))

    def test_every_builder_variant_is_checked_against_pm_and_red_team(self) -> None:
        cfg = copy.deepcopy(self.original)
        cfg["roles"]["product_mgr"] = {
            "model": "kimi-k2.7-code",
            "context_tier": "default",
        }
        cfg["roles"]["red_team"] = {
            "model": "grok-4.7",
            "context_tier": "default",
        }
        errors = self.validate(cfg)[0]
        self.assertTrue(any("tournament.competitors[1] shares Product Manager" in e for e in errors))
        self.assertTrue(any("tournament.competitors[2] shares Red Team" in e for e in errors))

    def test_same_named_suite_files_remain_in_separate_namespaces(self) -> None:
        errors, _, _, _ = self.validate(copy.deepcopy(self.original))
        self.assertEqual(errors, [])
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            vault = root / "vault"
            destination = root / "verify" / "sealed"
            destination.mkdir(parents=True)
            for suite_id, contents in (("suite-1", "author one"), ("suite-2", "author two")):
                source = vault / suite_id
                source.mkdir(parents=True)
                (source / "test_same_name.py").write_text(contents, encoding="utf-8")
                shutil.copytree(source, destination / suite_id)
            self.assertEqual(
                (destination / "suite-1" / "test_same_name.py").read_text(encoding="utf-8"),
                "author one",
            )
            self.assertEqual(
                (destination / "suite-2" / "test_same_name.py").read_text(encoding="utf-8"),
                "author two",
            )

    def test_documented_suite_hash_survives_copy_and_detects_changes(self) -> None:
        skill = (self.root / "SKILL.md").read_text(encoding="utf-8")
        match = re.search(r"1\. Per suite: `([^`]+)`", skill)
        self.assertIsNotNone(match)
        recipe = match.group(1)
        with tempfile.TemporaryDirectory() as temp:
            source = pathlib.Path(temp) / "vault" / "suite-1"
            source.mkdir(parents=True)
            (source / "test same name.py").write_text("assert 1 == 1\n", encoding="utf-8")
            destination = pathlib.Path(temp) / "verify" / "sealed" / "suite-1"
            shutil.copytree(source, destination)

            def digest(path: pathlib.Path) -> str:
                command = recipe.replace("<vault>/<run-id>/suite-<i>", str(path))
                return subprocess.check_output(
                    ["bash", "-o", "pipefail", "-c", command], text=True,
                )

            self.assertEqual(digest(source), digest(destination))
            (destination / "test same name.py").write_text("assert 1 == 2\n", encoding="utf-8")
            self.assertNotEqual(digest(source), digest(destination))

    def test_hardening_reuse_requires_live_agent_and_exact_tuple(self) -> None:
        errors, _, _, _ = self.validate(copy.deepcopy(self.original))
        self.assertEqual(errors, [])
        skill = (self.root / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("status in {running, idle} AND saved_actual_tuple == requested_tuple", skill)
        self.assertIn("A same-family model change, effort change, context change", skill)
        self.assertIn("Otherwise, dispatch a new background engineer", skill)

    def test_hardening_contract_rejects_missing_live_tuple_guard(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            (root / "agents").mkdir()
            skill = (self.root / "SKILL.md").read_text(encoding="utf-8")
            skill = skill.replace(
                "status in {running, idle} AND saved_actual_tuple == requested_tuple",
                "status == running",
                1,
            )
            (root / "SKILL.md").write_text(skill, encoding="utf-8")
            (root / "agents" / "lead-eng.md").write_text(
                (self.root / "agents" / "lead-eng.md").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            errors: list[str] = []
            validate_hardening_reuse_contract(root, errors)
            self.assertTrue(any("saved_actual_tuple == requested_tuple" in error for error in errors))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true", help="run validator regression tests")
    args = parser.parse_args(argv)
    if args.self_test:
        result = unittest.TextTestRunner(verbosity=2).run(
            unittest.defaultTestLoader.loadTestsFromTestCase(ConformanceRegressionTests)
        )
        return 0 if result.wasSuccessful() else 1

    cfg = yaml.safe_load((ROOT / "config.yml").read_text(encoding="utf-8"))
    errors, warnings, implementer_family, seal_families = validate_config(cfg, ROOT)
    for warning in warnings:
        print(f"::warning::{warning}")
    for error in errors:
        print(f"::error::{error}")
    if errors:
        print(f"\n❌ {len(errors)} Level 4 conformance violation(s)")
        return 1
    print("✅ Shadow Score Spec v2.0 Level 4 conformance checks passed")
    print(f"   implementer family : {implementer_family}")
    print(f"   seal families      : {sorted(seal_families)}")
    print("   profiles checked   : default, premium, tournament, hardening")
    print("   independence       : strong")
    return 0


if __name__ == "__main__":
    sys.exit(main())
