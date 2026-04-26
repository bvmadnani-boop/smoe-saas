# VIZIA — Manuel Technique
**Version** : 1.0 | **Date** : Avril 2026  
**Destinataire** : CTO / Équipe Développement  
**Repository** : https://github.com/bvmadnani-boop/smoe-saas

---

## 1. Stack Technique

### 1.1 Technologies principales

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| Framework | Next.js | ^15.3.8 | App Router, SSR, Edge Runtime |
| UI | React | ^19.0.0 | Composants client/serveur |
| Langage | TypeScript | ^5 | Type-safety |
| Styling | Tailwind CSS | ^3.4.1 | Utility-first CSS |
| BDD & Auth | Supabase | ^2.103.3 | PostgreSQL + Auth + Storage |
| IA | Vercel AI SDK | ai@^6.0.168 | Streaming LLM |
| Provider IA | Google Gemini | @ai-sdk/google@^3.0.64 | Gemini 2.0 Flash |
| Hooks IA | @ai-sdk/react | ^1.2.12 | useChat, useCompletion |
| Icônes | Lucide React | ^0.469.0 | Icon library |
| Graphiques | Recharts | ^2.15.3 | Data visualization |
| Déploiement | Vercel | — | PaaS, Edge Network |
| SSR Auth | @supabase/ssr | ^0.10.2 | Cookie-based sessions |

### 1.2 Dépendances UI complémentaires
```json
"@radix-ui/react-dialog": "^1.1.15",
"@radix-ui/react-label": "^2.1.8",
"@radix-ui/react-select": "^2.2.6",
"@radix-ui/react-separator": "^1.1.8",
"@radix-ui/react-slot": "^1.2.4",
"@radix-ui/react-tabs": "^1.1.13",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"tailwind-merge": "^2.6.0"
```

---

## 2. Architecture Applicative

### 2.1 Structure des dossiers
```
smoe-saas/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group auth
│   │   ├── layout.tsx            # Layout minimal
│   │   └── login/page.tsx        # Page connexion
│   ├── admin/                    # Zone super_admin
│   │   ├── layout.tsx            # Layout admin + sidebar
│   │   ├── page.tsx              # Dashboard admin
│   │   └── organisations/        # CRUD organisations
│   ├── api/                      # API Routes
│   │   └── incubateur/
│   │       └── assistant/
│   │           └── route.ts      # Gemini streaming endpoint
│   ├── org/[orgId]/             # Zone organisation (multi-tenant)
│   │   ├── layout.tsx            # Layout org + sidebar + auth check
│   │   ├── page.tsx              # Dashboard organisation
│   │   ├── management/           # P1
│   │   ├── conception/           # P2
│   │   ├── inscription/          # P3
│   │   ├── scolarite/            # P4
│   │   ├── diplomation/          # P5
│   │   ├── qualite/              # P6
│   │   ├── support/              # P7
│   │   ├── career-centre/        # T1
│   │   └── incubateur/           # T2
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   └── page.tsx                  # Redirect (landing ou org)
├── components/                   # Composants React réutilisables
│   ├── admin/                    # Composants zone admin
│   ├── incubateur/               # AIAssistant.tsx
│   ├── landing/                  # LandingPage.tsx
│   ├── org/                      # OrgSidebar.tsx
│   │   ├── conception/
│   │   ├── diplomation/
│   │   ├── inscription/
│   │   ├── qualite/
│   │   ├── scolarite/
│   │   └── support/
│   └── ui/                       # Composants UI génériques
├── lib/                          # Utilitaires et templates
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   └── server.ts             # Supabase SSR client
│   ├── utils.ts                  # cn() helper
│   ├── amelioration-templates.ts
│   ├── audit-templates.ts
│   ├── career-templates.ts
│   ├── conception-templates.ts
│   ├── context-templates.ts
│   ├── incubateur-templates.ts
│   ├── nc-ocap-templates.ts
│   ├── policy-templates.ts
│   ├── risk-templates.ts
│   └── support-templates.ts
├── docs/                         # Documentation (ce dossier)
├── .env.local                    # Variables d'environnement (non versionné)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 Patterns d'architecture

#### Server vs Client Components
```typescript
// Server Component (défaut) — fetch Supabase côté serveur
// app/org/[orgId]/qualite/page.tsx
export default async function QualitePage({ params }) {
  const { orgId } = await params  // ← IMPORTANT: await requis en Next.js 15
  const supabase = await createClient()  // ← server client
  const { data } = await supabase.from('nonconformities').select('*')
  return <div>...</div>
}

