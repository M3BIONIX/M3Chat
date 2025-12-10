'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
}

export function TypewriterText({
    text,
    speed = 50,
    onComplete,
    className = ''
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Reset when text changes
        setDisplayedText('');
        setCurrentIndex(0);
    }, [text]);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timer);
        } else if (currentIndex === text.length && text.length > 0) {
            onComplete?.();
        }
    }, [currentIndex, text, speed, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {currentIndex < text.length && (
                <span className="animate-pulse">|</span>
            )}
        </span>
    );
}
