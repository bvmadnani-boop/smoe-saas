# VIZIA — Manuel Fonctionnel
**Version** : 1.0 | **Date** : Avril 2026  
**Destinataire** : CTO, Directeurs, Utilisateurs clés  
**Plateforme** : https://[votre-domaine].vercel.app

---

## 1. Prise en Main

### 1.1 Connexion
1. Accéder à la page d'accueil VIZIA
2. Cliquer sur **"Connexion"** ou naviguer vers `/login`
3. Saisir email + mot de passe
4. Redirection automatique :
   - **Super Admin** → `/admin` (gestion plateforme)
   - **Utilisateur org** → `/org/{orgId}` (tableau de bord organisation)

### 1.2 Navigation principale
La sidebar gauche présente les 7 processus ISO 21001 + 2 modules transverses :

| Icône | Module | Norme |
|-------|--------|-------|
| 🎯 | P1 — Management | ISO 21001 §4-6 |
| 🎓 | P2 — Conception | ISO 21001 §8.3 |
| 👤 | P3 — Inscription | ISO 21001 §8.2 |
| 📚 | P4 — Scolarité | ISO 21001 §8.4 |
| 🏆 | P5 — Diplomation | ISO 21001 §8.5 |
| ✅ | P6 — Qualité | ISO 21001 §9-10 |
| 🔧 | P7 — Support | ISO 21001 §7 |
| 💼 | Career Centre | — |
| 🚀 | Incubateur | — |

---

## 2. Tableau de Bord Organisation

**Route** : `/org/{orgId}`

### KPIs affichés
- **Étudiants actifs** : nombre d'étudiants avec statut `actif`
- **Formations valides** : programmes avec statut `valide`
- **Référentiels actifs** : référentiels de compétences activés
- **NC ouvertes** : non-conformités non clôturées
- **Projets incubés** : projets en cours d'incubation

### Grille des processus
Accès rapide à chaque module via cartes cliquables. Les cartes en alerte affichent un badge rouge/orange selon les données critiques.

---

## 3. P1 — Management Stratégique

### 3.1 Contexte organisationnel (`/management/contexte`)

#### Onglet SWOT
- 4 quadrants : **Forces** (vert), **Faiblesses** (rouge), **Opportunités** (bleu), **Menaces** (orange)
- Ajouter un item : formulaire en bas de chaque quadrant
- Désactiver : toggle sur chaque item (reste visible, grisé)
- **Seeder** : bouton "Initialiser SWOT" charge des données préconfigurées pour établissements éducatifs marocains

#### Onglet PESTEL
- 6 dimensions : Politique / Économique / Social / Technologique / Environnemental / Légal
- Chaque item : contenu + niveau d'impact (faible/moyen/fort)
- **Seeder** : données PESTEL ESB marocain préconfigurées

#### Onglet Parties intéressées
- Groupes clés : étudiants, parents, employeurs, État, enseignants, partenaires
- Pour chaque partie : besoins + attentes documentés

### 3.2 Gestion des risques (`/management/risques`)
- **Matrice 5×5** (probabilité × impact) — visualisation colorée (vert → rouge)
- Ajouter un risque : titre, catégorie, type (risque/opportunité), probabilité (1-5), impact (1-5)
- Score calculé automatiquement = probabilité × impact
- Traitements : Accepter / Réduire / Transférer / Éviter / Exploiter / Partager
- **Seeder** : 15 risques types ISO 21001 préconfigurés

### 3.3 Politiques qualité (`/management/politique`)
- Liste des politiques avec statut (brouillon/actif/archivé)
- Éditeur riche : contenu libre + versioning + approbation
- **5 templates disponibles** : Standard SUP2I, Insertion professionnelle, Pédagogie, RH, Développement continu

---

## 4. P2 — Conception des Offres de Formation

### 4.1 Catalogue formations (`/conception/formations`)
**Statuts** : Brouillon → En validation → Valide → Archivé

