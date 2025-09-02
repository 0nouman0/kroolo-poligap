"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Frown, Meh, Laugh, Angry } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastError, toastSuccess } from "@/components/toast-varients";
import { useUserStore } from "@/stores/user-store";
import { useCompanyStore } from "@/stores/company-store";

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const satisfactionLevels = [
  {
    name: "Very unsatisfied",
    icon: <Angry className="w-8 h-8" />,
    color: "text-red-500",
  },
  {
    name: "Unsatisfied",
    icon: <Frown className="w-8 h-8" />,
    color: "text-orange-500",
  },
  {
    name: "Neutral",
    icon: <Meh className="w-8 h-8" />,
    color: "text-yellow-500",
  },
  {
    name: "Satisfied",
    icon: <Smile className="w-8 h-8" />,
    color: "text-green-400",
  },
  {
    name: "Very satisfied",
    icon: <Laugh className="w-8 h-8" />,
    color: "text-green-600",
  },
];

export default function FeedbackModal({
  isOpen,
  onOpenChange,
}: FeedbackModalProps) {
  const [selectedSatisfaction, setSelectedSatisfaction] = useState<
    string | null
  >(null);
  const [feedbackText, setFeedbackText] = useState("");
  const userId = useUserStore((state) => state.userData?.userId);
  const companyId = useCompanyStore(
    (state) => state.selectedCompany?.companyId
  );

  const handleSubmit = async () => {
    if (!selectedSatisfaction) {
      return;
    }
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          satisfaction: selectedSatisfaction,
          text: feedbackText,
          userId,
          companyId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toastSuccess("Thank you for your feedback!");
        onOpenChange(false);
        setSelectedSatisfaction(null);
        setFeedbackText("");
      } else {
        toastError("Failed to submit feedback", data.error || "Unknown error");
      }
    } catch (error) {
      toastError(
        "Failed to submit feedback",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Share feedback
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">
              How satisfied are you with this page?
            </p>
            <div className="flex justify-between space-x-2">
              {satisfactionLevels.map((level) => (
                <button
                  key={level.name}
                  onClick={() => setSelectedSatisfaction(level.name)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg w-full transition-all border-transparent border-0 cursor-pointer",
                    selectedSatisfaction === level.name
                      ? "bg-primary/10 border-primary"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "mb-1",
                      level.color,
                      selectedSatisfaction === level.name
                        ? level.color
                        : "text-muted-foreground group-hover:text-current"
                    )}
                  >
                    {level.icon}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      selectedSatisfaction === level.name
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {level.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="feedback-details" className="text-sm font-medium">
              Share additional details{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              id="feedback-details"
              placeholder="Tell us more about your rating"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="mt-1 min-h-[100px] focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your information will be shared with Kroolo's Enterprise Search (
            <a>privacy policy</a>). The following will be shared: your query and
            your feedback. Please be mindful of any internal information you
            include. Both your query and the response are logged, and any text
            you enter in the comment box will be sent to Kroolo's Enterprise
            Search Support.
          </p>
        </div>
        <DialogFooter className="sm:justify-end space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-purple-600 text-black hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "#fff" }}
            disabled={!selectedSatisfaction}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
