// CooldownDialog.js
import React from "react";
import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

const CooldownDialog = ({ open, cooldown }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Trận đáu bắt đầu sớm</DialogTitle>
      <DialogContent>
        <Typography>trong vòng {cooldown} giây...</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default CooldownDialog;
