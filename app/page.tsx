export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400 mb-3">
          GeneGenie · DNA-powered wellness
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">
          Turn your raw DNA into fun,
          <span className="text-emerald-400"> personalized insights</span>.
        </h1>
        <p className="text-neutral-400 text-sm md:text-base mb-8">
          Upload a DNA file, and GeneGenie generates a playful,
          non-medical report in seconds. Start with a free teaser,
          then unlock deeper wellness and biohacker packages when you&apos;re ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <a
            href="/packages"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full
                       bg-emerald-500 hover:bg-emerald-400 text-sm font-medium
                       transition-colors"
          >
            View DNA packages
          </a>
          <a
            href="/upload?pkg=tease"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full
                       border border-neutral-700 hover:border-neutral-500
                       text-sm font-medium text-neutral-200 transition-colors"
          >
            Try free DNA teaser
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs md:text-sm">
          <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/70">
            <p className="font-semibold mb-1">Not medical advice</p>
            <p className="text-neutral-400">
              GeneGenie is for entertainment and education only. It&apos;s not
              a diagnostic tool or a replacement for a doctor.
            </p>
          </div>
          <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/70">
            <p className="font-semibold mb-1">Works with raw DNA files</p>
            <p className="text-neutral-400">
              Designed to work with typical raw DNA exports (23andMe, Ancestry, etc.).
              This demo uses a tiny test file just to show the experience.
            </p>
          </div>
          <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/70">
            <p className="font-semibold mb-1">AI-generated on demand</p>
            <p className="text-neutral-400">
              Every report is generated fresh with AI so it feels personal,
              playful, and aligned with the package you choose.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
