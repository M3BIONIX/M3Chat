'use client';

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserHook } from "@/hooks/UserHook";
import { showError } from "@/lib/utils/toast";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { authenticateUserByEmail } = useUserHook();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authenticateUserByEmail({ email, password });
            router.push('/chat');
        } catch (error: any) {
            if (error.message === 'VERIFICATION_REQUIRED') {
                // Redirect to verify page with token
                router.push(`/auth/verify?token=${encodeURIComponent(error.pendingAuthenticationToken)}&email=${encodeURIComponent(error.email || email)}`);
            } else {
                showError(error, 'Failed to login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm text-gray-400">Email</p>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-gray-400">Password</p>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-[#0f0f0f] border-gray-700 text-white pl-10 pr-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-700 bg-[#0f0f0f] text-cyan-500 focus:ring-cyan-500/20" />
                    Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-cyan-400 hover:text-cyan-300">
                    Forgot password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>
    );
}

