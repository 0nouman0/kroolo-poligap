import { createApiResponse } from "@/lib/apiResponse";

export async function GET() {
  try {
    const { PIPEDREAM_CLIENT_ID, PIPEDREAM_CLIENT_SECRET } = process.env;

    const response = await fetch(`https://api.pipedream.com/v1/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: PIPEDREAM_CLIENT_ID!,
        client_secret: PIPEDREAM_CLIENT_SECRET!,
      }),
    });

    const data = await response.json();
    return createApiResponse({
      success: true,
      data: data.access_token,
    });
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    return createApiResponse({
      success: false,
      error: "Failed to get access token",
      status: 500,
    });
  }
}
