import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#";

const STATUS = {
  IDLE:      "idle",
  LOADING:   "loading",
  ASSESSING: "assessing",
  MAPPING:   "mapping",
  COMPLETE:  "complete",
  ERROR:     "error",
};

const RISK_CONFIG = {
  low:    { label: "Low Risk",    bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },
  medium: { label: "Medium Risk", bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300",   dot: "bg-amber-500" },
  high:   { label: "High Risk",   bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300",     dot: "bg-red-500" },
};

const REGULATOR_COLORS = {
  ICO:                   "bg-zinc-100 text-zinc-700",
  FCA:                   "bg-zinc-100 text-zinc-700",
  CMA:                   "bg-zinc-100 text-zinc-700",
  MHRA:                  "bg-zinc-100 text-zinc-700",
  EHRC:                  "bg-zinc-100 text-zinc-700",
  DSIT:                  "bg-zinc-100 text-zinc-700",
  "European Commission": "bg-zinc-100 text-zinc-700",
};

function getRegulatorColor(regulator) {
  return REGULATOR_COLORS[regulator] || "bg-zinc-100 text-zinc-700";
}

function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-zinc-200 h-px mb-2">
      <div
        className="h-px transition-all duration-500 bg-black"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
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
    <div className="w-full max-w-2xl mx-auto">
      <ProgressBar progress={progress} />
      <p className="text-xs text-zinc-400 mb-10 tracking-widest uppercase">{Math.round(progress)}% complete</p>
      <p className="text-2xl font-light text-black mb-10 leading-relaxed tracking-tight">{question}</p>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your answer"
          rows={3}
          className="w-full border-0 border-b border-zinc-300 px-0 py-3 text-base text-black placeholder-zinc-300 focus:outline-none focus:border-black resize-none bg-transparent transition-colors duration-200"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mt-8">
          <p className="text-xs text-zinc-400 tracking-widest uppercase">Return to continue</p>
          <button
            type="submit"
            disabled={!answer.trim() || isLoading}
            className="text-xs tracking-widest uppercase font-medium text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RiskBadge({ level }) {
  const labels = { low: "Low Risk", medium: "Medium Risk", high: "High Risk" };
  return (
    <span className="text-xs tracking-widest uppercase font-medium border border-black px-3 py-1.5">
      {labels[level] || "Unknown"}
    </span>
  );
}

function RegimeCard({ regime }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-zinc-200 pt-8 pb-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="font-medium text-black text-base leading-snug">{regime.name}</h3>
        <span className="text-xs tracking-widest uppercase text-zinc-400 whitespace-nowrap flex-shrink-0 pt-0.5">
          {regime.regulator}
        </span>
      </div>
      <p className="text-sm text-black font-medium mb-4 leading-relaxed">{regime.trigger_reason}</p>
      <p className="text-sm text-zinc-600 leading-relaxed">{regime.summary}</p>
      {regime.citations?.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs tracking-widest uppercase text-zinc-400 hover:text-black transition-colors"
          >
            {expanded ? "Hide sources" : "Show sources"}
          </button>
          {expanded && (
            <div className="mt-4 space-y-3">
              {regime.citations.map((c, i) => (
                <div key={i} className="text-xs text-zinc-500 border-l-2 border-zinc-200 pl-3">
                  <span className="font-medium text-zinc-700">{c.document}</span>
                  {c.reference && <span className="text-zinc-400">, {c.reference}</span>}
                  {c.description && <p className="mt-0.5">{c.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Results({ results, onRestart }) {
  const { riskLevel, regimes } = results;
  const mainRegimes = regimes.filter(r => r.id !== "dsit");
  const dsit = regimes.find(r => r.id === "dsit");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs tracking-widest uppercase text-zinc-400">Assessment complete</h2>
          <RiskBadge level={riskLevel} />
        </div>
        <p className="text-3xl font-light tracking-tight text-black mt-6 mb-4">
          {regimes.length} regulatory regime{regimes.length !== 1 ? "s" : ""} apply to your deployment.
        </p>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Every obligation below is traced to its source. This is a free-tier summary. The full report includes specific obligations, priority-ordered actions, and a downloadable PDF.
        </p>
      </div>

      <div>
        {mainRegimes.map(regime => <RegimeCard key={regime.id} regime={regime} />)}
        {dsit && <RegimeCard regime={dsit} />}
      </div>

      <div className="border-t border-black mt-12 pt-12 mb-12">
        <p className="text-xs tracking-widest uppercase text-zinc-400 mb-4">Full report</p>
        <p className="text-2xl font-light tracking-tight text-black mb-2">Specific obligations. Exact citations. Priority actions.</p>
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
          A downloadable PDF with every obligation mapped to its source document, recommended actions in priority order, and a summary you can share with legal counsel or your board.
        </p>
        <a
          href={STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs tracking-widest uppercase font-medium bg-black text-white px-8 py-4 hover:bg-zinc-800 transition-colors duration-200"
        >
          Get Full Report — £49
        </a>
        <p className="text-xs text-zinc-400 mt-4">
          Secure payment via Stripe. Report prepared and emailed within 1 business day.
        </p>
      </div>

      <div className="border border-zinc-200 p-6 mb-12">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="font-medium text-zinc-700">Important disclaimer: </span>
          This output is regulatory guidance based on published frameworks and your self-reported answers. It is not legal advice. The citation store is human-verified against source documents but regulation changes. Always verify obligations against current published guidance from the relevant regulator. If your situation is complex, consult a qualified solicitor or compliance professional.
        </p>
      </div>

      <div className="border-t border-zinc-200 pt-8 pb-16">
        <button
          onClick={onRestart}
          className="text-xs tracking-widest uppercase text-zinc-400 hover:text-black transition-colors"
        >
          Start new assessment
        </button>
      </div>
    </div>
  );
}

// ── Landing page ─────────────────────────────────────────────────────────────

function Landing({ onStart }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col px-8 md:px-16 lg:px-24"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between py-8 border-b border-zinc-200">
        <span className="text-xs tracking-widest uppercase font-medium">ValarAudit</span>
        <a
          href="mailto:alistair@mawdsleyadvisory.com"
          className="text-xs tracking-widest uppercase text-zinc-400 hover:text-black transition-colors"
        >
          Contact
        </a>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center py-24 max-w-4xl">
        <p className="text-xs tracking-widest uppercase text-zinc-400 mb-8">AI Regulatory Compliance</p>

        <h1
          className="font-semibold tracking-tight text-black mb-8 leading-none"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 500 }}
        >
          Know your exposure.<br />
          Before regulators<br />
          find it.
        </h1>

        <p className="text-base text-zinc-500 mb-16 leading-relaxed max-w-xl">
          Every obligation traced to its source. Not AI opinion or hallucinations. Verified regulatory guidance.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-24">
          <button
            onClick={onStart}
            className="text-xs tracking-widest uppercase font-medium bg-black text-white px-8 py-4 hover:bg-zinc-800 transition-colors duration-200"
          >
            Start free assessment
          </button>
          <span className="text-xs tracking-widest uppercase text-zinc-400">5 minutes. No account needed.</span>
        </div>

        {/* Three tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-zinc-200">
          {[
            { label: "Free assessment", desc: "Guided questions, one at a time. Instant results." },
            { label: "Human-verified citations", desc: "Every obligation linked to its source document." },
            { label: "Full report £49", desc: "Specific obligations, priority actions, downloadable PDF." },
          ].map(({ label, desc }) => (
            <div key={label} className="border-b sm:border-b-0 sm:border-r border-zinc-200 last:border-0 py-8 pr-8">
              <p className="text-xs tracking-widest uppercase font-medium text-black mb-2">{label}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regulator row */}
      <div className="border-t border-zinc-200 py-6 flex flex-wrap items-center gap-6">
        <span className="text-xs tracking-widest uppercase text-zinc-300">Covers</span>
        {["ICO", "FCA", "CMA", "MHRA", "EHRC", "DSIT", "EU AI Act"].map(r => (
          <span key={r} className="text-xs tracking-widest uppercase text-zinc-400">{r}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 py-6 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-zinc-300 tracking-wide">Regulatory guidance only. Not legal advice.</p>
        <p className="text-xs text-zinc-300">
          By{" "}
          <a href="https://mawdsleyadvisory.com" className="hover:text-black transition-colors">
            Mawdsley Advisory
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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

  async function handleAnswer(answer) {
    setStatus(STATUS.LOADING);
    const updatedHistory = [...history, { role: "user", content: answer }];
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: updatedHistory }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.status === "question") {
        const newHistory = [...updatedHistory, { role: "assistant", content: JSON.stringify(data) }];
        setHistory(newHistory);
        setCurrentQuestion(data.question);
        setProgress(data.progress ?? progress);
        setStatus(STATUS.ASSESSING);
      } else if (data.status === "complete") {
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

  return (
    <>
      <Head>
        <title>ValarAudit — AI Regulatory Compliance</title>
        <meta name="description" content="Know your AI regulatory exposure in 5 minutes. Human-verified citations from ICO, FCA, CMA, MHRA, EHRC, DSIT and the EU AI Act." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Editorial+New:ital,wght@0,200;0,400;1,200&family=Suisse+Int%27l:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        body { background: #ffffff; color: #000000; }
      `}</style>

      {status === STATUS.IDLE && <Landing onStart={startAssessment} />}

      {(status === STATUS.LOADING || status === STATUS.MAPPING) && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs tracking-widest uppercase text-zinc-400 animate-pulse">
            {status === STATUS.MAPPING ? "Mapping your exposure" : "Processing"}
          </p>
        </div>
      )}

      {status === STATUS.ASSESSING && (
        <div className="min-h-screen flex flex-col px-8 md:px-16 lg:px-24">
          <div className="flex items-center justify-between py-8 border-b border-zinc-200 mb-16">
            <span className="text-xs tracking-widest uppercase font-medium">ValarAudit</span>
            <button onClick={restart} className="text-xs tracking-widest uppercase text-zinc-400 hover:text-black transition-colors">
              Exit
            </button>
          </div>
          <div className="flex-1 flex items-start justify-center pt-8">
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleAnswer}
              isLoading={false}
              progress={progress}
            />
          </div>
        </div>
      )}

      {status === STATUS.COMPLETE && results && (
        <div className="min-h-screen flex flex-col px-8 md:px-16 lg:px-24">
          <div className="flex items-center justify-between py-8 border-b border-zinc-200 mb-16">
            <span className="text-xs tracking-widest uppercase font-medium">ValarAudit</span>
            <button onClick={restart} className="text-xs tracking-widest uppercase text-zinc-400 hover:text-black transition-colors">
              New assessment
            </button>
          </div>
          <Results results={results} onRestart={restart} />
        </div>
      )}

      {status === STATUS.ERROR && (
        <div className="min-h-screen flex items-center justify-center px-8">
          <div className="max-w-md text-center">
            <p className="text-xs tracking-widest uppercase text-zinc-400 mb-4">Error</p>
            <p className="text-sm text-zinc-600 mb-8">{errorMsg}</p>
            <button
              onClick={restart}
              className="text-xs tracking-widest uppercase font-medium border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-200"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
