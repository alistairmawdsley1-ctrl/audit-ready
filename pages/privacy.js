import Head from "next/head";
import Link from "next/link";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Notice — ValarAudit</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-200">
          <div className="max-w-2xl mx-auto px-8 py-6 flex items-center justify-between">
            <Link href="/" className="text-xs tracking-widest uppercase font-medium hover:opacity-60 transition-opacity">
              ValarAudit
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-2xl mx-auto px-8 py-16 w-full">
          <p className="text-xs tracking-widest uppercase text-zinc-400 mb-6">Legal</p>
          <h1 className="text-3xl font-light tracking-tight text-black mb-2">Privacy Notice</h1>
          <p className="text-sm text-zinc-400 mb-12">ValarAudit, operated by Mawdsley Advisory. Last updated May 2026.</p>

          <div className="space-y-10 text-sm text-zinc-700 leading-relaxed">

            <section>
              <h2 className="text-base font-medium text-black mb-3">Who we are</h2>
              <p>ValarAudit is operated by Mawdsley Advisory. We are the data controller for any personal data collected through this website.</p>
              <p className="mt-3">If you have any questions about how we handle your personal data, contact us at <a href="mailto:alistair@mawdsleyadvisory.com" className="text-black underline underline-offset-2">alistair@mawdsleyadvisory.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black mb-3">What data we collect and why</h2>

              <h3 className="font-medium text-black mb-2 mt-4">During the assessment</h3>
              <p>When you complete the AI regulatory assessment, you provide information about your business and AI deployment. Your answers are processed by Claude, an AI model developed by Anthropic, to generate the assessment questions and map your responses to relevant regulatory regimes. Anthropic processes this data as a sub-processor on our behalf. You can read Anthropic's privacy policy at anthropic.com/privacy. This may include your business sector, a description of your AI system, and details about how it is used.</p>
              <p className="mt-3">This information is used only to generate your assessment results. It is not stored after your session ends. We do not link it to your identity unless you choose to contact us or purchase a report.</p>
              <p className="mt-3">We process this data on the basis of legitimate interests: providing you with the regulatory guidance you have requested.</p>

              <h3 className="font-medium text-black mb-2 mt-6">When you purchase a report</h3>
              <p>If you purchase a full report via Stripe, Stripe processes your payment details directly. We do not receive or store your payment card information.</p>
              <p className="mt-3">When you complete a purchase, Stripe notifies us of the transaction. We use your email address to deliver your report. We retain your email address and the details of your assessment for up to 12 months in order to handle any queries about your report, after which it is deleted.</p>
              <p className="mt-3">We process this data on the basis of contract performance: you have purchased a service and we need your contact details to deliver it.</p>

              <h3 className="font-medium text-black mb-2 mt-6">Payment processing</h3>
              <p>Stripe processes payments on our behalf. Stripe is the data controller for payment data. You can read Stripe's privacy policy at <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2">stripe.com/gb/privacy</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black mb-3">What we do not do</h2>
              <p>We do not sell your data. We do not share it with third parties except as described above. We do not use it for marketing without your consent. We do not make automated decisions about you as an individual. The assessment generates regulatory guidance about your AI deployment, not decisions about you personally. If you wish to query or discuss your results, contact us at alistair@mawdsleyadvisory.com.</p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black mb-3">Your rights</h2>
              <p>Under UK GDPR you have the right to access the personal data we hold about you, correct inaccurate data, request deletion of your data, object to our processing, and request that we restrict processing while a complaint is resolved.</p>
              <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:alistair@mawdsleyadvisory.com" className="text-black underline underline-offset-2">alistair@mawdsleyadvisory.com</a>. We will respond within one calendar month.</p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black mb-3">Cookies</h2>
              <p>This website does not use tracking or advertising cookies. We may use a session cookie to maintain your assessment progress within a single visit. This cookie is deleted when you close your browser.</p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black mb-3">Changes to this notice</h2>
              <p>If we make material changes to this notice we will update the date at the top. We recommend checking this page periodically.</p>
            </section>

            <section>
              <h2 className="text-base font-medium text-black mb-3">Complaints</h2>
              <p>If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the Information Commissioner's Office at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2">ico.org.uk</a> or by calling 0303 123 1113.</p>
            </section>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200">
          <div className="max-w-2xl mx-auto px-8 py-6 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-zinc-300">Regulatory guidance only. Not legal advice.</p>
            <p className="text-xs text-zinc-300">Mawdsley Advisory</p>
          </div>
        </footer>
      </div>
    </>
  );
}
