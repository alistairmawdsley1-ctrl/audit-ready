import Head from "next/head";

export default function Audit() {
  return (
    <>
      <Head>
        <title>Full AI Regulatory Audit — Valar Audit</title>
        <meta name="description" content="A structured assessment of your AI deployment against seven UK and EU regulatory frameworks. Documentation, evidence, and a plan your board can act on." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen flex flex-col px-8 md:px-16 lg:px-24">

        {/* Navbar */}
        <div className="flex items-center justify-between py-8 border-b border-zinc-200">
          <a href="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '24px', letterSpacing: '-0.5px', color: '#0789a8', textDecoration: 'none' }}>Valar Audit</a>
          <div className="flex items-center gap-8">
            <a href="/" className="text-xs tracking-widest text-zinc-500 hover:text-black transition-colors">free assessment</a>
            <span className="text-xs tracking-widest text-black" style={{ borderBottom: '1px solid #111', paddingBottom: '1px' }}>full audit</span>
            <a href="mailto:alistair@mawdsleyadvisory.com" className="text-xs tracking-widest text-zinc-500 hover:text-black transition-colors">contact</a>
          </div>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-24 max-w-4xl">
          <p className="text-xs tracking-widest text-zinc-600 mb-8">AI regulatory compliance</p>

          <h1
            className="font-normal tracking-tight text-black mb-8 leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Deploy with confidence.
          </h1>

          <p className="text-base text-zinc-600 mb-16 leading-relaxed max-w-xl">
            Not a checklist. A structured audit conducted by an experienced AI governance specialist, with written findings across six dimensions and a prioritised action plan traceable to its regulatory source.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-24">
            <a
              href="mailto:alistair@mawdsleyadvisory.com?subject=Full%20AI%20Audit%20enquiry"
              className="text-xs tracking-widest font-medium bg-black text-white px-8 py-4 hover:bg-zinc-800 transition-colors duration-300 rounded-lg"
            >
              book a discovery call
            </a>
            <span className="text-xs tracking-widest text-zinc-600">from £2,000</span>
          </div>

          {/* Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* 01 Discovery interview — full width, black */}
            <div className="sm:col-span-2 bg-black rounded-xl p-8">
              <p className="text-xs tracking-widest text-zinc-500 mb-4">01 — discovery interview</p>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.875rem", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "1rem" }}>A structured 60-minute conversation.</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-lg">
                We cover your AI deployment, data practices, governance maturity, and regulatory exposure. The questions your legal team should be asking.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Business context", "AI use", "Data & compliance", "Risk & governance", "People & culture", "Opportunity"].map(tag => (
                  <span key={tag} className="text-xs text-zinc-400 px-3 py-1 rounded-full" style={{ background: '#1a1a1a' }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* 02 Audit report */}
            <div className="bg-zinc-100 rounded-xl p-8 border border-zinc-200">
              <p className="text-xs tracking-widest text-zinc-400 mb-4">02 — audit report</p>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.875rem", fontWeight: 400, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "1rem" }}>Six-section written assessment.</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">Findings, auditor commentary, and RAG risk rating across every dimension.</p>
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", background: "#fff" }}>
                <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-medium tracking-widest text-zinc-400">Section</span>
                  <span className="text-xs font-medium tracking-widest text-zinc-400">Risk level</span>
                </div>
                {[
                  ["Data & compliance", "HIGH"],
                  ["Risk & governance", "HIGH"],
                  ["Current AI use", "MEDIUM"],
                  ["People & culture", "MEDIUM"],
                  ["Business context", "LOW"],
                  ["Opportunity", "LOW"],
                ].map(([label, risk], i, arr) => {
                  const pill = {
                    HIGH:   { text: "text-red-600",   bg: "bg-red-50",    border: "border-red-100"   },
                    MEDIUM: { text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100" },
                    LOW:    { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                  }[risk];
                  return (
                    <div key={label} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-zinc-50" : ""}`}>
                      <span className="text-sm text-zinc-600">{label}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${pill.text} ${pill.bg} ${pill.border}`}>{risk}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 03 Priority recommendations */}
            <div className="bg-zinc-100 rounded-xl p-8 border border-zinc-200">
              <p className="text-xs tracking-widest text-zinc-400 mb-4">03 — priority recommendations</p>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.875rem", fontWeight: 400, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "1rem" }}>Ranked. Specific. Traceable.</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">Every obligation linked to its source document. Not generic advice.</p>
              <div className="flex flex-col gap-3">
                {[
                  "Complete a DPIA before any deployment",
                  "Appoint a named AI decision owner",
                  "Finalise AI usage policy within 30 days",
                  "Review insurance coverage for AI incidents",
                ].map((action, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs font-semibold mt-0.5 min-w-4" style={{ color: '#0789a8' }}>{i + 1}</span>
                    <span className="text-xs text-zinc-500 leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 04 90-day plan — full width */}
            <div className="sm:col-span-2 bg-zinc-50 rounded-xl p-8 border border-zinc-100">
              <p className="text-xs tracking-widest text-zinc-400 mb-4">04 — 90-day action plan</p>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.875rem', fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.5rem' }}>A phased programme your board can act on.</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  ["Days 1–30", "Immediate", ["AI usage policy finalised", "Begin DPIA", "AI risk register created"]],
                  ["Days 31–60", "Build foundations", ["Complete and sign off DPIA", "Review insurance coverage", "Mandatory staff briefings"]],
                  ["Days 61–90", "Embed and progress", ["External pilot go/no-go", "Board AI subcommittee", "Next AI project scoped"]],
                ].map(([period, label, items]) => (
                  <div key={period} className="bg-zinc-50 rounded-lg border border-zinc-200 p-5">
                    <p className="text-xs tracking-widest mb-1" style={{ color: '#0789a8' }}>{period}</p>
                    <p className="text-sm font-medium text-black mb-3">{label}</p>
                    {items.map(item => (
                      <p key={item} className="text-xs text-zinc-500 leading-relaxed mb-1">{item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-zinc-200 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-xl font-normal text-black mb-1">From £2,000.</p>
            <p className="text-sm text-zinc-500">Delivered within five working days of the discovery interview.</p>
          </div>
          <a
            href="mailto:alistair@mawdsleyadvisory.com?subject=Full%20AI%20Audit%20enquiry"
            className="text-xs tracking-widest font-medium bg-black text-white px-8 py-4 hover:bg-zinc-800 transition-colors duration-300 rounded-lg"
          >
            book a discovery call
          </a>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 py-6 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-zinc-300 tracking-wide">Regulatory guidance only. Not legal advice.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-xs text-zinc-300 hover:text-black transition-colors">privacy notice</a>
            <a href="https://mawdsleyadvisory.com" className="text-xs text-zinc-300 hover:text-black transition-colors">Mawdsley Advisory</a>
          </div>
        </div>

      </div>
    </>
  );
}
