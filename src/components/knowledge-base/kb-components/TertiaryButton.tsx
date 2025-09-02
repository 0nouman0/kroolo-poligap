import { styled } from "@mui/material";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { forwardRef } from "react";
import type { PropsWithChildren } from "react";

const BaseButton = forwardRef<HTMLButtonElement, MuiButtonProps>(
  (props, ref) => <MuiButton {...props} ref={ref} />
);
BaseButton.displayName = "BaseButton";

const Button = styled(BaseButton)({
  alignItems: "center",
  fontSize: 13,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: "nowrap",
  height: "30px !important",
  boxShadow: "none",
  p: "0 8px !important",
  gap: "6px",
  color: "var(--black-1000)",
  fontFamily: "inter",
  textTransform: "none",
  minWidth: "inherit",
  borderRadius: "4px !important",
  backgroundColor: "var(--text-color)",
  "& .MuiButton-startIcon, & .MuiButton-endIcon, & span": {
    margin: "0 !important",
  },
  "&:hover": {
    backgroundColor: "var(--secondary-text-color)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    color: "var(--black-1000)",
    cursor: "not-allowed",
    pointerEvents: "auto",
    opacity: 0.8,
  },
});

const TertiaryButton = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<MuiButtonProps>
>(({ children, ...props }, ref) => {
  return (
    <Button size="small" disableRipple {...props} ref={ref}>
      {children}
    </Button>
  );
});
TertiaryButton.displayName = "TertiaryButton";

export default TertiaryButton;
