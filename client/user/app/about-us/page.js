export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl shadow-zinc-950/40 text-zinc-100">
        <h1 className="text-3xl font-extrabold text-white border-b border-zinc-800 pb-4">
          About Us
        </h1>
        
        <p className="text-zinc-300 leading-relaxed">
          Welcome to <strong className="text-emerald-400">SubjectWise</strong>, your dedicated digital companion for mastering SSC (CGL, CHSL, MTS) and Railway (RRB) competitive examinations. 
        </p>

        <h2 className="text-xl font-bold text-white pt-4">Our Mission</h2>
        <p className="text-zinc-300 leading-relaxed">
          We believe that structured practice and consistent revision of Previous Year Questions (PYQs) are the ultimate keys to clearing government exams. SubjectWise is built to provide aspirants with a clean, distraction-free environment to practice topic-wise questions and build exam temperament.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">What We Offer</h2>
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          <li>
            <strong className="text-white">Topic-Wise Question Banks:</strong> Handpicked English and General Studies questions categorized precisely by topics.
          </li>
          <li>
            <strong className="text-white">Exam-Focused Practice:</strong> Designed specifically keeping the latest TCS-led exam patterns in mind.
          </li>
          <li>
            <strong className="text-white">Future-Ready Test Series:</strong> Affordable free and premium mock tests to evaluate your speed and accuracy.
          </li>
        </ul>

        <div className="pt-6 border-t border-zinc-800 text-sm text-zinc-400">
          Have questions or feedback? Reach out to us at <span className="font-medium text-emerald-400">support@subjectwise-nine.vercel.app</span>
        </div>
      </div>
    </main>
  );
}