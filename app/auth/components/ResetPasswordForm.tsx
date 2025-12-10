'use client';

import { Lock, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { showError } from "@/lib/utils/toast";

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const isPasswordValid = password.length >= 8;
    const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        if (!isPasswordValid) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (!doPasswordsMatch) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/complete-reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/auth');
            }, 3000);
        } catch (error: unknown) {
            console.error('Reset password error:', error);
            showError(error, 'Failed to reset password');
            setError(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl text-white mb-2">Password Reset!</h2>
                    <p className="text-gray-400 text-sm">
                        Your password has been successfully changed. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-red-400" />
                </div>
                <div>
                    <h2 className="text-2xl text-white mb-2">Invalid Link</h2>
                    <p className="text-gray-400 text-sm">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm text-gray-400">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-[#0f0f0f] border border-gray-700 text-white pl-10 pr-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                <p className={`text-xs ${isPasswordValid ? 'text-green-400' : 'text-gray-500'}`}>
                    {isPasswordValid ? '✓ ' : ''}Minimum 8 characters
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-[#0f0f0f] border border-gray-700 text-white pl-10 pr-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {confirmPassword && (
                    <p className={`text-xs ${doPasswordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                        {doPasswordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resetting...
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        Reset Password
                    </>
                )}
            </button>
        </form>
    );
}
