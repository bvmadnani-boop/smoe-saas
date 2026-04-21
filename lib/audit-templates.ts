// ISO 21001 §9.2 — Programme d'audit interne
// §9.3 — Revue de direction

export type AuditStatus   = 'planifie' | 'en_cours' | 'realise' | 'annule'
export type FindingType   = 'conforme' | 'observation' | 'mineure' | 'majeure'
export type ReviewStatus  = 'planifie' | 'realise'

export const AUDIT_STATUS_META: Record<AuditStatus, { label: string; cls: string }> = {
  planifie:  { label: 'Planifié',  cls: 'bg-slate-100   text-slate-600  border border-slate-300' },
  en_cours:  { label: 'En cours',  cls: 'bg-amber-100   text-amber-700  border border-amber-300' },
  realise:   { label: 'Réalisé',   cls: 'bg-emerald-100 text-emerald-700 border border-emerald-300' },
  annule:    { label: 'Annulé',    cls: 'bg-red-100     text-red-600    border border-red-300' },
}

export const FINDING_TYPE_META: Record<FindingType, { label: string; cls: string; icon: string }> = {
  conforme:    { label: 'Conforme',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '✅' },
  observation: { label: 'Observation', cls: 'bg-blue-100    text-blue-700    border-blue-300',    icon: '🔵' },
  mineure:     { label: 'Mineure',     cls: 'bg-amber-100   text-amber-700   border-amber-300',   icon: '⚠️' },
  majeure:     { label: 'Majeure',     cls: 'bg-red-100     text-red-700     border-red-300',     icon: '🔴' },
}

// Processus ISO 21001 — plan annuel pré-établi
// trimestre : 1 à 4, priorite : haute/moyenne/basse
export const AUDIT_PROCESSES = [
  {
    key: 'sup2i',            ref: 'SUP2I', label: 'Conformité SUP2I',
    desc: 'Validation enseignants, référentiels pédagogiques, reporting réseau SUP2I',
    trimestre: 1, mois: 2, priorite: 'haute',
    icon: '🎓',
  },
  {
    key: 'p5_leadership',    ref: '§5',    label: 'Leadership & Politique qualité',
    desc: 'Engagement direction, politique qualité approuvée, rôles et responsabilités',
    trimestre: 1, mois: 3, priorite: 'haute',
    icon: '🏛️',
  },
  {
    key: 'p4_contexte',      ref: '§4',    label: 'Contexte de l\'organisme',
    desc: 'SWOT, PESTEL, parties intéressées, domaine d\'application du SMQ',
    trimestre: 1, mois: 3, priorite: 'moyenne',
    icon: '🔍',
  },
  {
    key: 'p8_realisation',   ref: '§8',    label: 'Réalisation des activités',
    desc: 'Processus pédagogiques, conception de formation, évaluation apprenants',
    trimestre: 2, mois: 4, priorite: 'haute',
    icon: '📚',
  },
  {
    key: 'p4_pedagogique',   ref: 'P4',    label: 'Processus pédagogique',
    desc: 'Emploi du temps, suivi absences, notes, progression pédagogique',
    trimestre: 2, mois: 5, priorite: 'haute',
    icon: '📋',
  },
  {
    key: 'satisfaction',     ref: 'SAT',   label: 'Satisfaction apprenants',
    desc: 'Enquêtes de satisfaction, taux, réclamations, actions correctives',
    trimestre: 2, mois: 6, priorite: 'haute',
    icon: '⭐',
  },
  {
    key: 'p7_support',       ref: '§7',    label: 'Support & Ressources',
    desc: 'Ressources humaines, infrastructure, compétences, communication, documentation',
    trimestre: 3, mois: 7, priorite: 'moyenne',
    icon: '⚙️',
  },
  {
    key: 'p6_planification', ref: '§6',    label: 'Planification & Risques',
    desc: 'Risques, opportunités, objectifs qualité, planification des changements',
    trimestre: 3, mois: 8, priorite: 'moyenne',
    icon: '🎯',
  },
  {
    key: 'p5_diplomation',   ref: 'P5',    label: 'Diplomation & PFE',
    desc: 'Soutenances, jurys, diplômes SUP2I, conformité des dossiers',
    trimestre: 3, mois: 9, priorite: 'haute',
    icon: '🎓',
  },
  {
    key: 'ressources',       ref: 'RH',    label: 'Ressources & Compétences',
    desc: 'Formations internes, fiches de poste, plan de développement RH',
    trimestre: 4, mois: 10, priorite: 'moyenne',
    icon: '👥',
  },
  {
    key: 'p10_amelioration', ref: '§10',   label: 'Amélioration continue',
    desc: 'NC, actions correctives, efficacité des mesures, amélioration proactive',
    trimestre: 4, mois: 11, priorite: 'haute',
    icon: '🔄',
  },
  {
    key: 'p9_evaluation',    ref: '§9',    label: 'Évaluation des performances',
    desc: 'Indicateurs qualité, audits internes, bilan annuel, revue de direction',
    trimestre: 4, mois: 12, priorite: 'haute',
    icon: '📊',
  },
] as const
export type AuditProcessKey = typeof AUDIT_PROCESSES[number]['key']

