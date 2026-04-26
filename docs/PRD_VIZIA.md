# VIZIA — Product Requirements Document (PRD)
**Version** : 1.0 | **Date** : Avril 2026 | **Statut** : Production  
**Propriétaire produit** : Proximity Management SARL  
**Destinataire** : Direction Technique (CTO)

---

## 1. Vision Produit

### 1.1 Résumé exécutif
VIZIA est une plateforme SaaS de management institutionnel pour les établissements d'enseignement supérieur privés. Elle digitalise intégralement le Système de Management des Organismes d'Enseignement (SMOE) conforme à la norme **ISO 21001:2018**, en couvrant les 7 processus opérationnels d'un établissement + 2 modules transverses innovants (Career Centre & Incubateur de startups).

### 1.2 Positionnement
> "Intelligence pour l'enseignement supérieur"

VIZIA s'adresse aux écoles supérieures privées marocaines et africaines qui cherchent à :
- Obtenir ou maintenir leur accréditation ISO 21001
- Digitaliser leur pilotage académique et administratif
- Valoriser leur différenciation via un incubateur et un career centre intégrés

### 1.3 Marché cible
| Segment | Description |
|---------|-------------|
| Primaire | Écoles supérieures privées — Maroc (réseau SUP2I initial) |
| Secondaire | Établissements ISO 9001/21001 Afrique subsaharienne (CIV, RDC) |
| Tertiaire | Universités privées régionales — phase expansion 2027 |

---

## 2. Utilisateurs & Rôles

### 2.1 Personas

| Rôle | Identifiant système | Accès | Responsabilités |
|------|---------------------|-------|-----------------|
| Super Admin | `super_admin` | Plateforme entière | Gestion multi-organisations, KPIs globaux |
| Directeur | `director` | Son organisation | Pilotage stratégique, revues de direction, risques |
| Administrateur qualité | `org_admin` | Son organisation | Processus qualité, NC, audits, amélioration |
| Responsable académique | `staff` | Modules académiques | Formations, scolarité, diplomation |
| Enseignant | `teacher` | Modules cours | Saisie notes, présences, PFE |
| Coach incubateur | `staff` | Module incubateur | Accompagnement projets, sessions |
| Porteur de projet | `staff` | Fiche projet + IA | Gestion startup, accès assistant IA |

### 2.2 Flux d'authentification
1. Login email/password → Supabase Auth
2. Redirect automatique : `super_admin` → `/admin`, autres → `/org/{orgId}`
3. Protection des routes par layout SSR (cookies Supabase)
4. Isolation par `organization_id` sur toutes les requêtes

---

## 3. Architecture Fonctionnelle — Modules & Processus

### 3.1 Structure ISO 21001 (P1 → P7)

```
VIZIA
├── P1 — Management stratégique
├── P2 — Conception des offres de formation
├── P3 — Inscription & accueil étudiants
├── P4 — Scolarité & suivi pédagogique
├── P5 — Diplomation & projets de fin d'études
├── P6 — Qualité & amélioration continue
├── P7 — Support (RH, Infrastructure, Documents)
├── T1 — Career Centre (transversal)
└── T2 — Incubateur de startups (transversal)
```

### 3.2 Détail par module

#### P1 — Management Stratégique
**Objectif** : Piloter la stratégie institutionnelle et la conformité ISO 21001  
**Fonctionnalités** :
- Analyse de contexte SWOT (4 quadrants, items actifs/inactifs)
- Analyse PESTEL (6 dimensions : Politique, Économique, Social, Technologique, Environnemental, Légal)
- Cartographie des parties intéressées (besoins, attentes, criticité)
- Gestion des politiques qualité (templates + éditeur riche, versioning, approbation)
- Registre des risques & opportunités (matrice 5×5, scoring probabilité × impact, traitements)
- Seeder données SWOT/PESTEL préconfigurées (contexte ESB marocain)

