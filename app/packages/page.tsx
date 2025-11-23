const packages = [
  {
    id: "tease",
    name: "DNA Tease",
    tagline: "Go viral with your genes",
    price: "$0",
    badge: "Free teaser",
    description:
      "A playful mini-report with a few fun, social-media-ready traits.",
    bullets: [
      "3–5 quirky personality insights",
      "Fun, screenshot-worthy wording",
      "Great way to preview GeneGenie",
    ],
    cta: "Start free teaser",
    href: "/upload?pkg=tease",
    highlight: false,
  },
  {
    id: "core",
    name: "The Wellness Core",
    tagline: "Your complete wellness blueprint",
    price: "$34",
    badge: "Most popular",
    description:
      "A deeper wellness-focused report that competes with simple DNA wellness products.",
    bullets: [
      "Energy & recovery tendencies",
      "Nutrition & metabolism vibes (non-medical)",
      "Mood & sleep trait insights",
      "Gentle, lifestyle-style suggestions",
    ],
    cta: "Checkout with Stripe",
    href: "https://buy.stripe.com/test_fZu7sL5jr7eY7M1eP2cQU03",
    highlight: true,
  },
  {
    id: "premium",
    name: "The Biohacker Pack",
    tagline: "Optimize everything",
    price: "$59",
    badge: "For gym rats & geeks",
    description:
      "An upgraded blueprint for performance nerds, recovery junkies, and optimization-obsessed humans.",
    bullets: [
      "Training & muscle response insights",
      "Focus, drive & dopamine-style tendencies (non-medical)",
      "Recovery, inflammation & hydration angles",
      "90-day biohacker experiment game plan",
    ],
    cta: "Checkout with Stripe",
    href: "https://buy.stripe.com/test_00w5kDbHP6aUc2hdKYcQU01",
    highlight: false,
  },
];

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400 mb-3">
            GeneGenie Packages
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Choose your DNA journey
          </h1>
          <p className="text-neutral-400 text-sm md:text-base">
            Start with a free teaser, then upgrade to deeper wellness and
            biohacker reports whenever you&apos;re ready. All reports are
            playful, AI-generated, and strictly non-medical.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col rounded-2xl border p-5 bg-neutral-950/80 ${
                pkg.highlight
                  ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                  : "border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{pkg.name}</h2>
                {pkg.badge && (
                  <span className="text-[10px] px-2 py-1 rounded-full border border-neutral-700 text-neutral-300">
                    {pkg.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mb-2">{pkg.tagline}</p>
              <p className="text-2xl font-bold mb-1">{pkg.price}</p>
              <p className="text-xs text-neutral-400 mb-4">
                one-time · report delivered instantly on-screen
              </p>
              <p className="text-xs text-neutral-300 mb-4">{pkg.description}</p>
              <ul className="text-xs text-neutral-300 space-y-1 mb-6">
                {pkg.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-emerald-400 mt-[2px]">✔</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href={pkg.href}
                className="mt-auto inline-flex items-center justify-center px-4 py-2.5
                           rounded-full text-xs font-medium
                           bg-emerald-500 hover:bg-emerald-400
                           text-black transition-colors"
                target={pkg.id === "tease" ? "_self" : "_blank"}
                rel={pkg.id === "tease" ? undefined : "noreferrer"}
              >
                {pkg.cta}
              </a>
              {pkg.id !== "tease" && (
                <p className="mt-2 text-[10px] text-neutral-500">
                  Uses Stripe test checkout. On success, you&apos;ll be redirected
                  back to GeneGenie to upload your DNA.
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-[11px] text-neutral-500 text-center">
          GeneGenie reports are for entertainment and educational purposes only.
          They are not medical advice, diagnosis, or treatment.
        </p>
      </div>
    </main>
  );
}
