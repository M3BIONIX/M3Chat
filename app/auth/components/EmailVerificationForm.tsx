'use client';

import { Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useUserHook } from "@/hooks/UserHook";
import { showError } from "@/lib/utils/toast";

interface EmailVerificationFormProps {
    token: string;
    email: string;
}

export default function EmailVerificationForm({ token, email }: EmailVerificationFormProps) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { verifyEmailAndLogin } = useUserHook();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyEmailAndLogin(token, code);
            router.push('/chat');
        } catch (error: unknown) {
            showError(error, 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm text-gray-400 text-center">
                    We sent a verification code to <span className="text-cyan-400">{email}</span>
                </p>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl text-center text-2xl tracking-widest focus:border-cyan-500 focus:ring-cyan-500/20"
                        maxLength={6}
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={code.length !== 6 || isLoading}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
        </form>
    );
}

