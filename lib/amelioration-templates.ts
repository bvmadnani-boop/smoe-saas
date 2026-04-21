// ISO 21001 §9.1.2 + §10.2 + §10.3 — Réclamations, Satisfaction & Amélioration continue

// ─── RÉCLAMATIONS §10.2 ────────────────────────────────────────────────────

export type ReclamationPartie = 'apprenant' | 'parent' | 'employeur' | 'partenaire' | 'enseignant' | 'autre'
export type ReclamationCategorie = 'pedagogique' | 'administratif' | 'infrastructure' | 'comportement' | 'autre'
export type ReclamationGravite = 'mineure' | 'majeure'
export type ReclamationStatut = 'recue' | 'en_cours' | 'resolue' | 'cloturee'

export const RECLAMATION_PARTIE_META: Record<ReclamationPartie, { label: string; icon: string }> = {
  apprenant:    { label: 'Apprenant',    icon: '🎓' },
  parent:       { label: 'Parent',       icon: '👨‍👩‍👧' },
  employeur:    { label: 'Employeur',    icon: '🏢' },
  partenaire:   { label: 'Partenaire',   icon: '🤝' },
  enseignant:   { label: 'Enseignant',   icon: '👨‍🏫' },
  autre:        { label: 'Autre',        icon: '👤' },
}

