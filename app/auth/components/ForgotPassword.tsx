import {ArrowLeft, Mail, Send} from "lucide-react";
import {useState} from "react";
import useAuthHook from "@/hooks/AuthHook";

export default function ForgotPassword() {
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const { setShowForgotPassword } = useAuthHook();

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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
            <div className="w-full max-w-md bg-[#1a1a1a]/95 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 space-y-6 shadow-2xl">
                {!resetSent ? (
                    <>
                        {/* Header */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-4"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </button>
                            <h2 className="text-2xl text-white">Reset your password</h2>
                            <p className="text-gray-400 text-sm">
                                Enter your email address and we&#39;ll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Form */}
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
                                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base flex items-center justify-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                Send reset link
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <Send className="h-8 w-8 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl text-white mb-2">Check your email</h2>
                                <p className="text-gray-400 text-sm">
                                    We&#39;ve sent a password reset link to <span className="text-white">{resetEmail}</span>
                                </p>
                            </div>
                            <p className="text-gray-500 text-xs pt-4">
                                Didn&#39;t receive the email? Check your spam folder or try again.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>

    )
}