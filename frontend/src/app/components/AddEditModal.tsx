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
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { AxiosError } from "axios";

import api from "@/services/api";
import { Lead } from "@/types/lead";
import { leadValidationSchema } from "@/validations/leadValidations";

type LeadFormValues = {
  name: string;
  company: string;
  industry: string;
  deal_size: string;
  stage: string;
};

type AddEditModalProps = {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
};

const initialValues: LeadFormValues = {
  name: "",
  company: "",
  industry: "",
  deal_size: "",
  stage: "new",
};

const stageOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

export default function AddEditModal({
  open,
  onClose,
  lead,
}: AddEditModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(lead);

  const formInitialValues: LeadFormValues = lead
    ? {
        name: lead.name,
        company: lead.company,
        industry: lead.industry,
        deal_size: String(lead.deal_size),
        stage: lead.stage,
      }
    : initialValues;

  const mutation = useMutation({
    mutationFn: async (values: LeadFormValues) => {
      const payload = {
        ...values,
        deal_size: Number(values.deal_size),
      };

      const response = isEditMode
        ? await api.patch(`/leads/${lead?.id}`, payload)
        : await api.post("/leads", payload);

      return response.data.lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["focus-list"] });
      formik.resetForm();
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validationSchema: leadValidationSchema,
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

  const getError = (field: keyof LeadFormValues) =>
    formik.touched[field] && Boolean(formik.errors[field]);

  const getHelperText = (field: keyof LeadFormValues) =>
    formik.touched[field] ? formik.errors[field] : "";

  const errorMessage =
    mutation.error instanceof AxiosError
      ? mutation.error.response?.data?.message || "Failed to save lead"
      : "Failed to save lead";

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{isEditMode ? "Edit lead" : "Add lead"}</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              pt: 1,
            }}
          >
            {mutation.isError && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("name")}
              helperText={getHelperText("name")}
            />

            <TextField
              fullWidth
              id="company"
              name="company"
              label="Company"
              value={formik.values.company}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("company")}
              helperText={getHelperText("company")}
            />

            <TextField
              fullWidth
              id="industry"
              name="industry"
              label="Industry"
              value={formik.values.industry}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("industry")}
              helperText={getHelperText("industry")}
            />

            <TextField
              fullWidth
              id="deal_size"
              name="deal_size"
              label="Deal size"
              type="number"
              value={formik.values.deal_size}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("deal_size")}
              helperText={getHelperText("deal_size")}
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <TextField
              fullWidth
              select
              id="stage"
              name="stage"
              label="Stage"
              value={formik.values.stage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getError("stage")}
              helperText={getHelperText("stage")}
            >
              {stageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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
            disabled={mutation.isPending}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {mutation.isPending
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
                ? "Update lead"
                : "Save lead"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
