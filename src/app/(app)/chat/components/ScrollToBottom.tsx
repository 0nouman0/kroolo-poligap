"use client";

import type React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStickToBottomContext } from "use-stick-to-bottom";

import { Button } from "./../ui/button";
import Icon from "./../ui/icon";

// Define the expected context type
interface StickToBottomContext {
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

const ScrollToBottom: React.FC = () => {
  // Use try-catch to handle potential errors
  let isAtBottom = true;
  let scrollToBottom = () => {};

  try {
    const context = useStickToBottomContext() as StickToBottomContext;
    if (typeof context === "object") {
      isAtBottom = Boolean(context.isAtBottom);
      scrollToBottom =
        typeof context.scrollToBottom === "function"
          ? context.scrollToBottom
          : () => {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Handle error gracefully - component will just not show the scroll button
  }

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2"
        >
          <Button
            onClick={() => scrollToBottom()}
            type="button"
            size="icon"
            variant="secondary"
            className="border-border bg-background text-primary hover:bg-background-secondary border shadow-md transition-shadow duration-300 cursor-pointer"
          >
            <Icon type="arrow-down" size="xs" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToBottom;
