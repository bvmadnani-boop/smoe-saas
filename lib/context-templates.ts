// ─── SWOT Templates — École Supérieure SUP2I ────────────────────────────────

export const SWOT_TEMPLATES = {
  strength: [
    'Appartenance au réseau SUP2I reconnu à l\'échelle nationale',
    'Corps professoral qualifié et validé par le réseau SUP2I',
    'Programmes professionnalisants alignés sur les besoins du marché',
    'Proximité avec le tissu économique local et régional',
    'Taux d\'insertion professionnelle élevé des diplômés',
    'Accompagnement personnalisé des apprenants (faibles effectifs)',
    'Offre de filières diversifiées et adaptées au contexte local',
    'Partenariats actifs avec les entreprises locales pour les stages',
  ],
  weakness: [
    'Ressources financières limitées pour l\'investissement pédagogique',
    'Infrastructure physique à moderniser (salles, équipements)',
    'Forte dépendance aux enseignants vacataires',
    'Notoriété et visibilité locale à renforcer',
    'Processus administratifs partiellement digitalisés',
    'Faible développement de la formation continue et de l\'alternance',
    'Turn-over du personnel enseignant et administratif',
    'Capacité limitée de R&D et de publications académiques',
  ],
  opportunity: [
    'Demande croissante en enseignement supérieur privé au Maroc',
    'Développement de l\'alternance et de la formation continue',
    'Expansion potentielle vers les marchés africains subsahariens',
    'Accès aux financements européens (Erasmus+, coopération)',
    'Digitalisation des formations (e-learning hybride)',
    'Partenariats avec des universités étrangères pour doubles diplômes',
    'Croissance du secteur des technologies et du numérique',
    'Politique nationale de formation professionnelle (Vision 2030)',
    'Développement de l\'entrepreneuriat et de l\'incubation',
  ],
  threat: [
    'Concurrence des établissements publics à faibles frais de scolarité',
    'Prolifération d\'établissements privés non accrédités cassant les prix',
    'Pression sur les frais de scolarité face au pouvoir d\'achat',
    'Évolution rapide des compétences requises par les employeurs',
    'Risque de départ des meilleurs enseignants vers le secteur public',
    'Instabilité réglementaire dans le secteur de l\'enseignement privé',
    'Concurrence des MOOC et formations en ligne internationales',
    'Baisse démographique potentielle des bacheliers dans certaines régions',
  ],
}

// ─── PESTEL Templates — École Supérieure Maroc/Afrique ──────────────────────