// Client Component — interactivité, hooks React
// 'use client' en première ligne
export default function RiskEditor() {
  const [risks, setRisks] = useState([])
  const supabase = createClient()  // ← browser client
  useEffect(() => { /* fetch */ }, [])
}
```

#### Multi-tenant isolation
```typescript
// TOUJOURS filtrer par organization_id
const { data } = await supabase
  .from('nonconformities')
  .select('*')
  .eq('organization_id', orgId)  // ← isolation tenant
```

---

## 3. Configuration Supabase

### 3.1 Variables d'environnement
```env
# .env.local (jamais commit)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[key]
GOOGLE_GENERATIVE_AI_API_KEY=[gemini-api-key]
```

**Configuration Vercel** : Settings → Environment Variables → Ajouter les 3 variables ci-dessus.

### 3.2 Clients Supabase

```typescript
// lib/supabase/server.ts — SSR (pages serveur, layouts, middleware)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (...) => {...} } }
  )
}

// lib/supabase/client.ts — Browser (composants client)
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3.3 Auth Flow
1. `supabase.auth.signInWithPassword({ email, password })` → JWT cookie
2. Layout serveur vérifie session via `supabase.auth.getUser()`
3. Redirect vers login si non authentifié
4. `user_profiles` table → rôle + org associée

---

## 4. Schéma de Base de Données (48 tables)

### 4.1 Tables Core
```sql
-- Organisations (tenants)
organizations (id uuid PK, name text, city text, code text, is_active bool, created_at timestamp)

-- Profils utilisateurs
user_profiles (id uuid PK, full_name text, email text, role text, organization_id uuid FK, created_at timestamp)

-- Étudiants
students (id uuid PK, student_code text, full_name text, email text, phone text, 
          status text, organization_id uuid FK, academic_year text, filiere_id uuid FK, created_at timestamp)

-- Filières
filieres (id uuid PK, name text, organization_id uuid FK)
```

### 4.2 P2 — Conception
```sql
formations (id, code, title, statut, modalite, duree_totale_heures, version, organization_id)
formation_modules (id, formation_id FK, code, title, type, volume_horaire, ordre)
formation_seances (id, module_id FK, teacher_id FK, date, duree, salle, methode)
formation_evaluations (id, formation_id FK, titre, type, coefficient, duree_minutes, criteres)
formation_revues (id, formation_id FK, etape, statut, commentaire, reviewer_name, reviewed_at, checklist_results jsonb)
referentiels_competences (id, organization_id, code, title, source, is_active)
competences (id, referentiel_id FK, code, bloc, title, niveau_bloom, description)
```

### 4.3 P3 — Inscription
```sql
inscription_documents (id, student_id FK, document_type, url, uploaded_at, verified bool)
```

### 4.4 P4 — Scolarité
```sql
teachers (id, full_name, email, organization_id, sup2i_validated bool, contract_type)
courses (id, code, name, formation_id FK, organization_id)
grades (id, student_id FK, course_id FK, note decimal, organization_id, graded_at)
attendance (id, student_id FK, course_id FK, date, present bool)
schedules (id, course_id FK, teacher_id FK, day text, time_slot text, room text, organization_id)
```

### 4.5 P5 — Diplomation
```sql
pfe_projects (id, student_id FK, title, supervisor_id FK, status, score decimal, organization_id)
diplomas (id, student_id FK, promotion_year int, filiere_id FK, status, organization_id, issued_at)
```

### 4.6 P6 — Qualité
```sql
nonconformities (id, numero text, title, category, severity, status, 
                 detected_at, ocap_deadline, root_cause, observation, 
                 action_plan, proof, corrective_actions, organization_id, version)
quality_policies (id, title, content text, version, status, approver_name, approved_at, review_date, organization_id)
risks (id, title, description, type, category, probability int, impact int, score int, 
       status, treatment, owner, review_date, organization_id, version, is_active)
swot_items (id, quadrant text, content text, is_active bool, organization_id)
pestel_items (id, dimension text, content text, impact text, is_active bool, organization_id)
interested_parties (id, group_key text, name text, needs text, expectations text, is_active bool, organization_id)
audit_plans (id, title, process_key text, trimestre text, audit_date date, auditor text, 
             status text, scope text, organization_id)
audit_findings (id, audit_plan_id FK, finding_type text, process_area text, description text, 
                corrective_action text)
management_reviews (id, title, date, status, inputs jsonb, outputs jsonb, document_content text, organization_id)
reclamations (id, numero text, objet text, source text, gravite text, statut text, 
              date_reclamation date, delai_traitement date, solution text, organization_id)
enquetes (id, titre text, type text, statut text, score_moyen decimal, nb_reponses int, 
          resultats jsonb, organization_id)
ameliorations (id, numero text, titre text, description text, source_type text, source_id uuid,
               source_label text, priorite text, statut text, responsable text, echeance date, 
               actions text, efficacite_verifiee bool, organization_id)
```

