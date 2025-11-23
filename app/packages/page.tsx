export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Choose Your GeneGenie Journey</h1>
          <p className="text-sm md:text-base text-neutral-300">
            Start with a free DNA teaser, then unlock deeper wellness and performance insights.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Teaser */}
          <div className="border border-neutral-800 rounded-2xl p-5 bg-neutral-950/90 shadow-lg flex flex-col">
            <p className="text-xs font-semibold text-emerald-300 mb-1">Start here · Free</p>
            <h2 className="text-xl font-semibold mb-1">DNA Tease</h2>
            <p className="text-xs text-neutral-400 mb-4">Try GeneGenie with a playful, bite-sized DNA reading.</p>

            <p className="text-3xl font-bold mb-1">$0</p>
            <p className="text-xs text-neutral-400 mb-4">one-time · no signup</p>

            <ul className="text-xs text-neutral-300 space-y-1 mb-6">
              <li>• Fun 1–2 paragraph DNA snapshot</li>
              <li>• A couple of playful trait vibes</li>
              <li>• Clear “not medical advice” disclaimer</li>
            </ul>

            <a
              href="/upload?pkg=tease"
              className="mt-auto inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold
                         bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
            >
              Try the free teaser
            </a>
          </div>

          {/* Wellness Core */}
          <div className="border border-neutral-800 rounded-2xl p-5 bg-teal-500/10 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-teal-300">Most popular</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-400/60 text-teal-200">
                Wellness Core
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-1">The Wellness Core</h2>
            <p className="text-xs text-neutral-300 mb-4">
              Your complete wellness blueprint. Great general-purpose DNA report.
            </p>

            <p className="text-3xl font-bold mb-1">$34</p>
            <p className="text-xs text-neutral-400 mb-4">one-time</p>

            <ul className="text-xs text-neutral-200 space-y-1 mb-6">
              <li>• Core wellness genes (MTHFR, COMT, FTO, ACTN3, CYP1A2, etc.)</li>
              <li>• Energy & recovery themes</li>
              <li>• Nutrition & appetite tendencies</li>
              <li>• Mood & sleep traits</li>
              <li>• Gentle supplement-style ideas</li>
              <li>• PDF-style report + email delivery (v1 text now, visuals later)</li>
            </ul>

            <a
              href="https://buy.stripe.com/test_fZu7sL5jr7eY7M1eP2cQU03"
              className="mt-auto inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold
                         bg-teal-400 text-black hover:bg-teal-300 transition-colors"
            >
              Select Core (test checkout)
            </a>
          </div>

          {/* Biohacker Pack */}
          <div className="border border-neutral-800 rounded-2xl p-5 bg-violet-500/10 shadow-lg flex flex-col">
            <p className="text-xs font-semibold text-violet-300 mb-1">For gym rats & optimizers</p>
            <h2 className="text-xl font-semibold mb-1">The Biohacker Pack</h2>
            <p className="text-xs text-neutral-300 mb-4">
              Everything in Wellness Core plus extra performance, focus, and recovery insights.
            </p>

            <p className="text-3xl font-bold mb-1">$59</p>
            <p className="text-xs text-neutral-400 mb-4">one-time</p>

            <ul className="text-xs text-neutral-200 space-y-1 mb-6">
              <li>• Everything in Wellness Core</li>
              <li>• Workout & muscle response (ACTN3, recovery, inflammation)</li>
              <li>• Dopamine / motivation / stress tendencies</li>
              <li>• Light, cold exposure & circadian hints</li>
              <li>• Recovery, hydration & electrolytes themes</li>
              <li>• Lifestyle ideas for training & productivity</li>
            </ul>

            <a
              href="https://buy.stripe.com/test_00w5kDbHP6aUc2hdKYcQU01"
              className="mt-auto inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold
                         bg-violet-400 text-black hover:bg-violet-300 transition-colors"
            >
              Select Biohacker (test checkout)
            </a>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-neutral-500 text-center">
          All GeneGenie experiences are for entertainment and educational purposes only and do not provide
          medical advice, diagnosis, or treatment.
        </p>
      </div>
    </main>
  );
}
