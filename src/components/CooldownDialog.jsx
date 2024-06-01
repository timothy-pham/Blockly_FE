// CooldownDialog.js
import React from "react";
import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

const CooldownDialog = ({ open, cooldown }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Game Starting Soon</DialogTitle>
      <DialogContent>
        <Typography>The game will start in {cooldown} seconds...</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default CooldownDialog;
