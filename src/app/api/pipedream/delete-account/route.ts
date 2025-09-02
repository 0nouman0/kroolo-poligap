import { createApiResponse } from "@/lib/apiResponse";

export async function DELETE(req: Request) {
  try {
    const { access_token, account_id } = await req.json();
    const { PIPEDREAM_PROJECT_ID, PIPEDREAM_ENVIRONMENT } = process.env;

    if (!access_token || !account_id) {
      return createApiResponse({
        success: false,
        error: "Missing required data",
        status: 400,
      });
    }

    const response = await fetch(
      `https://api.pipedream.com/v1/connect/${PIPEDREAM_PROJECT_ID}/accounts/${account_id}`,
      {
        method: "DELETE",
        headers: new Headers({
          Authorization: `Bearer ${access_token}`,
          "x-pd-environment": PIPEDREAM_ENVIRONMENT as string,
        }),
      }
    );

    if (response.status === 204) {
      return createApiResponse({
        success: true,
        data: { message: "Account successfully deleted" },
      });
    }

    // Handle other status codes
    const data = await response.json();
    return createApiResponse({
      success: false,
      error: data.message || "Failed to delete account",
      status: response.status,
    });
  } catch (error) {
    console.error("Error in deleteAccount:", error);

    return createApiResponse({
      success: false,
      error: "Failed to delete account",
      status: 500,
    });
  }
}
