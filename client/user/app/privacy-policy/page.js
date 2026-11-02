export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl shadow-zinc-950/40 text-zinc-300">
        <h1 className="text-3xl font-extrabold text-white border-b border-zinc-800 pb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-400">Effective Date: October 30, 2026</p>

        <p className="leading-relaxed">
          At <strong className="text-emerald-400">SubjectWise</strong> (accessible via our Vercel deployment), we respect your privacy and are committed to protecting your personal information. This policy explains what we collect and how we use it.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-white">Account Details:</strong> When you sign up, we store your username, email address, and authentication tokens securely in our database.
          </li>
          <li>
            <strong className="text-white">Usage Data:</strong> Mock test scores, attempted topics, and website navigation patterns to help improve your study experience.
          </li>
          <li>
            <strong className="text-white">Payment Information:</strong> When you purchase a future premium subscription, financial transactions are handled securely by certified third-party payment gateways (e.g., Razorpay/Stripe). We do not store your bank passwords or card CVVs.
          </li>
        </ul>

        <h2 className="text-lg font-bold text-white pt-2">2. How We Use Your Data</h2>
        <p className="leading-relaxed">
          Your data is used strictly to maintain your account, track your test performance progress, and communicate important platform updates. We never sell your data to advertisers.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">3. Contact Us</h2>
        <p className="leading-relaxed">
          If you have any privacy-related questions, feel free to contact us through our platform support channels.
        </p>
      </div>
    </main>
  );
}