import { createApiResponse } from "@/lib/apiResponse";

/**
 * Request body interface for company member details
 * @example
 * {
 *   "userIds": ["6825d156ebaf9bebc15c4516", "68396d4db6db3c818c0635d8"]
 * }
 */
interface MemberDetailsRequest {
  userIds: string[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MemberDetailsRequest;
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return createApiResponse({
        success: false,
        error: "Authorization header missing",
        status: 401,
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/enterprise-search/get-company-users-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
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
