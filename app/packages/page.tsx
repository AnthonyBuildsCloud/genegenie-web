"use client";

import Link from "next/link";

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400 mb-3 text-center">
          GeneGenie · DNA-powered wellness
        </p>

        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-3">
          Choose your GeneGenie DNA experience
        </h1>

        <p className="text-neutral-400 text-sm md:text-base text-center mb-8">
          Start with a completely free DNA teaser, then unlock deeper
          wellness and biohacker reports when you&apos;re ready. All
          reports are AI-generated, playful, and{" "}
          <span className="font-semibold text-neutral-200">
            not medical advice
          </span>
          .
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          {/* DNA Tease - FREE */}
          <div className="border border-neutral-800 rounded-2xl bg-neutral-950/80 p-4 flex flex-col">
            <p className="text-xs font-semibold text-emerald-400 mb-1">
              Starter
            </p>
            <h2 className="text-lg font-semibold mb-2">DNA Tease</h2>
            <p className="text-2xl font-bold mb-1">$0</p>
            <p className="text-[11px] text-neutral-400 mb-3">
              Fun, social-friendly mini report from a tiny DNA sample.
              Great to try the vibe before upgrading.
            </p>
            <ul className="text-[11px] text-neutral-300 space-y-1 mb-4">
              <li>• Quick, playful personality-style insights</li>
              <li>• Based on a tiny subset of your file</li>
              <li>• Screenshot-ready, non-serious vibes</li>
            </ul>
            <div className="mt-auto">
              <Link
                href="/upload?pkg=tease"
                className="block w-full text-center text-xs font-medium
                           rounded-full px-3 py-2
                           bg-neutral-900 hover:bg-neutral-800
                           border border-neutral-700
                           transition-colors"
              >
                Start free teaser
              </Link>
            </div>
          </div>

          {/* Wellness Core – $39 */}
          <div className="border border-neutral-800 rounded-2xl bg-neutral-950/80 p-4 flex flex-col">
            <p className="text-xs font-semibold text-neutral-300 mb-1">
              Most approachable
            </p>
            <h2 className="text-lg font-semibold mb-2">Wellness Core</h2>
            <p className="text-2xl font-bold mb-1">$39</p>
            <p className="text-[11px] text-neutral-400 mb-3">
              A friendly, mid-depth wellness blueprint using core panels
              for methylation, nutrition, fitness, and sleep.
            </p>
            <ul className="text-[11px] text-neutral-300 space-y-1 mb-4">
              <li>• Methylation & detox tendencies (MTHFR, COMT, etc.)</li>
              <li>• Nutrition & weight-style insights (FTO, TCF7L2…)</li>
              <li>• Light fitness & movement profile (ACTN3)</li>
              <li>• Basic sleep & rhythm tendencies (CLOCK)</li>
            </ul>
            <div className="mt-auto">
              <a
                href="https://buy.stripe.com/test_8x214n3bj9n65DTayMcQU0f"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-xs font-medium
                           rounded-full px-3 py-2
                           bg-emerald-500 hover:bg-emerald-400
                           text-black transition-colors"
              >
                Buy Wellness Core – $39
              </a>
            </div>
          </div>

          {/* Biohacker Pack – $89 */}
          <div className="border border-emerald-500/80 rounded-2xl bg-emerald-500/5 p-4 flex flex-col relative">
            <div className="absolute -top-2 right-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-semibold">
                Most Popular
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-400 mb-1">
              For gym rats & optimizers
            </p>
            <h2 className="text-lg font-semibold mb-2">Biohacker Pack</h2>
            <p className="text-2xl font-bold mb-1">$89</p>
            <p className="text-[11px] text-neutral-400 mb-3">
              Deeper performance, dopamine, caffeine and recovery insights
              for people who love tweaking routines.
            </p>
            <ul className="text-[11px] text-neutral-300 space-y-1 mb-4">
              <li>• Includes all Core panels plus performance-focused ones</li>
              <li>• Training style & muscle response (ACTN3, ADRB2, PPARGC1A)</li>
              <li>• Dopamine, focus & drive (COMT, MAOA)</li>
              <li>• Caffeine metabolism & sleep interaction (CYP1A2, ADORA2A)</li>
              <li>• Recovery & inflammation profile (IL6, IL1B, IL4)</li>
              <li>• 90-day “Biohacker Game Plan” suggestions</li>
            </ul>
            <div className="mt-auto">
              <a
                href="https://buy.stripe.com/test_cNicN5aDLczic2h0YccQU0e"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-xs font-medium
                           rounded-full px-3 py-2
                           bg-emerald-500 hover:bg-emerald-400
                           text-black transition-colors"
              >
                Buy Biohacker Pack – $89
              </a>
            </div>
          </div>

          {/* GeneGenie Life Plan – $139 */}
          <div className="border border-purple-500/70 rounded-2xl bg-purple-500/5 p-4 flex flex-col">
            <p className="text-xs font-semibold text-purple-300 mb-1">
              Flagship
            </p>
            <h2 className="text-lg font-semibold mb-2">GeneGenie Life Plan</h2>
            <p className="text-2xl font-bold mb-1">$139</p>
            <p className="text-[11px] text-neutral-400 mb-3">
              Full “life blueprint” experience designed to compete with and
              exceed typical consumer DNA wellness reports at a lower price.
            </p>
            <ul className="text-[11px] text-neutral-300 space-y-1 mb-4">
              <li>• All Core + Biohacker panels, plus extra structure</li>
              <li>• Big Picture Snapshot & Trait Summary Table</li>
              <li>• Deep dives: methylation, nutrition, training, sleep, dopamine, caffeine, recovery</li>
              <li>• Structured 90-day Life Plan (3 phases)</li>
              <li>• Long-term check-in guidance & gentle cautions</li>
            </ul>
            <div className="mt-auto">
              <a
                href="https://buy.stripe.com/test_5kQeVddPX7eY7M15escQU0d"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-xs font-medium
                           rounded-full px-3 py-2
                           bg-purple-500 hover:bg-purple-400
                           text-black transition-colors"
              >
                Buy Life Plan – $139
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-neutral-500 text-center max-w-3xl mx-auto">
          All GeneGenie reports are for entertainment and educational purposes only.
          They are based on limited consumer DNA data and AI interpretation, and are
          <span className="font-semibold"> not medical advice</span>, diagnosis,
          or treatment. Always talk to a qualified healthcare professional about
          real health concerns.
        </p>
      </div>
    </main>
  );
}
