'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EmailVerificationForm from "@/app/auth/components/EmailVerificationForm";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token) {
        return (
            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 space-y-8 shadow-2xl">
                    <div className="text-center">
                        <p className="text-red-400 mb-4">Invalid verification link</p>
                        <Link href="/auth" className="text-cyan-400 hover:text-cyan-300">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md relative z-10">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 space-y-8 shadow-2xl">
                <div className="text-center space-y-4">
                    <div>
                        <h1 className="text-3xl text-white mb-2">Verify Email</h1>
                        <p className="text-gray-400">Enter the verification code sent to your email</p>
                    </div>
                </div>

                <EmailVerificationForm token={token} email={email || ''} />

                <div className="text-center text-sm text-gray-400">
                    <Link href="/auth" className="text-cyan-400 hover:text-cyan-300">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8">
                    <div className="text-center text-gray-400">Loading...</div>
                </div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}

