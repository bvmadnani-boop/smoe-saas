-- Incubateur — Programme d'accompagnement à la création

-- Projets incubés
CREATE TABLE IF NOT EXISTS incubateur_projets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nom              TEXT NOT NULL,
  description      TEXT,
  secteur          TEXT,
  stade            TEXT NOT NULL DEFAULT 'ideation'
                   CHECK (stade IN ('ideation','validation','prototypage','mvp','lancement','abandonne')),
  score_maturite   INT NOT NULL DEFAULT 0,
  business_model   BOOLEAN NOT NULL DEFAULT FALSE,
  prototype        BOOLEAN NOT NULL DEFAULT FALSE,
  premier_client   BOOLEAN NOT NULL DEFAULT FALSE,
  financement_obtenu BOOLEAN NOT NULL DEFAULT FALSE,
  equipe_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  besoins          JSONB DEFAULT '[]',
  site_web         TEXT,
  logo_url         TEXT,
  date_entree      DATE NOT NULL DEFAULT CURRENT_DATE,
  date_sortie      DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Porteurs (fondateurs liés aux profils career)
CREATE TABLE IF NOT EXISTS incubateur_porteurs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id   UUID NOT NULL REFERENCES incubateur_projets(id) ON DELETE CASCADE,
  profil_id   UUID REFERENCES career_profils(id),
  nom         TEXT NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'Co-fondateur',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions d'accompagnement
CREATE TABLE IF NOT EXISTS incubateur_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id   UUID NOT NULL REFERENCES incubateur_projets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expert_nom  TEXT NOT NULL,
  expert_titre TEXT,
  theme       TEXT NOT NULL DEFAULT 'autre'
              CHECK (theme IN ('business_model','technique','marketing','juridique','pitch','financement','rh','strategie','autre')),
  date_session DATE,
  duree_minutes INT,
  compte_rendu TEXT,
  actions_suivantes TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pitchs
CREATE TABLE IF NOT EXISTS incubateur_pitchs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id   UUID NOT NULL REFERENCES incubateur_projets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'interne'
              CHECK (type IN ('interne','externe','competition')),
  date_pitch  DATE,
  lieu        TEXT,
  jury        TEXT,
  score       NUMERIC(4,1),
  note_max    NUMERIC(4,1) DEFAULT 20,
  resultat    TEXT,
  feedback    TEXT,
  statut      TEXT NOT NULL DEFAULT 'planifie'
              CHECK (statut IN ('planifie','realise','annule')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financements
CREATE TABLE IF NOT EXISTS incubateur_financements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id   UUID NOT NULL REFERENCES incubateur_projets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'bourse'
              CHECK (type IN ('bourse','concours','investisseur','autofinancement','pret_honneur','subvention','autre')),
  montant_demande NUMERIC(12,2),
  montant_obtenu  NUMERIC(12,2),
  statut      TEXT NOT NULL DEFAULT 'identifie'
              CHECK (statut IN ('identifie','candidate','obtenu','refuse')),
  date_depot  DATE,
  date_reponse DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jalons / Milestones
CREATE TABLE IF NOT EXISTS incubateur_jalons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id   UUID NOT NULL REFERENCES incubateur_projets(id) ON DELETE CASCADE,
  titre       TEXT NOT NULL,
  description TEXT,
  echeance    DATE,
  statut      TEXT NOT NULL DEFAULT 'a_faire'
              CHECK (statut IN ('a_faire','en_cours','valide','retard')),
  ordre       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE incubateur_projets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubateur_porteurs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubateur_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubateur_pitchs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubateur_financements ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubateur_jalons       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incub_projets_open"  ON incubateur_projets      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "incub_porteurs_open" ON incubateur_porteurs     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "incub_sessions_open" ON incubateur_sessions     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "incub_pitchs_open"   ON incubateur_pitchs       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "incub_financ_open"   ON incubateur_financements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "incub_jalons_open"   ON incubateur_jalons       FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
