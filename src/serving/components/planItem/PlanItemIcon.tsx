import React from "react";
import { FormatListBulleted as FormatListBulletedIcon, MenuBook as MenuBookIcon, MusicNote as MusicNoteIcon } from "@mui/icons-material";

interface Props {
  itemType?: string;
}

const iconSx = { fontSize: 32, color: "text.secondary" };

/** Returns appropriate icon for plan item type. */
export const PlanItemIcon: React.FC<Props> = ({ itemType }) => {
  switch (itemType) {
    case "song":
    case "arrangementKey":
      return <MusicNoteIcon sx={iconSx} />;
    case "providerSection":
    case "lessonSection":
    case "section":
    case "providerPresentation":
    case "lessonAction":
    case "action":
    case "providerFile":
    case "lessonAddOn":
    case "addon":
    case "file":
      return <MenuBookIcon sx={iconSx} />;
    case "item":
    default:
      return <FormatListBulletedIcon sx={iconSx} />;
  }
};