export const PESTEL_TEMPLATES: Array<{
  dimension: 'politique' | 'economique' | 'social' | 'technologique' | 'environnemental' | 'legal'
  content: string
  impact: 'positif' | 'negatif' | 'neutre'
}> = [
  // Politique
  { dimension: 'politique', impact: 'positif',  content: 'Politique nationale de développement de l\'enseignement supérieur privé (Vision 2030 Maroc)' },
  { dimension: 'politique', impact: 'positif',  content: 'Soutien gouvernemental à la formation professionnelle et technique' },
  { dimension: 'politique', impact: 'neutre',   content: 'Réformes du système d\'accréditation et de reconnaissance des diplômes (MEN)' },
  { dimension: 'politique', impact: 'negatif',  content: 'Instabilité réglementaire dans le secteur de l\'éducation privée' },
  { dimension: 'politique', impact: 'positif',  content: 'Coopération Sud-Sud et ouverture vers les marchés africains (Maroc-Afrique)' },

  // Économique
  { dimension: 'economique', impact: 'negatif',  content: 'Pouvoir d\'achat des ménages limité — pression sur les frais de scolarité' },
  { dimension: 'economique', impact: 'negatif',  content: 'Taux de chômage des jeunes diplômés impactant la demande de formation' },
  { dimension: 'economique', impact: 'positif',  content: 'Croissance du secteur des services et du numérique — demande de compétences' },
  { dimension: 'economique', impact: 'positif',  content: 'Développement de la taxe de formation professionnelle et de l\'alternance' },
  { dimension: 'economique', impact: 'neutre',   content: 'Fluctuations du taux de change impactant les partenariats internationaux' },

  // Social
  { dimension: 'social', impact: 'positif',  content: 'Croissance démographique et hausse de la demande en enseignement supérieur' },
  { dimension: 'social', impact: 'positif',  content: 'Aspiration des jeunes à la mobilité internationale et aux doubles diplômes' },
  { dimension: 'social', impact: 'neutre',   content: 'Diversité culturelle et linguistique des apprenants (Maroc, Afrique subsaharienne)' },
  { dimension: 'social', impact: 'negatif',  content: 'Inégalités d\'accès à l\'enseignement supérieur selon les régions' },
  { dimension: 'social', impact: 'positif',  content: 'Montée des attentes des employeurs en matière de soft skills et compétences transversales' },

  // Technologique
  { dimension: 'technologique', impact: 'positif',  content: 'Digitalisation de l\'enseignement — e-learning, classes hybrides, LMS' },
  { dimension: 'technologique', impact: 'positif',  content: 'Intelligence artificielle comme outil pédagogique et d\'évaluation' },
  { dimension: 'technologique', impact: 'negatif',  content: 'Fracture numérique — inégalités d\'accès aux outils technologiques' },
  { dimension: 'technologique', impact: 'positif',  content: 'Plateformes collaboratives facilitant les projets et le suivi pédagogique' },
  { dimension: 'technologique', impact: 'neutre',   content: 'Cybersécurité et protection des données des apprenants (CNDP)' },

  // Environnemental
  { dimension: 'environnemental', impact: 'positif',  content: 'Développement de campus éco-responsables et sensibilisation au DD' },
  { dimension: 'environnemental', impact: 'neutre',   content: 'Impact environnemental des déplacements domicile-campus (transport)' },
  { dimension: 'environnemental', impact: 'positif',  content: 'Intégration du développement durable dans les curricula (compétences vertes)' },

  // Légal
  { dimension: 'legal', impact: 'neutre',   content: 'Loi 01.00 sur l\'organisation de l\'enseignement supérieur privé au Maroc' },
  { dimension: 'legal', impact: 'neutre',   content: 'Réglementation du travail — statut des enseignants vacataires et permanents' },
  { dimension: 'legal', impact: 'neutre',   content: 'Protection des données personnelles — CNDP (équivalent RGPD Maroc)' },
  { dimension: 'legal', impact: 'positif',  content: 'Cadre légal des conventions de stage et des contrats d\'apprentissage' },
  { dimension: 'legal', impact: 'neutre',   content: 'Propriété intellectuelle des supports pédagogiques et productions étudiantes' },
]

// ─── Parties Intéressées — groupées par thème ───────────────────────────────
// group : pour l'affichage en colonnes thématiques (comme SWOT)

export const PI_GROUPS = [
  { key: 'reseau',        label: 'Réseau & Gouvernance',     icon: '🏛️', color: 'bg-[#1B3A6B]',    textCls: 'text-white',     dotCls: 'bg-blue-300',    borderCls: 'border-blue-200',    lightCls: 'bg-blue-50' },
  { key: 'apprenants',    label: 'Apprenants & Familles',    icon: '🎓', color: 'bg-emerald-600',   textCls: 'text-white',     dotCls: 'bg-emerald-300', borderCls: 'border-emerald-200', lightCls: 'bg-emerald-50' },
  { key: 'personnel',     label: 'Personnel interne',        icon: '👥', color: 'bg-violet-600',    textCls: 'text-white',     dotCls: 'bg-violet-300',  borderCls: 'border-violet-200',  lightCls: 'bg-violet-50' },
  { key: 'institutionnel',label: 'Institutionnel & Réglementaire', icon: '⚖️', color: 'bg-amber-600', textCls: 'text-white', dotCls: 'bg-amber-300',   borderCls: 'border-amber-200',   lightCls: 'bg-amber-50' },
  { key: 'economique',    label: 'Partenaires économiques',  icon: '💼', color: 'bg-cyan-600',      textCls: 'text-white',     dotCls: 'bg-cyan-300',    borderCls: 'border-cyan-200',    lightCls: 'bg-cyan-50' },
  { key: 'territoire',    label: 'Territoire & Société',     icon: '🌍', color: 'bg-lime-600',      textCls: 'text-white',     dotCls: 'bg-lime-300',    borderCls: 'border-lime-200',    lightCls: 'bg-lime-50' },
] as const

