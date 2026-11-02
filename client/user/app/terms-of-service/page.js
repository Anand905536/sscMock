export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl shadow-zinc-950/40 text-zinc-300">
        <h1 className="text-3xl font-extrabold text-white border-b border-zinc-800 pb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-400">Effective Date: October 30, 2026</p>

        <p className="leading-relaxed">
          Welcome to <strong className="text-emerald-400">SubjectWise</strong>. By using our website, you agree to comply with and be bound by the following terms.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">
          1. Intellectual Property & Content Protection
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            All compiled question sets, user interfaces, platform designs, and custom explanations are the intellectual property of SubjectWise.
          </li>
          <li>
            You may not scrape, copy, mass-download, or redistribute our database of questions onto competing websites or public forums.
          </li>
        </ul>

        <h2 className="text-lg font-bold text-white pt-2">2. Paid Subscriptions & Refund Policy</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            We may offer premium test packs or subscription tiers in the future. Access granted under a paid tier is strictly for individual use.
          </li>
          <li>
            Due to the digital nature of our study materials and test series, all purchases are generally <strong className="text-white">non-refundable</strong> once access is granted, unless explicitly stated otherwise for specific promotional campaigns.
          </li>
        </ul>

        <h2 className="text-lg font-bold text-white pt-2">3. Limitation of Liability</h2>
        <p className="leading-relaxed">
          SubjectWise provides educational practice tools for SSC and Railway aspirants. We do not guarantee selection in official government exams, and test scores on our platform reflect practice analytics only.
        </p>
      </div>
    </main>
  );
}