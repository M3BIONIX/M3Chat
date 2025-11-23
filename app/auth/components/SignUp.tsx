import {ALargeSmall, Eye, EyeOff, Lock, Mail} from "lucide-react";
import React, {useState} from "react";
import useAuthHook from "@/hooks/AuthHook";
import {useUserHook} from "@/hooks/UserHook";

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { authenticateUserByEmail, createUser } = useUserHook();

    const { authState, setShowForgotPassword } = useAuthHook()
    const showSignUpModal = authState.data.showSignup

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if(showSignUpModal) {
            return await createUser({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            })
        }
        await authenticateUserByEmail({
            email,
            password,
        })
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {showSignUpModal && (
            <div className="flex space-x-4">
                <div className="flex space-y-2 flex-col">
                    <p className="text-sm text-gray-400">First Name</p>
                    <div className="relative flex flex-col">
                        <ALargeSmall className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your First Name"
                            className="w-full text-ellipsis bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                            required
                        />
                    </div>
                </div>
                <div className="flex space-y-2 flex-col">
                    <p className="text-sm text-gray-400">Last Name</p>
                    <div className="relative flex flex-col">
                        <ALargeSmall className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your Last Name"
                            className="w-full text-ellipsis bg-[#0f0f0f] border-gray-700 text-white pl-10 h-12 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                            required
                        />
                    </div>
                </div>
            </div>
            )
            }

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
            {!showSignUpModal && (
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-700 bg-[#0f0f0f] text-cyan-500 focus:ring-cyan-500/20"
                        />
                        Remember me
                    </label>
                    <button onClick={() => setShowForgotPassword(true)} type="button" className="text-cyan-400 hover:text-cyan-300">
                        Forgot password?
                    </button>
                </div>
            )}

            {/* Submit button */}
            <button
                type="submit"
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-base"
            >
                {showSignUpModal ? 'Create Account' : 'Sign In'}
            </button>
        </form>
    )
}