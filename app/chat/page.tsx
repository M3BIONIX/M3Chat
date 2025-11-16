'use client';

import React from "react";
import ChatInput from "@/app/components/chat-input/ChatInput";


const suggestions = [
    {
        title: 'Content Help',
        description: 'Help me create a Presentation',
    },
    {
        title: 'Suggestions',
        description: 'Help me with ideas',
    },
    {
        title: 'Job Application',
        description: 'Help me apply for job application',
    },
];

export default function NewChat() {


    const handleSuggestionClick = (suggestion: string) => {
    };

    return (
        <div className="flex-1 flex h-screen flex-col items-center justify-between relative overflow-hidden py-12">
            {/* Background with glowing orb effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                    {/* Glowing orb */}
                    <div className="w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-teal-500/10 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                    <div className="w-64 h-64 rounded-full border-2 border-cyan-500/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="w-80 h-80 rounded-full border border-cyan-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-8 flex-1 flex flex-col justify-center space-y-16">
                {/* Welcome Text */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl text-white">Hey! Raf</h1>
                    <p className="text-xl text-gray-400">What can I help with?</p>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap justify-center gap-4 px-4">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.description)}
                            className="flex flex-col items-start p-5 rounded-xl border border-gray-800 bg-[#1a1a1a]/50 backdrop-blur-sm hover:bg-[#252525] hover:border-gray-700 transition-all group min-w-[200px]"
                        >
                            <span className="text-sm text-cyan-400 mb-2">{suggestion.title}</span>
                            <span className="text-sm text-gray-400 group-hover:text-gray-300 text-left">
                                {suggestion.description}
                            </span>
                        </button>
                    ))}
                </div>

                <ChatInput/>
            </div>

        </div>
    );
}
