// ISO 21001 §6.1 — Risques & Opportunités
// Matrice 5×5 : Probabilité × Impact = Score

export type RiskType       = 'risque' | 'opportunite'
export type RiskStatus     = 'identifie' | 'en_traitement' | 'clos'
export type RiskTreatment  = 'accepter' | 'reduire' | 'transferer' | 'eviter' | 'exploiter' | 'partager'

export const RISK_CATEGORIES = [
  { key: 'pedagogique',       label: 'Pédagogique',        icon: '📚', color: 'bg-blue-50   border-blue-200   text-blue-700' },
  { key: 'ressources_humaines', label: 'Ressources humaines', icon: '👥', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { key: 'financier',         label: 'Financier',           icon: '💰', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { key: 'reglementaire',     label: 'Réglementaire',       icon: '⚖️',  color: 'bg-red-50    border-red-200    text-red-700' },
  { key: 'infrastructure',    label: 'Infrastructure',      icon: '🏛️',  color: 'bg-amber-50  border-amber-200  text-amber-700' },
  { key: 'reputation',        label: 'Réputation',          icon: '⭐',  color: 'bg-pink-50   border-pink-200   text-pink-700' },
  { key: 'numerique',         label: 'Numérique & SI',      icon: '💻',  color: 'bg-cyan-50   border-cyan-200   text-cyan-700' },
  { key: 'partenariats',      label: 'Partenariats',        icon: '🤝',  color: 'bg-teal-50   border-teal-200   text-teal-700' },
] as const
export type RiskCategory = typeof RISK_CATEGORIES[number]['key']

/** Seuils de criticité — score = probabilité × impact */
export function getScoreLevel(score: number): {
  label: string; cls: string; bgCls: string; matrixCls: string
} {
  if (score >= 20) return { label: 'Critique',  cls: 'text-red-700   bg-red-100   border-red-300',   bgCls: 'bg-red-600',    matrixCls: 'bg-red-500   text-white' }
  if (score >= 12) return { label: 'Élevé',     cls: 'text-orange-700 bg-orange-100 border-orange-300', bgCls: 'bg-orange-500', matrixCls: 'bg-orange-400 text-white' }
  if (score >= 6)  return { label: 'Modéré',    cls: 'text-amber-700 bg-amber-100 border-amber-300',  bgCls: 'bg-amber-400',  matrixCls: 'bg-amber-300  text-slate-800' }
  return                   { label: 'Faible',   cls: 'text-green-700 bg-green-100 border-green-300',  bgCls: 'bg-green-500',  matrixCls: 'bg-green-300  text-slate-800' }
}

export const RISK_STATUS_META: Record<RiskStatus, { label: string; cls: string }> = {
  identifie:     { label: 'Identifié',     cls: 'bg-slate-100 text-slate-600 border border-slate-300' },
  en_traitement: { label: 'En traitement', cls: 'bg-amber-100 text-amber-700 border border-amber-300' },
  clos:          { label: 'Clos',          cls: 'bg-green-100 text-green-700 border border-green-300' },
}

export const RISK_TREATMENT_META: Record<RiskTreatment, { label: string; desc: string; forType: RiskType[] }> = {
  eviter:    { label: 'Éviter',     desc: 'Supprimer l\'activité source du risque',          forType: ['risque'] },
  reduire:   { label: 'Réduire',    desc: 'Mettre en place des mesures préventives',         forType: ['risque'] },
  transferer:{ label: 'Transférer', desc: 'Assurance, externalisation, partage contractuel', forType: ['risque'] },
  accepter:  { label: 'Accepter',   desc: 'Risque résiduel acceptable, surveiller',          forType: ['risque', 'opportunite'] },
  exploiter: { label: 'Exploiter',  desc: 'Agir pour que l\'opportunité se concrétise',      forType: ['opportunite'] },
  partager:  { label: 'Partager',   desc: 'Partenariat pour bénéficier ensemble',             forType: ['opportunite'] },
}

// ─── Templates pré-établis ────────────────────────────────────────────────────

export interface RiskTemplate {
  type:        RiskType
  category:    RiskCategory
  title:       string
  description: string
  probability: number   // 1–5
  impact:      number   // 1–5
  treatment:   RiskTreatment
  treatment_action: string
}

export const RISK_TEMPLATES: RiskTemplate[] = [
  // ── Pédagogique — Risques ─────────────────────────────────────────────────
  {
    type: 'risque', category: 'pedagogique',
    title: 'Taux d\'absentéisme enseignants élevé',
    description: 'Absences répétées des enseignants entraînant un déficit d\'heures de formation et une dégradation de la qualité pédagogique.',
    probability: 3, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Constituer un vivier d\'enseignants remplaçants. Mettre en place un système de préavis obligatoire (48h). Suivre le taux mensuel dans les indicateurs qualité.',
  },
  {
    type: 'risque', category: 'pedagogique',
    title: 'Non-conformité des contenus aux référentiels SUP2I',
    description: 'Des modules de formation ne couvrent pas l\'intégralité des compétences exigées par SUP2I, exposant l\'établissement à un refus de validation.',
    probability: 3, impact: 5,
    treatment: 'reduire',
    treatment_action: 'Réaliser un audit pédagogique annuel par module. Aligner les syllabus sur la grille SUP2I. Former les coordinateurs à la lecture des référentiels.',
  },
  {
    type: 'risque', category: 'pedagogique',
    title: 'Faible taux de réussite aux examens de fin d\'année',
    description: 'Résultats académiques inférieurs aux seuils attendus, signaux d\'alerte sur l\'efficacité des apprentissages.',
    probability: 2, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Instaurer un suivi mensuel par filière. Proposer des sessions de rattrapage et de soutien. Analyser les causes racines par matière.',
  },
  {
    type: 'risque', category: 'pedagogique',
    title: 'Obsolescence des contenus de formation',
    description: 'Les contenus pédagogiques ne reflètent plus les évolutions du marché du travail et des technologies.',
    probability: 3, impact: 3,
    treatment: 'reduire',
    treatment_action: 'Réviser les contenus chaque cycle (tous les 2 ans). Impliquer les entreprises partenaires dans la validation des syllabus.',
  },

  // ── Ressources humaines — Risques ─────────────────────────────────────────
  {
    type: 'risque', category: 'ressources_humaines',
    title: 'Départ d\'enseignants clés non validés SUP2I',
    description: 'Perte de compétences critiques avec impact immédiat sur la couverture horaire et la conformité SUP2I.',
    probability: 2, impact: 5,
    treatment: 'reduire',
    treatment_action: 'Cartographier les compétences critiques. Planifier les formations SUP2I en avance. Maintenir un ratio de 20% d\'enseignants en cours de validation.',
  },
  {
    type: 'risque', category: 'ressources_humaines',
    title: 'Surcharge de travail du personnel administratif',
    description: 'Concentration des tâches administratives sur un nombre restreint d\'agents, risque d\'erreurs et de démotivation.',
    probability: 3, impact: 3,
    treatment: 'reduire',
    treatment_action: 'Automatiser les tâches répétitives (via SMOE). Répartir les responsabilités clairement. Prévoir des remplaçants formés.',
  },
  {
    type: 'risque', category: 'ressources_humaines',
    title: 'Non-renouvellement des contrats d\'enseignants vacataires',
    description: 'Difficulté à trouver des vacataires qualifiés pour couvrir certains modules spécialisés.',
    probability: 3, impact: 3,
    treatment: 'reduire',
    treatment_action: 'Établir un réseau de vacataires qualifiés. Anticiper les besoins en début de semestre. Développer des partenariats avec les entreprises locales.',
  },

  // ── Financier — Risques ──────────────────────────────────────────────────
  {
    type: 'risque', category: 'financier',
    title: 'Retard de paiement des frais de scolarité',
    description: 'Impact sur la trésorerie de l\'établissement et les capacités d\'investissement pédagogique.',
    probability: 4, impact: 3,
    treatment: 'reduire',
    treatment_action: 'Mettre en place un plan d\'échelonnement formalisé. Relancer automatiquement à J+15, J+30. Proposer des solutions de financement (OFPPT, banques partenaires).',
  },
  {
    type: 'risque', category: 'financier',
    title: 'Baisse des inscriptions en dessous du seuil de rentabilité',
    description: 'Recrutement insuffisant mettant en péril l\'équilibre financier de la filière.',
    probability: 2, impact: 5,
    treatment: 'eviter',
    treatment_action: 'Définir un seuil d\'alerte par filière (ex: 15 étudiants). Activer le plan marketing dès atteinte du seuil. Diversifier les sources de revenus (formation continue, alternance).',
  },
  {
    type: 'risque', category: 'financier',
    title: 'Impayés cumulés des entreprises partenaires (alternance)',
    description: 'Retards ou défauts de paiement des contributions entreprises aux programmes en alternance.',
    probability: 2, impact: 3,
    treatment: 'transferer',
    treatment_action: 'Formaliser les conventions de financement avec clause pénale. Exiger un acompte de 30% en début de contrat. Assurance-crédit à envisager.',
  },

  // ── Réglementaire — Risques ──────────────────────────────────────────────
  {
    type: 'risque', category: 'reglementaire',
    title: 'Non-conformité aux exigences d\'accréditation MESRSFC',
    description: 'Non-respect des cahiers des charges du Ministère de l\'Enseignement Supérieur, risque de retrait d\'autorisation.',
    probability: 2, impact: 5,
    treatment: 'eviter',
    treatment_action: 'Maintenir un tableau de bord réglementaire. Désigner un responsable conformité. Audit interne annuel avant échéance de renouvellement.',
  },
  {
    type: 'risque', category: 'reglementaire',
    title: 'Changement réglementaire imprévu (nouveau référentiel SUP2I)',
    description: 'Modification des critères SUP2I imposant une mise à niveau rapide des enseignants et des contenus.',
    probability: 2, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Maintenir une veille réglementaire active. Planifier 10% de budget formation pour mises à niveau urgentes. Adhérer aux instances de concertation SUP2I.',
  },
  {
    type: 'risque', category: 'reglementaire',
    title: 'Non-conformité RGPD/protection données étudiants',
    description: 'Collecte ou traitement non conforme des données personnelles des apprenants.',
    probability: 2, impact: 3,
    treatment: 'reduire',
    treatment_action: 'Nommer un DPO. Documenter les traitements. Mettre à jour les mentions légales et obtenir les consentements explicites.',
  },

  // ── Infrastructure — Risques ─────────────────────────────────────────────
  {
    type: 'risque', category: 'infrastructure',
    title: 'Panne du système informatique et perte de données',
    description: 'Interruption des services numériques impactant la gestion pédagogique et administrative.',
    probability: 2, impact: 4,
    treatment: 'transferer',
    treatment_action: 'Souscrire un contrat de maintenance. Mettre en place des sauvegardes quotidiennes cloud. Tester le plan de reprise d\'activité annuellement.',
  },
  {
    type: 'risque', category: 'infrastructure',
    title: 'Insuffisance des locaux en cas de croissance rapide',
    description: 'Capacité d\'accueil insuffisante face à une augmentation significative des effectifs.',
    probability: 2, impact: 3,
    treatment: 'accepter',
    treatment_action: 'Surveiller le taux d\'occupation mensuel. Prévoir un plan d\'extension ou de délocalisation partielle si > 85% de capacité.',
  },

  // ── Réputation — Risques ─────────────────────────────────────────────────
  {
    type: 'risque', category: 'reputation',
    title: 'Mauvaise e-réputation sur les réseaux sociaux',
    description: 'Avis négatifs non gérés entraînant une baisse des candidatures.',
    probability: 2, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Mettre en place un dispositif de veille e-réputation (Google Alerts, Facebook). Répondre à tous les avis sous 48h. Activer les ambassadeurs étudiants.',
  },
  {
    type: 'risque', category: 'reputation',
    title: 'Faible taux d\'insertion professionnelle communiqué',
    description: 'Indicateurs d\'insertion inférieurs aux concurrents, impact sur l\'attractivité de l\'établissement.',
    probability: 2, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Créer un Career Centre actif. Mesurer et communiquer le taux d\'insertion à 6 mois. Développer le réseau alumni.',
  },

  // ── Numérique — Risques ──────────────────────────────────────────────────
  {
    type: 'risque', category: 'numerique',
    title: 'Cyberattaque ou tentative d\'hameçonnage',
    description: 'Vol de données sensibles (données étudiants, données financières) suite à une attaque informatique.',
    probability: 2, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Former le personnel à la cybersécurité. Mettre en place une authentification à double facteur. Souscrire une cyber-assurance.',
  },
  {
    type: 'risque', category: 'numerique',
    title: 'Dépendance à un seul prestataire SaaS critique',
    description: 'Défaillance ou arrêt d\'un outil numérique central (plateforme LMS, ERP) sans alternative disponible.',
    probability: 2, impact: 3,
    treatment: 'reduire',
    treatment_action: 'Maintenir une exportation régulière des données. Identifier des solutions de repli. Clauses de réversibilité dans les contrats.',
  },

  // ── Partenariats — Risques ───────────────────────────────────────────────
  {
    type: 'risque', category: 'partenariats',
    title: 'Désengagement d\'un partenaire entreprise clé',
    description: 'Résiliation d\'une convention de stage ou d\'alternance majeure, impactant les apprenants concernés.',
    probability: 2, impact: 4,
    treatment: 'reduire',
    treatment_action: 'Diversifier le portefeuille partenaires (min. 3 par filière). Réunion de suivi semestrielle. Identifier des partenaires de substitution.',
  },
  {
    type: 'risque', category: 'partenariats',
    title: 'Non-renouvellement de la convention réseau SUP2I',
    description: 'Perte du label SUP2I suite à un audit négatif, remettant en cause le modèle de l\'établissement.',
    probability: 1, impact: 5,
    treatment: 'eviter',
    treatment_action: 'Préparer chaque audit SUP2I 6 mois à l\'avance. Maintenir un tableau de bord conformité permanent. Désigner un référent qualité dédié.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── OPPORTUNITÉS ─────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  {
    type: 'opportunite', category: 'pedagogique',
    title: 'Développement de la formation hybride (présentiel + e-learning)',
    description: 'Diversification des modalités pédagogiques pour attirer des apprenants en emploi et augmenter la flexibilité.',
    probability: 4, impact: 4,
    treatment: 'exploiter',
    treatment_action: 'Équiper une salle de tournage vidéo. Former 5 enseignants au design pédagogique en ligne. Lancer 2 modules hybrides pilotes en S1.',
  },
  {
    type: 'opportunite', category: 'pedagogique',
    title: 'Intégration de l\'IA dans les parcours de formation',
    description: 'Intégrer des modules IA/data pour préparer les apprenants aux métiers de demain et se différencier des concurrents.',
    probability: 4, impact: 5,
    treatment: 'exploiter',
    treatment_action: 'Créer une filière IA appliquée. Nouer un partenariat avec une startup EdTech. Former l\'équipe pédagogique aux outils IA.',
  },
  {
    type: 'opportunite', category: 'ressources_humaines',
    title: 'Programme de valorisation et certification des enseignants',
    description: 'Créer un parcours de développement professionnel attractif pour fidéliser et recruter les meilleurs profils.',
    probability: 3, impact: 3,
    treatment: 'exploiter',
    treatment_action: 'Formaliser un plan de carrière interne. Subventionner les certifications. Communiquer sur la marque employeur.',
  },
  {
    type: 'opportunite', category: 'financier',
    title: 'Accès aux financements OFPPT et CSF pour la formation continue',
    description: 'Mobiliser les fonds de formation professionnelle pour financer les programmes de formation continue des entreprises.',
    probability: 3, impact: 4,
    treatment: 'exploiter',
    treatment_action: 'Obtenir l\'agrément OFPPT. Former l\'équipe commerciale aux montages de dossiers CSF. Cibler 5 entreprises partenaires en priorité.',
  },
  {
    type: 'opportunite', category: 'reglementaire',
    title: 'Obtention d\'une nouvelle accréditation de filière',
    description: 'Dépôt d\'un nouveau dossier d\'accréditation MESRSFC pour ouvrir une filière à fort potentiel.',
    probability: 3, impact: 4,
    treatment: 'exploiter',
    treatment_action: 'Identifier la filière cible (ex: Cybersécurité, Green Tech). Constituer le dossier 12 mois avant la session d\'accréditation. Mobiliser le réseau SUP2I.',
  },
  {
    type: 'opportunite', category: 'reputation',
    title: 'Développement du réseau Alumni actif',
    description: 'Créer une communauté d\'anciens étudiants ambassadeurs pour booster le recrutement et l\'image de l\'école.',
    probability: 3, impact: 3,
    treatment: 'exploiter',
    treatment_action: 'Créer une page LinkedIn Alumni. Organiser un Forum Alumni annuel. Lancer un programme de mentorat.',
  },
  {
    type: 'opportunite', category: 'partenariats',
    title: 'Partenariat avec des entreprises multinationales (stages & emplois)',
    description: 'Conventions de partenariat avec des grands groupes offrant des débouchés premium aux lauréats.',
    probability: 3, impact: 4,
    treatment: 'exploiter',
    treatment_action: 'Identifier 10 cibles multinationales dans la région. Préparer un dossier de partenariat professionnel. Organiser des journées entreprises.',
  },
  {
    type: 'opportunite', category: 'partenariats',
    title: 'Ouverture vers les marchés Afrique subsaharienne',
    description: 'Proposer des programmes à distance ou en partenariat à des établissements d\'Afrique de l\'Ouest et Centrale.',
    probability: 2, impact: 5,
    treatment: 'partager',
    treatment_action: 'Identifier 2-3 établissements partenaires en Côte d\'Ivoire et RDC. Monter un accord de coopération. Adapter les modalités pédagogiques au contexte local.',
  },
  {
    type: 'opportunite', category: 'numerique',
    title: 'Digitalisation complète des processus administratifs',
    description: 'Réduire les coûts administratifs et améliorer la satisfaction des apprenants via un portail numérique intégré.',
    probability: 4, impact: 3,
    treatment: 'exploiter',
    treatment_action: 'Déployer SMOE pour la gestion complète. Former l\'équipe. Mesurer le gain de temps mensuel.',
  },
]
