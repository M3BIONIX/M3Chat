import { ArrowUpRight, Instagram, Linkedin, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-4">
        {/* CTA Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Create Smarter. Faster. Together with AI.</h2>
          <p className="text-gray-400 mb-8">
            Chat, generate, and bring your ideas to life — no technical skills needed.
          </p>
          <button className="rounded-full bg-white text-black text-lg hover:bg-cyan-400 hover:text-black transition-colors mx-0 py-[23px] px-9">
            <p className="flex items-center justify-center">Start Creating Free <ArrowUpRight className="w-5 h-5 ml-2" /></p>
          </button>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12 border-t border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-black font-bold">
                O
              </div>
              <span className="text-lg font-bold tracking-tight text-white">M3Chat</span>
            </div>
            <p className="text-sm text-gray-400">AI-Powered collaboration for modern creators.</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-cyan-400">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-cyan-400">
                  AI Video
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  AI Chat
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Motion Simulation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Quality Output
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  Motion Conversion
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400">
                  API Access
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          © 2025 M3Chat. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
