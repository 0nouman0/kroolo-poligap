import { ListItemIcon, MenuItem, Stack } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
// import { UPLOAD_MEATBALL_MENU } from "../Utils";
import { useState } from "react";
// import { MetaInfoChip } from "../../../../commonComponents/KrooloChip";
// import { CustomMenuList } from "../../../../commonComponents/CustomMenus/CustomMenu";
// import { FileIcon } from "../../../../fileProofing/attachmentUtils";
import useAiAgentsStore from "@/stores/ai-agents-store";
import { UPLOAD_MEATBALL_MENU } from "@/utils/knowledge-base.util";
import { MetaInfoChip } from "./kb-components/KrooloChip";
import { CustomMenuList } from "./kb-components/CustomMenu";
import { FileIcon } from "@/utils/attachments.util";

interface Media {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
}

interface AgentUploadFileRowProps {
  media: Media;
  from: string;
  id: string;
}

interface AiAgentsState {
  uploadsArray: Media[];
}

export const AgentUploadFileRow = ({
  media,
  from,
  id,
}: AgentUploadFileRowProps) => {
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
        p: "7px",
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
          svg: {
            width: 36,
            height: 36,
          },
        }}
        gap={1}
      >
        <FileIcon fileType={media?.fileType} />

        <div className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
          <div className="text-sm font-medium text-[var(--text-color)] text-ellipsis overflow-hidden whitespace-nowrap ">
            {media?.fileName}
          </div>
          <div className="text-xs text-[var(--secondary-text-color)]">
            {media?.fileSize ?? "50 KB"}
          </div>
        </div>
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
          {UPLOAD_MEATBALL_MENU.map((menuItem) => (
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
