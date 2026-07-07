import React from "react";
import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";

// Solid white "pill" CTA for use on the blue gradient page header banner
export const HeaderPrimaryButton: React.FC<ButtonProps> = ({ sx, ...props }) => (
  <Button
    variant="contained"
    {...props}
    sx={{
      backgroundColor: "#FFF",
      color: "var(--c1d1, #11439B)",
      fontWeight: 600,
      borderRadius: "7px",
      boxShadow: "0 1px 4px rgba(0,0,0,.22)",
      "&:hover": {
        backgroundColor: "#F0F5FD",
        boxShadow: "0 1px 4px rgba(0,0,0,.22)"
      },
      ...sx
    }}
  />
);

// Outlined white-ghost secondary action for use alongside HeaderPrimaryButton on the header banner
export const HeaderSecondaryButton: React.FC<ButtonProps> = ({ sx, ...props }) => (
  <Button
    variant="outlined"
    {...props}
    sx={{
      border: "1px solid rgba(255,255,255,.55)",
      color: "#FFF",
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,.12)",
        border: "1px solid rgba(255,255,255,.8)"
      },
      ...sx
    }}
  />
);
