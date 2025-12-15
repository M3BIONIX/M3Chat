'use client';

import React from 'react';
import { ChevronDown, Cpu, Loader2 } from 'lucide-react';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/lib/mistralConfig';

export interface ModelOption {
    id: string;
    name: string;
    description: string;
}

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    models?: ModelOption[];
    isLoading?: boolean;
    disabled?: boolean;
}

export function ModelSelector({
    selectedModel,
    onModelChange,
    models,
    isLoading = false,
    disabled
}: ModelSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Use provided models or fall back to static list
    const availableModels = models || AVAILABLE_MODELS;

    const currentModel = availableModels.find(m => m.id === selectedModel) ||
        availableModels.find(m => m.id === DEFAULT_MODEL) ||
        availableModels[0];

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
                onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                disabled={disabled || isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Cpu className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? 'Loading...' : currentModel?.name || 'Select Model'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 max-h-80 overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50">
                    <div className="p-2 space-y-1">
                        {availableModels.map((model) => (
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

