import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email address is required' },
                { status: 400 }
            );
        }

        await workos.userManagement.createMagicAuth({
            email,
        });

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error: any) {
        console.error('Error sending magic auth code:', error);
        
        let errorMessage = 'Failed to send verification code. Please try again.';
        
        if (error.message) {
            if (error.message.includes('invalid') || error.message.includes('format')) {
                errorMessage = 'Invalid email address. Please check and try again.';
            } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
                errorMessage = 'Too many requests. Please wait a moment before requesting another code.';
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}