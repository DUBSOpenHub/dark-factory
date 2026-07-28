#!/usr/bin/env python3
"""Validate Dark Factory config against Shadow Score Spec v2.0 Level 4 invariants.

Checks:
  1. Every dispatched model exists in families and model_capabilities.
  2. Every reasoning_effort / context_tier is supported by its model.
  3. cross_family_required: seal authors share no family with the implementer.
  4. seal_plurality_min families authoring sealed suites.
  5. tournament.enforce_judge_independence: no competitor shares a seal family.
  6. Hardening ladder rungs avoid seal-author families.
  7. product_mgr does not share a family with the implementer (bias direction).
  8. arch_critic differs in family from architect.
  9. red_team differs in family from the implementer.
 10. premium overrides preserve every independence invariant.
"""
import sys
import pathlib
import yaml

ERRORS: list[str] = []
WARNINGS: list[str] = []


def err(msg: str) -> None:
    ERRORS.append(msg)


def warn(msg: str) -> None:
    WARNINGS.append(msg)


def main() -> int:
    root = pathlib.Path(__file__).resolve().parents[2]
    cfg = yaml.safe_load((root / "config.yml").read_text(encoding="utf-8"))

    families = cfg["families"]
    caps = cfg["model_capabilities"]
    family_of = {m: f for f, models in families.items() for m in models}

    def check_dispatch(label: str, spec: dict) -> None:
        """Validate one model + effort + context triple."""
        model = spec.get("model")
        if model not in family_of:
            err(f"{label}: model '{model}' missing from families map")
            return
        if model not in caps:
            err(f"{label}: model '{model}' missing from model_capabilities")
            return
        effort = spec.get("reasoning_effort")
        allowed_effort = caps[model]["effort"]
        if effort is not None and effort not in allowed_effort:
            err(
                f"{label}: model '{model}' does not support reasoning_effort "
                f"'{effort}' (supports: {allowed_effort or 'none — omit the parameter'})"
            )
        tier = spec.get("context_tier")
        allowed_tier = caps[model]["context"]
        if tier is not None and tier not in allowed_tier:
            err(
                f"{label}: model '{model}' does not support context_tier "
                f"'{tier}' (supports: {allowed_tier})"
            )

    # --- 1 & 2: every dispatch is capability-valid -------------------------
    for role, spec in cfg["roles"].items():
        check_dispatch(f"roles.{role}", spec)
    for i, spec in enumerate(cfg["seal_plurality"]["authors"]):
        check_dispatch(f"seal_plurality.authors[{i}]", spec)
    for i, spec in enumerate(cfg["tournament"]["competitors"]):
        check_dispatch(f"tournament.competitors[{i}]", spec)
    for i, spec in enumerate(cfg["hardening"]["ladder"]):
        check_dispatch(f"hardening.ladder[{i}]", spec)
    for role, spec in (cfg.get("premium") or {}).items():
        check_dispatch(f"premium.{role}", spec)

    # --- family resolution -------------------------------------------------
    def fam(spec: dict) -> str | None:
        return family_of.get(spec.get("model"))

    impl_family = fam(cfg["roles"]["lead_eng"])
    seal_families = {fam(a) for a in cfg["seal_plurality"]["authors"]}
    seal_families.add(fam(cfg["roles"]["qa_sealed"]))
    seal_families.discard(None)

    inv = cfg["invariants"]

    # --- 3: cross-family requirement (the core Level 4 invariant) ---------
    if inv.get("cross_family_required"):
        if impl_family in seal_families:
            err(
                f"invariants.cross_family_required: implementer family "
                f"'{impl_family}' also authors sealed tests. Correlated blind "
                f"spots make the Shadow Score optimistically biased."
            )

    # --- 4: seal plurality -------------------------------------------------
    need = inv.get("seal_plurality_min", 1)
    if cfg["seal_plurality"].get("enabled") and len(seal_families) < need:
        err(
            f"invariants.seal_plurality_min={need} but only "
            f"{len(seal_families)} seal family/families configured: {sorted(seal_families)}"
        )

    # --- 5: tournament judge independence ---------------------------------
    trn = cfg["tournament"]
    if trn.get("enforce_judge_independence"):
        for i, comp in enumerate(trn["competitors"]):
            if fam(comp) in seal_families:
                err(
                    f"tournament.competitors[{i}] ({comp.get('model')}) shares family "
                    f"'{fam(comp)}' with a seal author. It would score artificially "
                    f"well, biasing model selection."
                )

    # --- 6: hardening rungs stay independent of sealers -------------------
    for i, rung in enumerate(cfg["hardening"]["ladder"]):
        if fam(rung) in seal_families:
            err(
                f"hardening.ladder[{i}] ({rung.get('model')}) shares family "
                f"'{fam(rung)}' with a seal author — the engineer would share priors "
                f"with the tests judging it."
            )

    # --- 7: PM bias direction ---------------------------------------------
    pm_family = fam(cfg["roles"]["product_mgr"])
    if pm_family == impl_family:
        err(
            f"roles.product_mgr family '{pm_family}' matches the implementer. "
            f"The builder would infer unstated PM assumptions, deflating the "
            f"Shadow Score and overclaiming quality."
        )
    elif pm_family in seal_families:
        warn(
            f"roles.product_mgr family '{pm_family}' matches a seal author. "
            f"This biases the Shadow Score conservatively (upward) — acceptable, "
            f"but should be disclosed in the report."
        )

    # --- 8: arch critic independence --------------------------------------
    if fam(cfg["roles"]["arch_critic"]) == fam(cfg["roles"]["architect"]):
        err(
            "roles.arch_critic shares a family with roles.architect — a critic "
            "with the architect's priors approves the architect's blind spots."
        )

    # --- 9: red team independence from builder ----------------------------
    if fam(cfg["roles"]["red_team"]) == impl_family:
        err(
            "roles.red_team shares a family with the implementer — it will miss "
            "the same attack surfaces the builder missed."
        )

    # --- 10: premium overrides preserve every independence invariant ------
    prem = cfg.get("premium") or {}
    if prem:
        p_impl = fam(prem.get("lead_eng", cfg["roles"]["lead_eng"]))
        p_seal = {fam(prem.get("qa_sealed", cfg["roles"]["qa_sealed"]))}
        p_seal.discard(None)
        if inv.get("cross_family_required") and p_impl in p_seal:
            err(
                f"premium: implementer family '{p_impl}' also authors sealed tests. "
                f"A premium run must not collapse the pipeline into one family."
            )
        if fam(prem.get("arch_critic", cfg["roles"]["arch_critic"])) == fam(
            prem.get("architect", cfg["roles"]["architect"])
        ):
            err("premium: arch_critic shares a family with architect")
        if fam(prem.get("red_team", cfg["roles"]["red_team"])) == p_impl:
            err("premium: red_team shares a family with the implementer")
        for role in cfg["roles"]:
            if role in prem and fam(prem[role]) != fam(cfg["roles"][role]):
                warn(
                    f"premium.{role} changes family "
                    f"'{fam(cfg['roles'][role])}' -> '{fam(prem[role])}'. "
                    f"Premium should raise capability within a role's family, not move it."
                )

    for w in WARNINGS:
        print(f"::warning::{w}")
    for e in ERRORS:
        print(f"::error::{e}")

    if ERRORS:
        print(f"\n❌ {len(ERRORS)} Level 4 conformance violation(s)")
        return 1

    print("✅ Shadow Score Spec v2.0 Level 4 conformance checks passed")
    print(f"   implementer family : {impl_family}")
    print(f"   seal families      : {sorted(seal_families)}")
    print(f"   independence       : strong")
    return 0


if __name__ == "__main__":
    sys.exit(main())
