"use client";

import { toast } from "sonner";
import { CheckCircle, X, Clipboard, Shield, AlertTriangle, Mail } from "lucide-react";

// Success toast (matches your design)
export const toastSuccess = (title: string, description?: string) => {
  toast.custom((t) => (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px] relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg" />
      <div className="flex-shrink-0 mt-0.5">
        <CheckCircle className="w-5 h-5 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
        {description && (
          <div className="text-sm text-gray-600">{description}</div>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};

// Error toast variant (red border with circle exclamation)
export const toastError = (title: string, description?: string) => {
  toast.custom((t) => (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px] relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg" />
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
        {description && (
          <div className="text-sm text-gray-600">{description}</div>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};

// Warning toast variant (yellow/orange border with circle exclamation)
export const toastWarning = (title: string, description?: string) => {
  toast.custom((t) => (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px] relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-l-lg" />
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
        {description && (
          <div className="text-sm text-gray-600">{description}</div>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};

// Info toast variant (yellow/orange border with clipboard icon)
export const toastInfo = (title: string, description?: string) => {
  toast.custom((t) => (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px] relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-l-lg" />
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 rounded bg-yellow-500 flex items-center justify-center">
          <Clipboard className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
        {description && (
          <div className="text-sm text-gray-600">{description}</div>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
};

// Email mismatch error toast with enhanced UI
export const toastEmailMismatch = (
  connectedEmail: string,
  userEmail: string,
  serviceName: string,
  onRetry?: () => void
) => {
  toast.custom((t) => (
    <div className="flex flex-col gap-3 bg-white border border-red-200 rounded-lg shadow-lg p-4 min-w-[380px] max-w-[420px] relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg" />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Connection Not Allowed
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Account email mismatch detected for {serviceName}
          </div>
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Email Details */}
      <div className="ml-11 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Mail className="w-3 h-3 text-gray-500" />
          <span className="text-gray-500 dark:text-gray-400">Connected account:</span>
          <span className="font-medium text-red-600 dark:text-red-400">{connectedEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Mail className="w-3 h-3 text-gray-500" />
          <span className="text-gray-500 dark:text-gray-400">Your account:</span>
          <span className="font-medium text-green-600 dark:text-green-400">{userEmail}</span>
        </div>
      </div>

      {/* Warning Message */}
      <div className="ml-11 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-700 dark:text-red-300">
            <div className="font-medium mb-1">Security Notice</div>
            <div>
              Please disconnect and reconnect using your authorized email address ({userEmail})
              to ensure data security and proper access control.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onRetry && (
        <div className="ml-11 flex gap-2 pt-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              onRetry();
            }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-md transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  ), {
    duration: 8000, // Longer duration for important security message
  });
};
