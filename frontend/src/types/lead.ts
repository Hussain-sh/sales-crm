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