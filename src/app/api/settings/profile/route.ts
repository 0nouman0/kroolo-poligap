import { NextRequest, NextResponse } from "next/server";
import { connectDBEnterprise } from "@/lib/db";
import connections from "@/lib/db";
import UserModel from "@/models/users.model";
import MembersModel from "@/models/members.model";
import mongoose from "mongoose";

// GET user profile
export async function GET(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user data from MongoDB
    const user = await UserModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch member data to get designation
    const member = await MembersModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    const userProfile = {
      fullName: user.name || "",
      email: user.email || "",
      designation: member?.designation || "",
      country: user.country || "",
      mobile: user.mobile || "",
      birthday: user.dob || "",
      avatar: user.profileImage || "/api/placeholder/150/150",
      createdAt: user.profileCreatedOn || user.createdAt?.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) || ""
    };

    return NextResponse.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const body = await request.json();
    const { userId, ...profileData } = body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    // Update user data in MongoDB
    const updateData: any = {};
    
    if (profileData.fullName) updateData.name = profileData.fullName;
    if (profileData.email) updateData.email = profileData.email;
    if (profileData.country) updateData.country = profileData.country;
    if (profileData.mobile) updateData.mobile = profileData.mobile;
    if (profileData.birthday) updateData.dob = profileData.birthday;
    if (profileData.avatar) updateData.profileImage = profileData.avatar;
    
    const updatedUser = await UserModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      updateData,
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Update member designation if provided
    if (profileData.designation) {
      await MembersModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { designation: profileData.designation },
        { new: true }
      );
    }
    
    const updatedProfile = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// DELETE user account
export async function DELETE(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    // Delete user from MongoDB
    const deletedUser = await UserModel.findOneAndDelete({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Also delete member records
    await MembersModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    
    console.log("Deleted user account:", userId);
    
    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