#### P2 — Conception des Offres de Formation
**Objectif** : Documenter et piloter le cycle de vie des programmes pédagogiques  
**Fonctionnalités** :
- Catalogue formations (statuts : brouillon → en_validation → valide → archive)
- Éditeur formation : modules, séances, volume horaire, enseignants assignés
- Plan pédagogique détaillé (modules, séances, méthodes pédagogiques)
- Gestion des évaluations (types : examen, contrôle continu, projet, soutenance — coefficients)
- Revue de conception (workflow multi-étapes, checklist ISO 21001 §8.3.x)
- Référentiels de compétences (source : CNCPST, RNCP, maison — niveaux Bloom)
- Seeder formations SUP2I préconfigurées

#### P3 — Inscription & Accueil Étudiants
**Objectif** : Gérer le cycle complet d'un dossier étudiant de l'inscription à l'archivage  
**Fonctionnalités** :
- Dossier étudiant (code, filière, année académique, statut)
- Workflow de statut : `inscrit → actif → diplômé` (ou `suspendu / inactif`)
- Upload de documents d'inscription (Supabase Storage)
- Recherche et filtres avancés (statut, filière, année)

#### P4 — Scolarité & Suivi Pédagogique
**Objectif** : Opérer le quotidien académique (cours, notes, présences, emplois du temps)  
**Fonctionnalités** :
- Gestion enseignants (validation SUP2I, types de contrat)
- Gestion des cours (par filière, formation)
- Saisie des notes (grille étudiant × cours)
- Suivi des présences (feuilles par séance)
- Emploi du temps (créneaux cours/enseignant/salle)

#### P5 — Diplomation & Projets de Fin d'Études
**Objectif** : Piloter la diplomation et les projets académiques  
**Fonctionnalités** :
- Gestion PFE (titre, encadrant, statut, score jury)
- Gestion des diplômes (promotion, filière, statut émission)
- Workflow diplomation : `pending → issued → archived`

#### P6 — Qualité & Amélioration Continue
**Objectif** : Assurer la conformité ISO 21001 et l'amélioration continue  
**Fonctionnalités clés** :
- Non-conformités (cycle OCAP : Observation → Cause → Action → Plan → Preuve)
- Catégories : pédagogique, RH, financier, infrastructures, administratif
- Sévérités : mineure / majeure / bloquante
- Programme d'audits internes (trimestriel, par processus)
- Détail audit : constatations (conforme/non-conforme/observation/opportunité)
- Revues de direction (compilation NC + risques + audits + SWOT/PESTEL)
- Réclamations clients (suivi, gravité, statut)
- Enquêtes de satisfaction (création, saisie résultats, score moyen)
- Plan d'amélioration continue (lié aux sources : NC, risques, audit, réclamation, SWOT)
- Vérification d'efficacité des actions

#### P7 — Support (RH, Infrastructure, Documents)
**Objectif** : Gérer les ressources humaines, infrastructure et documentation institutionnelle  
**Fonctionnalités** :
- Organigramme 3 niveaux (Direction / Responsables / Agents)
- Fiches de fonction (missions, responsabilités, tâches, exigences — ISO 21001 §7.1.2)
- Seeder organigramme ANEAQ (11 postes + fiches préconfigurées)
- Personnel : statut actif/inactif, type contrat (CDI/CDD/vacataire/prestataire), sensibilisation ISO
- Équipements & infrastructure (état, maintenance, localisation)
- GED documents (versioning, statut, date de revue)
- Canaux de communication interne

#### T1 — Career Centre
**Objectif** : Mesurer et améliorer l'employabilité des étudiants  
**Fonctionnalités** :
- Profils d'employabilité étudiants (score, niveau, date insertion)
- Ateliers (CV, entretien, soft skills, LinkedIn, réseautage)
- Base entreprises partenaires (convention, contacts RH, placements)
- Offres emploi/stage (CDI, CDD, stage, alternance, freelance)
- Événements (salons, forums, conférences)
- Sessions de mentoring (mentor/étudiant, thème, durée, statut)