Créer une formation :
1. Cliquer **"+ Nouvelle formation"**
2. Renseigner : code, titre, modalité (présentiel/hybride/distance), durée totale heures
3. Associer un référentiel de compétences
4. Sélectionner une filière

### 4.2 Plan pédagogique (`/conception/formations/{id}/plan`)
- **Modules** : créer des blocs thématiques (cours magistral, TD, projet, stage, séminaire)
- **Séances** : détail par module (objectif pédagogique, méthode, durée, enseignant)
- Volume horaire calculé automatiquement

### 4.3 Évaluations (`/conception/formations/{id}/evaluations`)
- Types : Examen, Contrôle continu, Projet, Soutenance, TP, Quiz
- Coefficient par évaluation (total vérifié)
- Critères d'évaluation documentés

### 4.4 Revue de conception (`/conception/formations/{id}/revue`)
Workflow multi-étapes conforme ISO 21001 §8.3.4 :
1. Responsable pédagogique
2. Directeur des études
3. Partenaires professionnels
4. Accréditation/Conformité

Chaque étape : checklist + commentaire + reviewer + statut (en attente/validé/rejeté)

### 4.5 Référentiels de compétences (`/conception/referentiels`)
- Créer un référentiel : code + titre + source (CNCPST/RNCP/maison)
- Ajouter des compétences : code, bloc, titre, niveau Bloom (1-6)
- **Seeder** : template SUP2I préconfigurée avec 12 compétences

---

## 5. P3 — Inscription & Accueil Étudiants

### 5.1 Dossiers étudiants (`/inscription`)
- Recherche par nom/code étudiant
- Filtres par statut, filière, année académique
- Vue synthétique : avatar initiales, filière, statut coloré

### 5.2 Créer un dossier étudiant (`/inscription/new`)
Informations obligatoires : nom complet, code étudiant, filière, année académique  
Optionnel : email, téléphone, date de naissance

### 5.3 Fiche étudiant (`/inscription/{studentId}`)
- **Données personnelles** : modification inline
- **Statut** : workflow visuel `inscrit → actif → diplômé` (boutons de transition)
- **Documents** : upload (CNI, baccalauréat, photos, formulaire inscription...) vers Supabase Storage
- Vérification documentaire : cocher chaque document vérifié

---

## 6. P4 — Scolarité & Suivi Pédagogique

### 6.1 Enseignants (`/scolarite/enseignants`)
- Liste avec statut validation SUP2I (badge vert/rouge)
- Type de contrat : permanent, vacataire, contractuel, prestataire
- Ajouter enseignant : nom, email, type contrat, validation SUP2I

### 6.2 Cours (`/scolarite/cours`)
- Associés à une formation et une filière
- Code cours + intitulé

### 6.3 Notes (`/scolarite/notes`)
- Saisie : étudiant + cours + note (sur 20 ou autre barème)
- Historique des notes par étudiant

### 6.4 Présences (`/scolarite/presences`)
- Feuille de présence par cours et date
- Présent/absent par étudiant

### 6.5 Emploi du temps (`/scolarite/emploi-du-temps`)
- Créneaux : cours + enseignant + jour + heure + salle
- Vue hebdomadaire

---

## 7. P5 — Diplomation & Projets de Fin d'Études

### 7.1 PFE (`/diplomation/pfe`)
Créer un PFE :
- Titre, étudiant (sélection), superviseur, entreprise d'accueil
- Statut : En cours → Soutenu → Validé → Archivé
- Note jury (sur 20)

### 7.2 Diplômes (`/diplomation/diplomes`)
- Enregistrer la diplomation : étudiant, promotion, filière
- Statut : En attente → Émis → Archivé
- Impression prévue en phase 2

---

## 8. P6 — Qualité & Amélioration Continue

### 8.1 Non-conformités (`/qualite/non-conformites`)

#### Créer une NC
1. Titre + description de l'observation
2. Catégorie : Pédagogique / RH / Financier / Infrastructure / Administratif / Étudiant
3. Sévérité : Mineure / Majeure / Bloquante
4. Date de détection + délai OCAP

