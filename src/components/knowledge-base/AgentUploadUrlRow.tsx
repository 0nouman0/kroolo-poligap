import { Box, ListItemIcon, MenuItem, Stack, Typography } from "@mui/material";
import { LuLayers } from "react-icons/lu";
import { IoLogoYoutube } from "react-icons/io5";
import { MoreHoriz } from "@mui/icons-material";
import { useState } from "react";
import Image from "next/image";
import useAiAgentsStore from "@/stores/ai-agents-store";
import { UPLOAD_MEATBALL_MENU } from "@/utils/knowledge-base.util";
import { MetaInfoChip } from "./kb-components/KrooloChip";
import { CustomMenuList } from "./kb-components/CustomMenu";

interface Media {
  _id: string;
  fileName: string;
  fileType: string;
  fileUrl?: string;
  projectColor?: string;
  documentId?: string;
}

interface AgentUploadUrlRowProps {
  media: Media;
  from: string;
  id: string;
}

interface AiAgentsState {
  uploadsArray: Media[];
}

// Utility functions (simplified versions)
const getPathNameFromLink = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

const isValidURLWithScheme = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const AgentUploadUrlRow = ({
  media,
  from,
  id,
}: AgentUploadUrlRowProps) => {
  const [openIconButton, setOpenIconButton] = useState<Element | null>(null);
  const { deleteMediaAPI } = useAiAgentsStore();

  const handleRemoveMedia = async (mediaItem: Media) => {
    setOpenIconButton(null);
    if (from === "chat-with-agent") {
      await deleteMediaAPI({
        mediaId: mediaItem?._id,
        agentId: id,
      });
    } else {
      useAiAgentsStore.setState((state) => ({
        uploadsArray: state.uploadsArray.filter(
          (file) => file._id !== mediaItem?._id
        ),
      }));
    }
  };
  return (
    <Stack
      key={media?._id}
      direction="row"
      sx={{
        p: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        borderRadius: 0.5,
        transition: "ease-in-out 0.35s all !important",
        "&:hover": {
          backgroundColor: "var(--menu-hover)",
        },
        cursor: "pointer",
        width: "100%",
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: "calc(100% - 150px)",
          alignItems: "center",
        }}
        gap={1}
      >
        {media?.fileType === "Project" ? (
          <LuLayers size={16} color={media?.projectColor} />
        ) : media.fileType === "youtube" ? (
          <IoLogoYoutube size={16} color="var(--text-color)" />
        ) : media.fileType === "Doc" ? (
          <Box
            sx={{
              fontSize: "16px",
              width: "20px",
              height: "20px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            {/* Document icon placeholder - can be enhanced later */}
            <Box
              sx={{
                width: 14,
                height: 14,
                backgroundColor: "var(--text-color)",
                borderRadius: "2px",
              }}
            />
          </Box>
        ) : media?.fileType === "link" ? (
          <Image
            src={`https://www.google.com/s2/favicons?domain=${
              media?.fileUrl && isValidURLWithScheme(media.fileUrl)
                ? getPathNameFromLink(media.fileUrl)
                : media?.fileUrl || ""
            }&sz=16`}
            alt="link"
            width={16}
            height={16}
            style={{ flexShrink: 0 }}
          />
        ) : null}
        <Typography
          className="themed-text-color text-ellipsis"
          component="span"
          sx={{
            fontWeight: "500",
            width: "100%",
            fontSize: "13px",
            paddingRight: "12px",
          }}
        >
          {media.fileName}
        </Typography>
      </Stack>
      <Stack direction="row" width="110px">
        <MetaInfoChip
          label="Ready"
          color="#12b76a"
          sx={{ width: { xs: 90 } }}
        />
      </Stack>

      <Stack
        direction="row"
        width="40px"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <MoreHoriz
          className="Icon-color"
          onClick={(e) => {
            setOpenIconButton(e.currentTarget);
          }}
        />

        <CustomMenuList
          anchorEl={openIconButton}
          open={Boolean(openIconButton)}
          onClose={() => setOpenIconButton(null)}
          transformOrigin={{
            horizontal: "center",
            vertical: "top",
          }}
          anchorOrigin={{
            horizontal: "center",
            vertical: "bottom",
          }}
          sx={{
            li: {
              gap: 1,
              display: "flex",
            },
            "& li:hover": {
              backgroundColor: "var(--menu-hover)",
            },
          }}
        >
          {UPLOAD_MEATBALL_MENU?.map((menuItem) => (
            <MenuItem
              key={menuItem?.id}
              onClick={() => handleRemoveMedia(media)}
              sx={{
                lineHeight: "24px",
                height: 30,
                minHeight: "inherit",
                alignItems: "center",
                fontSize: "13px",
              }}
            >
              {menuItem?.icon}
              <ListItemIcon
                sx={{
                  width: 14,
                  height: 14,
                  minWidth: "0 !important",
                  alignItems: "center",
                  color: menuItem?.textColor,
                  lineHeight: "24px",
                  "& svg": { width: 16, height: 16 },
                }}
              >
                {menuItem?.menuName}
              </ListItemIcon>
            </MenuItem>
          ))}
        </CustomMenuList>
      </Stack>
    </Stack>
  );
};
