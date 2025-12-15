'use client';

import Link from "next/link";
import { M3Logo } from "@/app/components/branding/M3Logo";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
            <M3Logo size={64} className="mb-8" />
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                Oops! The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:bg-cyan-400 hover:text-black transition-colors">
                Go back home
            </Link>
        </div>
    );
}
