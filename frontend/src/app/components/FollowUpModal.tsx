"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

import api from "@/services/api";
import { LeadSummary } from "@/types/lead";

type FollowUpModalProps = {
  open: boolean;
  lead: LeadSummary | null;
  onClose: () => void;
};

export default function FollowUpModal({
  open,
  lead,
  onClose,
}: FollowUpModalProps) {
  const [copied, setCopied] = useState(false);

  const { data, error, isError, isPending, mutate, reset } = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await api.post(`/leads/${leadId}/generate-followup`);

      return response.data.follow_up_message as string;
    },
  });

  useEffect(() => {
    if (open && lead) {
      reset();
      mutate(lead.id);
    }
  }, [lead, mutate, open, reset]);

  const errorMessage =
    error instanceof AxiosError
      ? error.response?.data?.message || "Failed to generate follow-up"
      : "Failed to generate follow-up";

  const handleCopy = async () => {
    if (!data) {
      return;
    }

    await navigator.clipboard.writeText(data);
    setCopied(true);
  };

  const handleClose = () => {
    reset();
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Generated follow-up</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            pt: 1,
          }}
        >
          {lead && (
            <Typography color="text.secondary">
              {lead.name} - {lead.company}
            </Typography>
          )}

          {isPending && (
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                gap: 1.5,
                py: 3,
              }}
            >
              <CircularProgress size={22} />
              <Typography>Generating follow-up...</Typography>
            </Box>
          )}

          {isError && <Alert severity="error">{errorMessage}</Alert>}

          {data && (
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Follow-up message"
              value={data}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          disabled={!data}
          onClick={handleCopy}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
