-- ISO 21001 §8.3 — Conception & Développement des formations

-- Référentiels de compétences
CREATE TABLE IF NOT EXISTS referentiels_competences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code             TEXT NOT NULL,
  title            TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT 'maison' CHECK (source IN ('rncp','sup2i','maison','sectoriel')),
  description      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compétences
CREATE TABLE IF NOT EXISTS competences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referentiel_id   UUID NOT NULL REFERENCES referentiels_competences(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code             TEXT NOT NULL,
  bloc             TEXT,
  title            TEXT NOT NULL,
  description      TEXT,
  niveau_bloom     TEXT CHECK (niveau_bloom IN ('connaitre','comprendre','appliquer','analyser','evaluer','creer')),
  ordre            INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Formations
CREATE TABLE IF NOT EXISTS formations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code                 TEXT,
  title                TEXT NOT NULL,
  filiere_id           UUID REFERENCES filieres(id),
  public_cible         TEXT,
  prerequis            TEXT,
  objectifs_generaux   TEXT,
  duree_totale_heures  NUMERIC(6,1),
  modalite             TEXT NOT NULL DEFAULT 'presentiel' CHECK (modalite IN ('presentiel','hybride','distanciel')),
  referentiel_id       UUID REFERENCES referentiels_competences(id),
  statut               TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon','en_validation','valide','archive')),
  version              INT NOT NULL DEFAULT 1,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Modules pédagogiques (Unités d'enseignement)
CREATE TABLE IF NOT EXISTS formation_modules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id     UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code             TEXT,
  title            TEXT NOT NULL,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'cours' CHECK (type IN ('cours','td','tp','projet','stage','e_learning')),
  volume_horaire   NUMERIC(5,1),
  ordre            INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Séances
CREATE TABLE IF NOT EXISTS formation_seances (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES formation_modules(id) ON DELETE CASCADE,
  formation_id      UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre             TEXT NOT NULL,
  objectif          TEXT,
  methode           TEXT NOT NULL DEFAULT 'cours_magistral'
                    CHECK (methode IN ('cours_magistral','td','tp','atelier','e_learning','projet','evaluation')),
  duree_heures      NUMERIC(4,1),
  supports          TEXT,
  teacher_id        UUID REFERENCES teachers(id),
  competences_visees JSONB DEFAULT '[]',
  ordre             INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Évaluations
CREATE TABLE IF NOT EXISTS formation_evaluations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id         UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titre                TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'examen'
                       CHECK (type IN ('cc','examen','tp','pfe','oral','projet','rattrapage')),
  description          TEXT,
  coefficient          NUMERIC(4,2),
  duree_minutes        INT,
  competences_evaluees JSONB DEFAULT '[]',
  criteres             TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revues de conception §8.3.4
CREATE TABLE IF NOT EXISTS formation_revues (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id        UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  etape               TEXT NOT NULL CHECK (etape IN ('responsable_pedagogique','directeur','sup2i')),
  statut              TEXT NOT NULL DEFAULT 'en_attente'
                      CHECK (statut IN ('en_attente','approuve','approuve_avec_reserves','refuse')),
  commentaire         TEXT,
  reviewer_name       TEXT,
  reviewed_at         TIMESTAMPTZ,
  version_formation   INT,
  checklist_results   JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lien formation ↔ emploi du temps (schedule_formations)
CREATE TABLE IF NOT EXISTS schedule_formations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id     UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  formation_id    UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  seance_id       UUID REFERENCES formation_seances(id),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE referentiels_competences ENABLE ROW LEVEL SECURITY;
ALTER TABLE competences              ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_modules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_seances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_evaluations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_revues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_formations      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referentiels_open"   ON referentiels_competences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "competences_open"    ON competences              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "formations_open"     ON formations               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "formation_mod_open"  ON formation_modules        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "formation_sea_open"  ON formation_seances        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "formation_eval_open" ON formation_evaluations    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "formation_rev_open"  ON formation_revues         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sched_form_open"     ON schedule_formations      FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
