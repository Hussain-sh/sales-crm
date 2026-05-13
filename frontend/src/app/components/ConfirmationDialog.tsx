"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

export default function ConfirmationDialog({
  open,
  title,
  message,
  isDeleting = false,
  onCancel,
  onDelete,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={isDeleting ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onCancel}
          disabled={isDeleting}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onDelete}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
