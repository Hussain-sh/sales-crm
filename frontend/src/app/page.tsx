"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import api from "@/services/api";
import { Lead, LeadSummary } from "@/types/lead";

import AddEditModal from "./components/AddEditModal";
import AddInteractionModal from "./components/AddInteractionModal";
import FocusList from "./components/FocusList";
import LeadTable from "./components/LeadTable";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedInteractionLead, setSelectedInteractionLead] =
    useState<LeadSummary | null>(null);
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/leads");

      return response.data.leads as Lead[];
    },
  });

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsAddModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsAddModalOpen(true);
  };

  const handleAddInteraction = (lead: LeadSummary) => {
    setSelectedInteractionLead(lead);
    setIsInteractionModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedLead(null);
  };

  const handleCloseInteractionModal = () => {
    setIsInteractionModalOpen(false);
    setSelectedInteractionLead(null);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 5,
          pb: 6,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
            }}
          >
            LeadFlow AI
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
            }}
          >
            {leads.length > 0 && (
              <Button
                component={Link}
                href="/pipeline"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Pipeline summary
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleAddLead}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add lead
            </Button>
          </Box>
        </Box>
        <FocusList onAddInteraction={handleAddInteraction} />
        <Typography variant="h6" sx={{ fontWeight: 700, mt: 4 }}>
          All leads
        </Typography>
        <LeadTable
          onEdit={handleEditLead}
          onAddInteraction={handleAddInteraction}
        />
      </Box>
      <AddEditModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
      />
      <AddInteractionModal
        open={isInteractionModalOpen}
        lead={selectedInteractionLead}
        onClose={handleCloseInteractionModal}
      />
    </Container>
  );
}
