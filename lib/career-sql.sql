-- Career Centre — Programme d'Employabilité

-- Entreprises partenaires
CREATE TABLE IF NOT EXISTS career_entreprises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nom              TEXT NOT NULL,
  secteur          TEXT,
  taille           TEXT NOT NULL DEFAULT 'pme'
                   CHECK (taille IN ('tpe','pme','eti','grande')),
  statut           TEXT NOT NULL DEFAULT 'prospect'
                   CHECK (statut IN ('prospect','partenaire','recruteur_actif')),
  contact_rh       TEXT,
  email_rh         TEXT,
  tel_rh           TEXT,
  convention       BOOLEAN NOT NULL DEFAULT FALSE,
  nb_placements    INT NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profils employabilité étudiants
CREATE TABLE IF NOT EXISTS career_profils (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  etudiant_nom     TEXT NOT NULL,
  etudiant_email   TEXT,
  filiere_id       UUID REFERENCES filieres(id),
  promotion        TEXT,
  score            INT NOT NULL DEFAULT 0,
  niveau           TEXT NOT NULL DEFAULT 'debutant'
                   CHECK (niveau IN ('debutant','construction','active','inserable')),
  cv_valide        BOOLEAN NOT NULL DEFAULT FALSE,
  experience_pro   BOOLEAN NOT NULL DEFAULT FALSE,
  soft_skills_done BOOLEAN NOT NULL DEFAULT FALSE,
  ateliers_count   INT NOT NULL DEFAULT 0,
  mentoring_count  INT NOT NULL DEFAULT 0,
  poste_vise       TEXT,
  secteur_vise     TEXT,
  notes_career     TEXT,
  date_insertion   DATE,
  entreprise_insertion TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ateliers
CREATE TABLE IF NOT EXISTS career_ateliers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'autre'
                   CHECK (type IN ('cv_lm','entretien','linkedin','personal_branding','secteurs_metiers','pitch','soft_skills','entrepreneuriat','autre')),
  objectif         TEXT,
  animateur        TEXT,
  date_atelier     DATE,
  duree_minutes    INT,
  lieu             TEXT,
  nb_places        INT,
  nb_inscrits      INT NOT NULL DEFAULT 0,
  statut           TEXT NOT NULL DEFAULT 'planifie'
                   CHECK (statut IN ('planifie','realise','annule')),
  filiere_ids      JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Présences ateliers
CREATE TABLE IF NOT EXISTS career_atelier_presences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atelier_id  UUID NOT NULL REFERENCES career_ateliers(id) ON DELETE CASCADE,
  profil_id   UUID NOT NULL REFERENCES career_profils(id) ON DELETE CASCADE,
  statut      TEXT NOT NULL DEFAULT 'inscrit'
              CHECK (statut IN ('inscrit','present','absent')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (atelier_id, profil_id)
);

-- Événements career
CREATE TABLE IF NOT EXISTS career_evenements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'autre'
                   CHECK (type IN ('forum','speed_dating','immersion','visite','networking','conference','autre')),
  description      TEXT,
  date_evenement   DATE,
  lieu             TEXT,
  nb_places        INT,
  nb_inscrits      INT NOT NULL DEFAULT 0,
  entreprises_ids  JSONB DEFAULT '[]',
  statut           TEXT NOT NULL DEFAULT 'planifie'
                   CHECK (statut IN ('planifie','realise','annule')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offres d'emploi/stage
CREATE TABLE IF NOT EXISTS career_offres (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entreprise_id    UUID REFERENCES career_entreprises(id),
  filiere_id       UUID REFERENCES filieres(id),
  titre            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'stage'
                   CHECK (type IN ('emploi','stage','alternance','freelance','vie')),
  description      TEXT,
  localisation     TEXT,
  remuneration     TEXT,
  date_debut       DATE,
  date_limite      DATE,
  statut           TEXT NOT NULL DEFAULT 'active'
                   CHECK (statut IN ('active','pourvue','expiree')),
  nb_candidatures  INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions mentoring
CREATE TABLE IF NOT EXISTS career_mentoring (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profil_id        UUID NOT NULL REFERENCES career_profils(id) ON DELETE CASCADE,
  mentor_nom       TEXT NOT NULL,
  mentor_poste     TEXT,
  mentor_entreprise TEXT,
  date_session     DATE,
  duree_minutes    INT,
  theme            TEXT,
  statut           TEXT NOT NULL DEFAULT 'planifiee'
                   CHECK (statut IN ('planifiee','realisee','annulee')),
  feedback_etudiant TEXT,
  feedback_mentor   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE career_entreprises       ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profils           ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_ateliers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_atelier_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_evenements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_offres            ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_mentoring         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_entreprises_open"  ON career_entreprises       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_profils_open"      ON career_profils           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_ateliers_open"     ON career_ateliers          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_presences_open"    ON career_atelier_presences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_evenements_open"   ON career_evenements        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_offres_open"       ON career_offres            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_mentoring_open"    ON career_mentoring         FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
