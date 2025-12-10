'use client';

import React from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/lib/mistralConfig';

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) ||
        AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL) ||
        AVAILABLE_MODELS[0];

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Cpu className="w-3.5 h-3.5" />
                <span>{currentModel.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="p-2 space-y-1">
                        {AVAILABLE_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full p-2.5 rounded-lg text-left transition-colors ${selectedModel === model.id
                                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                                        : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-sm font-medium text-gray-200">{model.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
