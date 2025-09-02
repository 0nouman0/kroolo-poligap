import { createApiResponse } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return createApiResponse({
        success: false,
        error: "Authorization header missing",
        status: 401,
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/enterprise-search/user-details`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return createApiResponse({
      success: true,
      data,
    });
  } catch (error) {
    return createApiResponse({
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
      status: 500,
    });
  }
}
