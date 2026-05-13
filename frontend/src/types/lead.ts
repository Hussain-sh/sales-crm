export type Lead = {
  id: string;
  name: string;
  company: string;
  industry: string;
  deal_size: number;
  stage: string;
  priority_score: string | null;
  ai_focus_reason: string | null;
  last_interaction_at: string | null;
};

export type LeadSummary = Pick<Lead, "id" | "name" | "company">;

export type FocusLead = LeadSummary &
  Pick<Lead, "stage" | "priority_score" | "ai_focus_reason" | "last_interaction_at">;
