'use client';

import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, Brain, MessageSquare } from 'lucide-react';
import {useState} from "react";


interface LoginPageProps {
    onLogin: () => void;
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        //onLogin();
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending reset email
        setResetSent(true);
        setTimeout(() => {
            setShowForgotPassword(false);
            setResetSent(false);
            setResetEmail('');
        }, 3000);
    };


    return (
        <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden">
            {/* Left Side - Animated Section */}
            <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
                {/* Background Gradient Animation */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Animated Grid */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Floating Icon 1 */}
                    <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '0s' }}>
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-cyan-400" />
                        </div>
                    </div>

                    {/* Floating Icon 2 */}
                    <div className="absolute top-1/3 right-32 animate-float" style={{ animationDelay: '1.5s' }}>
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 backdrop-blur-sm border border-teal-500/30 flex items-center justify-center">
                            <Brain className="h-10 w-10 text-teal-400" />
                        </div>
                    </div>

                    {/* Floating Icon 3 */}
                    <div className="absolute bottom-32 left-1/4 animate-float" style={{ animationDelay: '0.7s' }}>
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
                            <MessageSquare className="h-7 w-7 text-blue-400" />
                        </div>
                    </div>

                    {/* Floating Icon 4 */}
                    <div className="absolute top-1/2 left-1/3 animate-float" style={{ animationDelay: '2s' }}>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="max-w-xl space-y-8">
                        <div className="space-y-4">
                            <div className="inline-block">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-2xl">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-5xl">Welcome to M3 Chat</h1>
                            <p className="text-xl text-gray-400">
                                Experience the next generation of AI conversations. Powered by advanced language models.
                            </p>
                        </div>

                        <div className="space-y-4 pt-8">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg mb-1">Multiple AI Models</h3>
                                    <p className="text-gray-400 text-sm">Chat with GPT-4, Claude, Gemini, and more in one place</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="h-5 w-5 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg mb-1">Smart Conversations</h3>
                                    <p className="text-gray-400 text-sm">Context-aware responses with file attachments support</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                    <Brain className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg mb-1">Secure & Private</h3>
                                    <p className="text-gray-400 text-sm">Your conversations are encrypted and stored securely</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 lg:max-w-xl xl:max-w-2xl flex items-center justify-center p-8 relative">
                {/* Mobile background orb */}
                <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-teal-500/10 blur-3xl animate-pulse"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 space-y-8 shadow-2xl">
                        {/* Logo & Title */}
                        <div className="text-center space-y-4">
                            <div className="lg:hidden h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl text-white mb-2">
                                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                                </h1>
                                <p className="text-gray-400">
                                    {isSignUp ? 'Get started with M3 Chat today' : 'Sign in to continue your conversations'}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email input */}
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

                            {/* Password input */}
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
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            {!isSignUp && (
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-700 bg-[#0f0f0f] text-cyan-500 focus:ring-cyan-500/20"
                                        />
                                        Remember me
                                    </label>
                                    <button type="button" className="text-cyan-400 hover:text-cyan-300">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base"
                            >
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#1a1a1a] text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="h-12 flex items-center justify-center bg-[#0f0f0f] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl">
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <p>Google</p>
                            </button>
                            <button className="h-12 flex items-center justify-center bg-[#0f0f0f] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl">
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <p> GitHub</p>
                            </button>
                        </div>

                        {/* Toggle Sign Up */}
                        <div className="text-center text-sm text-gray-400">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-cyan-400 hover:text-cyan-300"
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </button>
                        </div>
                    </div>

                    {/* Footer - Only on mobile */}
                    <div className="lg:hidden text-center mt-8 text-sm text-gray-500">
                        By continuing, you agree to M3 Chat&#39;s{' '}
                        <button className="text-gray-400 hover:text-gray-300">Terms of Service</button>
                        {' '}and{' '}
                        <button className="text-gray-400 hover:text-gray-300">Privacy Policy</button>
                    </div>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
