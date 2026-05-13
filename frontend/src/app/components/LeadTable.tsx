"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MouseEvent, useState } from "react";

import api from "@/services/api";
import { Lead, LeadSummary } from "@/types/lead";

import ConfirmationDialog from "./ConfirmationDialog";
import FollowUpModal from "./FollowUpModal";

type LeadTableProps = {
  onEdit: (lead: Lead) => void;
  onAddInteraction: (lead: LeadSummary) => void;
};

export default function LeadTable({ onEdit, onAddInteraction }: LeadTableProps) {
  const queryClient = useQueryClient();
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<LeadSummary | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuLead, setMenuLead] = useState<Lead | null>(null);
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

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
      queryClient.invalidateQueries({ queryKey: ["focus-list"] });
      setLeadToDelete(null);
    },
  });

  const recalculateScoreMutation = useMutation({
    mutationFn: async (leadId: string) => {
      setScoringLeadId(leadId);

      const response = await api.post(`/leads/${leadId}/recalculate-score`);

      return response.data.lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["focus-list"] });
    },
    onSettled: () => {
      setScoringLeadId(null);
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

  const handleOpenMenu = (
    event: MouseEvent<HTMLButtonElement>,
    lead: Lead
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuLead(lead);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuLead(null);
  };

  const handleRecalculateScore = () => {
    if (!menuLead) {
      return;
    }

    recalculateScoreMutation.mutate(menuLead.id);
    handleCloseMenu();
  };

  const handleGenerateFollowUp = () => {
    if (!menuLead) {
      return;
    }

    setFollowUpLead(menuLead);
    handleCloseMenu();
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

      {recalculateScoreMutation.isError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to recalculate lead score
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
                      disabled={scoringLeadId === lead.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(lead);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Add interaction">
                    <IconButton
                      aria-label={`Add interaction for ${lead.name}`}
                      size="small"
                      disabled={scoringLeadId === lead.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddInteraction(lead);
                      }}
                    >
                      <NoteAddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete lead">
                    <IconButton
                      aria-label={`Delete ${lead.name}`}
                      size="small"
                      color="error"
                      disabled={scoringLeadId === lead.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setLeadToDelete(lead);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {lead.last_interaction_at && (
                    <Tooltip title="AI actions">
                      <span>
                        <IconButton
                          aria-label={`AI actions for ${lead.name}`}
                          size="small"
                          disabled={scoringLeadId === lead.id}
                          onClick={(event) => handleOpenMenu(event, lead)}
                        >
                          {scoringLeadId === lead.id ? (
                            <CircularProgress size={18} />
                          ) : (
                            <MoreVertIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
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

      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          disabled={!menuLead || scoringLeadId === menuLead.id}
          onClick={handleRecalculateScore}
        >
          <ListItemIcon>
            {menuLead && scoringLeadId === menuLead.id ? (
              <CircularProgress size={18} />
            ) : (
              <AutoAwesomeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              menuLead && scoringLeadId === menuLead.id
                ? "Recalculating score..."
                : "Recalculate score"
            }
          />
        </MenuItem>

        <MenuItem disabled={!menuLead} onClick={handleGenerateFollowUp}>
          <ListItemIcon>
            <AutoAwesomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Generate follow-up" />
        </MenuItem>
      </Menu>

      <FollowUpModal
        open={Boolean(followUpLead)}
        lead={followUpLead}
        onClose={() => setFollowUpLead(null)}
      />
    </>
  );
}
