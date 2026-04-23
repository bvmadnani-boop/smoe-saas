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

// ─── Fiches de fonction pré-renseignées — modèle ANEAQ ───────────────────────

export type FicheTemplate = {
  role_description: string
  missions: string[]
  responsabilites: string[]
  taches: string[]
  exigences_diplome: string
  exigences_experience: string
}

export const ANEAQ_FICHES: Record<string, FicheTemplate> = {

  dg: {
    role_description:
      "Pilote stratégique de l'établissement, le/la Directeur(trice) Général(e) est garant(e) de la vision institutionnelle, de la conformité aux exigences réglementaires et de l'efficacité du Système de Management de la Qualité selon ISO 21001. Il/elle représente l'établissement auprès des parties prenantes externes et assure le leadership global.",
    missions: [
      "Définir et décliner la vision et la stratégie de l'établissement",
      "Assurer la conformité aux exigences de l'ANEAQ et de l'ISO 21001",
      "Représenter l'établissement auprès des autorités et partenaires",
      "Garantir la performance globale et la pérennité de l'institution",
      "Conduire l'amélioration continue du SMQ",
    ],
    responsabilites: [
      "Engagement de la direction (§5 ISO 21001)",
      "Approbation de la politique qualité et des objectifs stratégiques",
      "Allocation des ressources humaines, matérielles et financières",
      "Supervision des processus transversaux",
      "Signature des conventions, contrats et documents stratégiques",
    ],
    taches: [
      "Présider les réunions du CODIR et les revues de direction",
      "Valider le budget annuel et en suivre l'exécution",
      "Signer les documents institutionnels et accréditations",
      "Assurer le reporting auprès du Conseil d'Administration",
      "Superviser les audits externes et les visites d'accréditation",
    ],
    exigences_diplome: "Bac+5 minimum — Master, MBA ou Doctorat (Management, Sciences de l'Éducation ou discipline de l'établissement)",
    exigences_experience: "Minimum 10 ans d'expérience professionnelle dont 5 ans en poste de direction dans l'enseignement supérieur ou secteur équivalent",
  },

  dir_peda: {
    role_description:
      "Garant(e) de la qualité pédagogique et de la conformité des formations aux référentiels nationaux, le/la Directeur(trice) Pédagogique pilote l'ingénierie de formation, encadre l'équipe enseignante et assure la cohérence entre les objectifs pédagogiques et les besoins du marché.",
    missions: [
      "Superviser la conception et la mise en œuvre des programmes de formation",
      "Encadrer et animer l'équipe pédagogique permanente et vacataire",
      "Veiller à la conformité des formations aux référentiels ANEAQ",
      "Assurer le suivi de la progression pédagogique des étudiants",
      "Coordonner les partenariats académiques et professionnels",
    ],
    responsabilites: [
      "Qualité et pertinence des enseignements dispensés",
      "Conformité des maquettes pédagogiques aux accréditations",
      "Évaluation des enseignants et suivi des performances",
      "Cohérence pédagogique entre les différentes filières",
      "Mise à jour régulière des curricula",
    ],
    taches: [
      "Valider les maquettes pédagogiques et les syllabus",
      "Établir et valider les plannings et emplois du temps",
      "Animer les conseils pédagogiques et jurys d'examens",
      "Gérer les recrutements des enseignants vacataires (en lien avec P4)",
      "Produire le bilan pédagogique annuel",
    ],
    exigences_diplome: "Bac+5 — Master ou Doctorat en Sciences de l'Éducation, ou dans la discipline principale de l'établissement",
    exigences_experience: "Minimum 7 ans d'expérience dont 3 ans en direction pédagogique ou coordination de formation",
  },

  daf: {
    role_description:
      "Garant(e) de la gestion administrative, comptable et financière de l'établissement, le/la DAF assure la rigueur budgétaire, la conformité fiscale et sociale, et fournit à la direction les outils de pilotage financier nécessaires à la prise de décision.",
    missions: [
      "Piloter la gestion budgétaire et le contrôle financier",
      "Superviser les opérations administratives et RH transversales",
      "Assurer la conformité aux obligations fiscales, sociales et réglementaires",
      "Produire les états financiers et tableaux de bord de gestion",
      "Gérer les marchés, contrats fournisseurs et achats",
    ],
    responsabilites: [
      "Exactitude et sincérité des comptes de l'établissement",
      "Respect des délais fiscaux et déclarations sociales",
      "Maîtrise des coûts et optimisation des ressources",
      "Sécurisation des flux financiers et des procédures de paiement",
      "Archivage conforme des pièces comptables et administratives",
    ],
    taches: [
      "Préparer le budget prévisionnel et en assurer le suivi mensuel",
      "Superviser la paie et les déclarations sociales",
      "Valider les marchés et bons de commande",
      "Produire les bilans financiers trimestriels et annuels",
      "Coordonner les audits comptables externes",
    ],
    exigences_diplome: "Bac+5 — Master en Finance, Comptabilité, Audit ou Gestion",
    exigences_experience: "Minimum 7 ans d'expérience en gestion financière, dont 3 ans en poste similaire de préférence dans l'enseignement ou le secteur public",
  },

  rq: {
    role_description:
      "Pilote du Système de Management de la Qualité (SMQ) selon ISO 21001, le/la Responsable Qualité assure le déploiement, le suivi et l'amélioration continue du dispositif qualité de l'établissement. Il/elle est le référent(e) interne pour toutes les exigences normatives et réglementaires.",
    missions: [
      "Déployer, maintenir et améliorer le SMQ selon ISO 21001",
      "Planifier et conduire les audits internes qualité",
      "Gérer les non-conformités, réclamations et actions correctives",
      "Assurer la sensibilisation du personnel (§7.3 ISO 21001)",
      "Préparer et animer la revue de direction",
    ],
    responsabilites: [
      "Conformité de l'établissement aux exigences ISO 21001 et ANEAQ",
      "Suivi des indicateurs qualité et tableaux de bord SMQ",
      "Traitement et clôture des non-conformités dans les délais",
      "Mise à jour du système documentaire qualité",
      "Coordination des processus d'accréditation et audits externes",
    ],
    taches: [
      "Planifier le programme annuel d'audits internes",
      "Rédiger et mettre à jour les procédures qualité",
      "Animer les groupes de travail qualité et amélioration continue",
      "Préparer les dossiers de renouvellement d'accréditation ANEAQ",
      "Former et sensibiliser le personnel aux exigences ISO 21001",
    ],
    exigences_diplome: "Bac+5 — Master en Management de la Qualité, Ingénierie ou domaine connexe. Certification Lead Auditor ISO 21001/9001 appréciée",
    exigences_experience: "Minimum 5 ans dont 3 ans en qualité dans l'enseignement supérieur ou secteur certifié ISO",
  },

  rsi: {
    role_description:
      "Garant(e) de l'infrastructure numérique et des systèmes d'information, le/la Responsable SI assure la disponibilité, la sécurité et l'évolution des outils technologiques de l'établissement, tout en accompagnant la transformation digitale des processus.",
    missions: [
      "Administrer et sécuriser l'infrastructure informatique de l'établissement",
      "Assurer la disponibilité et la continuité des systèmes d'information",
      "Piloter les projets de digitalisation et modernisation SI",
      "Former et accompagner les utilisateurs dans l'usage des outils numériques",
      "Gérer la politique de cybersécurité et de protection des données",
    ],
    responsabilites: [
      "Disponibilité du réseau, des serveurs et des équipements informatiques",
      "Sécurité des données personnelles (conformité RGPD/réglementation marocaine)",
      "Maintenance préventive et curative du parc informatique",
      "Gestion des accès et droits utilisateurs",
      "Documentation technique du parc et des procédures SI",
    ],
    taches: [
      "Administrer les serveurs, réseaux et plateformes applicatives",
      "Gérer les sauvegardes et la reprise après sinistre",
      "Déployer les mises à jour et correctifs de sécurité",
      "Gérer les contrats fournisseurs et prestataires IT",
      "Tenir le registre du parc informatique et des interventions",
    ],
    exigences_diplome: "Bac+3 à Bac+5 — Licence ou Master en Informatique, Réseaux & Systèmes ou Génie Informatique",
    exigences_experience: "Minimum 5 ans en administration système/réseau, dont expérience en établissement ou organisation multi-sites appréciée",
  },

  coord: {
    role_description:
      "Interface opérationnelle entre la direction pédagogique et les équipes terrain, le/la Coordinateur(trice) Pédagogique assure la planification et le suivi des activités d'enseignement, veille à la cohérence des emplois du temps et accompagne les étudiants dans leur parcours.",
    missions: [
      "Coordonner la planification opérationnelle des cours et activités pédagogiques",
      "Assurer le lien entre enseignants permanents, vacataires et direction",
      "Suivre la progression pédagogique et l'assiduité des étudiants",
      "Organiser les jurys d'examens et soutenances",
      "Contribuer à l'amélioration des processus pédagogiques",
    ],
    responsabilites: [
      "Cohérence et respect des emplois du temps",
      "Suivi de la présence enseignante et étudiante",
      "Remontée d'informations vers la direction pédagogique",
      "Gestion des salles et ressources pédagogiques",
      "Coordination des évaluations et examens",
    ],
    taches: [
      "Établir les emplois du temps hebdomadaires et les mettre à jour",
      "Coordonner les interventions des vacataires avec le service RH",
      "Suivre les feuilles d'émargement et signaler les absences",
      "Préparer la logistique des examens (salles, surveillants, sujets)",
      "Produire les PV de jurys et comptes rendus de réunions pédagogiques",
    ],
    exigences_diplome: "Bac+3 minimum — Licence en Sciences de l'Éducation, Gestion ou domaine de l'établissement",
    exigences_experience: "Minimum 3 ans en coordination ou administration pédagogique dans l'enseignement supérieur",
  },

  scol: {
    role_description:
      "Gestionnaire de la vie administrative des étudiants, le/la Chargé(e) de Scolarité & Examens assure le traitement des dossiers d'inscription, l'organisation réglementaire des examens et la délivrance des documents officiels dans le respect des procédures en vigueur.",
    missions: [
      "Gérer les inscriptions, réinscriptions et dossiers administratifs des étudiants",
      "Organiser les examens dans le respect des règlements en vigueur",
      "Délivrer les attestations, relevés de notes et diplômes",
      "Tenir à jour les bases de données étudiantes",
      "Assurer l'interface administrative avec les étudiants et leurs familles",
    ],
    responsabilites: [
      "Exactitude et confidentialité des données étudiantes",
      "Conformité des procédures d'examens aux règlements intérieurs",
      "Respect des délais de traitement des demandes administratives",
      "Archivage sécurisé des dossiers étudiants",
      "Remontée des indicateurs de scolarité (effectifs, taux de réussite)",
    ],
    taches: [
      "Réceptionner et contrôler les dossiers d'inscription",
      "Saisir les notes et éditer les relevés de notes",
      "Préparer les convocations et documents d'examens",
      "Instruire les demandes de dérogations et transferts",
      "Archiver les dossiers et produire les statistiques de scolarité",
    ],
    exigences_diplome: "Bac+2 minimum — DUT, BTS ou Licence en Administration, Gestion ou équivalent",
    exigences_experience: "Minimum 2 ans en scolarité ou administration dans un établissement d'enseignement",
  },

  compta: {
    role_description:
      "Responsable de la tenue de la comptabilité générale et analytique, l'Agent Comptable assure l'enregistrement rigoureux des opérations financières, le suivi des encaissements (notamment les frais de scolarité) et la préparation des déclarations fiscales et états financiers.",
    missions: [
      "Tenir la comptabilité générale et analytique de l'établissement",
      "Suivre les encaissements et relances des frais de scolarité",
      "Préparer les déclarations fiscales et contributions sociales",
      "Effectuer les rapprochements bancaires",
      "Participer à l'élaboration des états financiers",
    ],
    responsabilites: [
      "Exactitude et régularité des enregistrements comptables",
      "Respect des délais de déclaration fiscale et sociale",
      "Archivage conforme des pièces justificatives",
      "Signalement des anomalies et écarts au DAF",
      "Confidentialité des données financières",
    ],
    taches: [
      "Saisir les écritures comptables quotidiennes",
      "Établir les états de rapprochement bancaire mensuels",
      "Préparer et soumettre les déclarations TVA, IS et CNSS",
      "Suivre les créances étudiants et relancer les impayés",
      "Classer et archiver les factures, bons et justificatifs",
    ],
    exigences_diplome: "Bac+2 à Bac+3 — BTS Comptabilité, DUT GEA ou Licence en Comptabilité-Finances",
    exigences_experience: "Minimum 2 ans en comptabilité générale, connaissance des logiciels comptables marocains appréciée",
  },

  comm: {
    role_description:
      "Garant(e) de l'image et de la visibilité de l'établissement, le/la Chargé(e) de Communication pilote la stratégie de communication institutionnelle, développe la présence digitale et organise les événements promotionnels pour soutenir le recrutement et renforcer l'identité de marque.",
    missions: [
      "Développer et mettre en œuvre la stratégie de communication institutionnelle",
      "Gérer la présence digitale (site web, réseaux sociaux, newsletter)",
      "Produire les supports de communication (print et digital)",
      "Organiser les événements promotionnels et de recrutement",
      "Développer les relations médias et partenariats communication",
    ],
    responsabilites: [
      "Cohérence de l'identité visuelle et du message institutionnel",
      "Alimentation régulière des canaux de communication",
      "Respect du calendrier éditorial et des délais de production",
      "Mesure de l'impact des actions de communication",
      "Gestion du budget communication",
    ],
    taches: [
      "Animer les réseaux sociaux et publier du contenu régulier",
      "Mettre à jour le site web de l'établissement",
      "Concevoir les brochures, affiches et supports promotionnels",
      "Organiser les journées portes ouvertes et salons de l'étudiant",
      "Produire les rapports d'activité et bilans de communication",
    ],
    exigences_diplome: "Bac+3 à Bac+5 — Licence ou Master en Communication, Marketing ou Sciences de l'Information",
    exigences_experience: "Minimum 3 ans en communication, maîtrise des outils digitaux et de design (Canva, Adobe) requise",
  },

  career: {
    role_description:
      "Dédié(e) à l'accompagnement des étudiants et alumni vers l'emploi, le/la Chargé(e) Career Centre développe les partenariats entreprises, facilite l'accès aux stages et opportunités professionnelles, et suit les indicateurs d'insertion post-diplôme.",
    missions: [
      "Accompagner les étudiants dans leur projet professionnel et recherche d'emploi",
      "Développer et entretenir le réseau d'entreprises partenaires",
      "Organiser des événements carrières (forums, conférences RH, ateliers CV)",
      "Suivre les indicateurs d'insertion professionnelle des diplômés",
      "Animer la communauté alumni et maintenir le contact post-diplôme",
    ],
    responsabilites: [
      "Taux d'insertion professionnelle à 6 mois des diplômés",
      "Qualité et volume des conventions de stage signées",
      "Développement et fidélisation du réseau entreprises",
      "Mise à jour de la base de données entreprises et alumni",
      "Reporting régulier des indicateurs career à la direction",
    ],
    taches: [
      "Organiser les forums emploi et sessions de recrutement",
      "Prospecter de nouvelles entreprises partenaires pour les stages et l'emploi",
      "Animer les ateliers préparation CV, lettres de motivation et entretiens",
      "Suivre les enquêtes d'insertion 6 mois et 18 mois post-diplôme",
      "Gérer la plateforme offres de stage/emploi et la base alumni",
    ],
    exigences_diplome: "Bac+3 à Bac+5 — Licence ou Master en RH, Management ou Développement de Carrière",
    exigences_experience: "Minimum 3 ans en accompagnement carrière, recrutement ou développement RH",
  },

  maint: {
    role_description:
      "Garant(e) du bon état de fonctionnement des locaux et équipements de l'établissement, l'Agent de Maintenance assure les opérations de maintenance préventive et curative, veille à la conformité des installations et coordonne les interventions des prestataires externes.",
    missions: [
      "Assurer la maintenance préventive et curative des équipements et infrastructures",
      "Veiller à la conformité et à la sécurité des installations",
      "Gérer les interventions des prestataires de maintenance externe",
      "Suivre le registre des équipements et des interventions",
      "Contribuer à la gestion des stocks de fournitures et pièces de rechange",
    ],
    responsabilites: [
      "Disponibilité et bon fonctionnement des équipements",
      "Respect des normes de sécurité des locaux",
      "Réactivité face aux pannes et incidents techniques",
      "Mise à jour du registre de maintenance et des contrôles périodiques",
      "Optimisation des coûts de maintenance",
    ],
    taches: [
      "Effectuer les rondes de contrôle quotidiennes et hebdomadaires",
      "Diagnostiquer et intervenir sur les pannes courantes (électricité, plomberie, réseau)",
      "Planifier et suivre la maintenance préventive des équipements clés",
      "Coordonner et superviser les prestataires techniques externes",
      "Tenir à jour le registre de maintenance et signaler les anomalies critiques",
    ],
    exigences_diplome: "Bac Professionnel minimum — Maintenance Industrielle, Électrotechnique ou équivalent",
    exigences_experience: "Minimum 2 ans en maintenance technique, expérience en établissement recevant du public appréciée",
  },
}

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
