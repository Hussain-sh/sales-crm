"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import api from "@/services/api";

type PipelineStage = {
  stage: string;
  count: string;
};

type PipelineSummary = {
  total_pipeline_value: string;
  stages: PipelineStage[];
};

const formatCurrency = (value: string) =>
  new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value));

const formatStage = (stage: string) =>
  stage
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function PipelinePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pipeline-summary"],
    queryFn: async () => {
      const response = await api.get("/leads/pipeline-summary");

      return response.data.summary as PipelineSummary;
    },
  });

  const totalLeads =
    data?.stages.reduce((total, stage) => total + Number(stage.count), 0) || 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, pb: 6 }}>
        <Box
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pipeline Summary
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Sales manager view of deal value and stage distribution.
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Back to leads
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            Failed to fetch pipeline summary
          </Alert>
        )}

        {data && (
          <Box sx={{ display: "grid", gap: 3, mt: 4 }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  p: 3,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  Total pipeline value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {formatCurrency(data.total_pipeline_value)}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  p: 3,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  Total leads
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {totalLeads}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  p: 3,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  Active stages
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {data.stages.length}
                </Typography>
              </Paper>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1,
                p: 3,
              }}
            >
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Stage distribution
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Lead count across each pipeline stage.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gap: 2.5 }}>
                {data.stages.map((stage) => {
                  const count = Number(stage.count);
                  const percentage = totalLeads ? (count / totalLeads) * 100 : 0;

                  return (
                    <Box key={stage.stage}>
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: 2,
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>
                          {formatStage(stage.stage)}
                        </Typography>
                        <Chip
                          label={`${count} ${count === 1 ? "lead" : "leads"}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          borderRadius: 999,
                          height: 8,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
}
