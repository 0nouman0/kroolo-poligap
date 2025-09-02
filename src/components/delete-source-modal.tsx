"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  integrationType?: string;
  integrationName?: string;
}

export function DeleteSourceModal({
  isOpen,
  onClose,
  onConfirm,
  integrationType = "Google Drive",
  integrationName = "",
}: DeleteSourceModalProps) {
  const displayName = integrationName || integrationType;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Disconnect {displayName} Integration
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to disconnect this integration? <br /> This
            action will remove all connected data and permissions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-sm px-3 py-1 cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-sm px-3 py-1 cursor-pointer"
          >
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