export const RECLAMATION_CATEGORIE_META: Record<ReclamationCategorie, { label: string; cls: string }> = {
  pedagogique:    { label: 'Pédagogique',    cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  administratif:  { label: 'Administratif',  cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  infrastructure: { label: 'Infrastructure', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  comportement:   { label: 'Comportement',   cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  autre:          { label: 'Autre',          cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export const RECLAMATION_GRAVITE_META: Record<ReclamationGravite, { label: string; cls: string }> = {
  mineure: { label: 'Mineure', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  majeure: { label: 'Majeure', cls: 'bg-red-50 text-red-700 border-red-200' },
}

export const RECLAMATION_STATUT_META: Record<ReclamationStatut, { label: string; cls: string; icon: string }> = {
  recue:     { label: 'Reçue',      cls: 'bg-blue-50 text-blue-700 border-blue-200',      icon: '📥' },
  en_cours:  { label: 'En cours',   cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: '⚙️' },
  resolue:   { label: 'Résolue',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  cloturee:  { label: 'Clôturée',   cls: 'bg-slate-100 text-slate-500 border-slate-200',  icon: '🔒' },
}

// ─── ENQUÊTES DE SATISFACTION §9.1.2 ──────────────────────────────────────

export type EnqueteType = 'apprenants' | 'employeurs' | 'enseignants' | 'partenaires'
export type EnqueteStatut = 'brouillon' | 'active' | 'cloturee'

export const ENQUETE_TYPE_META: Record<EnqueteType, { label: string; icon: string; cls: string }> = {
  apprenants:   { label: 'Apprenants',   icon: '🎓', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  employeurs:   { label: 'Employeurs',   icon: '🏢', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  enseignants:  { label: 'Enseignants',  icon: '👨‍🏫', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  partenaires:  { label: 'Partenaires',  icon: '🤝', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

export const ENQUETE_STATUT_META: Record<EnqueteStatut, { label: string; cls: string }> = {
  brouillon: { label: 'Brouillon', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  active:    { label: 'Active',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cloturee:  { label: 'Clôturée', cls: 'bg-slate-100 text-slate-400 border-slate-200' },
}

export interface EnqueteQuestion {
  id: string
  texte: string
  type: 'likert' | 'texte' | 'oui_non'
  ordre: number
}

export const ENQUETE_TEMPLATES: Record<EnqueteType, { titre: string; questions: Omit<EnqueteQuestion, 'id'>[] }> = {
  apprenants: {
    titre: 'Enquête de satisfaction — Apprenants',
    questions: [
      { texte: 'La qualité globale de la formation répond à mes attentes', type: 'likert', ordre: 1 },
      { texte: 'Les enseignants maîtrisent bien leurs matières', type: 'likert', ordre: 2 },
      { texte: 'Les supports pédagogiques sont adaptés et accessibles', type: 'likert', ordre: 3 },
      { texte: 'Les méthodes pédagogiques favorisent ma progression', type: 'likert', ordre: 4 },
      { texte: 'L\'organisation (emploi du temps, salles, etc.) est satisfaisante', type: 'likert', ordre: 5 },
      { texte: 'L\'administration répond efficacement à mes demandes', type: 'likert', ordre: 6 },
      { texte: 'Je recommanderais cette formation à un proche', type: 'oui_non', ordre: 7 },
      { texte: 'Vos suggestions d\'amélioration', type: 'texte', ordre: 8 },
    ],
  },
  employeurs: {
    titre: 'Enquête de satisfaction — Employeurs',
    questions: [
      { texte: 'Le niveau de compétences des diplômés correspond aux besoins du poste', type: 'likert', ordre: 1 },
      { texte: 'Les diplômés sont capables de s\'intégrer rapidement', type: 'likert', ordre: 2 },
      { texte: 'Le programme de la formation est adapté aux réalités du marché', type: 'likert', ordre: 3 },
      { texte: 'La communication avec l\'établissement est fluide', type: 'likert', ordre: 4 },
      { texte: 'Vous souhaiteriez accueillir à nouveau des stagiaires/diplômés', type: 'oui_non', ordre: 5 },
      { texte: 'Compétences à renforcer selon vous', type: 'texte', ordre: 6 },
    ],
  },
  enseignants: {
    titre: 'Enquête de satisfaction — Enseignants',
    questions: [
      { texte: 'Les ressources pédagogiques mises à disposition sont suffisantes', type: 'likert', ordre: 1 },
      { texte: 'L\'emploi du temps est organisé de manière cohérente', type: 'likert', ordre: 2 },
      { texte: 'La communication interne avec l\'administration est satisfaisante', type: 'likert', ordre: 3 },
      { texte: 'Je bénéficie d\'un accompagnement pour mon développement professionnel', type: 'likert', ordre: 4 },
      { texte: 'Les infrastructures (salles, équipements) sont adaptées', type: 'likert', ordre: 5 },
      { texte: 'Propositions d\'amélioration', type: 'texte', ordre: 6 },
    ],
  },
  partenaires: {
    titre: 'Enquête de satisfaction — Partenaires',
    questions: [
      { texte: 'La collaboration avec l\'établissement est efficace', type: 'likert', ordre: 1 },
      { texte: 'Les engagements pris sont respectés', type: 'likert', ordre: 2 },
      { texte: 'La communication est régulière et transparente', type: 'likert', ordre: 3 },
      { texte: 'Le partenariat génère de la valeur pour votre organisation', type: 'likert', ordre: 4 },
      { texte: 'Vous souhaiteriez renforcer ce partenariat', type: 'oui_non', ordre: 5 },
      { texte: 'Axes d\'amélioration suggérés', type: 'texte', ordre: 6 },
    ],
  },
}

// ─── JOURNAL D'AMÉLIORATION §10.3 ─────────────────────────────────────────

export type AmeliorationSourceType =
  | 'swot' | 'pestel' | 'nc' | 'risque' | 'audit'
  | 'reclamation' | 'revue' | 'indicateur' | 'satisfaction' | 'manuel'

export type AmeliorationPriorite = 'critique' | 'haute' | 'moyenne' | 'faible'
export type AmeliorationStatut = 'identifiee' | 'en_cours' | 'realisee' | 'abandonnee'

export const AMELIORATION_SOURCE_META: Record<AmeliorationSourceType, { label: string; icon: string; cls: string }> = {
  swot:         { label: 'SWOT',          icon: '🔷', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  pestel:       { label: 'PESTEL',        icon: '🌐', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  nc:           { label: 'Non-conformité',icon: '🚨', cls: 'bg-red-50 text-red-700 border-red-200' },
  risque:       { label: 'Risque',        icon: '⚠️', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  audit:        { label: 'Audit',         icon: '🔍', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  reclamation:  { label: 'Réclamation',   icon: '📨', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  revue:        { label: 'Revue direction',icon: '📋', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  indicateur:   { label: 'Indicateur',    icon: '📊', cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  satisfaction: { label: 'Satisfaction',  icon: '⭐', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  manuel:       { label: 'Manuel',        icon: '✏️', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export const AMELIORATION_PRIORITE_META: Record<AmeliorationPriorite, { label: string; cls: string; order: number }> = {
  critique: { label: 'Critique', cls: 'bg-red-50 text-red-700 border-red-200',       order: 1 },
  haute:    { label: 'Haute',    cls: 'bg-orange-50 text-orange-700 border-orange-200', order: 2 },
  moyenne:  { label: 'Moyenne',  cls: 'bg-amber-50 text-amber-700 border-amber-200',  order: 3 },
  faible:   { label: 'Faible',   cls: 'bg-slate-100 text-slate-500 border-slate-200', order: 4 },
}

export const AMELIORATION_STATUT_META: Record<AmeliorationStatut, { label: string; cls: string; icon: string }> = {
  identifiee:  { label: 'Identifiée',  cls: 'bg-blue-50 text-blue-700 border-blue-200',      icon: '💡' },
  en_cours:    { label: 'En cours',    cls: 'bg-amber-50 text-amber-700 border-amber-200',    icon: '⚙️' },
  realisee:    { label: 'Réalisée',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  abandonnee:  { label: 'Abandonnée', cls: 'bg-slate-100 text-slate-400 border-slate-200',   icon: '🚫' },
}
