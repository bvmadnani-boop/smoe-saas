// Incubateur — Programme d'accompagnement à la création

// ─── STADES & SCORE ───────────────────────────────────────────────────────

export type ProjetStade =
  | 'ideation' | 'validation' | 'prototypage' | 'mvp' | 'lancement' | 'abandonne'

export const PROJET_STADE_META: Record<ProjetStade, {
  label: string; icon: string; cls: string; order: number; description: string
}> = {
  ideation:    { label: 'Idéation',     icon: '💡', cls: 'bg-slate-100 text-slate-600 border-slate-200',      order: 1, description: 'Concept initial, recherche d\'idée' },
  validation:  { label: 'Validation',   icon: '🔍', cls: 'bg-blue-50 text-blue-700 border-blue-200',          order: 2, description: 'Étude de marché, validation du besoin' },
  prototypage: { label: 'Prototypage',  icon: '🔧', cls: 'bg-violet-50 text-violet-700 border-violet-200',    order: 3, description: 'Premier prototype, tests utilisateurs' },
  mvp:         { label: 'MVP',          icon: '🚀', cls: 'bg-amber-50 text-amber-700 border-amber-200',       order: 4, description: 'Produit minimum viable, premiers clients' },
  lancement:   { label: 'Lancé',        icon: '🎯', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', order: 5, description: 'Entreprise créée, activité en cours' },
  abandonne:   { label: 'Abandonné',    icon: '🚫', cls: 'bg-red-50 text-red-400 border-red-100',             order: 6, description: 'Projet arrêté' },
}

export const STADE_PIPELINE: ProjetStade[] = ['ideation', 'validation', 'prototypage', 'mvp', 'lancement']

export interface ScoreMaturite {
  business_model: boolean   // +20
  prototype: boolean        // +20
  premier_client: boolean   // +20
  financement: boolean      // +20
  equipe_complete: boolean  // +20
}

export function calculateScoreMaturite(s: ScoreMaturite): number {
  let score = 0
  if (s.business_model)   score += 20
  if (s.prototype)        score += 20
  if (s.premier_client)   score += 20
  if (s.financement)      score += 20
  if (s.equipe_complete)  score += 20
  return score
}

export const SCORE_MATURITE_ITEMS = [
  { key: 'business_model',  label: 'Business model défini et documenté',    points: 20 },
  { key: 'prototype',       label: 'Prototype ou maquette fonctionnelle',    points: 20 },
  { key: 'premier_client',  label: 'Premier client ou utilisateur validé',   points: 20 },
  { key: 'financement',     label: 'Financement obtenu (bourse, concours…)', points: 20 },
  { key: 'equipe_complete', label: 'Équipe fondatrice complète',             points: 20 },
]

// ─── SECTEURS ─────────────────────────────────────────────────────────────

export const PROJET_SECTEURS = [
  'Tech & Digital', 'Fintech', 'Edtech', 'Santé', 'Agriculture',
  'Énergie & Environnement', 'Commerce & E-commerce', 'Services',
  'Industrie', 'Social & Impact', 'Tourisme', 'Autre',
]

// ─── BESOINS ──────────────────────────────────────────────────────────────

export type BesoinType = 'rh' | 'financement' | 'technique' | 'commercial' | 'juridique' | 'marketing' | 'autre'

export const BESOIN_META: Record<BesoinType, { label: string; icon: string; cls: string }> = {
  rh:          { label: 'RH & Recrutement',  icon: '👥', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  financement: { label: 'Financement',       icon: '💰', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  technique:   { label: 'Technique & Dev',   icon: '⚙️', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  commercial:  { label: 'Commercial',        icon: '🤝', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  juridique:   { label: 'Juridique',         icon: '⚖️', cls: 'bg-red-50 text-red-700 border-red-100' },
  marketing:   { label: 'Marketing',         icon: '📢', cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  autre:       { label: 'Autre',             icon: '📌', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

// ─── SESSIONS D'ACCOMPAGNEMENT ────────────────────────────────────────────

export type SessionTheme =
  | 'business_model' | 'technique' | 'marketing' | 'juridique'
  | 'pitch' | 'financement' | 'rh' | 'strategie' | 'autre'

export const SESSION_THEME_META: Record<SessionTheme, { label: string; icon: string }> = {
  business_model: { label: 'Business Model',  icon: '📊' },
  technique:      { label: 'Technique',       icon: '⚙️' },
  marketing:      { label: 'Marketing',       icon: '📢' },
  juridique:      { label: 'Juridique',       icon: '⚖️' },
  pitch:          { label: 'Pitch',           icon: '🎤' },
  financement:    { label: 'Financement',     icon: '💰' },
  rh:             { label: 'RH',              icon: '👥' },
  strategie:      { label: 'Stratégie',       icon: '♟️' },
  autre:          { label: 'Autre',           icon: '📌' },
}

// ─── PITCHS ───────────────────────────────────────────────────────────────

export type PitchType = 'interne' | 'externe' | 'competition'
export type PitchStatut = 'planifie' | 'realise' | 'annule'

export const PITCH_TYPE_META: Record<PitchType, { label: string; icon: string; cls: string }> = {
  interne:     { label: 'Interne',       icon: '🏫', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  externe:     { label: 'Externe',       icon: '🏢', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  competition: { label: 'Compétition',   icon: '🏆', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
}

// ─── FINANCEMENTS ─────────────────────────────────────────────────────────

export type FinancementType =
  | 'bourse' | 'concours' | 'investisseur' | 'autofinancement' | 'pret_honneur' | 'subvention' | 'autre'
export type FinancementStatut = 'identifie' | 'candidate' | 'obtenu' | 'refuse'

export const FINANCEMENT_TYPE_META: Record<FinancementType, { label: string; icon: string }> = {
  bourse:          { label: 'Bourse',           icon: '🎓' },
  concours:        { label: 'Concours',         icon: '🏆' },
  investisseur:    { label: 'Investisseur',     icon: '💼' },
  autofinancement: { label: 'Autofinancement',  icon: '💳' },
  pret_honneur:    { label: 'Prêt d\'honneur',  icon: '🤝' },
  subvention:      { label: 'Subvention',       icon: '🏛️' },
  autre:           { label: 'Autre',            icon: '💰' },
}

export const FINANCEMENT_STATUT_META: Record<FinancementStatut, { label: string; cls: string }> = {
  identifie: { label: 'Identifié',  cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  candidate:  { label: 'Candidaté', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  obtenu:     { label: 'Obtenu',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refuse:     { label: 'Refusé',    cls: 'bg-red-50 text-red-400 border-red-100' },
}

// ─── JALONS ───────────────────────────────────────────────────────────────

export type JalonStatut = 'a_faire' | 'en_cours' | 'valide' | 'retard'

export const JALON_STATUT_META: Record<JalonStatut, { label: string; cls: string; icon: string }> = {
  a_faire:  { label: 'À faire',   cls: 'bg-slate-100 text-slate-500 border-slate-200',      icon: '⬜' },
  en_cours: { label: 'En cours',  cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: '🔵' },
  valide:   { label: 'Validé',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  retard:   { label: 'En retard', cls: 'bg-red-50 text-red-600 border-red-200',             icon: '🔴' },
}

// ─── RÔLES PORTEURS ───────────────────────────────────────────────────────

export const PORTEUR_ROLES = ['CEO / Porteur principal', 'CTO', 'CMO', 'CFO', 'COO', 'Associé', 'Co-fondateur']
