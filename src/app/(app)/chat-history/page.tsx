"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trash2 } from "lucide-react";
import FilterIcon from "@/assets/icons/filter.svg";
import { useCompanyStore } from "@/stores/company-store";
import { useChatHistory } from "@/lib/queries/useChatHistory";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatHistoryPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;

  const {
    data: inboxData,
    isLoading: isInboxLoading,
    isError: isInboxError,
  } = useChatHistory(companyId, "inbox");
  const {
    data: trashData,
    isLoading: isTrashLoading,
    isError: isTrashError,
  } = useChatHistory(companyId, "trash");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  console.log("inboxData =>", inboxData);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="base-heading">All Chat History</h1>
            {/* <p className="text-muted-foreground">
              Here is the list of all the chat history.
            </p> */}
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button variant="outline" size="sm" className="text-sm">
              Mark as all read
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sm text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {activeTab === "trash" ? "Empty Trash" : "Move to Trash"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 border-r">
            <div className="w-full">
              <div className="flex flex-col h-auto w-full p-0 bg-transparent">
                <button
                  onClick={() => handleTabChange("inbox")}
                  className={`w-full text-left px-4 py-3 rounded-none ${
                    activeTab === "inbox"
                      ? "border-l-4 border-primary text-primary bg-accent/50"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  Inbox
                </button>
                <button
                  onClick={() => handleTabChange("trash")}
                  className={`w-full text-left px-4 py-3 rounded-none ${
                    activeTab === "trash"
                      ? "border-l-4 border-primary text-primary bg-accent/50"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  Trash
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="w-full">
              {/* <ManageAccessModal
                isOpen={true}
                onClose={() => {}}
                integrationType={"googledrive"}
                integrationName={"Google Drive"}
                setLoaderOpen={() => {}}
              /> */}
              {activeTab === "inbox" && (
                <div className="space-y-4">
                  {isInboxLoading && (
                    <>
                      {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 mt-1" />
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 text-xs">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-24 rounded" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {!isInboxLoading && isInboxError && (
                    <div>Error loading chat history.</div>
                  )}
                  {!isInboxLoading &&
                    inboxData?.data &&
                    inboxData.data.length === 0 && (
                      <div>No conversations found.</div>
                    )}
                  {!isInboxLoading &&
                    inboxData?.data?.map((item) => (
                      <ChatItem
                        key={item.conversation._id}
                        title={item.conversation.chatName}
                        time={new Date(
                          item.conversation.createdAt
                        ).toLocaleString()}
                        email={item?.user?.email || ""}
                        summary={item.conversation.summary}
                      />
                    ))}
                </div>
              )}
              {activeTab === "trash" && (
                <div className="space-y-4">
                  {isTrashLoading && <div>Loading...</div>}
                  {isTrashError && <div>Error loading chat history.</div>}
                  {trashData?.data && trashData.data.length === 0 && (
                    <div>No conversations found.</div>
                  )}
                  {trashData?.data?.map((item) => (
                    <ChatItem
                      key={item.conversation._id}
                      title={item.conversation.chatName}
                      time={new Date(
                        item.conversation.createdAt
                      ).toLocaleString()}
                      email={item?.user?.email || ""}
                      summary={item.conversation.summary}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatItemProps {
  title: string;
  time: string;
  email: string;
  summary: string;
}

function ChatItem({ title, time, email, summary }: ChatItemProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-primary">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-medium text-primary">{title}</h3>
            <div className="flex items-center gap-2">
              {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                <Star className="h-4 w-4 text-muted-foreground" />
              </Button> */}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 text-xs text-secondary">
            <span>{time}</span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 w-fit"
            >
              {email}
            </Badge>
          </div>
          <p className="text-xs text-secondary line-clamp-3">{summary}</p>
        </div>
      </div>
    </div>
  );
}
