'use client';
import Image from "next/image"
import { ArrowUp, Paperclip, Wand2 } from "lucide-react"
import { ChatInput } from "@/app/components/chat-input/ChatInput"

export function Hero() {
  return (
    <section className="relative pt-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Talk to M3Chat. Create Anything.</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Your Creative Partner <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-cyan-600">
              Powered by Conversation.
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            From dynamic video generation to intelligent chat, our AI-powered suite helps you create compelling content
            and conversations. Your all-in-one solution for modern creation.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="relative max-w-5xl mx-auto min-h-[400px] md:min-h-[400px]">
          {/* Main Chat/Input Interface */}
          <div className="z-50 relative">
            <ChatInput />
          </div>

          {/* Floating Elements */}
          <div className="absolute  md:-left-32 top-[50px] p-4 bg-gray-900/90 border border-white/10 rounded-2xl backdrop-blur-xl w-64 hidden md:block animate-in fade-in slide-in-from-left-10 duration-1000 z-30 shadow-2xl">
            <div className="space-y-3">
              <div className="h-48 rounded-lg overflow-hidden relative group">
                <Image src="/fashion-model-street-wear-cool.jpg" alt="Fashion" fill sizes="256px" className="object-cover" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5 text-white">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  2.5k+ Business Join
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded-xl p-2 text-xs font-medium flex items-center gap-2 text-white">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">👠</div>
                  Fashion
                </div>
                <div className="bg-white/10 rounded-xl p-2 text-xs font-medium flex items-center gap-2 text-white">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">🧴</div>
                  Product
                </div>
                <div className="bg-white/10 rounded-xl p-2 text-xs font-medium flex items-center gap-2 text-white">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">👟</div>
                  Shoes
                </div>
                <div className="bg-white/10 rounded-xl p-2 text-xs font-medium flex items-center gap-2 text-white">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">👔</div>
                  Motivate
                </div>
              </div>
            </div>
          </div>

          <div className="absolute  md:-right-32 top-[-30px] p-4 bg-gray-900/90 border border-white/10 rounded-2xl backdrop-blur-xl w-64 hidden md:block animate-in fade-in slide-in-from-right-10 duration-1000 delay-200 z-30 shadow-2xl">
            <div className="space-y-3">
              <div className="h-48 rounded-lg overflow-hidden relative">
                <Image
                  src="/urban-sneakers-product-shot-cool-lighting.jpg"
                  alt="Stats"
                  fill
                  sizes="256px"
                  className="object-cover"
                />
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-300">Increase Sales</span>
                  <span className="font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">30%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-300">Cancel Rate</span>
                  <span className="font-bold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
