import React from "react";

interface FileIconProps {
    type: string;
    className?: string;
}

export const FileIcon = ({ type, className = "w-10 h-10" }: FileIconProps) => {
    const isPdf = type === "application/pdf";
    const isImage = type.startsWith("image/");
    const isText = type === "text/plain" || type === "application/txt";

    if (isPdf) {
        return (
            <div className={`relative flex items-center justify-center bg-red-100 rounded-lg ${className}`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3/5 h-3/5 text-red-500"
                >
                    <path
                        d="M7 18H17V16H7V18Z"
                        fill="currentColor"
                    />
                    <path
                        d="M17 14H7V12H17V14Z"
                        fill="currentColor"
                    />
                    <path
                        d="M7 10H11V8H7V10Z"
                        fill="currentColor"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6ZM6 4H13V9H18V20H6V4Z"
                        fill="currentColor"
                    />
                </svg>
                <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 rounded">PDF</span>
            </div>
        );
    }

    if (isImage) {
        return (
            <div className={`relative flex items-center justify-center bg-purple-100 rounded-lg ${className}`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3/5 h-3/5 text-purple-500"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM4 6H20V18H4V6ZM6 15L10 9L13 13.5L16 9L18 12V16H6V15Z"
                        fill="currentColor"
                    />
                </svg>
                <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[8px] font-bold px-1 rounded">IMG</span>
            </div>
        );
    }

    // Default / Text
    return (
        <div className={`relative flex items-center justify-center bg-blue-100 rounded-lg ${className}`}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3/5 h-3/5 text-blue-500"
            >
                <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M16 13H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M16 17H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10 9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 rounded">{isText ? 'TXT' : 'DOC'}</span>
        </div>
    );
};
