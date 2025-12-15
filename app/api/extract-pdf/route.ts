import { extractText } from "unpdf";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route to extract text from a PDF URL
 * Uses unpdf which works in Node.js server environments
 */
export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        // Fetch the PDF as buffer
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Extract text using unpdf (mergePages to get single string)
        const { text } = await extractText(buffer, { mergePages: true });

        return NextResponse.json({ text });
    } catch (error) {
        console.error("PDF extraction error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to extract PDF text" },
            { status: 500 }
        );
    }
}
