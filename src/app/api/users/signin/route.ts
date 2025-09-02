// import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest, NextResponse } from "next/server";

/**
 * Request body interface for user signin
 * @example
 * {
 *   "email": "example@domain.com",
 *   "password": "Example"
 * }
 */

// interface SignInRequest {
//   email: string;
//   password: string;
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/users/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      // Try to extract error message from backend, else use a default message
      let errorMessage = "Incorrect username or password.";
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // ignore JSON parse errors, use default message
      }
      return NextResponse.json(
        {
          success: true,
          data: {
            status: "ERROR",
            data: null,
            message: errorMessage,
          },
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const token = data.token;
    const res = NextResponse.json({
      success: true,
      data,
    });

    // Set the cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        data: {
          status: "ERROR",
          data: null,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 200 }
    );
  }
}
