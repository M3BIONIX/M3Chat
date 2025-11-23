import { WorkOS } from "@workos-inc/node";
import {NextRequest, NextResponse} from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName } = body;
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
    catch {
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}