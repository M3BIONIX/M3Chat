import { WorkOS } from "@workos-inc/node";
import {NextRequest, NextResponse} from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const createdUser = await workos.userManagement.createUser({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        });

        return NextResponse.json({
            externalId: createdUser.externalId || '',
            email: createdUser.email || '',
            firstName: createdUser.firstName || '',
            lastName: createdUser.lastName || '',
            profilePicture: createdUser.profilePictureUrl || '',
            emailVerified: createdUser.emailVerified || false,
        });
    }
    catch (error: any) {
        console.error('Create user error:', error);
        
        let errorMessage = 'Failed to create account. Please try again.';
        
        if (error.message) {
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                errorMessage = 'An account with this email already exists.';
            } else if (error.message.includes('invalid') || error.message.includes('format')) {
                errorMessage = 'Please check that all fields are filled correctly.';
            } else if (error.message.includes('password')) {
                errorMessage = 'Password does not meet requirements.';
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