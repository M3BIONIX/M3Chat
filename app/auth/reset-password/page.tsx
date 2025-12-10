'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import ResetPasswordForm from "@/app/auth/components/ResetPasswordForm";

function ResetPasswordContent() {
    return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full max-w-md relative z-10">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 space-y-8 shadow-2xl">
                <div className="text-center space-y-4">
                    <div>
                        <h1 className="text-3xl text-white mb-2">Reset Password</h1>
                        <p className="text-gray-400">Enter your new password below</p>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    </div>
                }>
                    <ResetPasswordContent />
                </Suspense>

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
