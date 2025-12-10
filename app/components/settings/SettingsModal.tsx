'use client';

import React, { useState } from 'react';
import {
    X, User, Sparkles, Shield, Lock, Loader2, AlertTriangle
} from 'lucide-react';
import { useUserHook } from '@/hooks/UserHook';
import { useSettingsHook } from '@/hooks/SettingsHook';
import { toast } from 'sonner';

type Section = 'account' | 'intelligence' | 'security';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeSection, setActiveSection] = useState<Section>('account');
    const { user: userQuery } = useUserHook();
    const userData = userQuery.data;
    const {
        settings,
        updateSettings,
        isUpdatingSettings,
        updateProfile,
        isUpdatingProfile,
        uploadProfileImage,
        isUploadingProfileImage,
        sendPasswordReset,
        isSendingPasswordReset,
        deleteAccount,
        isDeletingAccount,
    } = useSettingsHook(userData?.id);

    // Local state
    const [firstName, setFirstName] = useState(userData?.firstName || '');
    const [lastName, setLastName] = useState(userData?.lastName || '');
    const [customPersonality, setCustomPersonality] = useState(settings.data?.customPersonality || '');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Update local state when data loads
    React.useEffect(() => {
        if (userData) {
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
        }
    }, [userData]);

    React.useEffect(() => {
        if (settings.data) {
            setCustomPersonality(settings.data.customPersonality || '');
        }
    }, [settings.data]);

    if (!isOpen) return null;

    const navItems = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'intelligence', label: 'Intelligence', icon: Sparkles },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const handleSaveProfile = async () => {
        try {
            await updateProfile({ firstName, lastName });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleSaveIntelligence = async () => {
        try {
            await updateSettings({
                selectedModel: settings.data?.selectedModel || 'mistral-large-latest',
                customPersonality
            });
            toast.success('Intelligence settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    const handlePasswordReset = async () => {
        try {
            await sendPasswordReset();
            toast.success('Reset email sent');
        } catch (error) {
            toast.error('Failed to send reset email');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') return;
        try {
            await deleteAccount();
            toast.success('Account deleted successfully');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans text-gray-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl h-[80vh] bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden">

                {/* Left Sidebar */}
                <div className="w-64 bg-[#121212]/50 border-r border-white/5 flex flex-col p-6">
                    <div className="mb-8 pl-2">
                        {userData?.profilePicture ? (
                            <img
                                src={userData.profilePicture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border border-white/10 mb-3"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-white font-medium border border-white/10 mb-3">
                                {firstName?.[0] || 'M'}
                            </div>
                        )}
                        <p className="text-base font-semibold text-gray-100">{firstName || 'User'} {lastName}</p>
                        <p className="text-xs text-gray-500">Skylight Agent</p>
                    </div>

                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as Section)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeSection === item.id
                                    ? 'bg-white/10 text-white font-medium shadow-sm'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-cyan-400' : 'opacity-70'}`} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-transparent relative">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                        <h1 className="text-xl font-semibold text-gray-100 capitalize">
                            {activeSection}
                        </h1>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">

                        {/* ACCOUNT SECTION */}
                        {activeSection === 'account' && (
                            <div className="space-y-8 max-w-2xl animation-fade-in">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                                        <input
                                            type="text"
                                            value={`${firstName} ${lastName}`}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const lastSpaceIndex = val.lastIndexOf(' ');
                                                if (lastSpaceIndex === -1) {
                                                    setFirstName(val);
                                                    setLastName('');
                                                } else {
                                                    setFirstName(val.slice(0, lastSpaceIndex));
                                                    setLastName(val.slice(lastSpaceIndex + 1));
                                                }
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={userData?.email || ''}
                                                readOnly
                                                className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed focus:outline-none"
                                            />
                                            <Lock className="w-4 h-4 text-gray-600 absolute right-4 top-1/2 -translate-y-1/2" />
                                        </div>
                                        <p className="text-xs text-gray-500">Email cannot be changed directly.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Profile Picture</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                {userData?.profilePicture ? (
                                                    <img
                                                        src={userData.profilePicture}
                                                        alt="Profile"
                                                        className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl font-medium text-white border-2 border-white/10">
                                                        {firstName?.[0] || 'M'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="profile-image-input"
                                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                await uploadProfileImage(file);
                                                                toast.success('Profile picture updated successfully');
                                                            } catch (error: any) {
                                                                toast.error(error.message || 'Failed to upload profile picture');
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('profile-image-input')?.click()}
                                                    disabled={isUploadingProfileImage}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isUploadingProfileImage && <Loader2 className="w-4 h-4 animate-spin" />}
                                                    {isUploadingProfileImage ? 'Uploading...' : 'Upload Photo'}
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF or WebP. Max 5MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isUpdatingProfile}
                                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INTELLIGENCE SECTION */}
                        {activeSection === 'intelligence' && (
                            <div className="space-y-8 max-w-2xl animation-fade-in">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            Custom Personality
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Instructions on how the AI should behave.</p>
                                        <textarea
                                            value={customPersonality}
                                            onChange={(e) => setCustomPersonality(e.target.value)}
                                            rows={5}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600 resize-none leading-relaxed"
                                            placeholder="e.g., Be concise, use technical terms, avoid emojis..."
                                        />
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>Maximum 1000 characters</span>
                                            <span>{customPersonality.length}/1000</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleSaveIntelligence}
                                            disabled={isUpdatingSettings}
                                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isUpdatingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECURITY SECTION */}
                        {activeSection === 'security' && (
                            <div className="space-y-8 max-w-2xl animation-fade-in">
                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
                                        <h3 className="text-base font-medium text-gray-200 mb-2">Password</h3>
                                        <p className="text-sm text-gray-500 mb-4">Request a password reset email to change your password.</p>
                                        <button
                                            onClick={handlePasswordReset}
                                            disabled={isSendingPasswordReset}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
                                        >
                                            {isSendingPasswordReset && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Reset Password
                                        </button>
                                    </div>

                                    <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
                                        <h3 className="text-base font-medium text-red-400 mb-2">Danger Zone</h3>
                                        <p className="text-sm text-red-400/70 mb-4">Permanently delete your account and all data.</p>

                                        {!showDeleteConfirm ? (
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                                            >
                                                Delete Account
                                            </button>
                                        ) : (
                                            <div className="space-y-4 animation-slide-up">
                                                <p className="text-xs text-gray-400">
                                                    Type <span className="font-mono text-red-400">DELETE</span> to confirm:
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={deleteConfirmation}
                                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                        className="flex-1 bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500/50"
                                                        placeholder="DELETE"
                                                    />
                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        disabled={isDeletingAccount || deleteConfirmation !== 'DELETE'}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                                                    >
                                                        {isDeletingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowDeleteConfirm(false);
                                                            setDeleteConfirmation('');
                                                        }}
                                                        className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-400 rounded-lg text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
