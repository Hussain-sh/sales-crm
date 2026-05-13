"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

import api from "@/services/api";
import { LeadSummary } from "@/types/lead";

type InteractionFormValues = {
  interaction_type: string;
  interaction_note: string;
};

type AddInteractionModalProps = {
  open: boolean;
  lead: LeadSummary | null;
  onClose: () => void;
};

const initialValues: InteractionFormValues = {
  interaction_type: "manual_note",
  interaction_note: "",
};

const interactionValidationSchema = Yup.object({
  interaction_type: Yup.string().required("Interaction type is required"),
  interaction_note: Yup.string().required("Interaction note is required"),
});

const interactionTypeOptions = [
  { value: "manual_note", label: "Manual note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "voice_note", label: "Voice Note" },
  { value: "ai_summary", label: "AI Summary" },
];

export default function AddInteractionModal({
  open,
  lead,
  onClose,
}: AddInteractionModalProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: InteractionFormValues) => {
      if (!lead) {
        throw new Error("Lead is required");
      }

      const response = await api.post(`/leads/${lead.id}/interactions`, values);

      return response.data.interaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["focus-list"] });
      queryClient.invalidateQueries({ queryKey: ["lead-interactions", lead?.id] });
      formik.resetForm();
      onClose();
    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema: interactionValidationSchema,
    onSubmit: (values) => mutation.mutate(values),
  });

  const handleClose = () => {
    if (mutation.isPending) {
      return;
    }

    formik.resetForm();
    mutation.reset();
    onClose();
  };

  const errorMessage =
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data?.message || "Failed to add interaction"
      : "Failed to add interaction";

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>Add interaction</DialogTitle>

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

            {mutation.isError && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              fullWidth
              select
              id="interaction_type"
              name="interaction_type"
              label="Interaction type"
              value={formik.values.interaction_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.interaction_type &&
                Boolean(formik.errors.interaction_type)
              }
              helperText={
                formik.touched.interaction_type
                  ? formik.errors.interaction_type
                  : ""
              }
            >
              {interactionTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={4}
              id="interaction_note"
              name="interaction_note"
              label="Interaction note"
              value={formik.values.interaction_note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.interaction_note &&
                Boolean(formik.errors.interaction_note)
              }
              helperText={
                formik.touched.interaction_note
                  ? formik.errors.interaction_note
                  : ""
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={mutation.isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || !lead}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {mutation.isPending ? "Adding..." : "Add interaction"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
