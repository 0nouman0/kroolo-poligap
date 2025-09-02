import { stopPropagation } from "@/utils/tools";
import { Menu, styled } from "@mui/material";
import type { MenuProps } from "@mui/material/Menu";
import type { PaperProps } from "@mui/material/Paper";

interface CustomMenuListProps extends Omit<MenuProps, "PaperProps"> {
  PaperProps?: PaperProps;
  rootProps?: object;
}

export const CustomMenuList = styled(
  ({ PaperProps, rootProps, ...props }: CustomMenuListProps) => {
    return (
      <Menu
        onClick={stopPropagation}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        {...props}
        disableRestoreFocus
        disableEnforceFocus
        disableAutoFocus
        disableAutoFocusItem
        disableScrollLock
        slotProps={{
          root: rootProps,
          paper: {
            elevation: 2,
            ...PaperProps,
            sx: {
              width: 182,
              overflow: "visible",
              mt: 1,
              border: "1px solid var(--datepicker-border-color)",
              borderRadius: "8px",
              color: "var(--text-color)",
              background: "var(--black-1000)",
              boxShadow: "var(--popover-shadow)",
              "& ul": {
                borderRadius: "8px",
                paddingY: 1,
              },
              li: {
                flexGrow: 1,
                flexShrink: 0,
                py: 0.5,
                px: 1.5,
                borderRadius: "0",
                fontWeight: 400,
                fontSize: 13,
                lineHeight: 1.2,
                gap: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                minHeight: 28,
              },
              ...PaperProps?.sx,
            },
          },
        }}
      />
    );
  }
)({
  "& ul": {
    overflow: "hidden",
    padding: "0px",
    borderRadius: "8px",
    py: 1,
  },
  "& li:hover, li.Mui-selected:hover, li.Mui-selected": {
    backgroundColor: "var(--url-color) !important",
  },
  "& li.Mui-disabled": { opacity: "0.6 !important;" },
});
