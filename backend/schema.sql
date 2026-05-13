create extension if not exists "pgcrypto";

create type lead_stage as enum (
    'new',
    'contacted',
    'interested',
    'negotiation',
    'closed',
    'lost'
);

create type priority_score as enum (
    'high',
    'medium',
    'low'
);

create type interaction_type as enum (
    'manual_note',
    'call',
    'email',
    'meeting',
    'voice_note',
    'ai_summary'
);

create table leads (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    company varchar(255) not null,
    industry varchar(255),
    deal_size numeric(12, 2) default 0,
    stage lead_stage default 'new',
    last_interaction_at timestamp,
    priority_score priority_score default 'medium',
    priority_reason text,
    ai_focus_reason text,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create table lead_interactions (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references leads(id) on delete cascade,
    interaction_note text not null,
    interaction_type interaction_type default 'manual_note',
    created_at timestamp default current_timestamp
);

create table ai_generated_messages (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references leads(id) on delete cascade,
    generated_message text not null,
    prompt_used text,
    created_at timestamp default current_timestamp
);

create index idx_leads_stage
on leads(stage);

create index idx_leads_priority_score
on leads(priority_score);

create index idx_leads_last_interaction
on leads(last_interaction_at);

create index idx_interactions_lead_id
on lead_interactions(lead_id);

create index idx_ai_generated_messages_lead_id
on ai_generated_messages(lead_id);