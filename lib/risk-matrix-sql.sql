-- ISO 21001 §6.1 — Risques & Opportunités
-- Exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS risks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('risque','opportunite')),
  category         TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  probability      INT  NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact           INT  NOT NULL CHECK (impact      BETWEEN 1 AND 5),
  score            INT  GENERATED ALWAYS AS (probability * impact) STORED,
  treatment        TEXT CHECK (treatment IN ('accepter','reduire','transferer','eviter','exploiter','partager')),
  treatment_action TEXT,
  owner            TEXT,
  status           TEXT NOT NULL DEFAULT 'identifie' CHECK (status IN ('identifie','en_traitement','clos')),
  version          INT  NOT NULL DEFAULT 1,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_risks_org   ON risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_risks_type  ON risks(type);
CREATE INDEX IF NOT EXISTS idx_risks_score ON risks(score DESC);

-- RLS
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can manage risks"
  ON risks FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Notifier PostgREST
NOTIFY pgrst, 'reload schema';
