import { RiDeleteBinLine, RiRobot2Line } from "react-icons/ri";
import { FiStar } from "react-icons/fi";

import { Share2 } from "lucide-react";
import CommentIcon from "@/assets/icons/doc-comment-icon.svg";

export const AGENTS_TABS_LIST = [
  {
    useCaseIcon: <RiRobot2Line color="var(--secondary-text-color)" />,
    usecase: "Created Agents",
  },
  {
    useCaseIcon: <Share2 size={16} color="var(--secondary-text-color)" />,
    usecase: "Shared Agents",
  },
  {
    useCaseIcon: (
      <CommentIcon
        stroke="var(--secondary-text-color)"
        style={{ width: 16, height: 16 }}
      />
    ),
    usecase: "Recent Chats",
  },
  {
    useCaseIcon: "🚀",
    usecase: "Popular",
  },
  {
    useCaseIcon: "🎓",
    usecase: "Education",
  },
  {
    useCaseIcon: (
      <FiStar color="var(--favorite-color)" fill="var(--favorite-color)" />
    ),
    usecase: "Favorites",
  },
];

export const UPLOAD_MEATBALL_MENU = [
  {
    id: 1,
    icon: <RiDeleteBinLine size={16} color="#F04438" />,
    menuName: "Remove",
    textColor: "#F04438",
  },
];
