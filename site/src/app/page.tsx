"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   🏭 DARK FACTORY — Landing Page
   ═══════════════════════════════════════════════════════════ */

// ── Typing animation phrases ──
const TYPING_PHRASES = [
  "dark factory — build a REST API rate limiter",
  "dark factory express — add auth middleware",
  "dark factory — create a dependency audit CLI",
  "dark factory premium — design a plugin system",
  "dark factory — build a webhook relay service",
];

// ── Counter animation hook ──
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Spark particles on click ──
function spawnSparks(x: number, y: number) {
  const colors = ["#f59e0b", "#8b5cf6", "#84cc16", "#f59e0b", "#ef4444"];
  for (let i = 0; i < 12; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
    const dist = 40 + Math.random() * 60;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.background = colors[i % colors.length];
    spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 700);
  }
}

export default function Home() {
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Counters ──
  const agents = useCounter(6);
  const phases = useCounter(7);
  const hardening = useCounter(3);
  const shadow = useCounter(0);

  // ── Cursor glow ──
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // ── Scroll: nav shrink + back-to-top ──
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 60);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Scroll reveal observer ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Typing animation ──
  useEffect(() => {
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = TYPING_PHRASES[phraseIdx];
      if (!deleting) {
        charIdx++;
        setTypedText(phrase.slice(0, charIdx));
        if (charIdx === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, 2200);
          return;
        }
        timeout = setTimeout(tick, 45 + Math.random() * 30);
      } else {
        charIdx--;
        setTypedText(phrase.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % TYPING_PHRASES.length;
          timeout = setTimeout(tick, 400);
          return;
        }
        timeout = setTimeout(tick, 25);
      }
    };
    timeout = setTimeout(tick, 1200);
    return () => clearTimeout(timeout);
  }, []);

  // ── Copy handler ──
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("/skills add DUBSOpenHub/dark-factory");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  return (
    <>
      {/* Cursor glow */}
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />

      {/* Blueprint grid bg */}
      <div className="grid-bg" aria-hidden="true" />

      {/* Back to top */}
      <button
        className={`back-top ${showTop ? "show" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* ── NAV ── */}
      <nav className={`factory-nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#hero" className="nav-logo">
          🏭 dark factory
        </a>
        <ul className={`nav-links ${mobileNav ? "open" : ""}`}>
          <li><a href="#what" onClick={() => setMobileNav(false)}>What</a></li>
          <li><a href="#pipeline" onClick={() => setMobileNav(false)}>Pipeline</a></li>
          <li><a href="#agents" onClick={() => setMobileNav(false)}>Agents</a></li>
          <li><a href="#sealed" onClick={() => setMobileNav(false)}>Sealed Testing</a></li>
          <li><a href="#install" onClick={() => setMobileNav(false)}>Install</a></li>
          <li>
            <a href="https://github.com/DUBSOpenHub/dark-factory" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
        <button
          className="nav-burger"
          aria-label="Toggle navigation"
          onClick={() => setMobileNav(!mobileNav)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="hero-section">
        <div className="furnace-orb furnace-orb-1" aria-hidden="true" />
        <div className="furnace-orb furnace-orb-2" aria-hidden="true" />
        <div className="furnace-orb furnace-orb-3" aria-hidden="true" />

        <div className="hero-content">
          <div>
            <div className="hero-badge">
              <span className="status-dot" aria-hidden="true" />
              Agentic Build System · Codename: Lights Out
            </div>
            <h1
              className="hero-name"
              onClick={(e) => spawnSparks(e.clientX, e.clientY)}
              tabIndex={0}
              aria-label="Click for sparks"
            >
              dark<br />factory<em>.</em>
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: ".82rem", color: "var(--muted)", marginBottom: "1.5rem", letterSpacing: ".08em" }}>
              AGENTIC · LIGHTS OUT · SEALED-ENVELOPE TESTING
            </p>
            <div className="hero-typing-wrap">
              <span className="typed-text">{typedText}</span>
              <span className="cursor-blink" />
            </div>
            <p className="hero-desc">
              The <strong>agentic dark factory</strong> for AI building. Turn a short free-text goal into a{" "}
              <strong>production-grade pull request</strong> — six specialist agents orchestrated through a
              checkpoint-gated pipeline with{" "}
              <a
                href="https://github.com/DUBSOpenHub/shadow-score-spec"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--amber)", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                sealed-envelope testing
              </a>
              . Builders never see the hidden tests. The{" "}
              <strong style={{ color: "var(--lime)" }}>shadow score</strong> reveals the truth.
            </p>
            {/* Hero inline mini-pipeline */}
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {["Goal →", "📋 PRD", "→ 🔒 Sealed QA", "→ 🏗️ Arch", "→ ⚙️ Build", "→ 🧪 Validate", "→ ✅ Ship"].map((step, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: ".68rem",
                  padding: ".25rem .55rem",
                  borderRadius: "6px",
                  background: step.includes("🔒") ? "rgba(245,158,11,.1)" : "rgba(139,92,246,.08)",
                  border: `1px solid ${step.includes("🔒") ? "rgba(245,158,11,.2)" : "rgba(139,92,246,.15)"}`,
                  color: step.includes("🔒") ? "var(--amber)" : "var(--subtle)",
                  whiteSpace: "nowrap",
                }}>
                  {step}
                </span>
              ))}
            </div>
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "⚡ /skills add DUBSOpenHub/dark-factory"}
              </button>
              <a
                href="https://github.com/DUBSOpenHub/dark-factory"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                View on GitHub →
              </a>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: ".72rem", color: "var(--muted)", marginTop: "1rem" }}>
              ☝️ One command to install · Paste that into the{" "}
              <a href="https://docs.github.com/copilot/concepts/agents/about-copilot-cli" target="_blank" rel="noopener noreferrer" style={{ color: "var(--subtle)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Copilot CLI</a>
              {" "}and start building
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: ".68rem", color: "var(--muted)", marginTop: ".75rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
              🐙 Created with 💜 by{" "}
              <a href="https://github.com/greggcochran" target="_blank" rel="noopener noreferrer" style={{ color: "var(--subtle)" }}>Gregg Cochran</a>
              {" "}
              <a href="https://github.com/DUBSOpenHub" target="_blank" rel="noopener noreferrer" style={{ color: "var(--subtle)" }}>@DUBSOpenHub</a>
              {" "}with the{" "}
              <a href="https://docs.github.com/copilot/concepts/agents/about-copilot-cli" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>GitHub Copilot CLI</a>
            </p>
          </div>
          <div>
            <div className="tui-window">
              <div className="tui-titlebar">
                <span className="status-dot" />
                <span className="tui-title">dark factory — copilot cli</span>
              </div>
              <div className="tui-body">
                <div className="tui-msg"><span className="tui-who you">you</span><span className="tui-text">dark factory — build a CLI that audits deps for GPL</span></div>
                <div className="tui-msg"><span className="tui-who fctry">factory</span><span className="tui-text">🏭 <strong>Run: run-20260401</strong> | Mode: FULL</span></div>
                <div className="tui-msg"><span className="tui-who agent">pm</span><span className="tui-text">PRD.md written — <code>12 acceptance criteria</code></span></div>
                <div className="tui-msg"><span className="tui-who agent">qa 🔒</span><span className="tui-text">Sealed tests hashed. <strong>Builders won&apos;t see these.</strong></span></div>
                <div className="tui-divider" />
                <div className="tui-msg"><span className="tui-who agent">eng</span><span className="tui-text">Build complete — <code>src/ tests/ README</code></span></div>
                <div className="tui-msg"><span className="tui-who fctry">factory</span><span className="tui-text">🏭 <code>SHADOW_SCORE: 0%</code> — all sealed tests pass ✓</span></div>
                <div className="tui-msg"><span className="tui-who fctry">factory</span><span className="tui-text"><strong>Delivery checkpoint</strong> — approve?</span></div>
              </div>
              <div className="tui-inputbar">
                <span className="tui-prompt">›</span>
                <span className="cursor-blink" />
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ── SCALE STATS ── */}
      <section className="factory-section" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div className="reveal" style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span className="section-label">The Machine</span>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "1rem" }}>
            <em>6 agents</em>, 7 phases, <em>zero blind spots</em>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto 3rem", textAlign: "center", maxWidth: 600 }}>
            Dark Factory orchestrates a team of specialist agents through a sealed-envelope pipeline.
            Every build is measured. Every gap is quantified by the{" "}
            <strong style={{ color: "var(--amber)" }}>shadow score</strong>.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", maxWidth: 900, margin: "0 auto" }}>
            <div className="stat-card" style={{ textAlign: "center" }} ref={agents.ref}>
              <div className="stat-number">{agents.count}</div>
              <div className="stat-label">Agents</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Specialist AI roles</p>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }} ref={phases.ref}>
              <div className="stat-number">{phases.count}</div>
              <div className="stat-label">Phases</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Checkpoint-gated pipeline</p>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }} ref={hardening.ref}>
              <div className="stat-number">{hardening.count}</div>
              <div className="stat-label">Hardening Cycles</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Automatic fix loops</p>
            </div>
            <div className="stat-card" style={{ textAlign: "center", borderColor: "rgba(132,204,22,.3)", boxShadow: "0 0 30px rgba(132,204,22,.06)" }} ref={shadow.ref}>
              <div className="stat-number" style={{ color: "var(--lime)" }}>{shadow.count}%</div>
              <div className="stat-label">Target Shadow Score</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Perfect sealed coverage</p>
            </div>
          </div>

          {/* Shadow Score explainer */}
          <div className="reveal" style={{ marginTop: "2.5rem", padding: "1.5rem 2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", maxWidth: 700, margin: "2.5rem auto 0", textAlign: "left" }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--amber)", marginBottom: ".75rem", fontWeight: 700 }}>
              🔒 What is Shadow Score?
            </h3>
            <p style={{ fontSize: ".88rem", color: "var(--subtle)", lineHeight: 1.7, marginBottom: ".75rem" }}>
              <strong style={{ color: "var(--text)" }}>Shadow Score = sealed test failures ÷ total sealed tests.</strong>{" "}
              It measures how much the builder missed when they couldn&apos;t see the hidden acceptance suite.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", fontFamily: "var(--font-mono)", fontSize: ".78rem", flexWrap: "wrap" }}>
              <span><span style={{ color: "var(--lime)", fontWeight: 700 }}>0%</span> <span style={{ color: "var(--muted)" }}>— perfect blind coverage</span></span>
              <span><span style={{ color: "var(--amber)", fontWeight: 700 }}>≤10%</span> <span style={{ color: "var(--muted)" }}>— team target</span></span>
              <span><span style={{ color: "var(--red)", fontWeight: 700 }}>&gt;25%</span> <span style={{ color: "var(--muted)" }}>— spec/test misalignment</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / CONFIG ── */}
      <section className="factory-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div className="reveal">
            <span className="section-label">About</span>
            <h2 className="section-title">Agentic<br /><em>lights out</em> builds</h2>
            <p className="section-sub" style={{ marginBottom: "1.5rem" }}>
              Dark Factory is an <strong>agentic build system</strong> — it isolates every build in a disposable
              git worktree, orchestrates six specialist AI agents, and measures quality with sealed-envelope testing.
              The shadow score tells you exactly how much the builder missed. Lights out means the builder works blind
              — and the hidden tests prove whether the spec was truly covered.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>🔒</div>
                <div className="stat-label">Sealed Tests</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>🌿</div>
                <div className="stat-label">Git Worktree</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>📋</div>
                <div className="stat-label">Checkpoints</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>⚡</div>
                <div className="stat-label">Express Mode</div>
              </div>
            </div>
          </div>
          <div className="reveal" style={{ transitionDelay: ".15s" }}>
            <div className="code-block">
              <div className="code-titlebar">
                <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
                <span className="code-file">config.yml</span>
              </div>
              <div className="code-body">
                <pre>{`\n`}<span className="cm"># what powers the factory</span>{`\n`}<span className="kw">factory</span><span className="br">:</span>{`\n`}  <span className="fn">default_mode</span><span className="br">:</span> <span className="str">full</span>{`\n`}  <span className="fn">max_hardening_cycles</span><span className="br">:</span> <span className="num">3</span>{`\n`}  <span className="fn">agent_timeout_sec</span><span className="br">:</span> <span className="num">300</span>{`\n\n`}<span className="kw">models</span><span className="br">:</span>{`\n`}  <span className="fn">product_mgr</span><span className="br">:</span> <span className="str">claude-sonnet-4.6</span>{`\n`}  <span className="fn">architect</span><span className="br">:</span> <span className="str">claude-sonnet-4.6</span>{`\n`}  <span className="fn">qa_sealed</span><span className="br">:</span> <span className="str">claude-sonnet-4.6</span>{`\n`}  <span className="fn">lead_eng</span><span className="br">:</span> <span className="str">claude-sonnet-4.6</span>{`\n`}  <span className="fn">qa_validator</span><span className="br">:</span> <span className="str">claude-haiku-4.5</span>{`\n`}  <span className="fn">premium_model</span><span className="br">:</span> <span className="str">claude-opus-4.6</span>{`\n\n`}<span className="kw">checkpoints</span><span className="br">:</span>{`\n`}  <span className="fn">allow_skip_all</span><span className="br">:</span> <span className="num">true</span></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT — features ── */}
      <section id="what" className="factory-section">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3.5rem" }}>
            <span className="section-label">Features</span>
            <h2 className="section-title">Agentic lights<br />out builds<em>.</em></h2>
          </div>
          {[
            { num: "01", title: "Goal in, PR out", desc: <><strong>Write a sentence. Get production code.</strong> Dark Factory takes a free-text goal and produces a complete pull request — spec, architecture, implementation, tests, and delivery report.</> },
            { num: "02", title: "Sealed-envelope testing", desc: <><strong>QA writes hidden acceptance tests before any code exists.</strong> The builder never sees them. Shadow scores quantify blind spots the builder didn&apos;t know about.</> },
            { num: "03", title: "Six specialist agents", desc: <><strong>Each phase has its own expert.</strong> Product Manager, Architect, QA Sealed, Lead Engineer, QA Validator, and Outcome Evaluator — stateless, focused, governed.</> },
            { num: "04", title: "Checkpoint-gated", desc: <><strong>You stay in control.</strong> Human approval gates at every phase boundary. Review the PRD, approve the architecture, inspect the build — or go fully dark with skip-all.</> },
            { num: "05", title: "Crash-recoverable", desc: <><strong>Every phase checkpoints to state.json.</strong> Network drops, timeouts, interrupted sessions — just run <code style={{ color: "var(--amber)", fontFamily: "var(--font-mono)", fontSize: ".88rem", background: "rgba(245,158,11,.08)", padding: ".1rem .4rem", borderRadius: "4px" }}>dark factory resume</code> and continue.</> },
            { num: "06", title: "Express mode", desc: <><strong>Short goals get fast builds.</strong> Express mode skips PRD and architecture, but still runs sealed QA from the raw goal. Quick fixes get the same quality envelope.</> },
          ].map((f, i) => (
            <div key={f.num} className="feature-item reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="feature-num">{f.num}</span>
              <div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section id="pipeline" className="factory-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "1.5rem" }}>
            <span className="section-label">Pipeline</span>
            <h2 className="section-title">The assembly <em>line.</em></h2>
            <p className="section-sub">Seven phases, each with its own specialist agent. Work flows forward through checkpoints. Express mode condenses to three phases.</p>
          </div>

          {/* Conveyor marquee */}
          <div className="marquee-wrap reveal" style={{ marginBottom: "3rem" }}>
            <div className="marquee-track">
              <div className="marquee-inner" style={{ animationDuration: "35s" }}>
                {["Phase 0: Setup", "Phase 1: PRD", "Phase 2a: QA Sealed 🔒", "Phase 2b: Architecture", "Phase 3: Build", "Phase 4: Validation", "Phase 5: Hardening", "Phase 6: Delivery", "Phase 7: Outcome",
                  "Phase 0: Setup", "Phase 1: PRD", "Phase 2a: QA Sealed 🔒", "Phase 2b: Architecture", "Phase 3: Build", "Phase 4: Validation", "Phase 5: Hardening", "Phase 6: Delivery", "Phase 7: Outcome"].map((p, i) => (
                  <span key={i} className="marquee-chip">{p}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { phase: "Phase 0", title: "Factory Setup", desc: "Creates an isolated git worktree and branch. No interference with your working tree.", agent: "Factory Manager" },
              { phase: "Phase 1", title: "Product Spec", desc: "Product Manager writes PRD.md with acceptance criteria, user stories, and scope.", agent: "Product Manager" },
              { phase: "Phase 2a", title: "QA Sealed 🔒", desc: "Hidden acceptance tests written from the PRD. SHA-256 hashed. Builder never sees them.", agent: "QA Sealed", sealed: true },
              { phase: "Phase 2b", title: "Architecture", desc: "System design — diagrams, contracts, tech decisions. Runs in parallel with QA Sealed.", agent: "Architect" },
              { phase: "Phase 3", title: "Build + Tests", desc: "Lead Engineer implements the spec and writes their own tests. Can't see the sealed suite.", agent: "Lead Engineer" },
              { phase: "Phase 4", title: "Sealed Validation", desc: "Sealed tests injected temporarily. Shadow score reveals the gap. Auto-hardening if needed.", agent: "QA Validator", sealed: true },
              { phase: "Phase 5", title: "Hardening", desc: "Automatic fix cycles when shadow score > 0%. Builder sees failures but never sealed tests.", agent: "Lead Engineer" },
              { phase: "Phase 6", title: "Delivery", desc: "Final human checkpoint. Delivery report with shadow score. Approve, modify, or reject.", agent: "Factory Manager" },
              { phase: "Phase 7", title: "Outcome Eval", desc: "Optional post-ship assessment. PRD criteria fulfillment and KPI scoring out of 100.", agent: "Outcome Evaluator" },
            ].map((p) => (
              <div key={p.phase} className="phase-card">
                <span className="phase-num-label">{p.phase}</span>
                <h3 className="phase-title">{p.title}</h3>
                <p className="phase-desc">{p.desc}</p>
                <span className={`agent-badge ${p.sealed ? "sealed" : ""}`}>{p.agent}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE SESSION ── */}
      <section className="factory-section">
        <div className="reveal" style={{ maxWidth: 780, margin: "0 auto" }}>
          <div className="convo-header">sample session — full mode</div>
          <div className="msg"><span className="msg-who you">you</span><span className="msg-text">dark factory — build a REST API rate limiter middleware</span></div>
          <div className="msg"><span className="msg-who factory">factory</span><span className="msg-text">🏭 <strong>Run: run-20260325-0900</strong> | Mode: FULL<br />Worktree created at <code>.factory/runs/run-20260325-0900</code></span></div>
          <div className="msg"><span className="msg-who agent">pm</span><span className="msg-text"><strong>PRD.md ready.</strong> 8 acceptance criteria, 3 user stories, token bucket algorithm specified.</span></div>
          <div className="msg"><span className="msg-who factory">factory</span><span className="msg-text">📋 <strong>Checkpoint 1</strong> — approve spec? <code>[approve]</code> <code>[modify]</code> <code>[abort]</code></span></div>
          <div className="msg-gap" />
          <div className="msg"><span className="msg-who agent">qa 🔒</span><span className="msg-text">Sealed tests authored. <code>SHA-256: a7f3...</code> — stored in <code>.factory/sealed/</code></span></div>
          <div className="msg"><span className="msg-who agent">arch</span><span className="msg-text"><strong>ARCH.md ready.</strong> Express middleware, Redis backing store, sliding window.</span></div>
          <div className="msg"><span className="msg-who agent">eng</span><span className="msg-text"><strong>Build complete.</strong> <code>src/middleware.ts</code>, <code>src/store.ts</code>, 14 unit tests passing.</span></div>
          <div className="msg-gap" />
          <div className="msg"><span className="msg-who factory">factory</span><span className="msg-text">🏭 <strong>SHADOW_SCORE: 11.1%</strong> — 2 sealed failures. Hardening cycle 1/3...</span></div>
          <div className="msg"><span className="msg-who agent">eng</span><span className="msg-text">Fixed: edge cases for burst reset and concurrent requests.</span></div>
          <div className="msg"><span className="msg-who factory">factory</span><span className="msg-text">🏭 <code>SHADOW_SCORE: 0%</code> — all sealed tests pass ✓<br /><strong>Delivery checkpoint ready.</strong></span></div>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section id="agents" className="factory-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3rem" }}>
            <span className="section-label">Agent Team</span>
            <h2 className="section-title">The <em>team.</em></h2>
            <p className="section-sub">Six specialist agents, each with its own prompt, model assignment, and governance rules. Stateless — they only see what the Factory Manager passes them.</p>
          </div>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: "📋", name: "Product Manager", role: "Phase 1 · PRD Author", desc: "Turns your free-text goal into a structured PRD with acceptance criteria, user stories, and technical constraints. Capped at 180 lines.", model: "claude-sonnet-4.6" },
              { icon: "🏗️", name: "Architect", role: "Phase 2b · System Designer", desc: "Designs the system from the PRD — diagrams, contracts, file structure, tech decisions. Runs in parallel with QA Sealed.", model: "claude-sonnet-4.6" },
              { icon: "🔒", name: "QA Sealed", role: "Phase 2a · Hidden Test Author", desc: "Writes acceptance tests from the PRD that the builder will never see. Tests are SHA-256 hashed and stored in a sealed vault.", model: "claude-sonnet-4.6" },
              { icon: "⚙️", name: "Lead Engineer", role: "Phase 3 & 5 · Builder", desc: "Implements the spec, writes tests, and handles hardening cycles. Only sees failure messages from sealed tests — never the tests themselves.", model: "claude-sonnet-4.6" },
              { icon: "🧪", name: "QA Validator", role: "Phase 4 · Sealed Test Runner", desc: "Temporarily injects sealed tests into the worktree, runs them, reports the shadow score, then removes all traces.", model: "claude-haiku-4.5" },
              { icon: "📊", name: "Outcome Evaluator", role: "Phase 7 · Post-Ship Analyst", desc: "Revisits archived artifacts after delivery. Scores PRD criteria fulfillment and KPI alignment out of 100.", model: "claude-sonnet-4.6" },
            ].map((a) => (
              <div key={a.name} className="agent-card">
                <div className="agent-icon">{a.icon}<span className="agent-powered" /></div>
                <h3 className="feature-title">{a.name}</h3>
                <span className="agent-role">{a.role}</span>
                <p className="feature-desc" style={{ maxWidth: "none" }}>{a.desc}</p>
                <span className="agent-model">model: {a.model}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEALED TESTING ── */}
      <section id="sealed" className="factory-section">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3rem" }}>
            <span className="section-label">Core Innovation</span>
            <h2 className="section-title">Sealed-envelope<br />testing<em>.</em></h2>
            <p className="section-sub">
              QA writes tests before code exists and hides them from the builder. The quality gap between what the builder tests
              and what the sealed suite catches is your{" "}
              <a href="https://github.com/DUBSOpenHub/shadow-score-spec" target="_blank" rel="noopener noreferrer">shadow score</a>
              {" "}— a blind-spot metric you can&apos;t game.
            </p>
          </div>
          <div className="sealed-cols reveal">
            <div className="sealed-col">
              <h3>How It Works</h3>
              <p><strong>QA Sealed writes tests using only the PRD — before any code exists.</strong> Tests are SHA-256 hashed and stored in <code style={{ color: "var(--amber)", fontFamily: "var(--font-mono)", fontSize: ".88rem" }}>.factory/sealed/</code>.</p>
              <p>During Phase 4, sealed tests are temporarily injected, executed, and immediately removed. The builder only ever sees failure messages — never the test source.</p>
              <p>Shadow score = sealed failures ÷ sealed total. <strong>0% means the builder nailed it blind. {">"}25% signals spec/test misalignment.</strong></p>
              <a href="https://github.com/DUBSOpenHub/shadow-score-spec" target="_blank" rel="noopener noreferrer" className="sealed-link">Shadow Score Spec ↗</a>
            </div>
            <div className="sealed-col">
              <h3>Why It Matters</h3>
              <p><strong>Prevents overfitting.</strong> Builders can&apos;t &quot;teach to the test&quot; because they never see the sealed suite.</p>
              <p><strong>Quantifies quality.</strong> Shadow scores expose blind spots numerically — not subjectively.</p>
              <p><strong>Automates escalation.</strong> Hardening cycles fire automatically when sealed tests fail. Up to 3 cycles before human decision.</p>
              <p><strong>Retains speed.</strong> Express mode derives sealed tests from the raw goal text, so even quick fixes get quality coverage.</p>
              <ul style={{ fontFamily: "var(--font-sans)", fontSize: ".92rem", color: "var(--subtle)", lineHeight: 2, marginTop: ".75rem", paddingLeft: 0, listStyle: "none" }}>
                <li style={{ display: "flex", gap: ".5rem" }}><span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span> Classic TDD: builder sees all tests</li>
                <li style={{ display: "flex", gap: ".5rem" }}><span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span> Manual QA: slow, inconsistent</li>
                <li style={{ display: "flex", gap: ".5rem" }}><span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span> <strong style={{ color: "var(--text)" }}>Dark Factory: blind, quantified, fast</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section className="factory-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "2rem" }}>
            <span className="section-label">System Design</span>
            <h2 className="section-title">Architecture<em>.</em></h2>
          </div>
          <div className="arch-svg-wrap reveal">
            <svg viewBox="0 0 1100 480" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dark Factory architecture diagram">
              <rect x="30" y="170" width="180" height="140" rx="18" fill="rgba(245,158,11,.06)" stroke="#f59e0b" strokeWidth="2" />
              <text x="120" y="222" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="30" fill="#f59e0b">💬</text>
              <text x="120" y="258" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="700" fill="#f59e0b">Your Goal</text>
              <text x="120" y="283" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgba(245,158,11,.45)">free-text prompt</text>

              <path d="M210 240 C250 240 270 240 300 240" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <polygon points="296,234 308,240 296,246" fill="#f59e0b" />

              <rect x="300" y="20" width="770" height="440" rx="24" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1.5" />
              <text x="685" y="72" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="28" fontWeight="700" fill="rgba(255,255,255,.92)">🏭 dark factory</text>
              <text x="685" y="105" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="rgba(255,255,255,.18)" letterSpacing=".16em">FACTORY MANAGER · CHECKPOINTS · STATE</text>
              <line x1="340" y1="125" x2="1030" y2="125" stroke="rgba(255,255,255,.04)" strokeWidth="1" />
              <text x="350" y="158" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="rgba(255,255,255,.18)" letterSpacing=".14em">AGENT TEAM</text>

              <rect x="350" y="175" width="140" height="85" rx="14" fill="rgba(139,92,246,.06)" stroke="#8b5cf6" strokeWidth="1.5" />
              <text x="420" y="210" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#8b5cf6">📋 PM</text>
              <text x="420" y="238" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(139,92,246,.45)">PRD Author</text>

              <rect x="510" y="175" width="140" height="85" rx="14" fill="rgba(139,92,246,.06)" stroke="#8b5cf6" strokeWidth="1.5" />
              <text x="580" y="210" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#8b5cf6">🏗️ Arch</text>
              <text x="580" y="238" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(139,92,246,.45)">Designer</text>

              <rect x="670" y="175" width="140" height="85" rx="14" fill="rgba(245,158,11,.06)" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="740" y="210" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#f59e0b">🔒 QA</text>
              <text x="740" y="238" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(245,158,11,.45)">Sealed Tests</text>

              <rect x="830" y="175" width="140" height="85" rx="14" fill="rgba(139,92,246,.06)" stroke="#8b5cf6" strokeWidth="1.5" />
              <text x="900" y="210" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#8b5cf6">⚙️ Eng</text>
              <text x="900" y="238" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(139,92,246,.45)">Builder</text>

              <rect x="430" y="290" width="160" height="85" rx="14" fill="rgba(245,158,11,.06)" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="510" y="325" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#f59e0b">🧪 Validator</text>
              <text x="510" y="353" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(245,158,11,.45)">Shadow Score</text>

              <rect x="620" y="290" width="160" height="85" rx="14" fill="rgba(139,92,246,.06)" stroke="#8b5cf6" strokeWidth="1.5" />
              <text x="700" y="325" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#8b5cf6">📊 Outcome</text>
              <text x="700" y="353" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(139,92,246,.45)">Post-Ship</text>

              <rect x="350" y="400" width="610" height="42" rx="10" fill="rgba(132,204,22,.04)" stroke="#84cc16" strokeWidth="1" />
              <text x="655" y="426" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgba(132,204,22,.5)" letterSpacing=".1em">GIT WORKTREE · .factory/sealed/ · state.json · SHADOW SCORE SPEC</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── COMMANDS ── */}
      <section className="factory-section">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "2rem" }}>
            <span className="section-label">Reference</span>
            <h2 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>Commands<em>.</em></h2>
            <p className="section-sub">Six commands. Everything else is handled by the pipeline automatically.</p>
          </div>
          <div className="reveal">
            {[
              { name: "Full Build", code: "dark factory — <goal>", desc: "Complete pipeline with all 7 phases and checkpoints at every gate. The \"lights out\" experience." },
              { name: "Express", code: "dark factory express — <goal>", desc: "Skips PRD/Architecture. Sealed QA still runs from the raw goal. One checkpoint at delivery." },
              { name: "Resume", code: "dark factory resume", desc: "Reloads state.json and continues from the saved phase. Crash recovery built in." },
              { name: "Status", code: "dark factory status", desc: "Prints current state without mutating anything. Shows pending evaluations." },
              { name: "Evaluate", code: "dark factory evaluate <run-id>", desc: "Launches Phase 7 Outcome Evaluator for a delivered run. KPI scoring out of 100." },
              { name: "Premium", code: "dark factory premium — <goal>", desc: "Routes all agents through claude-opus-4.6 for one run." },
            ].map((c) => (
              <div key={c.name} className="command-cell">
                <div className="command-name">{c.name} <code>{c.code}</code></div>
                <p className="command-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTALL ── */}
      <section id="install" className="install-section alt-bg">
        <div className="reveal" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="how-flow">
            <div className="how-step">
              <div className="how-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </div>
              <span className="how-step-num">Step 1</span>
              <span className="how-step-label">Add the skill</span>
              <span className="how-step-sub">One command in Copilot CLI</span>
            </div>
            <div className="how-arrow">
              <svg viewBox="0 0 40 16" fill="none">
                <line x1="0" y1="8" x2="32" y2="8" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
                <polygon points="30,4 38,8 30,12" fill="rgba(255,255,255,.12)" />
              </svg>
            </div>
            <div className="how-step">
              <div className="how-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h1l1 2 2-4h1" /><line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <span className="how-step-num">Step 2</span>
              <span className="how-step-label">State your goal</span>
              <span className="how-step-sub">Plain English, any scope</span>
            </div>
            <div className="how-arrow">
              <svg viewBox="0 0 40 16" fill="none">
                <line x1="0" y1="8" x2="32" y2="8" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
                <polygon points="30,4 38,8 30,12" fill="rgba(255,255,255,.12)" />
              </svg>
            </div>
            <div className="how-step">
              <div className="how-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>
              <span className="how-step-num">Step 3</span>
              <span className="how-step-label">Review the PR</span>
              <span className="how-step-sub">Production-grade, tested</span>
            </div>
          </div>

          <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(4rem, 12vw, 8rem)", marginBottom: "2.5rem" }}>
            Build<span className="footer-gradient">.</span>
          </h2>
          <div className="install-cmd"><span className="comment"># add the skill to Copilot CLI</span></div>
          <div className="install-cmd"><span className="prompt">›</span> <span className="cmd">/skills add</span> <span className="arg">DUBSOpenHub/dark-factory</span></div>
          <div className="install-cmd">&nbsp;</div>
          <div className="install-cmd"><span className="comment"># start building</span></div>
          <div className="install-cmd"><span className="prompt">›</span> <span className="cmd">dark factory</span> — build a dependency audit CLI</div>

          <div className="install-steps">
            <div className="install-step">
              <span className="step-num">01</span>
              <p>Add Skill</p>
              <code>/skills add DUBSOpenHub/dark-factory</code>
            </div>
            <div className="install-step">
              <span className="step-num">02</span>
              <p>Describe</p>
              <code>dark factory — &lt;your goal&gt;</code>
            </div>
            <div className="install-step">
              <span className="step-num">03</span>
              <p>Ship</p>
              <code>approve at delivery checkpoint</code>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="factory-footer" style={{ flexDirection: "column", gap: "1rem", textAlign: "center" }}>
        <span style={{ fontSize: ".92rem" }}>
          <span className="footer-gradient">dark factory</span> — created by{" "}
          <a href="https://github.com/greggcochran" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>Gregg Cochran</a>
          {" "}
          <a href="https://github.com/DUBSOpenHub" target="_blank" rel="noopener noreferrer">@DUBSOpenHub</a>
        </span>
        <span>
          Built with 💜 using the{" "}
          <a href="https://docs.github.com/copilot/concepts/agents/about-copilot-cli" target="_blank" rel="noopener noreferrer">GitHub Copilot CLI</a>
          {" · "}
          <a href="https://github.com/DUBSOpenHub/shadow-score-spec" target="_blank" rel="noopener noreferrer">shadow score spec</a>
          {" · "}
          <a href="https://github.com/DUBSOpenHub/dark-factory" target="_blank" rel="noopener noreferrer">source ↗</a>
        </span>
      </footer>
    </>
  );
}
