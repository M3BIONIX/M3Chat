"use client"
import Link from "next/link"
import { M3Logo } from "@/app/components/branding/M3Logo"
import { ArrowRight } from "lucide-react"
import { useUserHook } from "@/hooks/UserHook"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user: userQuery } = useUserHook();
  const userData = userQuery.data;
  const router = useRouter();

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

  const handleAuthClick = () => {
    if (userData?.id) {
      router.push('/chat');
    } else {
      router.push('/auth');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <M3Logo className="h-8 w-8" />
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
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAuthClick}
            className="hidden sm:block text-sm font-medium text-white hover:text-cyan-400"
          >
            {userData?.id ? 'Go to Chat' : 'Log In'}
          </button>
          <button
            onClick={handleAuthClick}
            className="rounded-full bg-white text-black hover:bg-cyan-400 hover:text-black transition-all"
          >
            <p className="flex items-center justify-center p-2">
              {userData?.id ? 'Open Chat' : 'Try Now'} <ArrowRight className="w-5 h-5 ml-2" />
            </p>
          </button>
        </div>
      </div>
    </header>
  )
}
