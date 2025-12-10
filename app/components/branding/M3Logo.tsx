import Image from "next/image";
import { cn } from "@/lib/utils";

interface M3LogoProps {
    className?: string;
    size?: number;
}

export const M3Logo = ({ className, size = 32 }: M3LogoProps) => {
    return (
        <div className={cn("relative overflow-hidden rounded-xl", className)} style={{ width: size, height: size }}>
            <Image
                src="/m3-logo.png"
                alt="M3 Chat Logo"
                fill
                className="object-cover mix-blend-screen"
                priority
            />
        </div>
    );
};