### 4.7 P7 — Support
```sql
org_positions (id, title text, level int, parent_id uuid FK, order_index int, 
               organization_id, is_active bool)
org_fiches_fonction (id, position_id uuid FK UNIQUE, organization_id,
                     role_description text, missions text[], responsabilites text[], 
                     taches text[], exigences_diplome text, exigences_experience text, version text)
support_personnel (id, position_id FK, full_name text, email text, phone text, 
                   status text, contract_type text, date_embauche date, 
                   sensibilisation_done bool, organization_id)
support_equipments (id, nom text, categorie text, marque text, modele text, 
                    numero_serie text, localisation text, statut text, 
                    date_acquisition date, next_maintenance date, organization_id)
support_documents (id, titre text, type text, reference text, version text, 
                   statut text, url text, review_date date, owner text, organization_id)
support_communications (id, titre text, type text, description text, responsable text, 
                        frequence text, organization_id)
```

### 4.8 Career Centre
```sql
career_profils (id, student_id FK, etudiant_nom text, filiere_id FK, score int, 
                niveau text, date_insertion date, mentoring_count int, organization_id)
career_ateliers (id, titre text, type text, description text, date_atelier date, 
                 duree_heures decimal, lieu text, formateur text, nb_inscrits int, 
                 statut text, organization_id)
career_entreprises (id, nom text, secteur text, taille text, ville text, 
                    contact_rh text, email_rh text, tel_rh text, 
                    statut text, convention bool, nb_placements int, notes text, organization_id)
career_offres (id, titre text, type text, description text, localisation text, 
               remuneration text, date_debut date, date_limite date, 
               statut text, entreprise_id FK, filiere_id FK, organization_id)
career_evenements (id, titre text, type text, description text, date_evenement date, 
                   lieu text, nb_places int, statut text, organization_id)
career_mentoring (id, profil_id FK, mentor_nom text, mentor_poste text, 
                  mentor_entreprise text, date_session date, duree_minutes int, 
                  theme text, statut text, notes text, organization_id)
```

### 4.9 Incubateur
```sql
incubateur_projets (id, nom text, secteur text, description text, site_web text,
                    stade text, score_maturite int, 
                    business_model bool, prototype bool, premier_client bool, 
                    financement_obtenu bool, equipe_complete bool,
                    besoins text[], date_entree date, organization_id)
incubateur_porteurs (id, projet_id FK, nom text, email text, phone text, role text, profil_id uuid)
incubateur_sessions (id, projet_id FK, organization_id, expert_nom text, expert_titre text,
                     theme text, date_session date, duree_minutes int, 
                     compte_rendu text, actions_suivantes text)
incubateur_pitchs (id, projet_id FK, organization_id, titre text, type text, 
                   date_pitch date, lieu text, jury text, note_max decimal, 
                   note_obtenue decimal, statut text, feedback text)
incubateur_financements (id, projet_id FK, organization_id, titre text, type text,
                         montant_demande decimal, montant_obtenu decimal, 
                         statut text, date_depot date, date_reponse date, notes text)
incubateur_jalons (id, projet_id FK, titre text, description text, 
                   echeance date, statut text, ordre int)
```

---

## 5. API Routes

### 5.1 POST /api/incubateur/assistant

**Runtime** : Edge (Vercel Edge Network)  
**Timeout** : 30 secondes  
**Modèle IA** : `gemini-2.0-flash-exp` via `@ai-sdk/google`

**Request Body** :
```typescript
{
  messages: Message[],    // Historique conversation useChat
  context: {
    nom: string,           // Nom du projet
    secteur: string | null,
    stade_label: string,   // Ex: "Idéation", "MVP"
    stade_index: number,   // 1-5
    score: number,         // Score maturité 0-100
    description: string | null,
    business_model: boolean,
    prototype: boolean,
    premier_client: boolean,
    financement_obtenu: boolean,
    equipe_complete: boolean,
    besoins: string[],
    jalons_en_retard: number,
    total_jalons: number,
    financement_total: number   // MAD
  }
}
```

