"use client";

import React from "react";
import { CheckCircleOutlineRounded } from "@mui/icons-material";
import Image from "next/image";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  midText?: string;
  maxLength?: number;
  errorMessage?: string;
  labelStyles?: React.CSSProperties;
  fromSprint?: boolean;
  fromSprintCreate?: boolean;
  successIcon?: boolean;
  error?: boolean;
  helper?: boolean;
}

export default function TextInput({
  label,
  midText,
  maxLength = 200,
  errorMessage,
  labelStyles,
  fromSprint,
  fromSprintCreate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  disabled,
  error,
  successIcon,
  ...props
}: TextInputProps) {
  return (
    <div
      className={`flex flex-col w-full ${!fromSprint ? "gap-1.5" : ""} 
        ${fromSprint ? "pt-[3px]" : ""} ${
        disabled ? "pointer-events-none" : ""
      }`}
    >
      {label && (
        <label
          className={`text-xs leading-tight text-[--text-input-label-color] 
            font-normal font-inter flex items-center gap-2 w-full`}
          style={labelStyles}
        >
          {label}
        </label>
      )}

      {midText && (
        <p className="text-xs leading-4 text-[--workspacetext-subheader] font-normal">
          {midText}
        </p>
      )}

      <div className={`relative w-full ${fromSprintCreate ? "pb-[3px]" : ""}`}>
        <input
          className={`
            w-full px-3 pr-8 py-1 h-7 rounded-md border
            text-[13px] leading-5 font-normal font-inter text-[--text-color]
            placeholder:text-[#ACB1B9] placeholder:opacity-100
            disabled:bg-transparent disabled:text-[--text-input-disabled-color]
            disabled:border-transparent disabled:cursor-not-allowed
            outline-none
            ${
              error
                ? "border-[#FDA29B] focus:border-[#FDA29B]"
                : "border-gray-300 focus:border-[--btn-color-base] hover:border-[--btn-color-base]"
            }
          `}
          maxLength={maxLength}
          spellCheck={false}
          disabled={disabled}
          {...props}
        />

        {error && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Image
              src="/assets/icons/input-error-icon.svg"
              width={16}
              height={16}
              alt="Error"
              className="object-contain"
              draggable={false}
            />
          </span>
        )}

        {successIcon && !error && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <CheckCircleOutlineRounded className="w-4 h-4 text-[#079455]" />
          </span>
        )}
      </div>

      {(error || props.helper) && errorMessage && (
        <p className="mt-1.5 text-xs leading-[18px] text-[#F04438] font-normal">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
