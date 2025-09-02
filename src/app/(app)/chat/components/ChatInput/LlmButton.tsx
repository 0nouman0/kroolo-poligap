import type { SelectedLlmTypeProps } from "@/types/agent";
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

import Icon from "./../../ui/icon";
import { LlmsList } from "./../../utils/utils";
import { ModelSpecificationTooltip } from "./ModelTooltip";
import { Button } from "@/components/common/common-button";

export const LlmButton = ({
  value,
  disabled = false,
  onSelect,
}: SelectedLlmTypeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                suffixIcon={
                  <ChevronDown
                    style={{
                      marginRight: "-4px",
                      marginLeft: "auto",
                      width: "16px",
                      height: "16px",
                      opacity: 0.5,
                    }}
                  />
                }
                variant="outline"
                size="sm"
                disabled={disabled}
                style={{ width: "100%", padding: "0 8px", height: "100%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {value?.modelIcon && (
                    <Icon type={value.modelIcon} size="xs" />
                  )}
                  {value?.shortName ?? "Select Model"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={{ zIndex: 1500, maxHeight: "200px", overflowY: "auto" }}
            >
              {LlmsList.map((model) => {
                const isSelected = value?.modelId === model.modelId;
                return (
                  <DropdownMenuItem
                    key={model.modelId}
                    style={{
                      fontSize: "12px",
                      backgroundColor: isSelected
                        ? "var(--agent-background-color)"
                        : "transparent",
                      position: "relative",
                    }}
                    onSelect={() => {
                      console.log("model ==>", model);
                      onSelect(model);
                    }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                            }}
                          >
                            <Icon type={model.modelIcon} size="xs" />
                            <p className="flex-1 text-[12px] text-[var(--text-color)]">
                              {model.shortName}
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
                        </TooltipTrigger>
                        <TooltipContent style={{ zIndex: 1600 }}>
                          {" "}
                          <ModelSpecificationTooltip
                            modelName={model.modelName}
                          />{" "}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent style={{ zIndex: 1600 }}>Select model</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
