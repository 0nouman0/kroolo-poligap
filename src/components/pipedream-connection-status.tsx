"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Mail,
  Eye,
  EyeOff
} from "lucide-react";
import { toastEmailMismatch } from "@/components/toast-varients";

interface ConnectionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

interface PipedreamConnectionStatusProps {
  isConnecting?: boolean;
  connectionLogs?: ConnectionLog[];
  onTestEmailMismatch?: () => void;
}

export function PipedreamConnectionStatus({ 
  isConnecting = false, 
  connectionLogs = [],
  onTestEmailMismatch 
}: PipedreamConnectionStatusProps) {
  const [showLogs, setShowLogs] = useState(false);
  const [showFullData, setShowFullData] = useState(false);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const testEmailMismatch = () => {
    toastEmailMismatch(
      "john.doe@example.com",
      "jane.smith@company.com", 
      "Google Drive",
      () => {
        console.log("User clicked retry after email mismatch");
      }
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isConnecting ? (
              <Clock className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            Pipedream Connection Status
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showLogs ? 'Hide' : 'Show'} Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testEmailMismatch}
            >
              <Mail className="w-4 h-4 mr-2" />
              Test Email Mismatch
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isConnecting ? "secondary" : "default"}>
            {isConnecting ? "Connecting..." : "Ready"}
          </Badge>
          {isConnecting && (
            <span className="text-sm text-gray-600">
              Processing connection with enhanced security checks...
            </span>
          )}
        </div>

        {/* Enhanced Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Email Security Check
            </h4>
            <p className="text-xs text-gray-600">
              Automatically validates that connected accounts match your authorized email address
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Comprehensive Logging
            </h4>
            <p className="text-xs text-gray-600">
              Detailed logs for every step of the connection process with timestamps and context
            </p>
          </div>
        </div>

        {/* Connection Logs */}
        {showLogs && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Connection Logs</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullData(!showFullData)}
              >
                {showFullData ? 'Hide' : 'Show'} Full Data
              </Button>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
              {connectionLogs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No connection logs yet. Start a connection to see logs here.
                </p>
              ) : (
                connectionLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLogBadgeVariant(log.level)} className="text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{log.message}</p>
                      {showFullData && log.data && (
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sample Log Entries for Demo */}
        {connectionLogs.length === 0 && showLogs && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sample Log Output</h4>
            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900 font-mono text-xs">
              <div className="text-green-600">🔌 PIPEDREAM INFO 2024-01-01T12:00:00Z [appName:Google Drive] - 🚀 Starting connection process</div>
              <div className="text-blue-600">🔌 PIPEDREAM INFO 2024-01-01T12:00:01Z - 🎫 Token generated successfully</div>
              <div className="text-green-600">🔌 PIPEDREAM INFO 2024-01-01T12:00:02Z - 🪝 Pipedream connection response received</div>
              <div className="text-green-600">🔌 PIPEDREAM INFO 2024-01-01T12:00:03Z - 📧 Email validation PASSED</div>
              <div className="text-green-600">🔌 PIPEDREAM INFO 2024-01-01T12:00:04Z - ✅ Connection completed successfully</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
