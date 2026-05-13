"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import api from "@/services/api";
import { Lead } from "@/types/lead";

import ConfirmationDialog from "./ConfirmationDialog";

type LeadTableProps = {
  onEdit: (lead: Lead) => void;
};

export default function LeadTable({ onEdit }: LeadTableProps) {
  const queryClient = useQueryClient();
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/leads");

      return response.data.leads;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      await api.delete(`/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setLeadToDelete(null);
    },
  });

  const handleDelete = () => {
    if (!leadToDelete) {
      return;
    }

    deleteMutation.mutate(leadToDelete.id);
  };

  const handleCancelDelete = () => {
    if (deleteMutation.isPending) {
      return;
    }

    deleteMutation.reset();
    setLeadToDelete(null);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Failed to fetch leads</Typography>;
  }

  return (
    <>
      {deleteMutation.isError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to delete lead
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          mt: 3,
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 980,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f9fafb",
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Deal Size</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Interaction</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.map((lead: Lead) => (
              <TableRow
                key={lead.id}
                hover
                sx={{
                  transition: "0.2s",
                  cursor: "pointer",

                  "&:hover": {
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {lead.name}
                  </Typography>
                </TableCell>

                <TableCell>{lead.company}</TableCell>

                <TableCell>
                  <Chip label={lead.stage} size="small" variant="outlined" />
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    Rs. {lead.deal_size}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={lead.priority_score || "N/A"}
                    size="small"
                    color={
                      lead.priority_score === "high"
                        ? "error"
                        : lead.priority_score === "medium"
                          ? "warning"
                          : "default"
                    }
                  />
                </TableCell>

                <TableCell>
                  {lead.last_interaction_at
                    ? new Date(lead.last_interaction_at).toLocaleDateString()
                    : "No interactions"}
                </TableCell>

                <TableCell align="right">
                  <Tooltip title="Edit lead">
                    <IconButton
                      aria-label={`Edit ${lead.name}`}
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(lead);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete lead">
                    <IconButton
                      aria-label={`Delete ${lead.name}`}
                      size="small"
                      color="error"
                      onClick={(event) => {
                        event.stopPropagation();
                        setLeadToDelete(lead);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmationDialog
        open={Boolean(leadToDelete)}
        title="Delete lead"
        message={`Are you sure you want to delete ${
          leadToDelete?.name || "this lead"
        }?`}
        isDeleting={deleteMutation.isPending}
        onCancel={handleCancelDelete}
        onDelete={handleDelete}
      />
    </>
  );
}
