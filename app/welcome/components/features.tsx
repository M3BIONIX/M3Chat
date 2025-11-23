import React from "react"
import Image from "next/image"
import { Wand2, Video, ImageIcon, Code, Zap, Layers } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Wand2,
      title: "AI-Powered Video Generation",
      description: "Create videos directly from natural text prompts with high fidelity.",
      image: "/abstract-futuristic-ui-network-nodes-white-backgro.jpg",
    },
    {
      icon: Layers,
      title: "Brand Style Consistency",
      description: "Maintain your brand's look and feel across all generated content.",
      image: "/fashion-model-street-wear-cool.jpg",
    },
    {
      icon: Video,
      title: "Instant, High-Quality Output",
      description: "Get studio-grade videos in seconds.",
      image: "/4k-cinematic-camera-lens-render.jpg",
    },
    {
      icon: ImageIcon,
      title: "Image-to-Motion Conversion",
      description: "Bring static visuals to life with smooth, realistic movement.",
      image: "/urban-sneakers-product-shot-cool-lighting.jpg",
    },
    {
      icon: Code,
      title: "API Access",
      description: "Integrated with the best AI models for seamless workflows.",
      image: "/abstract-futuristic-ui-network-nodes-white-backgro.jpg",
    },
    {
      icon: Zap,
      title: "Perfect for Creators & Brands",
      description: "Fashion, retail, marketing — you name it.",
      image: "/urban-sneakers-product-shot-cool-lighting.jpg",
    },
  ]

  return (
    <section id="features" className="py-20 bg-black relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-4">
            Powerful Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">The Future of Content Creation is Here</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the powerful features that make content creation effortless and exceptional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-neutral-900 border border-white/10 shadow-lg hover:shadow-cyan-500/10 transition-all group overflow-hidden"
            >
              <div className="h-48 rounded-xl bg-black mb-6 overflow-hidden relative border border-white/5">
                <Image
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500"
                />
              </div>
              <div className="flex items-center gap-3 mb-2">
                {React.createElement(feature.icon, { className: "w-6 h-6 text-cyan-400" })}
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
