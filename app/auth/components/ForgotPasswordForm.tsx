'use client';

import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showError } from "@/lib/utils/toast";

export default function ForgotPasswordForm() {
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // TODO: Implement actual password reset logic
            // For now, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setResetSent(true);
            setTimeout(() => {
                router.push('/auth');
            }, 3000);
        } catch (error) {
            showError(error, 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    if (resetSent) {
        return (
            <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-600/20 border border-cyan-500/30 flex items-center justify-center">
                    <Send className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-2xl text-white mb-2">Check your email</h2>
                    <p className="text-gray-400 text-sm">
                        We've sent a password reset link to <span className="text-white">{resetEmail}</span>
                    </p>
                </div>
                <p className="text-gray-500 text-xs pt-4">
                    Didn't receive the email? Check your spam folder or try again.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm text-gray-400">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="h-4 w-4" />
                {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
        </form>
    );
}

