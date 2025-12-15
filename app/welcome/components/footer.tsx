'use client';

import { ArrowUpRight } from "lucide-react"
import { useUserHook } from "@/hooks/UserHook"
import { useRouter } from "next/navigation"

export function Footer() {
  const { user: userQuery } = useUserHook();
  const userData = userQuery.data;
  const router = useRouter();

  const handleCtaClick = () => {
    if (userData?.id) {
      router.push('/chat');
    } else {
      router.push('/auth');
    }
  };

  return (
    <footer className="bg-black pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* CTA Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Create Smarter. Faster. Together with AI.</h2>
          <p className="text-gray-400 mb-8">
            Chat, generate, and bring your ideas to life — no technical skills needed.
          </p>
          <button
            onClick={handleCtaClick}
            className="rounded-full bg-white text-black text-lg hover:bg-cyan-400 hover:text-black transition-colors mx-0 py-[23px] px-9"
          >
            <p className="flex items-center justify-center">Start Creating Free <ArrowUpRight className="w-5 h-5 ml-2" /></p>
          </button>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          © 2025 M3Chat. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
