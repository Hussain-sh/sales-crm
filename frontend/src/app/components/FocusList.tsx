"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import api from "@/services/api";
import { FocusLead, LeadSummary } from "@/types/lead";

type FocusListProps = {
  onAddInteraction: (lead: LeadSummary) => void;
};

const getPriorityColor = (priority: string | null) => {
  if (priority === "high") {
    return "error";
  }

  if (priority === "medium") {
    return "warning";
  }

  return "default";
};

export default function FocusList({ onAddInteraction }: FocusListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["focus-list"],
    queryFn: async () => {
      const response = await api.get("/leads/focus-list");

      return response.data.focus_list as FocusLead[];
    },
  });

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Focus list
          </Typography>
          <Typography color="text.secondary" variant="body2">
            AI-ranked leads that need attention.
          </Typography>
        </Box>
        <AutoAwesomeIcon color="primary" />
      </Box>

      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress size={26} />
        </Box>
      )}

      {error && (
        <Alert severity="error">Failed to fetch focus list</Alert>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 1,
            p: 3,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>No focus leads yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Add interactions and recalculate scores to build your focus list.
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && Boolean(data?.length) && (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {data?.map((lead) => (
            <Paper
              key={lead.id}
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1,
                display: "grid",
                gap: 1.5,
                p: 2,
              }}
            >
              <Box
                sx={{
                  alignItems: "flex-start",
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{lead.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {lead.company}
                  </Typography>
                </Box>
                <Chip
                  label={lead.priority_score || "N/A"}
                  size="small"
                  color={getPriorityColor(lead.priority_score)}
                />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip label={lead.stage} size="small" variant="outlined" />
                <Chip
                  label={
                    lead.last_interaction_at
                      ? new Date(lead.last_interaction_at).toLocaleDateString()
                      : "No interactions"
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Typography color="text.secondary" variant="body2">
                {lead.ai_focus_reason || "No AI focus reason available."}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Tooltip title="Add interaction">
                  <Button
                    startIcon={<NoteAddIcon />}
                    onClick={() => onAddInteraction(lead)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Add interaction
                  </Button>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
