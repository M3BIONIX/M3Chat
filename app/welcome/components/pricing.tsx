import { Check, ArrowRight } from "lucide-react"

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-4">
            Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Find the Perfect Plan for Your Needs</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start for free and scale as you grow. No hidden fees, just pure creative power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
          {/* Free Plan */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">The Explorer</h3>
            <p className="text-sm text-gray-400 mb-6">
              Perfect for getting started and exploring the power of AI at no cost.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-400">/mo</span>
            </div>
            <button
              className="w-full rounded-full border-white/10 hover:bg-white/10 mb-8 bg-transparent"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <div className="space-y-4">
              {[
                "100 AI Credits per month",
                "Standard 720p video quality",
                "Watermarked videos",
                "Full access to AI models",
                "Community support",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-gray-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-cyan-400/10 to-black border border-cyan-400/50 rounded-3xl p-8 relative transform scale-105 shadow-[0_0_40px_rgba(34,211,238,0.1)] z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-400 text-black text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">The Creator</h3>
            <p className="text-sm text-gray-400 mb-6">
              For professionals who need high-quality, watermark-free content.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-cyan-400">$179</span>
              <span className="text-gray-400">/mo</span>
            </div>
            <button className="w-full rounded-full bg-cyan-400 text-black hover:bg-cyan-500 mb-8">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <div className="space-y-4">
              {[
                "2,000 AI Credits per month",
                "High-quality 1080p HD video",
                "No watermarks",
                "Commercial use license",
                "Priority support",
                "Best for creators & small biz",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-gray-200">
                  <div className="p-0.5 rounded-full bg-cyan-400/20">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">The Powerhouse</h3>
            <p className="text-sm text-gray-400 mb-6">
              Unlimited creation, collaboration, and the highest quality for your team.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$250</span>
              <span className="text-gray-400">/mo</span>
            </div>
            <button
              className="w-full rounded-full border-white/10 hover:bg-white/10 mb-8 bg-transparent"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <div className="space-y-4">
              {[
                "Unlimited AI Credits",
                "Premium 4K video quality",
                "API access for integration",
                "Team collaboration (5 seats)",
                "Dedicated onboarding",
                "Best for agencies",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-gray-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
