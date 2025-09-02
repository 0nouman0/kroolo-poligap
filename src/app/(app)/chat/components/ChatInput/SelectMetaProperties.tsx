import type { MultiSelectOption, MultiSelectProps } from "@/types/agent";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Icon from "./../../ui/icon";

export const SelectMetaProperties: React.FC<MultiSelectProps> = ({
  options: initialOptions,
  onChange,
  disabled = false,
}) => {
  const [options, setOptions] = useState<MultiSelectOption[]>(initialOptions);

  const handleToggle = (id: string) => {
    const updatedOptions = options.map((option) =>
      option.id === id ? { ...option, enabled: !option.enabled } : option
    );
    setOptions(updatedOptions);
    onChange(updatedOptions);
  };
  const selectedCount = options.filter((option) => option.enabled).length;
  const hasSelectedOptions = selectedCount > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild>
              <Button
                asChild
                disabled={disabled}
                size="sm"
                className={`relative px-1.5 ${
                  hasSelectedOptions ? "border-[#7073fc]" : ""
                }`}
                variant="outline"
              >
                <span>
                  <Icon
                    type="tool"
                    color={
                      hasSelectedOptions
                        ? "var(--primary-color, #3b82f6)"
                        : "var(--text-color)"
                    }
                    size="xs"
                  />
                  {hasSelectedOptions && (
                    <span className="absolute -top-2 -right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#7073fc] text-xs font-medium text-white">
                      {selectedCount}
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <DropdownMenuContent
            className="z-[1500]"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {options.map((option) => {
              return (
                <DropdownMenuItem
                  key={option.id}
                  className="text-[12px]"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleToggle(option.id);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <p className="flex-1 text-[12px] text-[var(--text-color)]">
                      {option.label}
                    </p>
                    <div
                      className={`relative h-4.5 w-9 cursor-pointer rounded-full transition-colors duration-200 ${
                        option.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(option.id);
                      }}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          option.enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent style={{ zIndex: 1600 }}>
          Search and tools
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
