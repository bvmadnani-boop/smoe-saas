export type PolicyTemplate = {
  key:         string
  label:       string
  desc:        string
  icon:        string
  title:       string
  content:     string
}

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    key:   'standard_sup2i',
    label: 'Standard SUP2I',
    desc:  'Politique généraliste, conforme ISO 21001, adaptée à tout établissement du réseau',
    icon:  '🏛️',
    title: 'Politique Qualité — [NOM ÉTABLISSEMENT]',
    content: `[NOM ÉTABLISSEMENT], membre du réseau SUP2I et opéré par Proximity Management, est un organisme d'enseignement supérieur privé engagé dans l'excellence pédagogique et l'insertion professionnelle de ses apprenants.

Dans le cadre de notre Système de Management des Organismes d'Enseignement (SMOE), conforme à la norme ISO 21001:2018, la Direction s'engage à mettre en œuvre et à améliorer continuellement une politique qualité fondée sur les axes suivants :

1. SATISFACTION DES APPRENANTS ET DES PARTIES INTÉRESSÉES
Nous nous engageons à identifier, comprendre et satisfaire les besoins et attentes de nos apprenants, de leurs familles, des employeurs, du réseau SUP2I et de toutes nos parties intéressées pertinentes.

2. CONFORMITÉ AUX EXIGENCES APPLICABLES
Nous respectons les exigences réglementaires du Ministère de l'Enseignement National, les standards du réseau SUP2I, et les cahiers des charges des organismes d'accréditation. Nos programmes sont régulièrement mis à jour pour rester alignés sur les besoins du marché.

3. QUALITÉ PÉDAGOGIQUE ET PROFESSIONNALISATION
Nous garantissons des formations professionnalisantes dispensées par un corps enseignant qualifié et validé SUP2I, s'appuyant sur des méthodes pédagogiques innovantes et des partenariats actifs avec les entreprises.

4. DÉVELOPPEMENT DES COMPÉTENCES
Nous investissons dans le développement professionnel continu de notre personnel enseignant et administratif, condition essentielle de la qualité de nos prestations.

5. AMÉLIORATION CONTINUE
Nous mesurons régulièrement nos performances à travers des indicateurs définis, traitons les non-conformités avec rigueur, et mettons en œuvre des actions correctives et préventives pour progresser en permanence.

6. INSERTION PROFESSIONNELLE
Nous nous fixons comme objectif prioritaire l'insertion professionnelle de nos diplômés, à travers des partenariats entreprises, un Career Centre actif et un suivi post-diplôme structuré.

La présente politique qualité est communiquée à l'ensemble du personnel, affichée dans les locaux et accessible à toutes les parties intéressées. Elle est revue annuellement lors de la Revue de Direction et révisée à chaque changement de contexte significatif.

Fait à [VILLE], le [DATE]

[NOM DU DIRECTEUR]
Directeur(trice) de [NOM ÉTABLISSEMENT]`,
  },

  {
    key:   'insertion_pro',
    label: 'Orientée Insertion Professionnelle',
    desc:  'Accent sur l\'employabilité, les partenariats entreprises et le taux d\'insertion',
    icon:  '💼',
    title: 'Politique Qualité — Orientation Employabilité',
    content: `[NOM ÉTABLISSEMENT] place l'employabilité de ses diplômés au cœur de sa stratégie qualité. Notre mission est de former des professionnels compétents, opérationnels et reconnus par le marché de l'emploi national et régional.

NOTRE ENGAGEMENT QUALITÉ POUR L'INSERTION PROFESSIONNELLE

1. ADÉQUATION FORMATION-EMPLOI
Nos programmes sont co-construits avec les employeurs partenaires et révisés annuellement sur la base des retours du marché. Nous garantissons un taux d'insertion professionnelle de nos diplômés supérieur à [OBJECTIF]% dans les 6 mois suivant l'obtention du diplôme.

2. PARTENARIATS ENTREPRISES ACTIFS
Nous développons et maintenons un réseau de [NOMBRE] entreprises partenaires pour les stages, l'alternance et le recrutement. Chaque apprenant bénéficie d'au moins [DURÉE] de stage en entreprise au cours de sa formation.

3. COMPÉTENCES TRANSVERSALES
Au-delà des compétences techniques, nous formons nos apprenants aux soft skills : communication, leadership, gestion de projet, langues, entrepreneuriat — compétences essentielles à leur réussite professionnelle.

4. CAREER CENTRE
Notre Career Centre accompagne chaque apprenant depuis son orientation jusqu'à l'obtention de son premier emploi, à travers des ateliers CV, des simulations d'entretien et des rencontres avec les recruteurs.

5. SUIVI ALUMNI
Nous maintenons un lien avec nos diplômés pour mesurer leur trajectoire professionnelle, enrichir notre réseau et adapter continuellement nos formations aux évolutions du marché.

6. AMÉLIORATION CONTINUE
Nous pilotons notre performance par des indicateurs mesurables : taux d'emploi, satisfaction employeurs, adéquation profil/poste. Toute non-conformité fait l'objet d'un plan d'action correctif structuré.

Cette politique est révisée annuellement en Revue de Direction, en intégrant les retours des employeurs, des alumni et des apprenants en cours de formation.

[NOM DU DIRECTEUR] — [NOM ÉTABLISSEMENT] — [DATE]`,
  },

  {
    key:   'excellence_academique',
    label: 'Excellence Académique',
    desc:  'Accent sur la rigueur pédagogique, la recherche appliquée et la qualité des enseignements',
    icon:  '🎓',
    title: 'Politique Qualité — Excellence Académique',
    content: `[NOM ÉTABLISSEMENT] s'engage dans une démarche d'excellence académique, fondée sur la rigueur scientifique, l'innovation pédagogique et le développement des capacités critiques et analytiques de ses apprenants.

POLITIQUE QUALITÉ — EXCELLENCE ACADÉMIQUE ET PÉDAGOGIQUE

1. QUALITÉ DES ENSEIGNEMENTS
Nous garantissons des enseignements dispensés par des professeurs qualifiés, titulaires de doctorats ou justifiant d'une expertise professionnelle reconnue dans leur domaine. Chaque syllabus est validé par le conseil pédagogique et révisé chaque année universitaire.

2. MÉTHODES PÉDAGOGIQUES INNOVANTES
Nous adoptons des approches pédagogiques actives : apprentissage par projet, études de cas, classes inversées, e-learning et blended learning. L'innovation pédagogique est encouragée et valorisée au sein de notre corps professoral.

3. ÉVALUATION RIGOUREUSE DES APPRENTISSAGES
Nos évaluations sont conçues pour mesurer réellement les compétences acquises, pas seulement les connaissances mémorisées. Nous garantissons la transparence et l'équité de toutes nos procédures d'évaluation.

4. RECHERCHE APPLIQUÉE ET PROJETS DE FIN D'ÉTUDES
Nous encourageons la culture de la recherche appliquée à travers des projets de fin d'études ambitieux, des partenariats avec des laboratoires et des publications académiques impliquant nos enseignants et nos meilleurs étudiants.

5. DÉVELOPPEMENT DU CORPS PROFESSORAL
La formation continue de nos enseignants est une priorité. Nous soutenons leur participation à des conférences, formations et séminaires académiques, et évaluons régulièrement la qualité de leurs enseignements.

6. ENVIRONNEMENT D'APPRENTISSAGE
Nous maintenons un environnement propice à l'apprentissage : bibliothèque actualisée, ressources numériques, espaces de travail collaboratif et outils technologiques adaptés.

Cette politique est diffusée à l'ensemble de la communauté académique et révisée annuellement.

[NOM DU DIRECTEUR] — [NOM ÉTABLISSEMENT] — [DATE]`,
  },

  {
    key:   'international',
    label: 'Orientée International',
    desc:  'Accent sur la mobilité, les doubles diplômes et la reconnaissance internationale',
    icon:  '🌍',
    title: 'Politique Qualité — Ouverture Internationale',
    content: `[NOM ÉTABLISSEMENT] se positionne comme un établissement d'enseignement supérieur ouvert sur le monde, engagé dans le développement de la mobilité internationale de ses apprenants et dans la construction de partenariats académiques à l'échelle mondiale.

POLITIQUE QUALITÉ — DIMENSION INTERNATIONALE

1. FORMATIONS À DIMENSION INTERNATIONALE
Nos programmes intègrent systématiquement une composante internationale : enseignement en langues étrangères, modules de droit et commerce international, études de cas multi-culturelles, et intervenants professionnels internationaux.

2. MOBILITÉ ÉTUDIANTE
Nous facilitons la mobilité internationale de nos apprenants à travers des conventions d'échange avec des universités partenaires en Europe, en Afrique et au Moyen-Orient. Notre objectif est d'offrir à [POURCENTAGE]% de nos apprenants une expérience internationale.

3. DOUBLES DIPLÔMES ET ACCRÉDITATIONS
Nous développons des accords de doubles diplômes avec des institutions académiques reconnues, permettant à nos diplômés d'obtenir des certifications à valeur internationale. Nous visons l'accréditation internationale de nos principales filières d'ici [ANNÉE].

4. MAÎTRISE DES LANGUES
La maîtrise d'au moins deux langues étrangères (dont le français et l'anglais) est une exigence de nos formations. Nous proposons des certifications linguistiques reconnues internationalement (TOEIC, DELF...).

5. RÉSEAU ALUMNI INTERNATIONAL
Nous construisons un réseau d'anciens diplômés actifs à l'international, ambassadeurs de notre établissement et vecteurs d'opportunités professionnelles pour nos apprenants.

6. CONFORMITÉ AUX STANDARDS INTERNATIONAUX
Notre SMOE, conforme à ISO 21001:2018, est notre gage de qualité reconnu à l'international. Nous nous engageons dans une amélioration continue de nos processus pour atteindre les meilleurs standards mondiaux de l'enseignement supérieur.

[NOM DU DIRECTEUR] — [NOM ÉTABLISSEMENT] — [DATE]`,
  },
]

export const POLICY_STATUS_META = {
  draft:    { label: 'Brouillon', cls: 'bg-slate-100 text-slate-500' },
  active:   { label: 'Active',    cls: 'bg-emerald-50 text-emerald-600' },
  archived: { label: 'Archivée', cls: 'bg-amber-50 text-amber-600' },
}
