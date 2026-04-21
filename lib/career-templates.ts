// Career Centre — Programme d'Employabilité

// ─── SCORE & NIVEAUX ──────────────────────────────────────────────────────

export type NiveauEmployabilite = 'debutant' | 'construction' | 'active' | 'inserable'

export const NIVEAU_META: Record<NiveauEmployabilite, {
  label: string; range: [number, number]; cls: string; icon: string; description: string
}> = {
  debutant:     { label: 'Débutant',        range: [0, 25],   cls: 'bg-slate-100 text-slate-500 border-slate-200',      icon: '🌱', description: 'Profil à construire' },
  construction: { label: 'En construction', range: [26, 50],  cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: '🔨', description: 'Parcours engagé' },
  active:       { label: 'Activé',          range: [51, 75],  cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: '⚡', description: 'Profil développé' },
  inserable:    { label: 'Insérable',       range: [76, 100], cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🚀', description: 'Prêt pour le marché' },
}

export function getNiveau(score: number): NiveauEmployabilite {
  if (score <= 25) return 'debutant'
  if (score <= 50) return 'construction'
  if (score <= 75) return 'active'
  return 'inserable'
}

export interface ScoreBreakdown {
  cv_valide: boolean          // +20
  ateliers_count: number      // +10 each, max 30
  experience_pro: boolean     // +25 (stage ou alternance)
  mentoring_count: number     // +5 each, max 15
  soft_skills_done: boolean   // +10
}

export function calculateScore(b: ScoreBreakdown): number {
  let score = 0
  if (b.cv_valide)        score += 20
  score += Math.min(b.ateliers_count * 10, 30)
  if (b.experience_pro)   score += 25
  score += Math.min(b.mentoring_count * 5, 15)
  if (b.soft_skills_done) score += 10
  return Math.min(score, 100)
}

export const SCORE_ITEMS = [
  { key: 'cv_valide',        label: 'CV validé par le career manager', points: 20, type: 'boolean' as const },
  { key: 'experience_pro',   label: 'Expérience professionnelle (stage/alternance)', points: 25, type: 'boolean' as const },
  { key: 'soft_skills_done', label: 'Auto-évaluation soft skills complétée', points: 10, type: 'boolean' as const },
  { key: 'ateliers_count',   label: 'Ateliers suivis (×10 pts, max 30)', points: 30, type: 'count' as const },
  { key: 'mentoring_count',  label: 'Sessions mentoring (×5 pts, max 15)', points: 15, type: 'count' as const },
]

// ─── ATELIERS ─────────────────────────────────────────────────────────────

export type AtelierType =
  | 'cv_lm' | 'entretien' | 'linkedin' | 'personal_branding'
  | 'secteurs_metiers' | 'pitch' | 'soft_skills' | 'entrepreneuriat' | 'autre'

export const ATELIER_TYPE_META: Record<AtelierType, { label: string; icon: string; cls: string }> = {
  cv_lm:            { label: 'CV & LM',           icon: '📄', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  entretien:        { label: 'Entretien',          icon: '🎙️', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  linkedin:         { label: 'LinkedIn',           icon: '💼', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  personal_branding:{ label: 'Personal Branding',  icon: '✨', cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  secteurs_metiers: { label: 'Secteurs & Métiers', icon: '🏢', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  pitch:            { label: 'Pitch 60s',          icon: '⏱️', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  soft_skills:      { label: 'Soft Skills',        icon: '🧠', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  entrepreneuriat:  { label: 'Entrepreneuriat',    icon: '🚀', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  autre:            { label: 'Autre',              icon: '📌', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export const ATELIER_CATALOGUE = [
  { type: 'cv_lm' as AtelierType,            titre: 'Atelier CV & Lettre de motivation', duree_minutes: 120, objectif: 'Rédiger un CV et une LM percutants adaptés au marché' },
  { type: 'entretien' as AtelierType,        titre: 'Simulation d\'entretien de recrutement', duree_minutes: 90, objectif: 'Maîtriser les techniques de l\'entretien d\'embauche' },
  { type: 'linkedin' as AtelierType,         titre: 'Optimiser son profil LinkedIn', duree_minutes: 90, objectif: 'Créer un profil LinkedIn attractif et développer son réseau professionnel' },
  { type: 'personal_branding' as AtelierType,titre: 'Personal Branding & Identité pro', duree_minutes: 120, objectif: 'Construire et communiquer son identité professionnelle' },
  { type: 'pitch' as AtelierType,            titre: 'Pitch 60 secondes', duree_minutes: 60, objectif: 'Présenter son parcours et ses compétences en 60 secondes' },
  { type: 'soft_skills' as AtelierType,      titre: 'Développer ses soft skills', duree_minutes: 180, objectif: 'Identifier et renforcer les compétences comportementales clés' },
  { type: 'secteurs_metiers' as AtelierType, titre: 'Découverte des secteurs & métiers', duree_minutes: 120, objectif: 'Explorer les secteurs d\'activité et définir son projet professionnel' },
  { type: 'entrepreneuriat' as AtelierType,  titre: 'Entrepreneuriat & création d\'activité', duree_minutes: 180, objectif: 'Comprendre les bases de la création d\'entreprise et de l\'auto-emploi' },
]

// ─── ÉVÉNEMENTS ───────────────────────────────────────────────────────────

export type EvenementType = 'forum' | 'speed_dating' | 'immersion' | 'visite' | 'networking' | 'conference' | 'autre'

export const EVENEMENT_TYPE_META: Record<EvenementType, { label: string; icon: string; cls: string }> = {
  forum:        { label: 'Forum entreprises', icon: '🏛️', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  speed_dating: { label: 'Speed Dating',      icon: '⚡', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  immersion:    { label: 'Immersion',         icon: '🔭', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  visite:       { label: 'Visite entreprise', icon: '🏭', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  networking:   { label: 'Networking',        icon: '🤝', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  conference:   { label: 'Conférence',        icon: '🎤', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  autre:        { label: 'Autre',             icon: '📅', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
}

// ─── OFFRES ───────────────────────────────────────────────────────────────

export type OffreType = 'emploi' | 'stage' | 'alternance' | 'freelance' | 'vie'
export type OffreStatut = 'active' | 'pourvue' | 'expiree'

export const OFFRE_TYPE_META: Record<OffreType, { label: string; cls: string; icon: string }> = {
  emploi:     { label: 'Emploi CDI/CDD', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💼' },
  stage:      { label: 'Stage',          cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: '🎓' },
  alternance: { label: 'Alternance',     cls: 'bg-violet-50 text-violet-700 border-violet-200',    icon: '🔄' },
  freelance:  { label: 'Freelance',      cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: '🖥️' },
  vie:        { label: 'VIE',            cls: 'bg-teal-50 text-teal-700 border-teal-200',          icon: '🌍' },
}

export const OFFRE_STATUT_META: Record<OffreStatut, { label: string; cls: string }> = {
  active:   { label: 'Active',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pourvue:  { label: 'Pourvue',  cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  expiree:  { label: 'Expirée', cls: 'bg-red-50 text-red-400 border-red-100' },
}

// ─── ENTREPRISES ──────────────────────────────────────────────────────────

export type EntrepriseTaille = 'tpe' | 'pme' | 'eti' | 'grande'
export type EntrepriseStatut = 'prospect' | 'partenaire' | 'recruteur_actif'

export const ENTREPRISE_TAILLE_META: Record<EntrepriseTaille, { label: string }> = {
  tpe:    { label: '< 10 salariés' },
  pme:    { label: '10-250 salariés' },
  eti:    { label: '250-5000 salariés' },
  grande: { label: '> 5000 salariés' },
}

export const ENTREPRISE_STATUT_META: Record<EntrepriseStatut, { label: string; cls: string }> = {
  prospect:        { label: 'Prospect',        cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  partenaire:      { label: 'Partenaire',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  recruteur_actif: { label: 'Recruteur actif', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

// ─── MENTORING ────────────────────────────────────────────────────────────

export type MentoringStatut = 'planifiee' | 'realisee' | 'annulee'

export const MENTORING_STATUT_META: Record<MentoringStatut, { label: string; cls: string; icon: string }> = {
  planifiee: { label: 'Planifiée',  cls: 'bg-blue-50 text-blue-700 border-blue-200',            icon: '📅' },
  realisee:  { label: 'Réalisée',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',   icon: '✅' },
  annulee:   { label: 'Annulée',   cls: 'bg-slate-100 text-slate-400 border-slate-200',        icon: '❌' },
}
