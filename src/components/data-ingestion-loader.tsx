"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Clock, Timer } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface DataIngestionLoaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress?: number;
  message?: string;
  steps?: Step[];
  currentStepIndex?: number;
  allowCancel?: boolean;
  onCancel?: () => void;
  estimatedTimeInSeconds?: number;
  engagingMessages?: string[];
  minimized?: boolean;
  onMinimizeToggle?: () => void;
}

export function DataIngestionLoader({
  open,
  onOpenChange,
  progress = 0,
  message = "Processing...",
  steps = [],
  currentStepIndex = 0,
  allowCancel = false,
  onCancel,
  estimatedTimeInSeconds,
  engagingMessages = [],
  minimized = false,
  onMinimizeToggle,
}: DataIngestionLoaderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(
    estimatedTimeInSeconds || null
  );
  const [currentEngagingMessageIndex, setCurrentEngagingMessageIndex] =
    useState(0);
  const [showEngagingMessage, setShowEngagingMessage] = useState(true);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSteps = steps.length > 0;
  const hasEngagingMessages = engagingMessages.length > 0;

  // Format time in mm:ss format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate ETA based on progress and elapsed time
  useEffect(() => {
    if (progress > 0 && elapsedTime > 0) {
      const timePerPercent = elapsedTime / progress;
      const remainingSecs = timePerPercent * (100 - progress);
      setRemainingTime(remainingSecs);
    } else if (estimatedTimeInSeconds) {
      setRemainingTime(Math.max(0, estimatedTimeInSeconds - elapsedTime));
    }
  }, [progress, elapsedTime, estimatedTimeInSeconds]);

  // Timer effect
  useEffect(() => {
    if (open) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setElapsedTime(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      startTimeRef.current = null;
      setElapsedTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open]);

  // Engaging messages rotation effect
  useEffect(() => {
    if (open && hasEngagingMessages) {
      // Initial fade in
      setShowEngagingMessage(true);

      // Set up interval to change messages
      messageIntervalRef.current = setInterval(() => {
        // Fade out
        setShowEngagingMessage(false);

        // Change message after fade out
        setTimeout(() => {
          setCurrentEngagingMessageIndex(
            (prev) => (prev + 1) % engagingMessages.length
          );
          // Fade in new message
          setShowEngagingMessage(true);
        }, 500); // Half a second for fade out
      }, 3500); // 3.5 seconds total (3 seconds display + 0.5s fade)
    } else {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
      setCurrentEngagingMessageIndex(0);
    }

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [open, hasEngagingMessages, engagingMessages.length]);

  // Get current step
  const currentStep = steps[currentStepIndex];

  // Get previous steps (completed)
  const completedSteps = steps.slice(0, currentStepIndex);

  // Get visible steps (completed + current)
  const visibleSteps = [...completedSteps, currentStep].filter(Boolean);

  // Minimized floating loader
  if (minimized) {
    return (
      <div
        className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-900 shadow-xl rounded-xl flex items-center gap-3 px-4 py-3 cursor-pointer border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
        onClick={onMinimizeToggle}
        role="button"
        aria-label="Show ingestion progress"
        tabIndex={0}
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col min-w-[140px]">
          <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate">
            {message}
          </span>
          <div className="w-full mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-[13px] font-medium text-primary">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 4L12 8L8 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={allowCancel ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md relative">
        {/* Minimize button */}
        {onMinimizeToggle && (
          <button
            className="absolute top-2 right-10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            onClick={onMinimizeToggle}
            aria-label="Minimize loader"
            tabIndex={0}
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="13"
                width="10"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        <div className="flex flex-col space-y-6 py-4">
          {/* Main message */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="animate-spin-slow">
                <div className="h-12 w-12 rounded-full border-4 border-primary/30"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{message}</h3>
              <p className="text-sm text-muted-foreground">
                {hasSteps
                  ? `Step ${currentStepIndex + 1} of ${steps.length}`
                  : "Please wait while we process your request"}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.toFixed(0)}% Complete</span>
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {formatTime(elapsedTime)}
              </span>
            </div>
            <Progress value={progress} className="h-2 transition-all" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started {formatTime(elapsedTime)} ago</span>
              {remainingTime !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ETA: {formatTime(remainingTime)}
                </span>
              )}
            </div>
          </div>

          {/* Engaging rotating messages */}
          {hasEngagingMessages && (
            <div className="pt-2 pb-1">
              <div
                className={cn(
                  "min-h-[60px] flex items-center justify-center text-center px-4 py-3 rounded-lg bg-muted/50 transition-all duration-500",
                  showEngagingMessage
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-2"
                )}
              >
                <p className="text-sm italic">
                  {engagingMessages[currentEngagingMessageIndex]}
                </p>
              </div>
            </div>
          )}

          {/* Steps display - only showing completed and current */}
          {hasSteps && visibleSteps.length > 0 && (
            <div className="space-y-3 pt-2">
              {visibleSteps.map((step, index) => {
                const isCompleted = index < visibleSteps.length - 1;
                const isActive = index === visibleSteps.length - 1;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-start space-x-3 rounded-lg p-2 transition-all duration-300",
                      isActive && "bg-muted/50 animate-pulse-subtle",
                      isCompleted && "text-muted-foreground"
                    )}
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : isActive ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30"></div>
                      )}
                    </div>
                    <div className={cn(isActive && "animate-fade-in")}>
                      <p
                        className={cn(
                          "font-medium",
                          isActive && "text-primary"
                        )}
                      >
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cancel button */}
          {allowCancel && onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              Cancel
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
