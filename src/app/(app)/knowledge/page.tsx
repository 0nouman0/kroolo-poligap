"use client";
import {
  getUserEnterpriseIntegration,
  UserAuthenticated,
  disconnectIntegration,
} from "@/app/api/enterpriseSearch/enterpriseSearch";
import { Button } from "@/components/common/common-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createFrontendClient } from "@pipedream/sdk/browser";
import {
  Search,
  CircleCheck,
  MoreVertical,
  View,
  X,
  Loader2,
  Unlink
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import DisconnectIcon from "@/assets/icons/disconnect.svg";

import { DeleteSourceModal } from "@/components/delete-source-modal";
import Link from "next/link";
import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import { Skeleton } from "@/components/ui/skeleton";
import {
  filterCategories,
  type IntegrationName,
  integrationNameToSlug,
} from "@/constants/knowledge";
import { useCompanyStore } from "@/stores/company-store";
import { useUserStore } from "@/stores/user-store";
import ExternalKnowledgeBaseUploader from "./internal_knowledge";
import { IngestionSocketProvider } from "@/context/IngestionSocketContext";
import { toastEmailMismatch, toastError, toastSuccess } from "@/components/toast-varients";
import { pipedreamLogger, PipedreamLogger } from "@/utils/pipedream-logger";

function KnowledgePageContent() {
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const { companyId } = selectedCompany || {};
  const userData = useUserStore((s) => s.userData);
  const userId = userData?.userId;
  const userEmail = userData?.email;

  // Initialize logger with context
  const logger = new PipedreamLogger({
    userId,
    companyId,
    userEmail
  });

  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isFetchingToken, setIsFetchingToken] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [integrations, setIntegrations] = useState<any[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [disconnectingIntegration, setDisconnectingIntegration] = useState<
    string | null
  >(null);
  const [disconnectingIntegrationName, setDisconnectingIntegrationName] =
    useState<string | null>(null);
  const [disconnectingAccountId, setDisconnectingAccountId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [connectedSpinners, setConnectedSpinners] = useState<{
    [key: string]: boolean;
  }>({});

  // Filter integrations based on search and active filter
  const filteredIntegrations = useMemo(() => {
    let filtered = integrations;
    if (activeFilter !== "all") {
      const activeFilterObj = filterCategories.find(
        (f) => f.id === activeFilter
      );
      if (activeFilterObj && activeFilterObj.integrations) {
        filtered = filtered.filter((integration) =>
          activeFilterObj.integrations.includes(
            integration.platformDetails?.name as IntegrationName
          )
        );
      } else {
        filtered = [];
      }
    }
    if (searchQuery) {
      filtered = filtered.filter((integration) =>
        // removed to search by description
        // integration.platformDetails?.description ||
        (integration.platformDetails?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [searchQuery, activeFilter, integrations]);

  const pd = createFrontendClient({
    externalUserId: userId,
  });

  // Fetch integrations on mount and for refresh
  async function fetchUserEnterpriseIntegration() {
    setLoading(true);
    const integrationDetails = await getUserEnterpriseIntegration(
      userId!,
      companyId!
    );
    setIntegrations(integrationDetails.data || []);

    setLoading(false);
  }

  useEffect(() => {
    fetchToken("initial");
    fetchUserEnterpriseIntegration();
  }, []);

  async function fetchToken(app: string) {
    setIsFetchingToken((prev) => ({ ...prev, [app]: true }));
    logger.logStep('Starting token generation', { app, userId });

    try {
      const res = await fetch("/api/pd", {
        method: "POST",
        body: JSON.stringify({ external_user_id: userId }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Capture the full response and extract fields
        const response = await res.json();
        const { token, expires_at, connect_link_url, cloud_id, cloud_url } = response;
        setToken(token);
        logger.logTokenGeneration(token);
        // Optionally, you could use or store cloud_id/cloud_url as needed
        return {
          token,
          expires_at,
          connect_link_url,
          cloud_id,
          cloud_url
        };
      } else {
        const errorText = await res.text();
        logger.logTokenError({ status: res.status, message: errorText });
        toastError(
          'Token Generation Failed',
          'Unable to generate connection token. Please try again.'
        );
        return null;
      }
    } catch (error) {
      logger.logTokenError(error);
      toastError(
        'Connection Error',
        'Failed to initialize connection. Please check your internet connection and try again.'
      );
      return null;
    } finally {
      setIsFetchingToken((prev) => ({ ...prev, [app]: false }));
    }
  }

  async function fetchAccount(app: string) {
    try {
      const res = await fetch("/api/pd", {
        method: "PUT",
        body: JSON.stringify({ external_user_id: userId, accountId: app }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const response = await res.json();
        console.log("res->>>>>>", response)
        return response;
      } else {
        console.error("Failed to fetch token");
        return null;
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  }

  async function connectAccount(appName: IntegrationName, platformId: string) {
    // Use the mapping to get the slug
    const appSlug = integrationNameToSlug[appName] || appName;

    // Initialize logging for this connection
    logger.setContext({ appName, platformId });
    logger.logConnectionStart(appName, platformId);

    setIsConnecting((prev) => ({ ...prev, [appName]: true }));
    await fetchToken(appSlug);

    if (!token) {
      console.error("No token available");
      setIsConnecting((prev) => ({ ...prev, [appSlug]: false }));
      return;
    }

    try {
      await pd.connectAccount({
        app: appSlug,
        token,
        onSuccess: async (data) => {
          try {
            // Log the basic Pipedream response
            logger.logPipedreamResponse(data);
            logger.logTokenGeneration(token || "");

            // Fetch full account details
            const pipedreamResponse = await fetchAccount(data.id);
            logger.logFullAccountDetails(pipedreamResponse);

            // Extract connected account email
            // const connectedEmail = pipedreamResponse?.account?.name ||
            //   pipedreamResponse?.account?.email ||
            //   pipedreamResponse?.account?.user?.email ||
            //   'Unknown';

            // // 🚫 Enhanced Email mismatch check with comprehensive logging
            // if (connectedEmail && connectedEmail !== userEmail) {
            //   // Log the security issue
            //   logger.logEmailMismatch(connectedEmail, userEmail || 'Unknown', appName);
            //   logger.logSecurityAction(
            //     'CONNECTION_BLOCKED',
            //     'Email mismatch detected',
            //     { connectedEmail, userEmail, appName, accountId: data.id }
            //   );

            //   // Show enhanced email mismatch toast
            //   toastEmailMismatch(
            //     connectedEmail,
            //     userEmail || 'Unknown',
            //     appName,
            //     () => {
            //       // Retry callback - user can try connecting again
            //       logger.logStep('User initiated retry after email mismatch');
            //       connectAccount(appName, platformId);
            //     }
            //   );

            //   setIsConnecting((prev) => ({ ...prev, [appName]: false }));
            //   return;
            // }

            // Log successful email validation
            // logger.logEmailValidation(connectedEmail, userEmail || 'Unknown', true);

            // Send success payload to FastAPI
            // const fastApiPayload = {
            //   user_id: userId,
            //   company_id: companyId,
            //   pipedream_response: pipedreamResponse,
            // };

            // try {
            //   logger.logStep('Sending notification to FastAPI', fastApiPayload);

            //   const response = await fetch(
            //     `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/v1/connect/pipedream`,
            //     {
            //       method: "POST",
            //       headers: {
            //         "Content-Type": "application/json",
            //       },
            //       body: JSON.stringify(fastApiPayload),
            //     }
            //   );

            //   if (!response.ok) {
            //     logger.logFastApiNotification(fastApiPayload, false);
            //     logger.logStep('FastAPI notification failed', { status: response.status }, 'error');
            //   } else {
            //     logger.logFastApiNotification(fastApiPayload, true);
            //     logger.logStep('FastAPI notification successful');
            //   }
            // } catch (err) {
            //   logger.logFastApiNotification(fastApiPayload, false);
            //   logger.logStep('FastAPI notification error', err, 'error');
            // }
          } catch (fetchErr: any) {
            console.error(
              "⚠️ Failed to fetch full account details:",
              fetchErr.message
            );
          }

          // Log connection details
          logger.logStep('Processing connection details', {
            accountId: data.id,
            companyId,
            platformId,
            userId
          });

          // Store integration in database
          const userAuth = await UserAuthenticated(
            data.id,
            platformId,
            companyId!,
            userId!
          );

          logger.logDatabaseOperation('UserAuthenticated', userAuth);
          // Refresh integrations after successful connect
          await fetchUserEnterpriseIntegration();

          // Start spinner for 6 seconds
          setConnectedSpinners((prev) => ({ ...prev, [appName]: true }));
          setTimeout(() => {
            setConnectedSpinners((prev) => ({ ...prev, [appName]: false }));
          }, 10000);

          const ingestionBody: any = {
            services: [appSlug],
            account_google_drive: undefined,
            account_slack: undefined,
            account_dropbox: undefined,
            account_jira: undefined,
            account_sharepoint: undefined,
            account_confluence: undefined,
            account_microsoft_teams: undefined,
            account_zendesk: undefined,
            account_document360: undefined,
            account_bitbucket: undefined,
            account_github: undefined,
            account_google_calendar: undefined,
            account_outlook: undefined,
            external_user_id: userId,
            user_email: userEmail,
            empty: false,
            chunkall: false,
            websocket_session_id: data.id,
          };

          switch (appSlug) {
            case "google_drive":
              ingestionBody.account_google_drive = data.id;
              break;
            case "dropbox":
              ingestionBody.account_dropbox = data.id;
              break;
            case "slack":
              ingestionBody.account_slack = data.id;
              break;
            case "jira":
              ingestionBody.account_jira = data.id;
              break;
            case "sharepoint":
              ingestionBody.account_sharepoint = data.id;
              break;
            case "confluence":
              ingestionBody.account_confluence = data.id;
              break;
            case "microsoft_teams":
              ingestionBody.account_microsoft_teams = data.id;
              break;
            case "zendesk":
              ingestionBody.account_zendesk = data.id;
              break;
            case "document360":
              ingestionBody.account_document360 = data.id;
              break;
            case "bitbucket":
              ingestionBody.account_bitbucket = data.id;
              break;
            case "github":
              ingestionBody.account_github = data.id;
              break;
            case "google_calendar":
              ingestionBody.account_google_calendar = data.id;
              break;
            case "outlook":
              ingestionBody.account_outlook = data.id;
              break;
          }

          // Remove undefined account fields
          Object.keys(ingestionBody).forEach(
            (key) => ingestionBody[key] === undefined && delete ingestionBody[key]
          );

          // Log ingestion start
          logger.logIngestionStart(ingestionBody);

          try {
            const ingestionResponse = await fetch(DJANGO_API_ROUTES.INGEST, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ingestionBody),
            });

            if (ingestionResponse.ok) {
              logger.logStep('Ingestion request successful');
              logger.logConnectionComplete(appName, data.id);

              // Show success toast
              toastSuccess(
                `${appName} Connected Successfully`,
                `Data ingestion has started. You'll see progress updates in real-time.`
              );
            } else {
              logger.logStep('Ingestion request failed', { status: ingestionResponse.status }, 'error');
              toastError(
                'Ingestion Failed',
                `Failed to start data ingestion for ${appName}. Please try again.`
              );
            }
          } catch (ingestionError) {
            logger.logStep('Ingestion request error', ingestionError, 'error');
            toastError(
              'Connection Error',
              `Failed to initiate data sync for ${appName}. Please check your connection.`
            );
          }
        },
        onError: (error) => {
          logger.logConnectionError(appName, error);
          toastError(
            `${appName} Connection Failed`,
            `Unable to connect to ${appName}. Please try again or contact support if the issue persists.`
          );
        },
      });
    } catch (error) {
      logger.logConnectionError(appName, error);
      toastError(
        'Connection Error',
        `An unexpected error occurred while connecting to ${appName}. Please try again.`
      );
    } finally {
      setIsConnecting((prev) => ({ ...prev, [appName]: false }));
      logger.logStep('Connection process completed', { appName });
    }
  }

  const disconnect = useCallback(async () => {
    if (!disconnectingIntegration) return;

    await disconnectIntegration(userId!, companyId!, disconnectingIntegration);

    setShowDeleteConfirm(false);
    setDisconnectingIntegration(null);
    setDisconnectingAccountId(null);
    setDisconnectingIntegrationName(null);

    await fetch(DJANGO_API_ROUTES.DISCONNECT_ACCOUNT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_id: disconnectingAccountId,
        external_user_id: userId,
        user_email: userEmail,
      }),
    });

    // Refresh integrations
    const integrationDetails = await getUserEnterpriseIntegration(
      userId!,
      companyId!
    );
    setIntegrations(integrationDetails.data || []);
  }, [
    disconnectingIntegration,
    disconnectingAccountId,
    userId,
    companyId,
    userEmail,
  ]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-2">
            <h1 className="base-heading">Knowledge Base</h1>
            <p className="text-13 -mt-2">
              Connect external sources to enable faster, smarter responses.
            </p>
          </div>
          <div className="mb-2">
            {/* Available Sources Section */}
            <div className="space-y-1">
              <h2 className="text-sm font-medium">
                Available Apps ({filteredIntegrations.length})
              </h2>
              {/* Search Bar and Filter Buttons Row */}
              <div className="flex flex-wrap gap-3 md:gap-6 mb-4 items-center">
                <div className="relative flex-1 min-w-[250px] md:max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search app"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full pr-8"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterCategories.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={"outline"}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "h-6",
                        activeFilter === filter.id
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {loading ? (
                  <>
                    {[...Array(6)].map((_, idx) => (
                      <Card
                        key={idx}
                        className="border border-transparent overflow-hidden"
                      >
                        <CardContent className="p-0">
                          <div className="p-1">
                            <div className="flex justify-center mb-1">
                              <Skeleton className="h-8 w-8 mb-2" />
                            </div>
                            <Skeleton className="h-4 w-3/4 mx-auto mb-1" />
                          </div>
                          <div className="p-1 flex justify-center">
                            <Skeleton className="h-7 w-[85%] rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : filteredIntegrations.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                      No apps found
                    </p>
                  </div>
                ) : (
                  filteredIntegrations.map((integration) => {
                    const isConnected =
                      integration.isConnected === true ||
                      integration.status === "ACTIVE";

                    const isConnectingOrFetching =
                      isFetchingToken[integration.platformDetails?.name] ||
                      isConnecting[integration.platformDetails?.name];

                    return (
                      <Card
                        key={
                          integration._id ||
                          integration.platformDetails?._id ||
                          integration.platformDetails?.name
                        }
                        className={
                          "border border-transparent overflow-hidden relative group dark:border-white/10"
                        }
                      >
                        <CardContent className="p-0">
                          <div className="p-1">
                            <div className="flex justify-center mb-1">
                              <Image
                                src={
                                  integration.platformDetails?.imageUrl ||
                                  integration.platformDetails?.logo ||
                                  "/placeholder.svg"
                                }
                                alt={`$${integration.platformDetails?.description ||
                                  integration.platformDetails?.name
                                  } logo`}
                                className="h-8 w-8 object-contain"
                                width={32}
                                height={32}
                              />
                            </div>
                            <h3 className="text-center text-sm font-medium mb-1">
                              {integration.platformDetails?.name}
                            </h3>
                            <p className="text-xs text-center text-muted-foreground mb-3 line-clamp-2">
                              {/* {integration.platformDetails?.description} */}
                            </p>
                          </div>
                          <div className="p-1 flex justify-center">
                            {isConnected ? (
                              <div className="relative w-[85%]">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded flex items-center justify-between">
                                  <div></div>
                                  <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
                                    {connectedSpinners[
                                      integration.platformDetails?.name
                                    ] ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <button className="text-xs cursor-pointer">
                                          Ingesting...
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <CircleCheck
                                          size={16}
                                          fill="green"
                                          stroke="white"
                                        />
                                        <button className="text-xs cursor-pointer">
                                          Connected
                                        </button>
                                      </>
                                    )}
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      asChild
                                      className="cursor-pointer "
                                    >
                                      <button className="focus:outline-none">
                                        <MoreVertical className="h-4 w-5 text-gray-500 dark:text-gray-400" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="min-w-[168px] text-sm popover-shadow p-1"
                                    >
                                      {isConnected && (
                                        <Link
                                          href={
                                            integration.platformDetails?.name === "sitemap"
                                              ? `/knowledge/sitemap/${integration.accountId}`
                                              : `/knowledge/${integrationNameToSlug[
                                              integration.platformDetails
                                                ?.name as IntegrationName
                                              ]
                                              }/${integration.accountId}`
                                          }
                                        >
                                          <DropdownMenuItem className="text-primary cursor-pointer font-normal text-13 px-0 rounded-none hover:bg-gray-50 focus:bg-gray-50 focus:text-primary">
                                            <div className="px-3 w-full flex items-center">
                                              <View
                                                className="h-4 w-4 text-black dark:text-white mr-2"
                                                stroke="currentColor"
                                                strokeWidth={1}
                                              />
                                              <span>Configure</span>
                                            </div>
                                          </DropdownMenuItem>
                                        </Link>
                                      )}

                                      {isConnected && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setShowDeleteConfirm(true);
                                            setDisconnectingIntegration(
                                              integration.platformDetails?._id
                                            );
                                            setDisconnectingAccountId(
                                              integration.accountId
                                            );
                                            setDisconnectingIntegrationName(
                                              integration.platformDetails?.name
                                            );
                                          }}
                                          className="cursor-pointer font-normal text-13 text-error-red focus:text-red-500 dark:text-red-400 dark:focus:text-red-400 px-0 rounded-none hover:bg-gray-50 focus:bg-gray-50"
                                        >
                                          <div className="px-3 w-full flex items-center">
                                            <Unlink
                                              className="h-4 w-4 text-black dark:text-white mr-2"
                                              stroke="currentColor"
                                              strokeWidth={1}
                                            />
                                            <span className="text-13">
                                              Disconnect
                                            </span>
                                          </div>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ) : (
                              <div className="relative w-[85%]">
                                <button
                                  onClick={() =>
                                    connectAccount(
                                      integration.platformDetails?.name,
                                      integration.platformDetails?._id
                                    )
                                  }
                                  disabled={isConnectingOrFetching}
                                  className="text-xs font-medium w-full py-1.5 px-3 rounded border 
                                  bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                  border-gray-300 dark:border-gray-600 
                                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isConnectingOrFetching
                                    ? "Connecting..."
                                    : "Connect"}
                                </button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ExternalKnowledgeBaseUploader />

      <DeleteSourceModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDisconnectingIntegration(null);
          setDisconnectingAccountId(null); // reset here
          setDisconnectingIntegrationName(null);
        }}
        onConfirm={disconnect}
        integrationName={disconnectingIntegrationName || ""}
      />
    </div>
  );
}

export default function PipedreamIntegrations() {
  return (
    <IngestionSocketProvider>
      <KnowledgePageContent />
    </IngestionSocketProvider>
  );
}
