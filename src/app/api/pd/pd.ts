import { createBackendClient, ProjectEnvironment } from "@pipedream/sdk/server";

// These secrets should be saved securely and passed to your environment
export const pd = createBackendClient({
  environment: process.env.PIPEDREAM_ENVIRONMENT as ProjectEnvironment,
  projectId: process.env.PIPEDREAM_PROJECT_ID as string,
  credentials: {
    clientId: process.env.PIPEDREAM_CLIENT_ID!,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET!,
  },
});

// Create a token for a specific user
export const serverConnectTokenCreate = async ({
  external_user_id,
}: {
  external_user_id: string;
}) => {
  const { token, expires_at, connect_link_url } = await pd.createConnectToken({
    external_user_id,
  });

  const accounts = await pd.getAccounts({
    external_user_id, // Your external user ID
    include_credentials: true, // Include credentials to get user details
  });

  console.log("====> accounts", accounts);

  return {
    token,
    expires_at,
    connect_link_url,
  };
};

// Fetch account access token
export const getAccountInfo = async ({
  accountId,
  external_user_id,
}: {
  accountId: string;
  external_user_id: string;
}) => {
  const response = await pd.getAccounts({
    external_user_id,
    include_credentials: true,
  });

  const matchedAccount = response.data.find((acc) => acc.id === accountId);

  if (!matchedAccount) {
    console.warn(`⚠️ No account found for ID: ${accountId}`);
    return { account: null };
  }

  console.log("✅ Matched Account:", matchedAccount);

  return { account: matchedAccount };
};