#### Cycle OCAP
| Étape | Contenu |
|-------|---------|
| **O**bservation | Description factuelle du problème constaté |
| **C**ause | Analyse des causes racines (5 pourquoi, Ishikawa) |
| **A**ction | Plan d'action corrective (responsable, délai) |
| **P**reuve | Evidence de la mise en œuvre et de l'efficacité |

Statuts : Ouverte → En cours → Clôturée

### 8.2 Audits internes (`/qualite/audits`)
- Programme trimestriel par processus
- Créer un audit : processus, trimestre, date, auditeur, périmètre
- **Constatations** par type :
  - ✅ Conforme
  - ❌ Non-conforme (génère une NC automatiquement)
  - ⚠ Observation
  - 💡 Opportunité d'amélioration

### 8.3 Revue de direction (`/qualite/revue`)
Document formel compilant automatiquement :
- État des NC (ouvertes, clôturées, efficacité)
- Résultats audits
- Risques actifs et évolutions
- SWOT/PESTEL (synthèse)
- Indicateurs satisfaction
- Actions d'amélioration en cours

Créer une revue → formulaire → document généré → statut : Planifié / En cours / Finalisé / Approuvé

### 8.4 Réclamations (`/qualite/reclamations`)
- Source : étudiant, parent, entreprise, autorité
- Gravité : Faible / Moyenne / Élevée
- Suivi : Reçue → En traitement → Résolue → Archivée

### 8.5 Enquêtes de satisfaction (`/qualite/satisfaction`)
- Créer une enquête : titre, type (étudiants/employeurs/enseignants)
- Saisir les résultats : notes par critère
- Score moyen calculé automatiquement
- Suivi évolution dans le temps

### 8.6 Amélioration continue (`/qualite/ameliorations`)
- Sources linkées : NC / Risque / Audit / Réclamation / SWOT
- Priorité : Critique / Haute / Moyenne / Faible
- Statut : Identifiée → En cours → Réalisée
- Vérification d'efficacité : checkbox après délai de vérification
- Sync automatique depuis NC, risques, audits (bouton "Synchroniser")

---

## 9. P7 — Support

### 9.1 Ressources Humaines (`/support/rh`)

#### Organigramme 3 niveaux
- **N1** : Direction (DG, etc.)
- **N2** : Responsables (pédagogie, finances, qualité...)
- **N3** : Chargés & Agents

#### Seeder ANEAQ (initialisation rapide)
Pour les établissements qui démarrent, cliquer **"Initialiser avec modèle ANEAQ"** :
- Crée automatiquement 11 postes sur 3 niveaux
- Génère les fiches de fonction complètes pour chaque poste
- Données préconfigurées selon le référentiel ANEAQ

#### Fiche de poste (`/support/rh/poste/{id}`)
Chaque fiche contient (ISO 21001 §7.1.2 / §7.2) :
- Description du rôle
- Missions principales
- Responsabilités
- Tâches spécifiques
- Exigences diplôme
- Exigences expérience
- Personnel affecté au poste

#### Affecter du personnel
Dans la fiche poste → section "Personnel" → ajouter un agent :
- Nom, email, type contrat (CDI/CDD/vacataire/prestataire)
- Date d'embauche
- Sensibilisation ISO 21001 : checkbox

### 9.2 Infrastructure (`/support/infrastructure`)
- Catégories : Informatique, Mobilier, Audiovisuel, Véhicule, Autre
- Statuts : Actif / En maintenance / Hors service
- Prochaine maintenance : alerte visuelle si date dépassée

### 9.3 Documents (`/support/documents`)
- Types : Procédure, Instruction, Formulaire, Charte, Rapport, Politique, Manuel, Contrat
- Versioning : v1.0, v1.1, etc.
- Statuts : Actif / En révision / Archivé
- Date de revue périodique avec alerte

### 9.4 Communication (`/support/communication`)
- Canaux internes : réunions, emails, intranet, panneau affichage...
- Fréquence et responsable documentés

---

## 10. Career Centre (`/career-centre`)