**Response** : UIMessageStream (SSE — Server-Sent Events)  
```typescript
return result.toUIMessageStreamResponse()
```

**System Prompt** : Contextualise le modèle avec les données du projet + rules (français uniquement, max 250 mots, contexte entrepreneurial marocain : OMPIC, CRI, CCG, MAROC PME, Innov Invest)

---

## 6. Authentification & Sécurité

### 6.1 Protection des routes
```typescript
// app/org/[orgId]/layout.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

// Vérification rôle & org
const { data: profile } = await supabase
  .from('user_profiles').select('role, organization_id')
  .eq('id', user.id).single()

if (profile.role !== 'super_admin' && profile.organization_id !== orgId) {
  redirect('/login')
}
```

### 6.2 Row Level Security (RLS)
Toutes les tables Supabase ont RLS activé.  
Policies type : `organization_id = auth.jwt() -> organization_id`

### 6.3 Variables sensibles
- `GOOGLE_GENERATIVE_AI_API_KEY` → **Ne jamais exposer côté client** (préfixe NEXT_PUBLIC absent intentionnel)
- Clé Supabase anon → lecture seule, requiert auth pour write
- Accès Supabase service role → **NON utilisé** (sécurité)

---

## 7. Déploiement

### 7.1 Configuration Vercel
```
Project: smoe-saas
Framework: Next.js (auto-détecté)
Branch: main (auto-deploy)
Node.js: 20.x
Build Command: npm run build
Output Directory: .next
```

### 7.2 Variables d'environnement Vercel
| Variable | Scope | Requis |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview | ✅ |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Production | ✅ (assistant IA) |

### 7.3 Build & Déploiement
```bash
# Local dev
npm run dev          # http://localhost:3000

# Build local (vérification avant push)
npm run build

# Push → Vercel auto-deploy
git push origin main
```

### 7.4 Commandes utiles
```bash
npm install --legacy-peer-deps   # Installation (évite conflits peer deps)
npm run lint                     # ESLint
npm run build                    # Build production
```

---

## 8. Configuration Next.js & TypeScript

### 8.1 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": false,          // Note: migration strict en cours
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./*"] }
  }
}
```

### 8.2 tailwind.config.ts
- Couleur principale : `#1B3A6B` (bleu SUP2I)
- Couleur secondaire : `#2E5BA8`
- Dark background landing : `#070B14`
- Breakpoints : `sm` (640), `md` (768), `lg` (1024), `xl` (1280)

---

## 9. Conventions de Code

### 9.1 Nommage
- **Pages** : `page.tsx` (convention Next.js)
- **Composants** : PascalCase (`AIAssistant.tsx`, `RiskMatrix.tsx`)
- **Templates** : kebab-case (`risk-templates.ts`, `nc-ocap-templates.ts`)
- **Types** : exportés depuis les templates (`type RiskCategory`, `type NcSeverity`)

### 9.2 Patterns utilisés
```typescript
// Imports Supabase avec types explicites
import type { ProjetStade, BesoinType } from '@/lib/incubateur-templates'

// Params async (Next.js 15 obligatoire)
export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
}

// cn() pour className conditionnel
import { cn } from '@/lib/utils'
className={cn('base-class', condition && 'conditional-class')}

// Tailwind arbitrary values
className="h-[calc(100vh-6rem)] grid-cols-[1fr_340px]"
```

### 9.3 Gestion d'erreurs
- Server components : `data ?? []` (fallback vide)
- Client components : state `loading` + `error`
- API routes : try/catch avec status codes appropriés

---

## 10. Breaking Changes & Migrations Connues

### Vercel AI SDK v6 (migration depuis v3)
| Ancienne API | Nouvelle API |
|-------------|-------------|
| `import { useChat } from 'ai/react'` | `import { useChat } from '@ai-sdk/react'` |
| `result.toDataStreamResponse()` | `result.toUIMessageStreamResponse()` |
| Package `ai` seul | `ai` + `@ai-sdk/react` (séparé) |

### Next.js 15 (params async)
```typescript
// ❌ Next.js 14 (synchrone)
export default function Page({ params }: { params: { orgId: string } }) {
  const { orgId } = params

// ✅ Next.js 15 (asynchrone — server components)
export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params

// ✅ Next.js 15 (client components — useParams, pas de changement)
const params = useParams<{ orgId: string }>()
const { orgId } = params  // pas d'await côté client
```

---

*Document propriétaire — Proximity Management SARL — SUP2I © 2026*
