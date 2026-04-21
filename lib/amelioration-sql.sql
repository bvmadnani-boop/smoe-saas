-- ISO 21001 §9.1.2 + §10.2 + §10.3 — Réclamations, Enquêtes, Journal d'amélioration

-- Réclamations §10.2 + §9.1.2
CREATE TABLE IF NOT EXISTS reclamations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  numero           TEXT,
  partie_type      TEXT NOT NULL DEFAULT 'apprenant'
                   CHECK (partie_type IN ('apprenant','parent','employeur','partenaire','enseignant','autre')),
  partie_nom       TEXT,
  categorie        TEXT NOT NULL DEFAULT 'autre'
                   CHECK (categorie IN ('pedagogique','administratif','infrastructure','comportement','autre')),
  gravite          TEXT NOT NULL DEFAULT 'mineure'
                   CHECK (gravite IN ('mineure','majeure')),
  statut           TEXT NOT NULL DEFAULT 'recue'
                   CHECK (statut IN ('recue','en_cours','resolue','cloturee')),
  description      TEXT NOT NULL,
  action_realisee  TEXT,
  responsable      TEXT,
  date_reception   DATE NOT NULL DEFAULT CURRENT_DATE,
  delai_traitement DATE,
  nc_id            UUID REFERENCES nonconformities(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enquêtes de satisfaction §9.1.2
CREATE TABLE IF NOT EXISTS enquetes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'apprenants'
                   CHECK (type IN ('apprenants','employeurs','enseignants','partenaires')),
  statut           TEXT NOT NULL DEFAULT 'brouillon'
                   CHECK (statut IN ('brouillon','active','cloturee')),
  questions        JSONB NOT NULL DEFAULT '[]',
  formation_id     UUID REFERENCES formations(id),
  periode          TEXT,
  date_ouverture   DATE,
  date_cloture     DATE,
  nb_reponses      INT NOT NULL DEFAULT 0,
  score_moyen      NUMERIC(3,1),
  resultats        JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal d'amélioration §10.3
CREATE TABLE IF NOT EXISTS ameliorations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  numero           TEXT,
  titre            TEXT NOT NULL,
  description      TEXT,
  source_type      TEXT NOT NULL DEFAULT 'manuel'
                   CHECK (source_type IN ('swot','pestel','nc','risque','audit','reclamation','revue','indicateur','satisfaction','manuel')),
  source_id        UUID,
  source_label     TEXT,
  priorite         TEXT NOT NULL DEFAULT 'moyenne'
                   CHECK (priorite IN ('critique','haute','moyenne','faible')),
  statut           TEXT NOT NULL DEFAULT 'identifiee'
                   CHECK (statut IN ('identifiee','en_cours','realisee','abandonnee')),
  responsable      TEXT,
  echeance         DATE,
  actions          TEXT,
  efficacite_verifiee BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE reclamations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquetes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ameliorations  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reclamations_open"  ON reclamations  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "enquetes_open"      ON enquetes       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ameliorations_open" ON ameliorations  FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
