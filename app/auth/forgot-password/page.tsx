'use client';

import Link from 'next/link';
import ForgotPasswordForm from "@/app/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <div className="w-full max-w-md relative z-10">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 space-y-8 shadow-2xl">
                <div className="text-center space-y-4">
                    <div>
                        <h1 className="text-3xl text-white mb-2">Forgot Password</h1>
                        <p className="text-gray-400">Enter your email to reset your password</p>
                    </div>
                </div>

                <ForgotPasswordForm />

                <div className="text-center text-sm text-gray-400">
                    Remember your password?{' '}
                    <Link href="/auth" className="text-cyan-400 hover:text-cyan-300">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

