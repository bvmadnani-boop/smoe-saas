// ISO 21001 Chapitre 7 — Ressources de support

// ─── Personnel §7.1.2 / §7.2 / §7.3 ─────────────────────────────────────────

export type PersonnelStatus   = 'actif' | 'inactif' | 'conge' | 'essai'
export type PersonnelContract = 'cdi' | 'cdd' | 'vacataire' | 'stagiaire' | 'benevole'

export const PERSONNEL_STATUS_META: Record<PersonnelStatus, { label: string; cls: string }> = {
  actif:   { label: 'Actif',           cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  inactif: { label: 'Inactif',         cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  conge:   { label: 'En congé',        cls: 'bg-amber-50   text-amber-600   border-amber-200'   },
  essai:   { label: "Période d'essai", cls: 'bg-blue-50    text-blue-600    border-blue-200'    },
}

export const CONTRACT_META: Record<PersonnelContract, { label: string; cls: string }> = {
  cdi:       { label: 'CDI',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cdd:       { label: 'CDD',       cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  vacataire: { label: 'Vacataire', cls: 'bg-violet-50  text-violet-700  border-violet-200'  },
  stagiaire: { label: 'Stagiaire', cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
  benevole:  { label: 'Bénévole',  cls: 'bg-slate-100  text-slate-600   border-slate-200'   },
}

export const PERSONNEL_ROLES = [
  'Directeur pédagogique',
  'Coordinateur pédagogique',
  'Enseignant permanent',
  'Responsable qualité',
  'Responsable administratif',
  'Responsable financier',
  'Chargé de communication',
  'Responsable informatique',
  'Agent de maintenance',
  'Secrétaire',
  'Autre',
]

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
  interne: { label: 'Interne', cls: 'bg-blue-50    text-blue-600    border-blue-200'    },
  externe: { label: 'Externe', cls: 'bg-violet-50  text-violet-600  border-violet-200'  },
}

export const COMM_STATUT_META: Record<CommStatut, { label: string; cls: string }> = {
  planifie: { label: 'Planifié', cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  envoye:   { label: 'Envoyé',   cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  recu:     { label: 'Reçu',     cls: 'bg-blue-50    text-blue-600    border-blue-200'    },
  archive:  { label: 'Archivé',  cls: 'bg-amber-50   text-amber-600   border-amber-200'   },
}

export const COMM_CHANNELS = [
  'Email',
  'Réunion',
  'Affichage',
  'Courrier',
  'Téléphone',
  'Application',
  'Autre',
]
