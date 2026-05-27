import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#";

// ── Status constants ────────────────────────────────────────────────────────
const STATUS = {
  IDLE:      "idle",
  LOADING:   "loading",
  ASSESSING: "assessing",
  MAPPING:   "mapping",
  COMPLETE:  "complete",
  ERROR:     "error",
};

// ── Risk display config ─────────────────────────────────────────────────────
const RISK_CONFIG = {
  low:    { label: "Low Risk",    bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },
  medium: { label: "Medium Risk", bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300",   dot: "bg-amber-500" },
  high:   { label: "High Risk",   bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300",     dot: "bg-red-500" },
};

// ── Regulator badge colors ──────────────────────────────────────────────────
const REGULATOR_COLORS = {
  ICO:                    "bg-blue-100 text-blue-800",
  FCA:                    "bg-purple-100 text-purple-800",
  CMA:                    "bg-orange-100 text-orange-800",
  MHRA:                   "bg-red-100 text-red-800",
  EHRC:                   "bg-pink-100 text-pink-800",
  DSIT:                   "bg-slate-100 text-slate-700",
  "European Commission":  "bg-indigo-100 text-indigo-800",
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function getRegulatorColor(regulator) {
  return REGULATOR_COLORS[regulator] || "bg-gray-100 text-gray-700";
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
      <div
        className="bg-navy-800 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: "#1e3a5f" }}
      />
    </div>
  );
}

function QuestionCard({ question, onSubmit, isLoading, progress }) {
  const [answer, setAnswer] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    setAnswer("");
    if (textareaRef.current) textareaRef.current.focus();
  }, [question]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setAnswer("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-2xl mx-auto">
      <ProgressBar progress={progress} />
      <p className="text-xs text-gray-400 mb-6 text-right">{Math.round(progress)}% complete</p>

      <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">{question}</p>

      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">Press Enter to continue</p>
          <button
            type="submit"
            disabled={!answer.trim() || isLoading}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {isLoading ? "Thinking..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RiskBadge({ level }) {
  const config = RISK_CONFIG[level] || RISK_CONFIG.low;
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function RegimeCard({ regime }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{regime.name}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${getRegulatorColor(regime.regulator)}`}>
            {regime.regulator}
          </span>
        </div>

        <p className="text-sm text-blue-900 bg-blue-50 rounded-xl px-4 py-3 mb-4 leading-relaxed font-medium">
          {regime.trigger_reason}
        </p>

        <p className="text-sm text-gray-600 leading-relaxed">{regime.summary}</p>

        {regime.citations?.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <span>{expanded ? "Hide" : "Show"} citations</span>
              <span>{expanded ? "↑" : "↓"}</span>
            </button>

            {expanded && (
              <div className="mt-3 space-y-2">
                {regime.citations.map((c, i) => (
                  <div key={i} className="text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    <span className="font-medium text-gray-700">{c.document}</span>
                    {c.reference && (
                      <span className="text-gray-500">, {c.reference}</span>
                    )}
                    {c.description && (
                      <p className="text-gray-500 mt-0.5">{c.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Results({ results, onRestart }) {
  const { riskLevel, regimes } = results;
  const riskConfig = RISK_CONFIG[riskLevel] || RISK_CONFIG.low;

  // Separate DSIT (baseline) from the substantive regimes for display ordering
  const mainRegimes = regimes.filter(r => r.id !== "dsit");
  const dsit = regimes.find(r => r.id === "dsit");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your regulatory exposure</h2>
            <p className="text-sm text-gray-500">
              {regimes.length} regulatory regime{regimes.length !== 1 ? "s" : ""} apply to your AI deployment
            </p>
          </div>
          <RiskBadge level={riskLevel} />
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Based on your answers, the regimes below apply to your AI system. Each entry below shows why it applies and what it requires. This is a free-tier summary — the full report includes specific obligations, priority-ordered actions, and a downloadable PDF.
        </p>
      </div>

      {/* Main regimes */}
      {mainRegimes.map(regime => (
        <RegimeCard key={regime.id} regime={regime} />
      ))}

      {/* DSIT baseline */}
      {dsit && <RegimeCard regime={dsit} />}

      {/* Get Full Report CTA */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: "#1e3a5f" }}
      >
        <h3 className="text-white font-bold text-lg mb-2">Get the full report</h3>
        <p className="text-blue-200 text-sm mb-6 leading-relaxed">
          Specific obligations within each regime, exact article and paragraph citations, recommended actions in priority order, and a downloadable PDF you can share with your board, legal counsel, or investors.
        </p>
        <a
          href={STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#f59e0b", color: "#1e3a5f" }}
        >
          Get Full Report — £49
        </a>
        <p className="text-blue-300 text-xs mt-4">
          Secure payment via Stripe. Your report is prepared and emailed to you within 1 business day.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Disclaimer:</strong> This output is regulatory guidance based on published frameworks and your self-reported answers. It is not legal advice. The citation store is human-verified against source documents but regulation changes — always verify obligations against the current published guidance from the relevant regulator. If your situation is complex, consult a qualified solicitor or compliance professional.
        </p>
      </div>

      {/* Restart */}
      <div className="text-center pb-8">
        <button
          onClick={onRestart}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
        >
          Start a new assessment
        </button>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Start assessment ─────────────────────────────────────────────────────
  async function startAssessment() {
    setStatus(STATUS.LOADING);
    setHistory([]);
    setResults(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [] }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (data.status === "question") {
        setCurrentQuestion(data.question);
        setProgress(data.progress ?? 0);
        // Store Claude's first question in history
        setHistory([
          { role: "user", content: "Please begin the assessment." },
          { role: "assistant", content: JSON.stringify(data) },
        ]);
        setStatus(STATUS.ASSESSING);
      } else {
        throw new Error("Unexpected response from assessment service.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus(STATUS.ERROR);
    }
  }

  // ── Handle answer submission ─────────────────────────────────────────────
  async function handleAnswer(answer) {
    setStatus(STATUS.LOADING);

    // Append user's answer to history
    const updatedHistory = [
      ...history,
      { role: "user", content: answer },
    ];

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: updatedHistory }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (data.status === "question") {
        // More questions to ask
        const newHistory = [
          ...updatedHistory,
          { role: "assistant", content: JSON.stringify(data) },
        ];
        setHistory(newHistory);
        setCurrentQuestion(data.question);
        setProgress(data.progress ?? progress);
        setStatus(STATUS.ASSESSING);

      } else if (data.status === "complete") {
        // All slots filled — run deterministic mapping
        setStatus(STATUS.MAPPING);
        await mapResults(data.slots);

      } else {
        throw new Error("Unexpected response from assessment service.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus(STATUS.ERROR);
    }
  }

  // ── Deterministic mapping ────────────────────────────────────────────────
  async function mapResults(slots) {
    try {
      const res = await fetch("/api/map-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setResults(data);
      setStatus(STATUS.COMPLETE);
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate results. Please try again.");
      setStatus(STATUS.ERROR);
    }
  }

  function restart() {
    setStatus(STATUS.IDLE);
    setHistory([]);
    setCurrentQuestion("");
    setProgress(0);
    setResults(null);
    setErrorMsg("");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>AI Regulatory Compliance Check — AuditReady</title>
        <meta
          name="description"
          content="Find out which UK regulatory regimes apply to your AI deployment. Free guided assessment for UK SMEs."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 text-base" style={{ color: "#1e3a5f" }}>
                AuditReady
              </span>
              <span className="text-gray-400 text-sm ml-2">by Mawdsley Advisory</span>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">UK AI Regulatory Compliance</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-6 py-12">
          {/* ── Idle: landing ──────────────────────────────────────────── */}
          {status === STATUS.IDLE && (
            <div className="max-w-2xl w-full mx-auto text-center space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ color: "#1e3a5f" }}>
                  Which AI regulations apply to your project?
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Answer a short series of questions about your AI deployment. We map your answers to the UK regulatory regimes that apply — ICO, FCA, CMA, MHRA, EHRC, DSIT, and the EU AI Act — and show you why each one is triggered.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {[
                  { icon: "5 min", label: "Quick assessment", desc: "8–12 questions, one at a time" },
                  { icon: "Free", label: "No account needed", desc: "Instant results, no sign-up" },
                  { icon: "Cited", label: "Human-verified sources", desc: "Every obligation linked to its source" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="text-lg font-bold mb-1" style={{ color: "#1e3a5f" }}>{icon}</div>
                    <div className="font-medium text-gray-900 text-sm mb-1">{label}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={startAssessment}
                className="px-10 py-4 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                Start the assessment
              </button>

              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No personal data is stored. Your answers are used only to generate your results in this session.
              </p>
            </div>
          )}

          {/* ── Loading ─────────────────────────────────────────────────── */}
          {status === STATUS.LOADING && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#1e3a5f", borderTopColor: "transparent" }}
              />
              <p className="text-sm text-gray-500">Processing your answer...</p>
            </div>
          )}

          {/* ── Mapping ─────────────────────────────────────────────────── */}
          {status === STATUS.MAPPING && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#1e3a5f", borderTopColor: "transparent" }}
              />
              <p className="text-sm text-gray-500">Mapping your regulatory exposure...</p>
            </div>
          )}

          {/* ── Assessing: question card ─────────────────────────────────── */}
          {status === STATUS.ASSESSING && (
            <div className="w-full">
              <QuestionCard
                question={currentQuestion}
                onSubmit={handleAnswer}
                isLoading={false}
                progress={progress}
              />
              <p className="text-center text-xs text-gray-400 mt-6 max-w-md mx-auto">
                Your answers are used only to generate your results. Nothing is stored after this session ends.
              </p>
            </div>
          )}

          {/* ── Complete: results ─────────────────────────────────────────── */}
          {status === STATUS.COMPLETE && results && (
            <Results results={results} onRestart={restart} />
          )}

          {/* ── Error ───────────────────────────────────────────────────── */}
          {status === STATUS.ERROR && (
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-700 font-medium text-sm mb-2">Something went wrong</p>
                <p className="text-red-600 text-xs">{errorMsg}</p>
              </div>
              <button
                onClick={restart}
                className="px-6 py-3 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                Start again
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-gray-400">
              Regulatory guidance only — not legal advice.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Mawdsley Advisory Ltd
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
