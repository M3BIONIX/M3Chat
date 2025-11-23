import { WorkOS } from "@workos-inc/node";
import {NextRequest, NextResponse} from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.WORKOS_CLIENT_ID!;


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;
        const createdUser = await workos.userManagement.authenticateWithPassword({
            clientId,
            email: email,
            password: password,
        });

        return NextResponse.json({
            externalId: createdUser.user.externalId,
            email: createdUser.user.email,
            firstName: createdUser.user.firstName,
            lastName: createdUser.user.lastName,
            profilePicture: createdUser.user.profilePictureUrl,
            emailVerified: createdUser.user.emailVerified,
        });
    }
    catch {
        return NextResponse.json(
            { error: 'Failed to Login' },
            { status: 500 }
        );
    }
}