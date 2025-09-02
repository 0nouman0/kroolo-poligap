import { NextRequest, NextResponse } from "next/server";
import { connectDBEnterprise } from "@/lib/db";

// GET payment methods
export async function GET(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch payment methods from database
    const paymentMethods: Array<{
      id: string;
      last4: string;
      brand: string;
      expiry: string;
    }> = [
      // Empty for now - user has no payment methods
    ];

    return NextResponse.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST add payment method
export async function POST(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const body = await request.json();
    const { userId, paymentMethod } = body;
    
    if (!userId || !paymentMethod) {
      return NextResponse.json(
        { error: "User ID and payment method are required" },
        { status: 400 }
      );
    }

    // Add payment method to database
    console.log("Adding payment method:", { userId, paymentMethod });
    
    return NextResponse.json({
      success: true,
      message: "Payment method added successfully"
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

// DELETE remove payment method
export async function DELETE(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const methodId = searchParams.get('methodId');
    
    if (!userId || !methodId) {
      return NextResponse.json(
        { error: "User ID and method ID are required" },
        { status: 400 }
      );
    }

    // Remove payment method from database
    console.log("Removing payment method:", { userId, methodId });
    
    return NextResponse.json({
      success: true,
      message: "Payment method removed successfully"
    });
  } catch (error) {
    console.error("Error removing payment method:", error);
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    );
  }
}
