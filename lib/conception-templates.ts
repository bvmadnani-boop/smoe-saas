// ISO 21001 §8.3 — Conception & Développement des formations

export type FormationStatut = 'brouillon' | 'en_validation' | 'valide' | 'archive'
export type FormationModalite = 'presentiel' | 'hybride' | 'distanciel'
export type ModuleType = 'cours' | 'td' | 'tp' | 'projet' | 'stage' | 'e_learning'
export type SeanceMethode = 'cours_magistral' | 'td' | 'tp' | 'atelier' | 'e_learning' | 'projet' | 'evaluation'
export type EvalType = 'cc' | 'examen' | 'tp' | 'pfe' | 'oral' | 'projet' | 'rattrapage'
export type RevueEtape = 'responsable_pedagogique' | 'directeur' | 'sup2i'
export type RevueStatut = 'en_attente' | 'approuve' | 'approuve_avec_reserves' | 'refuse'
export type NiveauBloom = 'connaitre' | 'comprendre' | 'appliquer' | 'analyser' | 'evaluer' | 'creer'
export type ReferentielSource = 'rncp' | 'sup2i' | 'maison' | 'sectoriel'

export const FORMATION_STATUT_META: Record<FormationStatut, { label: string; cls: string; step: number }> = {
  brouillon:     { label: 'Brouillon',     cls: 'bg-slate-100  text-slate-600  border-slate-300',   step: 1 },
  en_validation: { label: 'En validation', cls: 'bg-amber-100  text-amber-700  border-amber-300',   step: 2 },
  valide:        { label: 'Validé',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', step: 3 },
  archive:       { label: 'Archivé',       cls: 'bg-slate-100  text-slate-400  border-slate-200',   step: 4 },
}

export const MODULE_TYPE_META: Record<ModuleType, { label: string; icon: string; cls: string }> = {
  cours:      { label: 'Cours',      icon: '📖', cls: 'bg-blue-50   text-blue-700   border-blue-200' },
  td:         { label: 'TD',         icon: '✏️',  cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  tp:         { label: 'TP',         icon: '🔬', cls: 'bg-amber-50  text-amber-700  border-amber-200' },
  projet:     { label: 'Projet',     icon: '🎯', cls: 'bg-teal-50   text-teal-700   border-teal-200' },
  stage:      { label: 'Stage',      icon: '🏢', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  e_learning: { label: 'E-learning', icon: '💻', cls: 'bg-cyan-50   text-cyan-700   border-cyan-200' },
}

export const SEANCE_METHODE_META: Record<SeanceMethode, { label: string; icon: string }> = {
  cours_magistral: { label: 'Cours magistral', icon: '🎓' },
  td:              { label: 'Travaux dirigés',  icon: '✏️' },
  tp:              { label: 'Travaux pratiques',icon: '🔬' },
  atelier:         { label: 'Atelier',          icon: '🛠️' },
  e_learning:      { label: 'E-learning',       icon: '💻' },
  projet:          { label: 'Projet',           icon: '🎯' },
  evaluation:      { label: 'Évaluation',       icon: '📝' },
}

export const EVAL_TYPE_META: Record<EvalType, { label: string; icon: string; cls: string }> = {
  cc:          { label: 'Contrôle continu', icon: '📋', cls: 'bg-blue-100   text-blue-700   border-blue-300' },
  examen:      { label: 'Examen final',     icon: '📝', cls: 'bg-red-100    text-red-700    border-red-300' },
  tp:          { label: 'TP noté',          icon: '🔬', cls: 'bg-amber-100  text-amber-700  border-amber-300' },
  pfe:         { label: 'PFE / Mémoire',    icon: '📚', cls: 'bg-violet-100 text-violet-700 border-violet-300' },
  oral:        { label: 'Oral / Soutenance',icon: '🎤', cls: 'bg-teal-100   text-teal-700   border-teal-300' },
  projet:      { label: 'Projet',           icon: '🎯', cls: 'bg-orange-100 text-orange-700 border-orange-300' },
  rattrapage:  { label: 'Rattrapage',       icon: '🔄', cls: 'bg-slate-100  text-slate-600  border-slate-300' },
}

export const REVUE_ETAPE_META: Record<RevueEtape, { label: string; icon: string; desc: string; ordre: number }> = {
  responsable_pedagogique: { label: 'Responsable pédagogique', icon: '👨‍🏫', desc: 'Vérification conformité pédagogique et alignement compétences', ordre: 1 },
  directeur:               { label: 'Direction',               icon: '🏛️',  desc: 'Approbation stratégique et ressources', ordre: 2 },
  sup2i:                   { label: 'Validation SUP2I',        icon: '🎓', desc: 'Conformité référentiel réseau SUP2I', ordre: 3 },
}

export const REVUE_STATUT_META: Record<RevueStatut, { label: string; cls: string; icon: string }> = {
  en_attente:             { label: 'En attente',           cls: 'bg-slate-100  text-slate-600  border-slate-300',   icon: '⏳' },
  approuve:               { label: 'Approuvé',             cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '✅' },
  approuve_avec_reserves: { label: 'Approuvé avec réserves', cls: 'bg-amber-100 text-amber-700 border-amber-300',   icon: '⚠️' },
  refuse:                 { label: 'Refusé',               cls: 'bg-red-100    text-red-700    border-red-300',     icon: '❌' },
}

export const BLOOM_META: Record<NiveauBloom, { label: string; cls: string; niveau: number; verbes: string }> = {
  connaitre:    { label: 'Connaître',    cls: 'bg-slate-100  text-slate-600',   niveau: 1, verbes: 'Définir, Citer, Lister, Identifier, Nommer' },
  comprendre:   { label: 'Comprendre',  cls: 'bg-blue-100   text-blue-700',    niveau: 2, verbes: 'Expliquer, Décrire, Illustrer, Résumer, Interpréter' },
  appliquer:    { label: 'Appliquer',   cls: 'bg-teal-100   text-teal-700',    niveau: 3, verbes: 'Utiliser, Exécuter, Implémenter, Résoudre, Calculer' },
  analyser:     { label: 'Analyser',    cls: 'bg-amber-100  text-amber-700',   niveau: 4, verbes: 'Distinguer, Comparer, Décomposer, Différencier, Examiner' },
  evaluer:      { label: 'Évaluer',     cls: 'bg-orange-100 text-orange-700',  niveau: 5, verbes: 'Juger, Critiquer, Argumenter, Recommander, Justifier' },
  creer:        { label: 'Créer',       cls: 'bg-violet-100 text-violet-700',  niveau: 6, verbes: 'Concevoir, Construire, Planifier, Produire, Formuler' },
}

// ─── Checklist de revue de conception §8.3.4 ─────────────────────────────────
export const REVUE_CHECKLIST: Record<RevueEtape, string[]> = {
  responsable_pedagogique: [
    'Les objectifs pédagogiques sont formulés en termes de compétences observables',
    'Les compétences visées sont cohérentes avec le référentiel de formation',
    'Chaque compétence est couverte par au moins une évaluation',
    'Le volume horaire est conforme aux exigences du diplôme',
    'La progression pédagogique est logique et adaptée au public cible',
    'Les prérequis sont clairement définis et vérifiables',
    'Les méthodes pédagogiques sont variées et adaptées aux objectifs',
    'Les ressources et supports pédagogiques sont disponibles',
  ],
  directeur: [
    'La formation répond aux besoins identifiés du marché',
    'Les ressources humaines (enseignants) sont disponibles et qualifiées',
    'Les ressources matérielles sont disponibles (salles, équipements)',
    'Le budget prévisionnel est validé',
    'La formation est compatible avec l\'offre existante de l\'établissement',
    'Les partenariats entreprises nécessaires sont en place ou planifiés',
  ],
  sup2i: [
    'Le programme est conforme au référentiel SUP2I de la filière',
    'Les enseignants assignés sont validés SUP2I ou en cours de validation',
    'Le plan de cours respecte la structure définie par le réseau',
    'Les modalités d\'évaluation sont conformes aux exigences SUP2I',
    'Le dossier de formation est complet pour l\'accréditation',
  ],
}

// ─── Templates de formations pré-établis ─────────────────────────────────────
export const FORMATION_TEMPLATES = [
  {
    key: 'licence_info',
    label: 'Licence Sciences et Techniques — Informatique',
    code: 'LST-INFO',
    duree: 1500,
    modalite: 'presentiel' as FormationModalite,
    public_cible: 'Bacheliers scientifiques (Bac S, STI, STG) ayant une appétence pour l\'informatique et les technologies numériques.',
    prerequis: 'Baccalauréat ou équivalent. Notions de base en mathématiques et logique.',
    objectifs_generaux: 'Former des techniciens supérieurs en informatique maîtrisant les fondamentaux du développement logiciel, des réseaux, des bases de données et de la gestion de projets informatiques.\n\nÀ l\'issue de la formation, le lauréat sera capable de :\n• Concevoir et développer des applications web et mobiles\n• Administrer des bases de données relationnelles\n• Gérer des projets informatiques en mode agile\n• Intégrer les enjeux de la cybersécurité dans ses pratiques',
  },
  {
    key: 'bts_gestion',
    label: 'BTS Management des Organisations',
    code: 'BTS-MO',
    duree: 1200,
    modalite: 'presentiel' as FormationModalite,
    public_cible: 'Titulaires d\'un baccalauréat (toutes filières) souhaitant acquérir des compétences en gestion d\'entreprise.',
    prerequis: 'Baccalauréat ou équivalent. Maîtrise de la langue française (niveau B2 minimum).',
    objectifs_generaux: 'Former des professionnels polyvalents capables de gérer les fonctions administratives, comptables et commerciales d\'une organisation.\n\nÀ l\'issue de la formation, le lauréat sera capable de :\n• Gérer la comptabilité et les finances d\'une PME\n• Piloter les ressources humaines d\'une équipe\n• Conduire des actions commerciales et marketing\n• Assurer la gestion administrative et documentaire',
  },
  {
    key: 'licence_marketing',
    label: 'Licence Commerce & Marketing Digital',
    code: 'LCD',
    duree: 1500,
    modalite: 'hybride' as FormationModalite,
    public_cible: 'Bacheliers et professionnels en reconversion souhaitant maîtriser le marketing digital et les outils de commerce électronique.',
    prerequis: 'Baccalauréat ou équivalent. Bonne maîtrise du français et de l\'arabe. Notions d\'anglais commercial.',
    objectifs_generaux: 'Former des professionnels du marketing digital et du commerce capables d\'élaborer et piloter des stratégies commerciales omnicanales.\n\nÀ l\'issue de la formation, le lauréat sera capable de :\n• Concevoir et mettre en œuvre une stratégie marketing digitale\n• Gérer des campagnes publicitaires en ligne (SEA, SEO, réseaux sociaux)\n• Analyser les données commerciales et prendre des décisions\n• Créer et gérer une boutique e-commerce',
  },
  {
    key: 'master_audit',
    label: 'Master Management Qualité & Audit',
    code: 'MQA',
    duree: 1800,
    modalite: 'presentiel' as FormationModalite,
    public_cible: 'Titulaires d\'un bac+3 en gestion, économie, ingénierie ou équivalent. Professionnels en activité souhaitant évoluer vers des fonctions qualité.',
    prerequis: 'Licence ou bac+3 validé. Expérience professionnelle appréciée.',
    objectifs_generaux: 'Former des managers de la qualité et des auditeurs internes capables de déployer et piloter des systèmes de management conformes aux normes ISO.\n\nÀ l\'issue de la formation, le lauréat sera capable de :\n• Déployer un système de management qualité ISO 9001 / ISO 21001\n• Conduire des audits internes et des revues de direction\n• Analyser les risques et piloter l\'amélioration continue\n• Manager des équipes qualité et animer des groupes de travail',
  },
]

// ─── Référentiel de compétences SUP2I pré-établi ─────────────────────────────
export const SUP2I_COMPETENCES_TEMPLATE = {
  code: 'SUP2I-REF',
  title: 'Référentiel de compétences SUP2I',
  source: 'sup2i' as ReferentielSource,
  description: 'Référentiel officiel du réseau SUP2I pour l\'enseignement supérieur privé — compétences transversales et spécifiques.',
  blocs: [
    {
      bloc: 'Compétences transversales',
      competences: [
        { code: 'CT-01', title: 'Communication écrite et orale en français', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'CT-02', title: 'Maîtrise des outils numériques professionnels', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'CT-03', title: 'Travail en équipe et collaboration', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'CT-04', title: 'Résolution de problèmes et pensée critique', niveau_bloom: 'analyser' as NiveauBloom },
        { code: 'CT-05', title: 'Gestion de projet et organisation du travail', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'CT-06', title: 'Anglais professionnel (niveau B1 minimum)', niveau_bloom: 'comprendre' as NiveauBloom },
        { code: 'CT-07', title: 'Éthique professionnelle et déontologie', niveau_bloom: 'comprendre' as NiveauBloom },
      ],
    },
    {
      bloc: 'Compétences méthodologiques',
      competences: [
        { code: 'CM-01', title: 'Recherche documentaire et veille informationnelle', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'CM-02', title: 'Analyse de données et reporting', niveau_bloom: 'analyser' as NiveauBloom },
        { code: 'CM-03', title: 'Rédaction de rapports professionnels', niveau_bloom: 'creer' as NiveauBloom },
        { code: 'CM-04', title: 'Conduite d\'entretiens et enquêtes', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'CM-05', title: 'Présentation orale et argumentation', niveau_bloom: 'evaluer' as NiveauBloom },
      ],
    },
    {
      bloc: 'Insertion professionnelle',
      competences: [
        { code: 'IP-01', title: 'Rédaction d\'un CV et lettre de motivation', niveau_bloom: 'creer' as NiveauBloom },
        { code: 'IP-02', title: 'Préparation aux entretiens d\'embauche', niveau_bloom: 'appliquer' as NiveauBloom },
        { code: 'IP-03', title: 'Connaissance du marché de l\'emploi marocain', niveau_bloom: 'comprendre' as NiveauBloom },
        { code: 'IP-04', title: 'Création d\'entreprise et entrepreneuriat', niveau_bloom: 'evaluer' as NiveauBloom },
      ],
    },
  ],
}
