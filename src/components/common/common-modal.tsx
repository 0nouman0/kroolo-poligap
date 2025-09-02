"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

interface ModalAction {
  label: string;
  onClick: () => Promise<void> | void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ModalAction[];
  showCancel?: boolean;
  cancelLabel?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
}

export function CommonModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  showCancel = true,
  cancelLabel = "Cancel",
  maxWidth = "md",
  showCloseButton = true,
}: CommonModalProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={`${maxWidthClasses[maxWidth]} gap-6`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          {showCancel && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={actions.some((action) => action.loading)}
            >
              {cancelLabel}
            </Button>
          )}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "default"}
              onClick={action.onClick}
              disabled={
                action.disabled ||
                action.loading ||
                actions.some((a) => a.loading)
              }
            >
              {action.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {action.loadingText || action.label}
                </>
              ) : (
                action.label
              )}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
