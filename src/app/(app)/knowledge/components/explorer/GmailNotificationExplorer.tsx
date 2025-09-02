"use client";

import React, { useState, useEffect } from "react";
import { useIntegrationStore } from "@/stores/integration-store";
import { INTEGRATIONS } from "@/constants/knowledge";
import { GMAIL_INTEGRATION } from "@/constants/gmail-integration";

interface GmailNotificationExplorerProps {
  accountId: string;
  onFileSelect?: (file: any) => void;
}

export default function GmailNotificationExplorer({ 
  accountId, 
  onFileSelect 
}: GmailNotificationExplorerProps) {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) {
      fetchGmailNotifications();
    }
  }, [accountId]);

  const fetchGmailNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would be the actual API call to fetch Gmail notifications
      // For now, we'll simulate the structure
      const response = await fetch(`/api/gmail-notifications/${accountId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        throw new Error("Failed to fetch Gmail notifications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchGmailNotifications();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {GMAIL_INTEGRATION.DISPLAY_NAME}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {notifications.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">
            No Gmail notifications found. Ensure your Gmail account is properly connected.
          </p>
        )}

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onFileSelect?.(notification)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{notification.subject}</h4>
                <p className="text-sm text-gray-600">{notification.from}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
