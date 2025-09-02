import { Check, ChevronDown } from "lucide-react";

// import { Button } from "@/components/ui/button";
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

import type { SelectedLanguageTypeProps } from "./../../types/agent";
import { LanguagesList } from "./../../utils/utils";
import { Button } from "@/components/common/common-button";

export const SelectLanguageButton = ({
  value,
  disabled = false,
  onSelect,
}: SelectedLanguageTypeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenu>
            <div className="flex h-full flex-row items-center gap-1">
              <p className="w-[105px] text-[12px] text-[var(--text-color)]">
                Output in -
              </p>
              <DropdownMenuTrigger asChild>
                <Button
                  suffixIcon={
                    <ChevronDown className="text-foreground/50 -mr-1 ml-auto size-4" />
                  }
                  variant="outline"
                  style={{ width: "100%", padding: "0 8px", height: "100%" }}
                  size="sm"
                  disabled={disabled}
                >
                  {value?.name ?? "Select Language"}
                </Button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent
              className="z-[1500]"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {LanguagesList.map((type) => {
                const isSelected = value?.code === type.code;
                return (
                  <DropdownMenuItem
                    key={type.name}
                    style={{
                      backgroundColor: isSelected
                        ? "var(--agent-background-color)"
                        : "transparent",
                    }}
                    className="text-[12px]"
                    onSelect={() => onSelect(type)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      <p className="text-[12px] text-[var(--text-color)]">
                        {" "}
                        {type.name}
                      </p>
                      {isSelected && (
                        <Check
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "var(--text-color)",
                            marginLeft: "auto",
                          }}
                        />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent style={{ zIndex: 1600 }}>
          Select language
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
