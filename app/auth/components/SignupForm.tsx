'use client';

import { ALargeSmall, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useUserHook } from "@/hooks/UserHook";
import { showError } from "@/lib/utils/toast";
import { isVerificationRequiredError } from "@/lib/utils/errorHandling";
import { VerificationRequiredError } from "@/lib/schemas/ErrorSchema";

export default function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { createUser, authenticateUserByEmail } = useUserHook();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUser({ email, password, firstName, lastName });
            // After creation, try to login (which will trigger verification)
            try {
                await authenticateUserByEmail({ email, password });
                router.push("/chat");
            } catch (error: unknown) {
                if (isVerificationRequiredError(error)) {
                    const verificationError = error as VerificationRequiredError;
                    router.push(`/auth/verify?token=${encodeURIComponent(verificationError.pendingAuthenticationToken)}&email=${encodeURIComponent(verificationError.email || email)}`);
                } else {
                    throw error;
                }
            }
        } catch (error: unknown) {
            if (isVerificationRequiredError(error)) {
                const verificationError = error as VerificationRequiredError;
                router.push(`/auth/verify?token=${encodeURIComponent(verificationError.pendingAuthenticationToken)}&email=${encodeURIComponent(verificationError.email || email)}`);
            } else {
                showError(error, 'Failed to create account');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-400">First Name</p>
                    <div className="relative">
                        <ALargeSmall className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                            required
                        />
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-400">Last Name</p>
                    <div className="relative">
                        <ALargeSmall className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                            required
                        />
                    </div>
                </div>
            </div>

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

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
        </form>
    );
}