### 10.1 Dashboard Career Centre
KPIs : profils créés, ateliers planifiés, offres actives, entreprises partenaires, événements à venir

### 10.2 Profils étudiants (`/career-centre/profils`)
- Score employabilité (0-100) par étudiant
- Niveau : Débutant / Intermédiaire / Avancé / Expert
- Date d'insertion professionnelle (quand disponible)
- Nombre de sessions mentoring suivies

### 10.3 Ateliers (`/career-centre/ateliers`)
Types disponibles : CV, Lettre de motivation, Simulation entretien, Soft Skills, LinkedIn, Réseautage, Orientation, Veille métier  
Statuts : Planifiée → En cours → Archivée

### 10.4 Entreprises partenaires (`/career-centre/entreprises`)
- Fiche entreprise : secteur, taille, contact RH, convention (oui/non)
- Suivi des placements par entreprise

### 10.5 Offres (`/career-centre/offres`)
- Types : CDI, CDD, Stage, Alternance, Freelance, Bénévolat
- Associées à une entreprise + filière cible
- Date limite candidature + rémunération

### 10.6 Événements (`/career-centre/evenements`)
- Salons, Forums emploi, Conférences, Networking, Ateliers collectifs
- Capacité (nb places), lieu, statut

### 10.7 Mentoring (`/career-centre/mentoring`)
- Session mentor-étudiant : durée, thème, statut
- Thèmes : Orientation, Stratégie de carrière, Compétences techniques, Entrepreneuriat, Réseau

---

## 11. Incubateur de Startups (`/incubateur`)

### 11.1 Dashboard Incubateur
- **Pipeline par stade** : nombre de projets à chaque étape
- Pitchs planifiés / réalisés
- Financements obtenus (total MAD)

### 11.2 Créer un projet (`/incubateur/projets/new`)
Informations de base : nom du projet, secteur d'activité, description, site web

### 11.3 Fiche projet (`/incubateur/projets/{id}`)

#### Score de maturité
5 critères, chacun vaut 20 points (total 100%) :

| Critère | Description |
|---------|-------------|
| Business Model | Le modèle économique est défini et documenté |
| Prototype | Un prototype ou maquette fonctionnel existe |
| 1er Client | Au moins un client ou bêta-testeur validé |
| Financement | Un financement a été obtenu (subvention, love money, etc.) |
| Équipe | L'équipe fondatrice est complète |

**Cliquer sur un critère** pour le cocher/décocher → score mis à jour automatiquement.

#### Pipeline de stades
Progression du projet sur 5 étapes :
```
🌱 Idéation → 🔍 Validation → 🔧 Prototypage → 🚀 MVP → ✅ Lancé
```
**Cliquer sur un stade** pour déplacer le projet. Bouton "Abandonner" en cas d'arrêt.

#### Équipe fondatrice
Ajouter les porteurs de projet : nom, email, rôle (Co-fondateur, CEO, CTO, CMO, COO, Business Dev, Technique, Commercial)

#### Sessions d'accompagnement
Pour chaque session de coaching :
- Expert/Coach + titre
- Thème : Business Model, Pitch, Marketing, Tech, Finance, Legal, Opérations, Stratégie, Réseau
- Date, durée, compte-rendu, actions suivantes

#### Pitchs
Types : Interne, Concours, Investisseurs, Présentation client, Demo Day  
Statuts : Planifié → Réalisé → Annulé  
Note obtenue / note max

#### Financements
Types de financement disponibles :
- Fonds propres / Love money
- Subvention publique (CCG, Innov Invest, MAROC PME)
- Amorçage / Business Angels
- Prêt bancaire / Crowdfunding

Statuts : Identifié → Candidaté → Obtenu → Refusé

#### Jalons & Roadmap
- Créer des étapes clés avec date d'échéance
- Statuts : À faire / En cours / Validé
- Barre de progression globale
- Alertes automatiques : jalons en retard affichés en rouge

### 11.4 Assistant IA — VIZIA Assistant

