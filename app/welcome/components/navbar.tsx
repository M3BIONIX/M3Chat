"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Navbar() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 16 // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-black font-bold">O</div>
            <span className="text-lg font-bold tracking-tight text-white">M3Chat</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a
            href="#features"
            onClick={(e) => handleScrollTo(e, "features")}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#use-cases"
            onClick={(e) => handleScrollTo(e, "use-cases")}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Use Cases
          </a>
          {/* <a
            href="#pricing"
            onClick={(e) => handleScrollTo(e, "pricing")}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Pricing
          </a>
          <Link href="#" className="hover:text-cyan-400 transition-colors">
            Blog
          </Link> */}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="#" className="hidden sm:block text-sm font-medium text-white hover:text-cyan-400">
            Log In
          </Link>
          <button className="rounded-full bg-white text-black hover:bg-cyan-400 hover:text-black transition-all">
            <p className="flex items-center justify-center p-2">Try Demo <ArrowRight className="w-5 h-5 ml-2" /></p>
          </button>
        </div>
      </div>
    </header>
  )
}
