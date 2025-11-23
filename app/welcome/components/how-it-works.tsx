import Image from "next/image"
import { Upload, MessageSquare, Download } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Image",
      description: "Start by uploading a high-quality image of your product, model, or concept.",
      visual: (
        <div className="relative w-full h-48 mt-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all border border-white/10">
          <Image
            src="/upload-interface-drag-drop-photo.jpg"
            alt="Upload"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-cyan-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              Click to Upload
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -left-4 top-10 w-20 h-20 rounded-xl border-2 border-white/20 shadow-lg overflow-hidden transform -rotate-6 relative">
            <Image src="/fashion-model-street-wear-cool.jpg" fill sizes="80px" className="object-cover" alt="" />
          </div>
          <div className="absolute -right-2 bottom-4 w-16 h-16 rounded-xl border-2 border-white/20 shadow-lg overflow-hidden transform rotate-3 relative">
            <Image src="/urban-sneakers-product-shot-cool-lighting.jpg" fill sizes="64px" className="object-cover" alt="" />
          </div>
        </div>
      ),
    },
    {
      icon: MessageSquare,
      title: "Write Your Command",
      description: "Describe the motion you want to see, like 'make the model walk down a runway.'",
      visual: (
        <div className="relative w-full h-48 mt-4 rounded-2xl overflow-hidden shadow-lg bg-black border border-white/10 group-hover:shadow-xl transition-all flex flex-col">
          <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-neutral-900">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <Image
              src="/chat-interface-typing-prompt-ai.jpg"
              alt="Chat"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-gray-200 max-w-[90%] self-start mb-[0] px-3">
                {"Create a video "}               
              </div>
              <div className="bg-cyan-500 text-black rounded-2xl rounded-tr-none p-3 text-sm max-w-[90%] self-end shadow-md font-medium">
                {"Generating ..."}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Download,
      title: "Generate Video & Download",
      description: "Click and watch your vision come to life. Download your high-resolution video.",
      visual: (
        <div className="relative w-full h-48 mt-4 rounded-2xl overflow-hidden shadow-lg bg-neutral-900 border border-white/10 group-hover:shadow-xl transition-all flex items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-4 gap-2 p-4 opacity-20">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg shadow-sm"></div>
            ))}
          </div>

          <div className="relative z-10 bg-black p-2 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300 border border-white/20">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden">
              <Image src="/red-dress-fashion-model-runway.jpg" alt="Result" fill sizes="128px" className="object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-black/60 backdrop-blur rounded-full flex items-center justify-center shadow-lg border border-white/20">
                <div className="w-0 h-0 border-l-[8px] border-l-cyan-400 border-y-[5px] border-y-transparent ml-1"></div>
              </div>
            </div>
          </div>

          
        </div>
      ),
    },
  ]

  return (
    <section id="use-cases" className="py-24 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            3 Steps to Magic <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              From Chat to Creation
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Talk naturally with AI, upload your visuals, and watch your ideas turn into videos, content, or marketing
            assets — instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group bg-neutral-900 rounded-[2rem] p-8 shadow-lg hover:shadow-cyan-500/10 border border-white/10 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-900/20 to-transparent rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors duration-300 border border-white/10">
                  <step.icon className="w-6 h-6 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{step.description}</p>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
