export type NcCategory =
  | 'p3_admin'
  | 'p4_pedagogique'
  | 'p5_diplomation'
  | 'sup2i'
  | 'satisfaction'
  | 'infrastructure'
  | 'autre'

export type NcTemplate = {
  label:     string
  color:     string
  badgeCls:  string
  subtypes:  Array<{
    key:              string
    label:            string
    defaultTitle:     string
    defaultSeverity:  'majeure' | 'mineure' | 'observation'
    ocap_containment: string
    ocap_cause:       string
    ocap_plan:        string
  }>
}

export const NC_CATEGORY_META: Record<NcCategory, { label: string; color: string; badgeCls: string }> = {
  p3_admin:        { label: 'P3 — Administratif',  color: 'bg-amber-50',   badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
  p4_pedagogique:  { label: 'P4 — Pédagogique',    color: 'bg-blue-50',    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200' },
  p5_diplomation:  { label: 'P5 — Diplomation',    color: 'bg-violet-50',  badgeCls: 'bg-violet-50 text-violet-700 border-violet-200' },
  sup2i:           { label: 'SUP2I — Réseau',       color: 'bg-red-50',     badgeCls: 'bg-red-50 text-red-700 border-red-200' },
  satisfaction:    { label: 'Satisfaction',         color: 'bg-emerald-50', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  infrastructure:  { label: 'Infrastructure',       color: 'bg-slate-50',   badgeCls: 'bg-slate-100 text-slate-600 border-slate-200' },
  autre:           { label: 'Autre',                color: 'bg-slate-50',   badgeCls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

export const NC_OCAP_TEMPLATES: Record<NcCategory, NcTemplate['subtypes']> = {
  p4_pedagogique: [
    {
      key: 'absenteisme_enseignant',
      label: 'Absentéisme enseignant non remplacé',
      defaultTitle: 'Séances non assurées sans remplacement dans les 48h',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Contacter immédiatement le coordinateur pédagogique.\nOrganiser le remplacement sous 48h.\nPlanifier la récupération des séances manquées sous 7 jours.',
      ocap_cause:
        'Conduire un entretien avec le responsable pédagogique.\nIdentifier la cause : problème de santé / conflit de planning / démotivation / force majeure.',
      ocap_plan:
        'Constituer un pool d\'enseignants remplaçants préidentifiés.\nIntégrer une clause de remplacement dans le contrat enseignant.\nMettre en place une alerte automatique dès J+1 d\'absence non justifiée.',
    },
    {
      key: 'notes_hors_delai',
      label: 'Notes non saisies dans les délais',
      defaultTitle: 'Notes non disponibles dans le système J+15 après évaluation',
      defaultSeverity: 'mineure',
      ocap_containment:
        'Alerte système déclenchée automatiquement à J+15.\nRelance formelle de l\'enseignant avec délai de grâce 48h.',
      ocap_cause:
        'Analyser la cause : surcharge de travail / oubli / problème d\'accès système / absence prolongée.',
      ocap_plan:
        'Activer des rappels automatiques à J+7 et J+14 post-évaluation.\nBlocker la publication des résultats si des notes sont manquantes.\nFormer les enseignants à la saisie numérique.',
    },
    {
      key: 'syllabus_non_respecte',
      label: 'Syllabus non respecté (< 80% couverture)',
      defaultTitle: 'Contenu enseigné couvrant moins de 80% du programme validé',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Organiser des séances de rattrapage obligatoires avant les examens.\nInformer les étudiants des chapitres non couverts.',
      ocap_cause:
        'Comparer le syllabus prévu vs réalisé.\nIdentifier : volumétrie sous-estimée / programme inadapté / compétence insuffisante de l\'enseignant.',
      ocap_plan:
        'Réviser les syllabi avec les enseignants concernés.\nOrganiser une séance de calibration semestrielle.\nMettre en place un suivi de couverture mensuel par le coordinateur.',
    },
  ],

  p3_admin: [
    {
      key: 'dossier_incomplet',
      label: 'Dossier étudiant incomplet J+30',
      defaultTitle: 'Pièces manquantes non régularisées 30 jours après inscription',
      defaultSeverity: 'mineure',
      ocap_containment:
        'Notifier formellement l\'étudiant par écrit.\nBlocker l\'accès aux examens si non régularisé à J+60.',
      ocap_cause:
        'Identifier la raison : document en cours d\'obtention / négligence / fraude potentielle.\nVérifier si le problème est systémique (type de document souvent manquant).',
      ocap_plan:
        'Rendre la checklist documentaire obligatoire à la pré-inscription.\nMettre en place des relances automatiques à J+7, J+15 et J+30.\nBloquer le statut "actif" tant que le dossier n\'est pas complet.',
    },
    {
      key: 'contrat_non_signe',
      label: 'Contrat de formation non signé',
      defaultTitle: 'Étudiant actif sans contrat de formation signé dans le système',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Convoquer l\'étudiant pour signature immédiate.\nObtenir la signature sous 5 jours ouvrés.',
      ocap_cause:
        'Vérifier si le processus d\'admission n\'a pas été finalisé correctement.\nIdentifier s\'il s\'agit d\'un oubli administratif ou d\'un refus implicite.',
      ocap_plan:
        'Bloquer le passage au statut "actif" tant que le contrat n\'est pas uploadé et signé.\nAjouter une vérification automatique lors de chaque changement de statut étudiant.',
    },
  ],

  p5_diplomation: [
    {
      key: 'pfe_hors_delai',
      label: 'PFE non soutenu dans les délais réglementaires',
      defaultTitle: 'Soutenance PFE non tenue dans la fenêtre SUP2I définie',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Déclencher une alerte J-30 avant la deadline de soutenance.\nConvoquer l\'étudiant et l\'encadrant pour fixer une date de rattrapage immédiate.',
      ocap_cause:
        'Analyser la cause : rapport non finalisé / problème avec l\'entreprise d\'accueil / abandon / indisponibilité du jury.',
      ocap_plan:
        'Imposer des jalons PFE intermédiaires obligatoires (remise brouillon rapport J-45).\nActiver une alerte automatique pour l\'encadrant si aucune activité détectée J-60.\nRéviser la fenêtre de soutenance si les délais SUP2I sont inadaptés.',
    },
    {
      key: 'diplome_hors_delai',
      label: 'Diplôme non émis dans les 90 jours post-validation',
      defaultTitle: 'Délai entre validation jury et émission diplôme supérieur à 90 jours',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Déclencher une alerte automatique J+90 post-soutenance validée.\nEscalader au responsable diplomation et informer l\'étudiant.',
      ocap_cause:
        'Identifier le blocage : approbation SUP2I en attente / erreur administrative / délai impression.',
      ocap_plan:
        'Automatiser le workflow statut diplôme avec des SLA par étape :\n• pending → sup2i_approved : 15 jours\n• approved → issued : 30 jours\n• issued → delivered : 15 jours\nEnvoyer des alertes automatiques à chaque dépassement de SLA.',
    },
  ],

  sup2i: [
    {
      key: 'enseignant_non_valide',
      label: 'Enseignant non validé SUP2I assurant des cours',
      defaultTitle: 'Enseignant avec statut sup2i_validated=false actif dans l\'emploi du temps',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Suspendre immédiatement les séances concernées.\nOrganiser un remplacement par un enseignant validé SUP2I.',
      ocap_cause:
        'Vérifier la cause : recrutement d\'urgence non validé / dossier de validation en cours / erreur administrative.',
      ocap_plan:
        'Bloquer l\'affectation dans l\'emploi du temps si sup2i_validated = false.\nMettre en place un processus de pré-validation SUP2I avant tout recrutement définitif.\nSuivre le statut de validation de tous les enseignants depuis le tableau de bord.',
    },
    {
      key: 'taux_encadrement_pfe',
      label: 'Taux d\'encadrement PFE non conforme',
      defaultTitle: 'Ratio étudiants/encadrant interne supérieur au seuil SUP2I',
      defaultSeverity: 'majeure',
      ocap_containment:
        'Déclencher une alerte au responsable pédagogique.\nRedistribuer les PFE entre les encadrants disponibles.',
      ocap_cause:
        'Analyser la cause : départ d\'enseignant / sous-effectif du corps professoral / surcharge d\'un encadrant.',
      ocap_plan:
        'Imposer un plafond automatique dans le formulaire d\'affectation PFE.\nDéfinir le ratio maximum dans les paramètres de l\'organisation.\nPrévoir un plan de recrutement d\'urgence en cas de dépassement.',
    },
  ],

  satisfaction: [
    {
      key: 'reclamation_non_traitee',
      label: 'Réclamation étudiant non traitée J+10',
      defaultTitle: 'Réclamation déposée sans réponse formelle après 10 jours ouvrés',
      defaultSeverity: 'mineure',
      ocap_containment:
        'Envoyer un accusé de réception à l\'étudiant sous J+2.\nForcer une réponse formelle sous J+10.',
      ocap_cause:
        'Identifier le type de réclamation : pédagogique / administrative / relationnelle.\nVérifier si c\'est un problème de processus ou de responsable.',
      ocap_plan:
        'Mettre en place un workflow réclamations avec SLA intégré.\nActiver une escalade automatique vers le responsable qualité si SLA dépassé.\nPublier un rapport mensuel des réclamations traitées/en attente.',
    },
    {
      key: 'satisfaction_faible',
      label: 'Taux de satisfaction inférieur à 70%',
      defaultTitle: 'Score satisfaction apprenants (enquête semestrielle) < 70%',
      defaultSeverity: 'mineure',
      ocap_containment:
        'Analyser les verbatims de l\'enquête.\nOrganiser une réunion d\'équipe pédagogique sous 15 jours.',
      ocap_cause:
        'Identifier les axes de mécontentement : qualité des cours / organisation administrative / infrastructures / vie étudiante.',
      ocap_plan:
        'Formaliser un plan d\'amélioration avec objectifs mesurables par axe.\nRéaliser un suivi à mi-semestre suivant.\nComparer l\'évolution N vs N-1.',
    },
  ],

  infrastructure: [
    {
      key: 'salle_non_conforme',
      label: 'Salle non conforme aux standards',
      defaultTitle: 'Salle de cours ne respectant pas les standards d\'équipement ou de capacité',
      defaultSeverity: 'observation',
      ocap_containment:
        'Réaffecter les cours vers des salles conformes.\nInformer les étudiants et enseignants concernés.',
      ocap_cause:
        'Évaluer : équipement défaillant / sureffectif / problème de maintenance.',
      ocap_plan:
        'Planifier une intervention de maintenance sous 30 jours.\nMaintenir un registre d\'état des salles mis à jour semestriellement.',
    },
  ],

  autre: [],
}

export const NC_SEVERITY_META = {
  majeure:     { label: 'Majeure',     cls: 'bg-red-50 text-red-700 border-red-200' },
  mineure:     { label: 'Mineure',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  observation: { label: 'Observation', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
}

export const NC_STATUS_META = {
  ouverte:   { label: 'Ouverte',   cls: 'bg-red-50 text-red-600' },
  en_cours:  { label: 'En cours',  cls: 'bg-amber-50 text-amber-600' },
  cloturee:  { label: 'Clôturée', cls: 'bg-emerald-50 text-emerald-600' },
  rejetee:   { label: 'Rejetée',  cls: 'bg-slate-100 text-slate-500' },
}
