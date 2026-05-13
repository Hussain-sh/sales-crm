"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useState } from "react";

import { Lead } from "@/types/lead";

import AddEditModal from "./components/AddEditModal";
import LeadTable from "./components/LeadTable";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsAddModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedLead(null);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 5,
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
          <Button
            variant="contained"
            onClick={handleAddLead}
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add lead
          </Button>
        </Box>
        <LeadTable onEdit={handleEditLead} />
      </Box>
      <AddEditModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
      />
    </Container>
  );
}
