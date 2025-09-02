"use server";
import EnterpriseIntegration from "@/models/enterpriseIntegration.model";
import IntegrationPlatform from "@/models/integrationPlatform.model";
import Company from "@/models/companies.model";
import Member from "@/models/members.model";
import User from "@/models/users.model";
import SearchHistory, { ISearchHistory } from "@/models/searchHistory.model";
import mongoose from "mongoose";

// When Owner will connect to it's own integration
export async function UserAuthenticated(
  accountId: string,
  platformId: string,
  companyId: string,
  userId: string
) {
  try {
    const existingIntegration = await EnterpriseIntegration.findOne({
      platformId,
      companyId,
      userId,
      accountId,
      status: { $ne: "DELETED" }, // optional: ignore deleted records
    });

    if (existingIntegration) {
      // Update the accountId for the existing integration
      await EnterpriseIntegration.updateOne(
        { _id: existingIntegration._id },
        { $set: { accountId } }
      );

      return {
        message: "User is already authenticated for this platform",
        code: 200,
      };
    }

    await EnterpriseIntegration.create({
      platformId,
      userId,
      companyId,
      accountId,
      status: "ACTIVE",
      permission: true,
      requestPermission: false,
    });

    return {
      message: "User Authenticated Successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error in UserAuthenticated:", error);
    return {
      message: "Failed to authenticate user",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// When Owner Enable the integration for the User to connect, then only it will show to the User in the knowledge base
export async function enableIntegrationForUser(
  platformId: string,
  companyId: string,
  userId: string
) {
  try {
    const existingIntegration = await EnterpriseIntegration.findOne({
      platformId,
      userId,
      companyId,
      status: { $ne: "DELETED" }, // optional: ignore deleted records
    });

    if (existingIntegration) {
      // Update the accountId for the existing integration
      await EnterpriseIntegration.updateOne(
        { _id: existingIntegration._id },
        {
          $set: {
            permission: true,
            requestPermission: false,
            status: "INACTIVE",
          },
        }
      );

      return {
        message: "Integration enabled successfully",
        code: 200,
      };
    }

    await EnterpriseIntegration.create({
      platformId,
      userId,
      companyId,
      accountId: "-",
      status: "INACTIVE",
      permission: true,
      requestPermission: false,
    });

    return {
      message: "Integration enabled successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error in enableIntegrationForUser:", error);
    return {
      message: "Failed to enable integration",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// When User connect it's integration - We are updating the EnterpriseIntegration values
export async function connectUserToIntegration(
  userId: string,
  platformId: string,
  companyId: string,
  accountId: string
) {
  try {
    const integration = await EnterpriseIntegration.findOne({
      userId,
      platformId,
      companyId,
      status: { $ne: "DELETED" }, // optional: ignore deleted records
    });

    if (integration) {
      await EnterpriseIntegration.updateOne(
        { _id: integration._id },
        {
          $set: {
            accountId,
            status: "ACTIVE",
          },
        }
      );

      return {
        message: "User connected to integration successfully",
        code: 200,
      };
    }

    return {
      message: "Integration not found",
      code: 404,
    };
  } catch (error) {
    console.error("Error in connectUserToIntegration:", error);
    return {
      message: "Failed to connect user to integration",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Raise Request to Owner for the integration to connect
export async function requestIntegrationPermission() {}

// Owner Approved integration for user to connect
export async function approveIntegrationPermission() {}

// To fetch all the current integration that is enabled or exist (excluding Deleted) for the Owner/User
export async function getUserEnterpriseIntegration(
  userId: string,
  companyId: string
) {
  try {
    // Get all active integration platforms
    if (!companyId) {
      return {
        message: "Missing required fields",
        code: 400,
      };
    }

    // Ensure plain objects (no Mongoose documents)
    const integrationPlatforms = await IntegrationPlatform.find({
      status: { $in: ["ACTIVE"] },
    }).lean();

    // Get user's enterprise integrations
    const userIntegrations = await EnterpriseIntegration.find({
      userId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId),
    }).lean();

    // 3. Create a map for fast lookup of user integrations by platformId
    const integrationMap = new Map(
      userIntegrations.map((integration) => [
        integration.platformId.toString(),
        integration,
      ])
    );

    // 4. Merge platform data with user integration if exists
    const result = integrationPlatforms.map((platform) => {
      const matchedIntegration = integrationMap.get(
        platform._id?.toString() || ""
      );

      // Normalize platform details to be JSON-serializable
      const safePlatform = {
        ...platform,
        _id: platform._id?.toString?.() || String(platform._id),
      } as any;

      if (matchedIntegration) {
        // Normalize integration fields to primitives
        const safeIntegration: any = {
          ...matchedIntegration,
          _id: matchedIntegration._id?.toString?.() || String(matchedIntegration._id),
          platformId:
            (matchedIntegration as any).platformId?.toString?.() || String((matchedIntegration as any).platformId),
          userId:
            (matchedIntegration as any).userId?.toString?.() || String((matchedIntegration as any).userId),
          companyId:
            (matchedIntegration as any).companyId?.toString?.() || String((matchedIntegration as any).companyId),
        };

        return {
          ...safeIntegration,
          platformDetails: safePlatform,
        };
      }

      return {
        platformDetails: safePlatform,
        isConnected: false,
      };
    });

    return {
      message: "Integration fetched successfully",
      code: 200,
      data: result,
    };
  } catch (error) {
    console.error("Error in getUserEnterpriseIntegration:", error);
    throw error;
  }
}

// Delete the User Integration from Pipedream and Update the status in DB
export async function disconnectIntegration(
  userId: string,
  companyId: string,
  platformId: string
) {
  try {
    // Get integration details first
    const integration = await EnterpriseIntegration.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId),
      platformId: new mongoose.Types.ObjectId(platformId),
      status: "ACTIVE",
    });

    if (!integration) {
      return {
        message: "Integration not found",
        code: 404,
      };
    }

    // Get access token from Pipedream
    const tokenResponse = await fetch(
      process.env.NEXT_PUBLIC_APP_URL + "api/pipedream/accessToken"
    );
    const tokenData = await tokenResponse.json();

    if (!tokenData.success) {
      return {
        message: "Failed to get access token",
        code: 500,
        error: tokenData.error,
      };
    }

    // Delete account from Pipedream
    const deleteResponse = await fetch(
      process.env.NEXT_PUBLIC_APP_URL + "api/pipedream/delete-account",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokenData.data,
          account_id: integration.accountId,
        }),
      }
    );

    const deleteData = await deleteResponse.json();
    if (!deleteData.success) {
      return {
        message: "Failed to delete Pipedream account",
        code: 500,
        error: deleteData.error,
      };
    }

    // Update integration status
    await EnterpriseIntegration.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        platformId: new mongoose.Types.ObjectId(platformId),
        companyId: new mongoose.Types.ObjectId(companyId),
        status: "ACTIVE",
      },
      {
        $set: {
          status: "DELETED",
        },
      }
    );

    return {
      message: "Integration deleted successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return {
      message: "Failed to delete integration",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete the User Integration Account from DB
export async function deleteUserIntegrationAccount(
  userId: string,
  companyId: string,
  platformId: string
) {
  try {
    await EnterpriseIntegration.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId),
      platformId: new mongoose.Types.ObjectId(platformId),
      status: "DELETED",
    });

    return {
      message: "Integration account deleted successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error deleting integration account:", error);
    return {
      message: "Failed to delete integration account",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validates if companies exist in enterprise-search system
 *
 * @param companies - Array of company objects with the following structure:
 * [
 *   {
 *     "_id": "686652a8f4b1f91eec9e56f8",
 *     "companyName": "Enterprise Search Test",
 *     "owner": "686652a3f4b1f91eec9e56dd", (optional)
 *     "createdBy": "686652a3f4b1f91eec9e56dd" (optional)
 *   }
 * ]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importCompanies(companies: any[], token: string) {
  try {
    const companyIds = companies.map((c) => String(c._id));

    const existingCompanies = await Company.find({
      _id: { $in: companyIds },
    }).select("_id");

    const existingIds = new Set(existingCompanies.map((c) => String(c._id)));

    // instead of only IDs, keep the full company objects that are missing
    const missingCompanies = companies.filter(
      (c) => !existingIds.has(String(c._id))
    );

    await Promise.all(
      missingCompanies.map((c) =>
        importCompanyDetails(String(c._id), c.companyName, token)
      )
    );

    return {
      message: "Company check & import completed",
      code: 200,
    };
  } catch (error) {
    console.error("Error in companyIdExist:", error);
    return {
      message: "Failed to check companyId",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// When Owner of the company made in kroolo sign-in first time, then it will create the company and import it's organization members into the enterprise-search users so that they can login
export async function importCompanyDetails(
  companyId: string,
  companyName: string,
  token: string
) {
  try {
    console.log("importCompanyDetails", companyId, companyName);
    await Company.findOneAndUpdate(
      { companyId: new mongoose.Types.ObjectId(companyId) },
      { name: companyName },
      { upsert: true, new: true }
    );

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/enterprise-search/get-company-member-list/${companyId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.is_error) {
      throw new Error(data.message || "Failed to fetch company member list");
    }

    if (!Array.isArray(data.data)) {
      throw new Error(
        "Invalid response format: expected data.data to be an array"
      );
    }

    const userOps = data.data.map(
      (member: {
        email: string;
        name: string;
        userId: string;
        country: string;
        dob: string;
        mobile: string;
        profileImage: string;
        profileCreatedOn: string;
        banner: {
          image?: string;
          color?: string;
          type?: string;
          yOffset?: number;
        } | null;
        status: string;
      }) => ({
        updateOne: {
          filter: { userId: member.userId },
          update: {
            $set: {
              email: member.email,
              name: member.name,
              country: member.country,
              dob: member.dob,
              mobile: member.mobile,
              profileImage: member.profileImage,
              profileCreatedOn: member.profileCreatedOn,
              banner: member.banner || null,
              status: member.status,
            },
          },
          upsert: true,
        },
      })
    );

    await User.bulkWrite(userOps);

    const memberOps = data.data.map(
      (member: {
        userId: string;
        email: string;
        status: string;
        role: string;
        designation: string;
        reportingManager: { _id: string; email: string; name: string } | null;
        createdBy: { _id: string; email: string; name: string };
      }) => ({
        updateOne: {
          filter: {
            userId: member.userId,
            companyId: new mongoose.Types.ObjectId(companyId),
          },
          update: {
            $set: {
              status: member.status,
              role: member.role,
              designation: member.designation,
              reportingManagerId: member.reportingManager?._id || null,
              reportingManagerName: member.reportingManager?.name || null,
              reportingManagerEmail: member.reportingManager?.email || null,
              createdBy: member.createdBy._id,
              createdByName: member.createdBy.name,
              createdByEmail: member.createdBy.email,
            },
          },
          upsert: true,
        },
      })
    );

    await Member.bulkWrite(memberOps);

    return {
      message: "Company members imported successfully",
      code: 200,
      data: data.data,
    };
  } catch (error) {
    console.error("Error in importCompanyDetails:", error);
    return {
      message: "Failed to import company details",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// When User is created after the import of the company members, then for that user to actually use the enterprise, we are checking if that user is already the part of that company and have user/admin role then we are creating that user in user, member table.
export async function addUser(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userDetails: any,
  companyId: string
) {
  try {
    await User.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          email: userDetails.email,
          name: userDetails.name,
          country: userDetails.country || "",
          dob: userDetails.dob || "",
          mobile: userDetails?.mobile || "",
          profileImage: userDetails?.picture || "",
          profileCreatedOn: userDetails.createdAt,
          banner: {
            image: userDetails?.banner?.image || null,
            color: userDetails?.banner?.color || "",
            type: userDetails?.banner?.type || "",
            yOffset: userDetails?.banner?.yOffset || 0,
          },
          about: userDetails?.about || "",
        },
      },
      { upsert: true, new: true }
    );
    await Member.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        companyId: new mongoose.Types.ObjectId(companyId),
      },
      {
        $set: {
          status: "ACTIVE",
          role: userDetails.role || "USER",
          designation: userDetails.designation || "",
          reportingManagerId: userDetails.reportingManager?._id || null,
          reportingManagerName: userDetails.reportingManager?.name || "",
          reportingManagerEmail: userDetails.reportingManager?.email || "",
          createdBy: userDetails.createdBy?._id || null,
          createdByName: userDetails.createdBy?.name || "",
          createdByEmail: userDetails.createdBy?.email || "",
        },
      },
      { upsert: true, new: true }
    );
    return {
      message: "User added successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error in addUser:", error);
    return {
      message: "Failed to add user",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validates if a user exists in the Enterprise Search database
 * @param userId - The unique identifier of the user to validate
 */
export async function validateUser(userId: string) {
  try {
    const user = await User.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return {
        message: "User not found",
        code: 404,
      };
    }

    return {
      message: "User found",
      code: 200,
    };
  } catch (error) {
    console.error("Error in validateUser:", error);
    return {
      message: "Failed to validate user",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retrieves a list of companies and roles associated with a specific user
 *
 * This function fetches all companies where the user has membership along with their corresponding roles.
 * The data is used to determine appropriate page access (user vs owner views).
 *
 * @returns {Object} Response containing:
 * - userId: The ID of the user
 * - company: Array of company objects containing:
 *   - role: User's role in the company
 *   - companyName: Name of the company
 *   - companyId: Unique identifier of the company
 */
export async function getCompanyList(userId: string) {
  try {
    const companyList = await Member.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .select("role companyId")
      .populate({
        path: "companyId",
        model: "Company",
        select: "name companyId",
      })
      .lean();

    if (!companyList.length) {
      return {
        message: "No company found",
        code: 404,
      };
    }

    const companies = companyList.map((item) => ({
      role: item.role,
      companyName: (item.companyId as { name?: string })?.name || "",
      companyId:
        (
          item.companyId as { companyId?: mongoose.Types.ObjectId }
        )?.companyId?.toString() || "",
    }));

    return {
      message: "Company list retrieved successfully",
      code: 200,
      data: {
        userId,
        company: companies,
      },
    };
  } catch (error) {
    console.error("Error in getCompanyList:", error);
    return {
      message: "Failed to retrieve company list",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// to fetch the user search history
export async function getSearchHistory(userId: string, companyId: string) {
  try {
    const searchHistory = (await SearchHistory.findOne({
      enterpriseUserId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId),
    }).lean()) as ISearchHistory | null;

    if (!searchHistory || !Array.isArray(searchHistory.text)) {
      return {
        message: "No search history found",
        code: 404,
        searchHistory: [],
      };
    }

    const recentSearches = searchHistory.text.slice(-5).reverse();

    return {
      message: "Search history retrieved successfully",
      code: 200,
      searchHistory: recentSearches,
    };
  } catch (error) {
    console.error("Error in getSearchHistory:", error);
    return {
      message: "Failed to retrieve search history",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// to add the search history into the array of user search history
export async function addSearchHistory(
  userId: string,
  companyId: string,
  title: string,
  description: string,
  type: string
) {
  try {
    await SearchHistory.findOneAndUpdate(
      {
        enterpriseUserId: new mongoose.Types.ObjectId(userId),
        companyId: new mongoose.Types.ObjectId(companyId),
      },
      {
        $push: {
          text: {
            $each: [
              {
                title,
                description,
                type,
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );

    return {
      message: "Search history added",
      code: 200,
    };
  } catch (error) {
    console.error("Error in addSearchHistory:", error);
    return {
      message: "Failed to add search history",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// To fetch the all the members of a company - which is only visible to Owner
export async function getMembersList(companyId: string) {
  try {
    const objectCompanyId = new mongoose.Types.ObjectId(companyId);

    // Get active integrations first (since they are global, not user-specific)
    const currentActiveIntegrations = await IntegrationPlatform.find({
      status: "ACTIVE",
    })
      .select("imageUrl name")
      .lean();

    const membersWithUsers = await Member.aggregate([
      {
        $match: {
          companyId: objectCompanyId,
          status: { $nin: ["DELETED", "PENDING"] },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "enterpriseintegrations",
          let: { userIdStr: { $toString: "$userId" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$userId" }, "$$userIdStr"],
                },
              },
            },
            { $sort: { updatedAt: -1 } },
            {
              $project: {
                platformId: 1,
                status: 1,
              },
            },
          ],
          as: "userIntegrations",
        },
      },

      {
        $addFields: {
          integrations: currentActiveIntegrations.map((integration) => ({
            imageUrl: integration.imageUrl,
            name: integration.name,
            userStatus: {
              $let: {
                vars: {
                  matched: {
                    $first: {
                      $filter: {
                        input: "$userIntegrations",
                        as: "ui",
                        cond: {
                          $eq: [
                            { $toString: "$$ui.platformId" },
                            integration._id.toString(),
                          ],
                        },
                      },
                    },
                  },
                },
                in: {
                  $cond: [
                    { $eq: ["$$matched.status", "ACTIVE"] },
                    "ACTIVE",
                    null,
                  ],
                },
              },
            },
          })),
        },
      },

      {
        $project: {
          _id: { $toString: "$_id" },
          userId: { $toString: "$userId" },
          email: "$userInfo.email",
          name: "$userInfo.name",
          status: { $ifNull: ["$status", "$userInfo.status"] },
          designation: 1,
          role: 1,
          country: "$userInfo.country",
          dob: "$userInfo.dob",
          mobile: "$userInfo.mobile",
          profileImage: "$userInfo.profileImage",
          profileCreatedOn: "$userInfo.profileCreatedOn",
          about: "$userInfo.about",
          banner: "$userInfo.banner",
          createdAt: { $ifNull: ["$createdAt", "$userInfo.createdAt"] },
          reportingManager: {
            $cond: [
              { $ifNull: ["$reportingManagerName", false] },
              {
                name: "$reportingManagerName",
                email: "$reportingManagerEmail",
              },
              null,
            ],
          },
          createdBy: {
            $cond: [
              { $ifNull: ["$createdByName", false] },
              {
                name: "$createdByName",
                email: "$createdByEmail",
              },
              null,
            ],
          },
          integrations: 1,
        },
      },
    ]);

    if (!membersWithUsers.length) {
      return {
        message: "No members found",
        code: 404,
        data: [],
      };
    }

    return {
      message: "Members list retrieved successfully",
      code: 200,
      data: membersWithUsers,
    };
  } catch (error) {
    console.error("Error in getMembersList:", error);
    return {
      message: "Failed to retrieve members list",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// To fetch the member details by memberId
export async function getMemberById(memberId: string, companyId: string) {
  try {
    const member = await Member.findOne({
      _id: new mongoose.Types.ObjectId(memberId),
      companyId: new mongoose.Types.ObjectId(companyId),
    }).lean();

    if (!member) {
      return {
        message: "Member not found",
        code: 404,
        data: null,
      };
    }

    const user = await User.findOne(
      { userId: member.userId },
      {
        userId: 1,
        name: 1,
        email: 1,
        status: 1,
        country: 1,
        dob: 1,
        mobile: 1,
        profileImage: 1,
        profileCreatedOn: 1,
        about: 1,
        banner: 1,
        createdAt: 1,
      }
    ).lean();

    const fullMemberData = {
      _id: member._id,
      userId: member.userId?.toString() || "",
      email: user?.email || "",
      name: user?.name || "",
      status: member.status || user?.status || "",
      designation: member.designation || "",
      role: member.role || "",
      country: user?.country || "",
      dob: user?.dob || "",
      mobile: user?.mobile || "",
      profileImage: user?.profileImage || "",
      profileCreatedOn: user?.profileCreatedOn || "",
      about: user?.about || "",
      banner: user?.banner || null,
      reportingManager: member.reportingManagerName
        ? {
            name: member.reportingManagerName,
            email: member.reportingManagerEmail || "",
          }
        : null,
      createdBy: member.createdByName
        ? {
            name: member.createdByName,
            email: member.createdByEmail || "",
          }
        : null,
      createdAt: member.createdAt || user?.createdAt || null,
    };

    return {
      message: "Member retrieved successfully",
      code: 200,
      data: fullMemberData,
    };
  } catch (error) {
    console.error("Error in getMemberById:", error);
    return {
      message: "Failed to retrieve member",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update about section in profile
export async function updateAbout(userId: string, about: string) {
  try {
    const aboutUpdate = await User.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        $set: {
          about: about || "",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!aboutUpdate) {
      return {
        message: "Failed to update About",
        code: 404,
      };
    }

    return {
      message: "About updated successfully",
      code: 200,
      data: aboutUpdate,
    };
  } catch (error) {
    console.error("Error in updateAbout:", error);
    return {
      message: "Failed to update about",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Fetch Profile Details
export async function fetchUserProfileDetails(
  userId: string,
  companyId: string
) {
  try {
    const userDetails = await User.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!userDetails) {
      return {
        message: "User not found",
        code: 404,
      };
    }

    const memberDetails = await Member.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .populate({
        path: "companyId",
        model: "Company",
        select: "name",
      })
      .lean();

    if (!memberDetails) {
      return {
        message: "Member details not found",
        code: 404,
      };
    }

    const details = {
      ...userDetails,
      _id: userDetails._id?.toString(), // convert _id to string
      userId: userDetails.userId?.toString() || userDetails.userId, // if userId is ObjectId
      uniqueId: userDetails.uniqueId || "",
      // member fields
      memberStatus: memberDetails.status || "",
      role: memberDetails.role || "",
      designation: memberDetails.designation || "",
      reportingManager: memberDetails.reportingManagerName
        ? {
            name: memberDetails.reportingManagerName,
            email: memberDetails.reportingManagerEmail || "",
          }
        : null,
      createdBy: memberDetails.createdByName
        ? {
            name: memberDetails.createdByName,
            email: memberDetails.createdByEmail || "",
          }
        : null,
      // populated company
      companyName: memberDetails.companyId
        ? memberDetails.companyId.toString()
        : "",
    };

    return {
      message: "User profile details fetched successfully",
      code: 200,
      data: details,
    };
  } catch (error) {
    console.error("Error in fetchUserProfileDetails:", error);
    return {
      message: "Failed to fetch user profile details",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Check if the Company is already onboard on not
export async function isCompanyExist(companyId: string) {
  try {
    const company = await Company.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (!company) {
      return {
        message: "Company not found",
        code: 404,
      };
    }

    return {
      message: "Company found",
      code: 200,
    };
  } catch (error) {
    console.error("Error in isCompanyExist:", error);
    return {
      message: "Failed to check company existence",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all the companies of a user
export async function getCompanies(userId: string) {
  try {
    const memberCompanies = await Member.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .select("role companyId")
      .lean();

    if (!memberCompanies || memberCompanies.length === 0) {
      return {
        message: "Companies not found",
        code: 404,
      };
    }

    const companies = await Company.find({
      companyId: {
        $in: memberCompanies.map((company) => company.companyId),
      },
    })
      .select("name companyId ")
      .lean();

    const formattedCompanies = memberCompanies.map((memberCompany) => {
      const company = companies.find(
        (c) => c.companyId.toString() === memberCompany.companyId.toString()
      );
      return {
        role: memberCompany.role,
        companyId: memberCompany.companyId.toString(),
        name: company?.name || "",
      };
    });

    return {
      message: "Companies found",
      code: 200,
      data: formattedCompanies,
    };
  } catch (error) {
    console.error("Error in getCompanies:", error);
    return {
      message: "Failed to get companies",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
