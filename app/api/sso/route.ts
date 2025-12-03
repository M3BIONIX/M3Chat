import { WorkOS } from "@workos-inc/node";
import {createErrorResponse, createValidatedResponse} from "@/lib/utils/apiValidation";
import { getErrorMessage} from "@/lib/utils/errorHandling";
import {NextRequest} from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const workOsClientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!;
const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI!;


export async function POST(req: NextRequest) {
    try {
        const { provider} = await req.json()
        if(!redirectUri) {
            return createErrorResponse("No redirect uri");
        }

        if(provider !== 'GoogleOAuth' && provider !== 'GitHubOAuth'){
            return createErrorResponse(
                'Provider does not exist',
            )
        }

       const url = workos.sso.getAuthorizationUrl({
           redirectUri,
           clientId: workOsClientId,
           provider
       })

        return createValidatedResponse({
            redirectUrl: url
        })
    }
    catch(error) {
        const errorMessage = getErrorMessage(error);
        return createErrorResponse(
            errorMessage || 'Failed to verify code. Please try again.',
            500
        );
    }
}