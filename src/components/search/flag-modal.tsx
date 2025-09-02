import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { useCompanyStore } from "@/stores/company-store";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { toastSuccess } from "../toast-varients";

const REASONS = [
  "Flagged",
  "Inappropriate Content",
  "Incorrect Information",
  "Other",
];

export default function FlagModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
}) {
  const { userData } = useUserStore();
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Prepare data
      const data = {
        userId: userData?.userId,
        companyId: selectedCompany?.companyId,
        status: "new",
        reason,
        name: userData?.name,
        email: userData?.email,
        note,
        date: new Date().toISOString(),
        link: item.file_url,
        title: item.title,
      };
      // TODO: Call API to store flagged issue
      await fetch("/api/flagged-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toastSuccess("Flag submitted!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      setError("Failed to flag issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag /> Flag this result
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Reason</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full focus-visible:ring-0">
              <SelectValue
                placeholder="Select a reason"
                className="focus-visible:ring-0"
              />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Note</label>
          <Textarea
            className="w-full min-h-[80px] focus-visible:ring-0"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (required)"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !note.trim()}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