**Localisation** : Panel latéral droit de la fiche projet (s'affiche sur écrans ≥ 1024px)

#### Brief contextuel (automatique, sans IA)
Le panel affiche immédiatement :
- **Priorités du stade actuel** (3 actions recommandées selon Idéation/MVP/etc.)
- **Critères manquants** (liste des critères non cochés)
- **Jalons en retard** (alerte rouge si délais dépassés)

#### Chat IA (Gemini 2.0 Flash)
Poser des questions libres sur :
- Stratégie et priorités
- Préparation du pitch
- Sources de financement marocaines
- Rédaction (email, pitch deck, business plan)
- Analyse de marché
- Aspects juridiques (SARL, OMPIC, RC...)

**Suggestions rapides** : 3 boutons prédéfinis pour démarrer rapidement :
- "Que dois-je faire en priorité ?"
- "Comment préparer mon pitch ?"
- "Quels financements au Maroc ?"

> ⚠️ **Prérequis** : La clé `GOOGLE_GENERATIVE_AI_API_KEY` doit être configurée dans Vercel pour activer le chat IA. Le brief statique fonctionne sans clé.

---

## 12. Administration Plateforme (Super Admin uniquement)

### 12.1 Dashboard Admin (`/admin`)
- Total organisations actives
- Total étudiants toutes organisations
- Total utilisateurs
- NC ouvertes (toutes orgs)
- Tableau des 10 dernières organisations créées

### 12.2 Gestion des organisations (`/admin/organisations`)
- Liste toutes les organisations
- Créer une organisation : nom, ville, code
- Fiche organisation : stats, utilisateurs actifs

### 12.3 Créer une organisation (`/admin/organisations/new`)
1. Renseigner nom + code (ex: SUP2I-MKC) + ville
2. L'organisation est créée avec `is_active: true`
3. Créer ensuite les utilisateurs via Supabase Auth + `user_profiles`

---

## 13. Bonnes Pratiques d'Utilisation

### Pour la conformité ISO 21001
1. **Renseigner le SWOT et PESTEL** dès l'onboarding (utiliser les seeders)
2. **Créer les risques** au minimum 5 (utiliser le seeder risques)
3. **Toute NC ouverte** doit avoir un responsable et une deadline OCAP
4. **Revue de direction** : minimum 2 fois par an (générée depuis la plateforme)
5. **Fiches de fonction** : 100% des postes doivent avoir une fiche (indicateur "Sans fiche" sur dashboard RH)

### Pour l'incubateur
1. Maintenir le **score de maturité à jour** à chaque session de coaching
2. **Documenter chaque session** : compte-rendu + actions suivantes
3. **Créer des jalons** avec dates précises → alertes automatiques
4. Utiliser l'**assistant IA** pour préparer les pitchs et identifier les financements

### Pour le career centre
1. Créer les **profils étudiants** dès la 2e année
2. Lier les **offres aux filières** pour un ciblage précis
3. Documenter les **insertions professionnelles** pour les indicateurs d'employabilité

---

## 14. FAQ Utilisateurs

**Q : Le panel IA n'apparaît pas sur la fiche projet ?**  
R : Il s'affiche uniquement sur les écrans ≥ 1024px. Sur mobile, il apparaît en bas de la page.

**Q : Le chat IA ne répond pas ?**  
R : Vérifier que la clé `GOOGLE_GENERATIVE_AI_API_KEY` est configurée dans les variables d'environnement Vercel.

**Q : Comment créer un utilisateur pour une organisation ?**  
R : Via Supabase Dashboard → Authentication → Users → Inviter l'utilisateur → Puis créer manuellement la ligne dans `user_profiles` avec `role` et `organization_id`.

**Q : Comment exporter les données ?**  
R : Export natif disponible en Phase 2. En attendant, utiliser Supabase Dashboard → Table Editor → Export CSV.

**Q : Puis-je avoir plusieurs organisations sur le même compte ?**  
R : Oui, un `super_admin` peut accéder à toutes les organisations. Un utilisateur standard est lié à une seule organisation.

---

*Document propriétaire — Proximity Management SARL — SUP2I © 2026*
