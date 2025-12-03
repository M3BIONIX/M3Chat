'use client';

import { Sparkles, Zap, Brain, MessageSquare } from 'lucide-react';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
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
                    <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '0s' }}>
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-cyan-400" />
                        </div>
                    </div>
                    <div className="absolute top-1/3 right-32 animate-float" style={{ animationDelay: '1.5s' }}>
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 backdrop-blur-sm border border-teal-500/30 flex items-center justify-center">
                            <Brain className="h-10 w-10 text-teal-400" />
                        </div>
                    </div>
                    <div className="absolute bottom-32 left-1/4 animate-float" style={{ animationDelay: '0.7s' }}>
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
                            <MessageSquare className="h-7 w-7 text-blue-400" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/3 animate-float" style={{ animationDelay: '2s' }}>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
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

                {/* Render children (page content) */}
                {children}
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



