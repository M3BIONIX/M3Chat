import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const workOsClientID = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code } = body;

        if(!workOsClientID) {
            return NextResponse.json(
                { error: 'Server configuration error: WorkOS Client ID is missing' },
                { status: 500 }
            );
        }

        if (!code) {
            return NextResponse.json(
                { error: 'Verification code is required' },
                { status: 400 }
            );
        }

        await workos.userManagement.authenticateWithCode({
            code,
            clientId: workOsClientID
        });

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error: any) {
        console.error('Error verifying code:', error);
        
        let errorMessage = 'Failed to verify code. Please try again.';
        
        if (error.message) {
            if (error.message.includes('invalid') || error.message.includes('incorrect')) {
                errorMessage = 'Invalid verification code. Please check and try again.';
            } else if (error.message.includes('expired')) {
                errorMessage = 'Verification code has expired. Please request a new one.';
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