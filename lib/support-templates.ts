// ISO 21001 Chapitre 7 — Ressources de support

// ─── Organigramme ANEAQ — modèle pré-chargé ─────────────────────────────────

export const ANEAQ_POSITIONS = [
  // Niveau 1
  { key: 'dg',       title: "Directeur(trice) Général(e)",                          level: 1, parent_key: null,    order_index: 0 },
  // Niveau 2
  { key: 'dir_peda', title: "Directeur(trice) Pédagogique",                         level: 2, parent_key: 'dg',   order_index: 0 },
  { key: 'daf',      title: "Directeur(trice) Administratif(ve) & Financier(ère)",  level: 2, parent_key: 'dg',   order_index: 1 },
  { key: 'rq',       title: "Responsable Qualité",                                  level: 2, parent_key: 'dg',   order_index: 2 },
  { key: 'rsi',      title: "Responsable Systèmes d'Information",                   level: 2, parent_key: 'dg',   order_index: 3 },
  // Niveau 3
  { key: 'coord',    title: "Coordinateur(trice) Pédagogique",                      level: 3, parent_key: 'dir_peda', order_index: 0 },
  { key: 'scol',     title: "Chargé(e) de Scolarité & Examens",                     level: 3, parent_key: 'dir_peda', order_index: 1 },
  { key: 'compta',   title: "Agent Comptable",                                       level: 3, parent_key: 'daf', order_index: 0 },
  { key: 'comm',     title: "Chargé(e) de Communication",                           level: 3, parent_key: 'daf', order_index: 1 },
  { key: 'career',   title: "Chargé(e) Career Centre",                              level: 3, parent_key: 'rq',  order_index: 0 },
  { key: 'maint',    title: "Agent de Maintenance",                                  level: 3, parent_key: 'rsi', order_index: 0 },
] as const

// ─── Personnel permanent §7.1.2 / §7.2 / §7.3 ───────────────────────────────

export type PersonnelStatus   = 'actif' | 'inactif' | 'conge' | 'essai'
export type PersonnelContract = 'cdi' | 'cdd' | 'temps_partiel'

export const PERSONNEL_STATUS_META: Record<PersonnelStatus, { label: string; cls: string }> = {
  actif:   { label: 'Actif',           cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  inactif: { label: 'Inactif',         cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  conge:   { label: 'En congé',        cls: 'bg-amber-50   text-amber-600   border-amber-200'   },
  essai:   { label: "Période d'essai", cls: 'bg-blue-50    text-blue-600    border-blue-200'    },
}

export const CONTRACT_META: Record<PersonnelContract, { label: string; cls: string }> = {
  cdi:          { label: 'CDI',          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cdd:          { label: 'CDD',          cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  temps_partiel:{ label: 'Temps partiel',cls: 'bg-violet-50  text-violet-700  border-violet-200'  },
}

// ─── Infrastructure & Équipements §7.1.3 ────────────────────────────────────

export type EquipmentStatus   = 'operationnel' | 'maintenance' | 'hors_service' | 'reserve'
export type EquipmentCategory = 'informatique' | 'audiovisuel' | 'mobilier' | 'vehicule' | 'infrastructure' | 'autre'

export const EQUIPMENT_STATUS_META: Record<EquipmentStatus, { label: string; cls: string }> = {
  operationnel: { label: 'Opérationnel', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  maintenance:  { label: 'Maintenance',  cls: 'bg-amber-50   text-amber-600   border-amber-200'   },
  hors_service: { label: 'Hors service', cls: 'bg-red-50     text-red-600     border-red-200'     },
  reserve:      { label: 'En réserve',   cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
}

export const EQUIPMENT_CATEGORY_META: Record<EquipmentCategory, { label: string; icon: string }> = {
  informatique:   { label: 'Informatique',   icon: '💻' },
  audiovisuel:    { label: 'Audiovisuel',    icon: '📽️' },
  mobilier:       { label: 'Mobilier',       icon: '🪑' },
  vehicule:       { label: 'Véhicule',       icon: '🚗' },
  infrastructure: { label: 'Infrastructure', icon: '🏛️' },
  autre:          { label: 'Autre',          icon: '📦' },
}

// ─── Informations documentées §7.5 ──────────────────────────────────────────

export type DocumentStatus = 'actif' | 'en_revision' | 'archive' | 'obsolete'
export type DocumentType   = 'procedure' | 'instruction' | 'formulaire' | 'enregistrement' | 'politique' | 'manuel' | 'plan'

export const DOCUMENT_STATUS_META: Record<DocumentStatus, { label: string; cls: string }> = {
  actif:       { label: 'Actif',       cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  en_revision: { label: 'En révision', cls: 'bg-amber-50   text-amber-600   border-amber-200'   },
  archive:     { label: 'Archivé',     cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  obsolete:    { label: 'Obsolète',    cls: 'bg-red-50     text-red-500     border-red-200'     },
}

export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string; icon: string }> = {
  procedure:      { label: 'Procédure',      icon: '📋' },
  instruction:    { label: 'Instruction',    icon: '📝' },
  formulaire:     { label: 'Formulaire',     icon: '📄' },
  enregistrement: { label: 'Enregistrement', icon: '🗂️' },
  politique:      { label: 'Politique',      icon: '📌' },
  manuel:         { label: 'Manuel',         icon: '📚' },
  plan:           { label: 'Plan',           icon: '🗺️' },
}

// ─── Communication §7.4 ─────────────────────────────────────────────────────

export type CommType   = 'interne' | 'externe'
export type CommStatut = 'planifie' | 'envoye' | 'recu' | 'archive'

export const COMM_TYPE_META: Record<CommType, { label: string; cls: string }> = {
  interne: { label: 'Interne', cls: 'bg-blue-50    text-blue-600    border-blue-200'   },
  externe: { label: 'Externe', cls: 'bg-violet-50  text-violet-600  border-violet-200' },
}

export const COMM_STATUT_META: Record<CommStatut, { label: string; cls: string }> = {
  planifie: { label: 'Planifié', cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  envoye:   { label: 'Envoyé',   cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  recu:     { label: 'Reçu',     cls: 'bg-blue-50    text-blue-600    border-blue-200'    },
  archive:  { label: 'Archivé',  cls: 'bg-amber-50   text-amber-600   border-amber-200'   },
}

export const COMM_CHANNELS = ['Email', 'Réunion', 'Affichage', 'Courrier', 'Téléphone', 'Application', 'Autre']
