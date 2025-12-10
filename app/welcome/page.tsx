import {Navbar} from "@/app/welcome/components/navbar";
import {Hero} from "@/app/welcome/components/hero";
import {HowItWorks} from "@/app/welcome/components/how-it-works";
import {Features} from "@/app/welcome/components/features";
import {Footer} from "@/app/welcome/components/footer";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-400/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