// Checklist par processus
export const AUDIT_CHECKLIST: Record<string, string[]> = {
  p4_contexte: [
    'L\'organisation a-t-elle défini son contexte interne et externe (SWOT/PESTEL) ?',
    'Les parties intéressées et leurs exigences sont-elles identifiées et à jour ?',
    'Le domaine d\'application du SMQ est-il documenté ?',
    'Le contexte est-il révisé lors de changements significatifs ?',
  ],
  p5_leadership: [
    'La politique qualité est-elle documentée, approuvée et communiquée ?',
    'La politique est-elle accessible à toutes les parties intéressées ?',
    'Les objectifs qualité sont-ils définis et mesurables ?',
    'Les rôles, responsabilités et autorités sont-ils clairement définis ?',
    'La direction démontre-t-elle son engagement envers le SMQ ?',
  ],
  p6_planification: [
    'Les risques et opportunités sont-ils identifiés et évalués ?',
    'Des actions de traitement sont-elles planifiées pour les risques élevés ?',
    'Les objectifs qualité sont-ils suivis avec des indicateurs ?',
    'Un plan de gestion des changements est-il en place ?',
  ],
  p7_support: [
    'Les ressources nécessaires au SMQ sont-elles disponibles ?',
    'Les compétences requises sont-elles définies et les écarts comblés ?',
    'L\'infrastructure et l\'environnement de travail sont-ils appropriés ?',
    'La documentation du SMQ est-elle maîtrisée (versions, approbations) ?',
    'Les communications internes et externes sont-elles planifiées ?',
  ],
  p8_realisation: [
    'Les processus pédagogiques sont-ils planifiés et maîtrisés ?',
    'Les syllabus respectent-ils les référentiels de compétences ?',
    'L\'évaluation des apprenants est-elle conforme aux exigences ?',
    'Les stages et PFE sont-ils encadrés et documentés ?',
    'Les prestataires externes (intervenants) sont-ils évalués ?',
  ],
  p9_evaluation: [
    'La satisfaction des apprenants est-elle mesurée régulièrement ?',
    'Le programme d\'audit interne est-il respecté ?',
    'Les indicateurs de performance sont-ils suivis et analysés ?',
    'La revue de direction est-elle réalisée annuellement ?',
  ],
  p10_amelioration: [
    'Les non-conformités sont-elles enregistrées et traitées dans les délais ?',
    'Les causes racines sont-elles analysées pour les NC récurrentes ?',
    'Les actions correctives font-elles l\'objet d\'un suivi d\'efficacité ?',
    'Des actions d\'amélioration proactives sont-elles menées ?',
  ],
  sup2i: [
    'Tous les enseignants actifs dans l\'emploi du temps sont-ils validés SUP2I ?',
    'Le reporting SUP2I est-il transmis dans les délais requis ?',
    'Les référentiels pédagogiques SUP2I sont-ils intégrés aux syllabus ?',
    'Les audits SUP2I précédents ont-ils fait l\'objet d\'un plan d\'action ?',
  ],
  satisfaction: [
    'Une enquête de satisfaction apprenants est-elle réalisée chaque semestre ?',
    'Le taux de satisfaction est-il analysé et communiqué ?',
    'Les réclamations sont-elles enregistrées et traitées ?',
    'Des actions correctives ont-elles été mises en place suite aux retours ?',
  ],
  p4_pedagogique: [
    'L\'emploi du temps couvre-t-il la totalité des heures prévues par filière ?',
    'Le suivi des absences enseignants est-il formalisé ?',
    'Les résultats des examens sont-ils enregistrés et analysés ?',
    'La progression pédagogique est-elle conforme au calendrier prévu ?',
  ],
  p5_diplomation: [
    'Les dossiers de soutenance respectent-ils les délais SUP2I ?',
    'Les jurys sont-ils constitués conformément aux exigences ?',
    'Les diplômes émis sont-ils enregistrés et archivés ?',
    'Le taux de réussite est-il conforme aux objectifs de l\'établissement ?',
  ],
  ressources: [
    'Les fiches de poste sont-elles à jour pour tout le personnel ?',
    'Un plan de formation annuel est-il défini et suivi ?',
    'Les évaluations du personnel sont-elles réalisées régulièrement ?',
    'Les besoins en compétences nouvelles sont-ils anticipés ?',
  ],
}

export const MOIS_LABELS = [
  '', 'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]
