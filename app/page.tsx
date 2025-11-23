export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-3xl w-full border border-neutral-800 rounded-2xl p-8 md:p-10 bg-neutral-950/90 shadow-xl">
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            GeneGenie · DNA-powered wellness teaser
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Turn your raw DNA into a playful wellness snapshot ⚡
        </h1>

        <p className="text-sm md:text-base text-neutral-300 mb-6 leading-relaxed">
          GeneGenie gives you an instant, AI-generated interpretation of a few
          of your DNA markers. This teaser experience is fun, bite-sized, and{" "}
          <span className="font-semibold">never medical advice</span>—just a
          glimpse into what&apos;s possible with your full report.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
    <a
      href="/upload?pkg=tease"
      className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold
                 bg-emerald-500 text-black hover:bg-emerald-400 transition-colors w-full md:w-auto"
    >
      Try the free DNA teaser
    </a>
    <a
      href="/packages"
      className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold
                 border border-neutral-700 text-neutral-100 hover:border-neutral-500 hover:bg-neutral-900
                 transition-colors w-full md:w-auto"
    >
      View full packages
    </a>
  </div>

  <div className="text-xs text-neutral-400 flex-1 md:self-center">
    No signup required for the teaser. When you&apos;re ready, upgrade to a deeper wellness or biohacker report.
  </div>
</div>


        <div className="grid gap-4 md:grid-cols-3 text-xs md:text-sm text-neutral-300">
          <div className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/60">
            <p className="font-semibold mb-1">Playful, not clinical</p>
            <p>Lighthearted language, zero diagnosis. Think “cosmic horoscope” but for your DNA.</p>
          </div>
          <div className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/60">
            <p className="font-semibold mb-1">AI + genetics</p>
            <p>We mix modern AI with basic genetic patterns to create fun, personalized narratives.</p>
          </div>
          <div className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/60">
            <p className="font-semibold mb-1">Future-ready</p>
            <p>This teaser is step one. Full wellness, fitness, and trait reports are coming.</p>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-neutral-500">
          GeneGenie is for entertainment and educational purposes only. It does
          not provide medical, diagnostic, or treatment advice.
        </p>
      </div>
    </main>
  );
}