export type PiGroupKey = typeof PI_GROUPS[number]['key']

export const INTERESTED_PARTIES_TEMPLATES: Array<{
  name: string
  category: 'interne' | 'externe'
  group: PiGroupKey
  needs: string
  expectations: string
  influence_level: 'fort' | 'moyen' | 'faible'
  interest_level: 'fort' | 'moyen' | 'faible'
}> = [
  // ── Réseau & Gouvernance
  { group: 'reseau', category: 'externe', name: 'SUP2I (Réseau national)',
    needs: 'Conformité aux standards du réseau, reporting qualité, respect des processus',
    expectations: 'Rapports réguliers, accréditation maintenue, résultats cohérents avec les objectifs réseau',
    influence_level: 'fort', interest_level: 'fort' },
  { group: 'reseau', category: 'externe', name: 'Proximity Management (PM)',
    needs: 'Déploiement opérationnel du réseau, rentabilité, cohérence du modèle SUP2I',
    expectations: 'Reporting mensuel, respect du cahier des charges, croissance du portefeuille partenaires',
    influence_level: 'fort', interest_level: 'fort' },
  { group: 'reseau', category: 'interne', name: 'Direction de l\'établissement',
    needs: 'Rentabilité, conformité réglementaire, croissance des effectifs',
    expectations: 'Reporting financier et académique, développement stratégique',
    influence_level: 'fort', interest_level: 'fort' },
  { group: 'reseau', category: 'externe', name: 'Actionnaires / Investisseurs',
    needs: 'Retour sur investissement, viabilité à long terme',
    expectations: 'Transparence financière, croissance régulière, réputation préservée',
    influence_level: 'fort', interest_level: 'fort' },

  // ── Apprenants & Familles
  { group: 'apprenants', category: 'interne', name: 'Apprenants (étudiants)',
    needs: 'Formation de qualité, encadrement pédagogique, insertion professionnelle',
    expectations: 'Diplôme reconnu, accompagnement personnalisé, environnement d\'apprentissage adapté',
    influence_level: 'fort', interest_level: 'fort' },
  { group: 'apprenants', category: 'externe', name: 'Familles des apprenants',
    needs: 'Suivi de la scolarité, transparence sur les résultats, sécurité',
    expectations: 'Communication régulière, rapport qualité/prix, projet professionnel pour leur enfant',
    influence_level: 'moyen', interest_level: 'fort' },
  { group: 'apprenants', category: 'externe', name: 'Anciens diplômés (Alumni)',
    needs: 'Réseau professionnel, valorisation de leur diplôme',
    expectations: 'Événements réseau, mise à jour des compétences, reconnaissance institutionnelle',
    influence_level: 'moyen', interest_level: 'moyen' },
  { group: 'apprenants', category: 'interne', name: 'Associations étudiantes',
    needs: 'Espace d\'expression, représentation des étudiants',
    expectations: 'Écoute de la direction, soutien aux initiatives étudiantes',
    influence_level: 'faible', interest_level: 'fort' },

  // ── Personnel interne
  { group: 'personnel', category: 'interne', name: 'Corps enseignant',
    needs: 'Conditions de travail correctes, développement professionnel, reconnaissance',
    expectations: 'Rémunération équitable, ressources pédagogiques, environnement stimulant',
    influence_level: 'fort', interest_level: 'fort' },
  { group: 'personnel', category: 'interne', name: 'Enseignants vacataires',
    needs: 'Flexibilité, rémunération juste, intégration dans l\'équipe',
    expectations: 'Contrats clairs, respect des engagements, matériel pédagogique disponible',
    influence_level: 'moyen', interest_level: 'fort' },
  { group: 'personnel', category: 'interne', name: 'Personnel administratif',
    needs: 'Conditions de travail, formation, clarté des procédures',
    expectations: 'Organisation efficace, outils adaptés, communication interne claire',
    influence_level: 'moyen', interest_level: 'fort' },
  { group: 'personnel', category: 'interne', name: 'Coordinateurs pédagogiques',
    needs: 'Outils de suivi, autonomie opérationnelle, support de la direction',
    expectations: 'Responsabilités bien définies, accès aux données de pilotage',
    influence_level: 'fort', interest_level: 'fort' },

  // ── Institutionnel & Réglementaire
  { group: 'institutionnel', category: 'externe', name: 'Ministère de l\'Enseignement National (MEN)',
    needs: 'Conformité réglementaire, rapports d\'activité, respect des cahiers des charges',
    expectations: 'Transparence, qualité des formations, contribution au système éducatif',
    influence_level: 'fort', interest_level: 'moyen' },
  { group: 'institutionnel', category: 'externe', name: 'OFPPT',
    needs: 'Respect des référentiels de formation professionnelle',
    expectations: 'Rapports de conformité, coordination sur les filières communes',
    influence_level: 'fort', interest_level: 'moyen' },
  { group: 'institutionnel', category: 'externe', name: 'Organismes d\'accréditation',
    needs: 'Conformité aux standards qualité nationaux et internationaux',
    expectations: 'Documentation rigoureuse, amélioration continue, audits réussis',
    influence_level: 'fort', interest_level: 'faible' },
  { group: 'institutionnel', category: 'externe', name: 'Universités partenaires',
    needs: 'Conventions de partenariat, échanges académiques, doubles diplômes',
    expectations: 'Qualité académique, respect des engagements, réciprocité',
    influence_level: 'moyen', interest_level: 'moyen' },

  // ── Partenaires économiques
  { group: 'economique', category: 'externe', name: 'Employeurs locaux',
    needs: 'Diplômés compétents et opérationnels, accueil de stagiaires',
    expectations: 'Compétences techniques et comportementales, réactivité aux besoins du marché',
    influence_level: 'fort', interest_level: 'fort' },
  { group: 'economique', category: 'externe', name: 'Entreprises d\'accueil (stages / alternance)',
    needs: 'Stagiaires et alternants de qualité, coordination avec l\'établissement',
    expectations: 'Suivi rigoureux des stages, conventions claires, étudiants autonomes',
    influence_level: 'moyen', interest_level: 'fort' },
  { group: 'economique', category: 'externe', name: 'Agences d\'emploi & cabinets RH',
    needs: 'Diplômés qualifiés à placer, partenariats de placement',
    expectations: 'Profils adaptés aux offres, base de données diplômés actualisée',
    influence_level: 'moyen', interest_level: 'moyen' },
  { group: 'economique', category: 'externe', name: 'Banques et organismes de financement',
    needs: 'Viabilité financière, remboursement des engagements',
    expectations: 'Transparence financière, bonne santé économique de l\'école',
    influence_level: 'moyen', interest_level: 'faible' },
  { group: 'economique', category: 'externe', name: 'Fournisseurs (matériel, services)',
    needs: 'Paiements dans les délais, renouvellement des contrats',
    expectations: 'Relation commerciale stable, commandes régulières',
    influence_level: 'faible', interest_level: 'faible' },

  // ── Territoire & Société
  { group: 'territoire', category: 'externe', name: 'Collectivités locales & Région',
    needs: 'Développement territorial, création d\'emplois, attractivité de la région',
    expectations: 'Contribution à l\'économie locale, partenariats, visibilité',
    influence_level: 'moyen', interest_level: 'moyen' },
  { group: 'territoire', category: 'externe', name: 'Communauté locale',
    needs: 'Impact social positif, retombées économiques locales',
    expectations: 'Citoyenneté corporate, événements ouverts, emplois locaux',
    influence_level: 'faible', interest_level: 'moyen' },
  { group: 'territoire', category: 'externe', name: 'Médias locaux & régionaux',
    needs: 'Information sur les activités de l\'établissement',
    expectations: 'Transparence, événements médiatisables, réussite des diplômés',
    influence_level: 'moyen', interest_level: 'faible' },
  { group: 'territoire', category: 'externe', name: 'ONG et associations',
    needs: 'RSE, inclusivité, accès à l\'éducation pour les publics défavorisés',
    expectations: 'Bourses, actions sociales, rapports d\'impact',
    influence_level: 'faible', interest_level: 'moyen' },
  { group: 'territoire', category: 'externe', name: 'Ambassades et Consulats',
    needs: 'Reconnaissance des diplômes, mobilité internationale des étudiants',
    expectations: 'Diplômes accrédités, programmes d\'échange, suivi des étudiants étrangers',
    influence_level: 'faible', interest_level: 'faible' },
]
