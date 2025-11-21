"use client";

type PackageId =
  | "tease"
  | "wellness-core"
  | "biohacker-pack"
  | "life-plan"
  | "personality-pack"
  | "parent-decoder";

type PackageConfig = {
  id: PackageId;
  name: string;
  price: string;
  tagline: string;
  bullets: string[];
  stripeLink: string;
  badge?: string;
};

const PACKAGES: PackageConfig[] = [
  {
    id: "tease",
    name: "DNA Tease",
    price: "$5",
    tagline: "Go viral with your genes",
    bullets: [
      "Perfect for sharing",
      "Discover fun traits",
      "3–5 quirky personality traits",
      "Share-worthy visuals",
      "Fun insights like 'midnight snacker gene'",
      "Social media ready graphics",
      "Email delivery",
    ],
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_TEASE_LINK || "#",
  },
  {
    id: "wellness-core",
    name: "The Wellness Core",
    price: "$34",
    tagline: "Your complete wellness blueprint",
    bullets: [
      "Most popular",
      "Competes with LifeDNA",
      "Best value",
      "Core 5 genes: MTHFR + COMT + FTO + ACTN3 + CYP1A2",
      "Nutrition & fitness analysis",
      "Mood & sleep traits",
      "Basic supplement suggestions",
      "PDF + email delivery",
      "Faster & cheaper than competitors",
    ],
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_WELLNESS_CORE_LINK || "#",
    badge: "Most popular",
  },
  {
    id: "biohacker-pack",
    name: "The Biohacker Pack",
    price: "$59",
    tagline: "Optimize everything",
    bullets: [
      "For gym rats",
      "Productivity geeks",
      "Health-obsessed",
      "Everything in Wellness Core +",
      "Epigenetic-friendly recommendations",
      "Cold exposure & light therapy genes",
      "Dopamine profile (motivation, stress, addiction)",
      "Workout optimizer (ACTN3, recovery, inflammation)",
      "Electrolyte & hydration genes",
      "Gut, detox & inflammation mapping",
      "Weekly AI insights for 30 days",
    ],
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_BIOHACKER_LINK || "#",
  },
  {
    id: "life-plan",
    name: "The Life Plan",
    price: "$89",
    tagline: "Your DNA-powered life coach",
    bullets: [
      "Complete lifestyle guide",
      "Daily AI coaching",
      "Maximum results",
      "Everything in Biohacker Pack +",
      "AI-generated daily wellness routine",
      "Custom supplement stack",
      "Mood & mental health guide",
      "Sleep routine based on CLOCK gene",
      "Weekly progress tracking via email",
      "Personalized wake times & exercise windows",
      "Caffeine & stress optimization",
    ],
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_LIFE_PLAN_LINK || "#",
  },
  {
    id: "personality-pack",
    name: "The Personality Pack",
    price: "$39",
    tagline: "Go viral with your quirks",
    bullets: [
      "TikTok viral ready",
      "Perfect gift",
      "Social buzz",
      "25+ quirky gene traits",
      "Netflix addiction gene",
      "Cilantro hatred trait",
      '"Dad jokes" susceptibility',
      "Thrill-seeking & fear of change",
      "Custom avatar profile",
      "Shareable social cards",
      "Gift option available",
    ],
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_PERSONALITY_LINK || "#",
  },
  {
    id: "parent-decoder",
    name: "The Parent Decoder",
    price: "$59",
    tagline: "Unlock your child's genetic blueprint",
    bullets: [
      "Perfect for parents",
      "Understanding your child",
      "Parenting toolkit",
      "Upload child's DNA file",
      "Temperament & learning style analysis",
      "Emotional regulation insights",
      "Screen sensitivity traits",
      "Nutrition needs for kids",
      "ADHD/autism-related gene insights (non-diagnostic)",
      "Gene-based parenting strategies",
      'AI bot: "What foods calm my kid\'s COMT?"',
    ],
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_PARENT_DECODER_LINK || "#",
  },
];

export default function PackagesPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-2xl w-full p-6 space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-yellow-400">GeneGenie</h1>
          <h2 className="text-lg font-semibold">Choose Your DNA Journey</h2>
          <p className="text-xs text-gray-400">
            From fun traits to complete wellness transformation
          </p>
        </header>

        <div className="space-y-4">
          {PACKAGES.map((pkg) => (
            <article
              key={pkg.id}
              className="rounded-2xl p-4 bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  <p className="text-xs text-gray-300">{pkg.tagline}</p>
                </div>
                {pkg.badge && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500 text-black font-semibold uppercase tracking-wide">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold mb-2">
                {pkg.price}
                <span className="text-xs font-normal text-gray-300 ml-1">
                  one-time
                </span>
              </p>

              <ul className="text-xs text-gray-200 space-y-1 mb-4">
                {pkg.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <a
                href={pkg.stripeLink}
                className="block w-full text-center text-sm font-medium py-2 rounded-full bg-white text-black hover:bg-gray-100 transition"
              >
                Select Package
              </a>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