#### T2 — Incubateur de Startups
**Objectif** : Accompagner les projets entrepreneuriaux des étudiants et alumni  
**Fonctionnalités** :
- Pipeline 5 stades : Idéation → Validation → Prototypage → MVP → Lancé
- Score de maturité (5 critères × 20% : business model, prototype, 1er client, financement, équipe)
- Équipe fondatrice (porteurs multiples, rôles)
- Sessions de coaching (expert, thème, durée, compte-rendu, actions)
- Pitchs (type, jury, score, statut)
- Financements (type : bourse/subvention/amorçage/love money/business angels/prêt/crowdfunding, statut)
- Jalons & roadmap (suivi avancement, alertes retard)
- **Assistant IA Gemini** : copilot contextuel adapté au stade et aux critères du projet

---

## 4. Fonctionnalité Phare — Assistant IA

### 4.1 Description
Un panel latéral dans la fiche projet incubateur, alimenté par **Google Gemini 2.0 Flash**.

### 4.2 Architecture
```
Porteur / Coach
     ↓
AIAssistant.tsx (client)   [useChat — @ai-sdk/react]
     ↓
/api/incubateur/assistant  [Edge Runtime — 30s max]
     ↓
streamText() → Gemini 2.0 Flash
     ↓
System Prompt contextuel (stade, score, critères, jalons, financements)
```

### 4.3 Capacités
- **Brief statique** (sans coût API) : priorités par stade, critères manquants, jalons en retard
- **Chat libre** : questions stratégiques, pitch, financement, réglementation marocaine
- **Suggestions rapides** : 3 boutons prédéfinis selon le contexte
- **Connaissance terrain marocain** : OMPIC, CRI, CCG, MAROC PME, Innov Invest

---

## 5. Dashboard & Pilotage

### 5.1 Dashboard Admin (Super Admin)
- Total organisations, étudiants, utilisateurs, NC ouvertes
- 10 dernières organisations créées
- Liens d'accès rapide à tous les processus SMOE

### 5.2 Dashboard Organisation
- KPIs par processus (étudiants actifs, formations valides, référentiels, NC, projets)
- Grille processus P1-P7 + modules transverses
- Alertes visuelles (NC ouvertes, jalons en retard)

---

## 6. Contraintes & Exigences Non-Fonctionnelles

| Exigence | Détail |
|----------|--------|
| **Conformité** | ISO 21001:2018 — couverture §4 à §10 |
| **Multi-tenant** | Isolation totale par `organization_id` (RLS Supabase) |
| **Performance** | SSR par défaut, Edge Runtime pour l'IA |
| **Sécurité** | Auth Supabase (JWT), RLS PostgreSQL, cookies HttpOnly |
| **Scalabilité** | Vercel (auto-scale), Supabase (PostgreSQL managé) |
| **Accessibilité** | aria-hidden sur éléments décoratifs, autocomplete sur formulaires |
| **Langues** | Français uniquement (v1) |
| **Disponibilité** | 99.9% (Vercel SLA) |

---

## 7. Roadmap Produit

### Phase actuelle (Avril 2026) — v1.0 Production
✅ 7 processus ISO 21001 complets  
✅ Career Centre complet  
✅ Incubateur complet avec assistant IA Gemini  
✅ Multi-tenant (isolation par org)  
✅ Déployé sur Vercel  

### Phase 2 (T3 2026)
- [ ] Module rapports & exports PDF
- [ ] Tableau de bord analytique avancé (Recharts)
- [ ] Notifications en temps réel (Supabase Realtime)
- [ ] API publique pour intégrations tierces
- [ ] Module alumni

### Phase 3 (2027)
- [ ] Application mobile (React Native)
- [ ] Multi-langue (Arabe, Anglais)
- [ ] Marketplace de modules complémentaires
- [ ] Expansion Afrique subsaharienne

---

## 8. Métriques de Succès

| KPI | Cible v1 | Cible 2026 |
|-----|----------|------------|
| Organisations actives | 1 (SUP2I) | 5 |
| Étudiants gérés | 200 | 1 000 |
| Taux de couverture ISO 21001 | 100% processus | — |
| Projets incubés | 10 | 50 |
| Score employabilité moyen | Baseline | +15 pts |

---

*Document propriétaire — Proximity Management SARL — SUP2I © 2026*
