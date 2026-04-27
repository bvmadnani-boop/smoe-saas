// VIZIA — Générateur DOCX professionnel
// Usage: node generate-docx.js
// Génère: PRD_VIZIA.docx, MANUEL_TECHNIQUE.docx, MANUEL_FONCTIONNEL.docx

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  UnderlineType, TableOfContents
} = require('docx');
const fs = require('fs');

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────
const NAVY    = '1B3A6B';
const BLUE    = '2E5BA8';
const BODY    = '333333';
const WHITE   = 'FFFFFF';
const ALT     = 'EEF2F8';
const CODE_BG = 'F3F4F6';
const GRAY    = '6B7280';

const CW = 9026; // content width DXA (A4 – 2×1440)

// ─────────────────────────────────────────────
// STYLES DOCUMENT
// ─────────────────────────────────────────────
function makeStyles() {
  return {
    default: {
      document: { run: { font: 'Calibri', size: 22, color: BODY } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Calibri', color: NAVY },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Calibri', color: NAVY },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Calibri', color: BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
      },
      {
        id: 'CodeBlock', name: 'Code Block', basedOn: 'Normal', next: 'Normal',
        run: { size: 18, font: 'Courier New', color: '1F2937' },
        paragraph: {
          shading: { fill: CODE_BG, type: ShadingType.CLEAR },
          spacing: { before: 120, after: 120 },
          indent: { left: 360 }
        }
      }
    ]
  };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function h1(text, pageBreak = true) {
  const children = [];
  if (pageBreak) children.push(new PageBreak());
  children.push(new TextRun({ text, font: 'Calibri', size: 32, bold: true, color: NAVY }));
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children, spacing: { before: pageBreak ? 0 : 480, after: 240 } });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: 'Calibri', size: 26, bold: true, color: NAVY })],
    spacing: { before: 360, after: 180 }
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: 'Calibri', size: 22, bold: true, color: BLUE })],
    spacing: { before: 240, after: 120 }
  });
}

function p(text, options = {}) {
  const runs = [];
  // Parse **bold** inline
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  parts.forEach(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: 'Calibri', size: 22, color: BODY }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New', size: 18, color: '1F2937', shading: { fill: CODE_BG, type: ShadingType.CLEAR } }));
    } else if (part) {
      runs.push(new TextRun({ text: part, font: 'Calibri', size: 22, color: BODY, ...options }));
    }
  });
  return new Paragraph({
    children: runs,
    spacing: { after: 120 },
    ...(options.alignment ? { alignment: options.alignment } : {})
  });
}

function bullet(text, level = 0) {
  const indent = level === 0 ? { left: 720, hanging: 360 } : { left: 1080, hanging: 360 };
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  const children = [];
  parts.forEach(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push(new TextRun({ text: part.slice(2, -2), bold: true, font: 'Calibri', size: 22, color: BODY }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      children.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New', size: 18, color: '1F2937' }));
    } else if (part) {
      children.push(new TextRun({ text: part, font: 'Calibri', size: 22, color: BODY }));
    }
  });
  return new Paragraph({
    numbering: { reference: level === 0 ? 'bullets' : 'bullets2', level: 0 },
    children,
    spacing: { after: 80 },
    indent
  });
}

function numbered(text, num) {
  return new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    children: [new TextRun({ text, font: 'Calibri', size: 22, color: BODY })],
    spacing: { after: 80 },
    indent: { left: 720, hanging: 360 }
  });
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      style: 'CodeBlock',
      children: [new TextRun({ text: line, font: 'Courier New', size: 18, color: '1F2937' })],
      spacing: { after: 0, before: 0 }
    })
  );
}

function spacer() {
  return new Paragraph({ children: [new TextRun('')], spacing: { after: 120 } });
}

function divider() {
  return new Paragraph({
    children: [new TextRun('')],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DBEAFE', space: 1 } },
    spacing: { after: 240 }
  });
}

// ─────────────────────────────────────────────
// TABLE HELPER
// ─────────────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          children: [new TextRun({ text: h, bold: true, color: WHITE, font: 'Calibri', size: 20 })],
          alignment: AlignmentType.LEFT
        })]
      })
    )
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? WHITE : ALT, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: (() => {
              const parts = String(cell).split(/(\*\*[^*]+\*\*|`[^`]+`)/);
              return parts.map(part => {
                if (part.startsWith('**') && part.endsWith('**'))
                  return new TextRun({ text: part.slice(2, -2), bold: true, font: 'Calibri', size: 20, color: BODY });
                if (part.startsWith('`') && part.endsWith('`'))
                  return new TextRun({ text: part.slice(1, -1), font: 'Courier New', size: 18, color: '1F2937' });
                return new TextRun({ text: part, font: 'Calibri', size: 20, color: BODY });
              });
            })()
          })]
        })
      )
    })
  );

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

// ─────────────────────────────────────────────
// FOOTER & HEADER
// ─────────────────────────────────────────────
function makeFooter(docTitle) {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `VIZIA — Confidentiel | Proximity Management SARL`, font: 'Calibri', size: 16, color: GRAY }),
          new TextRun({ text: `\t`, font: 'Calibri', size: 16 }),
          new TextRun({ text: 'Page ', font: 'Calibri', size: 16, color: GRAY }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 16, color: GRAY }),
          new TextRun({ text: ' / ', font: 'Calibri', size: 16, color: GRAY }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 16, color: GRAY }),
        ],
        tabStops: [{ type: 'right', position: CW }],
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: NAVY, space: 1 } },
        spacing: { before: 80 }
      })
    ]
  });
}

// ─────────────────────────────────────────────
// PAGE DE GARDE
// ─────────────────────────────────────────────
function makeCoverPage(title, subtitle, version, date, destinataire) {
  return [
    new Paragraph({ children: [new TextRun('')], spacing: { after: 2400 } }),
    new Paragraph({
      children: [new TextRun({ text: 'VIZIA', font: 'Calibri', size: 72, bold: true, color: NAVY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 }
    }),
    new Paragraph({
      children: [new TextRun({ text: title, font: 'Calibri', size: 40, bold: true, color: BLUE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 }
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, font: 'Calibri', size: 24, color: GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 }
    }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 1 } },
      children: [new TextRun('')], spacing: { after: 400 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Version : ${version}`, font: 'Calibri', size: 22, color: BODY })],
      alignment: AlignmentType.CENTER, spacing: { after: 120 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Date : ${date}`, font: 'Calibri', size: 22, color: BODY })],
      alignment: AlignmentType.CENTER, spacing: { after: 120 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Destinataire : ${destinataire}`, font: 'Calibri', size: 22, color: BODY })],
      alignment: AlignmentType.CENTER, spacing: { after: 120 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Proximity Management SARL — SUP2I © 2026', font: 'Calibri', size: 20, color: GRAY })],
      alignment: AlignmentType.CENTER, spacing: { after: 120 }
    }),
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } })
  ];
}

// ─────────────────────────────────────────────
// NUMBERING CONFIG
// ─────────────────────────────────────────────
const numberingConfig = {
  config: [
    {
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: 'bullets2',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '\u2013', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
      }]
    },
    {
      reference: 'numbers',
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════
// PRD VIZIA
// ═══════════════════════════════════════════════════════════════
function buildPRD() {
  const content = [
    ...makeCoverPage(
      'Product Requirements Document',
      'Vision produit, modules, architecture, roadmap',
      '1.0', 'Avril 2026', 'Direction Technique (CTO), Investisseurs'
    ),

    // TOC
    new TableOfContents('Table des matières', { hyperlink: true, headingStyleRange: '1-3', stylesWithLevels: [] }),
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } }),

    // ── SECTION 1 ──
    h1('1. Vision Produit', false),
    h2('1.1 Résumé exécutif'),
    p('VIZIA est une plateforme SaaS de management institutionnel pour les établissements d\'enseignement supérieur privés. Elle digitalise intégralement le Système de Management des Organismes d\'Enseignement (SMOE) conforme à la norme **ISO 21001:2018**, en couvrant les 7 processus opérationnels d\'un établissement + 2 modules transverses innovants (Career Centre & Incubateur de startups).'),
    spacer(),
    h2('1.2 Positionnement'),
    p('"Intelligence pour l\'enseignement supérieur"'),
    p('VIZIA s\'adresse aux écoles supérieures privées marocaines et africaines qui cherchent à :'),
    bullet('Obtenir ou maintenir leur accréditation **ISO 21001**'),
    bullet('Digitaliser leur pilotage académique et administratif'),
    bullet('Valoriser leur différenciation via un incubateur et un career centre intégrés'),
    spacer(),
    h2('1.3 Marché cible'),
    makeTable(
      ['Segment', 'Description'],
      [
        ['Primaire', 'Écoles supérieures privées — Maroc (réseau SUP2I initial)'],
        ['Secondaire', 'Établissements ISO 9001/21001 Afrique subsaharienne (CIV, RDC)'],
        ['Tertiaire', 'Universités privées régionales — phase expansion 2027']
      ],
      [2200, 6826]
    ),

    // ── SECTION 2 ──
    h1('2. Utilisateurs & Rôles'),
    h2('2.1 Personas'),
    makeTable(
      ['Rôle', 'Identifiant', 'Accès', 'Responsabilités'],
      [
        ['Super Admin', '`super_admin`', 'Plateforme entière', 'Gestion multi-organisations, KPIs globaux'],
        ['Directeur', '`director`', 'Son organisation', 'Pilotage stratégique, revues de direction, risques'],
        ['Administrateur qualité', '`org_admin`', 'Son organisation', 'Processus qualité, NC, audits, amélioration'],
        ['Responsable académique', '`staff`', 'Modules académiques', 'Formations, scolarité, diplomation'],
        ['Enseignant', '`teacher`', 'Modules cours', 'Saisie notes, présences, PFE'],
        ['Coach incubateur', '`staff`', 'Module incubateur', 'Accompagnement projets, sessions'],
        ['Porteur de projet', '`staff`', 'Fiche projet + IA', 'Gestion startup, accès assistant IA']
      ],
      [2000, 1800, 2000, 3226]
    ),
    spacer(),
    h2('2.2 Flux d\'authentification'),
    numbered('Login email/password → Supabase Auth'),
    numbered('Redirect automatique : `super_admin` → `/admin`, autres → `/org/{orgId}`'),
    numbered('Protection des routes par layout SSR (cookies Supabase)'),
    numbered('Isolation par `organization_id` sur toutes les requêtes'),

    // ── SECTION 3 ──
    h1('3. Architecture Fonctionnelle — Modules & Processus'),
    h2('3.1 Structure ISO 21001 (P1 → P7)'),
    ...codeBlock([
      'VIZIA',
      '├── P1 — Management stratégique',
      '├── P2 — Conception des offres de formation',
      '├── P3 — Inscription & accueil étudiants',
      '├── P4 — Scolarité & suivi pédagogique',
      '├── P5 — Diplomation & projets de fin d\'études',
      '├── P6 — Qualité & amélioration continue',
      '├── P7 — Support (RH, Infrastructure, Documents)',
      '├── T1 — Career Centre (transversal)',
      '└── T2 — Incubateur de startups (transversal)'
    ]),
    spacer(),
    h2('3.2 Détail par module'),
    h3('P1 — Management Stratégique'),
    p('**Objectif** : Piloter la stratégie institutionnelle et la conformité ISO 21001'),
    bullet('Analyse de contexte SWOT (4 quadrants, items actifs/inactifs)'),
    bullet('Analyse PESTEL (6 dimensions : Politique, Économique, Social, Technologique, Environnemental, Légal)'),
    bullet('Cartographie des parties intéressées (besoins, attentes, criticité)'),
    bullet('Gestion des politiques qualité (templates + éditeur riche, versioning, approbation)'),
    bullet('Registre des risques & opportunités (matrice 5×5, scoring probabilité × impact, traitements)'),
    bullet('Seeder données SWOT/PESTEL préconfigurées (contexte ESB marocain)'),
    spacer(),
    h3('P2 — Conception des Offres de Formation'),
    p('**Objectif** : Documenter et piloter le cycle de vie des programmes pédagogiques'),
    bullet('Catalogue formations (statuts : brouillon → en_validation → valide → archive)'),
    bullet('Éditeur formation : modules, séances, volume horaire, enseignants assignés'),
    bullet('Plan pédagogique détaillé (modules, séances, méthodes pédagogiques)'),
    bullet('Gestion des évaluations (types : examen, contrôle continu, projet, soutenance — coefficients)'),
    bullet('Revue de conception (workflow multi-étapes, checklist ISO 21001 §8.3.x)'),
    bullet('Référentiels de compétences (source : CNCPST, RNCP, maison — niveaux Bloom)'),
    spacer(),
    h3('P3 — Inscription & Accueil Étudiants'),
    p('**Objectif** : Gérer le cycle complet d\'un dossier étudiant de l\'inscription à l\'archivage'),
    bullet('Dossier étudiant (code, filière, année académique, statut)'),
    bullet('Workflow de statut : inscrit → actif → diplômé (ou suspendu / inactif)'),
    bullet('Upload de documents d\'inscription (Supabase Storage)'),
    bullet('Recherche et filtres avancés (statut, filière, année)'),
    spacer(),
    h3('P4 — Scolarité & Suivi Pédagogique'),
    p('**Objectif** : Opérer le quotidien académique (cours, notes, présences, emplois du temps)'),
    bullet('Gestion enseignants (validation SUP2I, types de contrat)'),
    bullet('Gestion des cours (par filière, formation)'),
    bullet('Saisie des notes (grille étudiant × cours)'),
    bullet('Suivi des présences (feuilles par séance)'),
    bullet('Emploi du temps (créneaux cours/enseignant/salle)'),
    spacer(),
    h3('P5 — Diplomation & Projets de Fin d\'Études'),
    p('**Objectif** : Piloter la diplomation et les projets académiques'),
    bullet('Gestion PFE (titre, encadrant, statut, score jury)'),
    bullet('Gestion des diplômes (promotion, filière, statut émission)'),
    bullet('Workflow diplomation : pending → issued → archived'),
    spacer(),
    h3('P6 — Qualité & Amélioration Continue'),
    p('**Objectif** : Assurer la conformité ISO 21001 et l\'amélioration continue'),
    bullet('Non-conformités (cycle OCAP : Observation → Cause → Action → Plan → Preuve)'),
    bullet('Catégories : pédagogique, RH, financier, infrastructures, administratif'),
    bullet('Sévérités : mineure / majeure / bloquante'),
    bullet('Programme d\'audits internes (trimestriel, par processus)'),
    bullet('Revues de direction (compilation NC + risques + audits + SWOT/PESTEL)'),
    bullet('Réclamations clients (suivi, gravité, statut)'),
    bullet('Enquêtes de satisfaction (création, saisie résultats, score moyen)'),
    bullet('Plan d\'amélioration continue (lié aux sources : NC, risques, audit, réclamation, SWOT)'),
    spacer(),
    h3('P7 — Support (RH, Infrastructure, Documents)'),
    p('**Objectif** : Gérer les ressources humaines, infrastructure et documentation institutionnelle'),
    bullet('Organigramme 3 niveaux (Direction / Responsables / Agents)'),
    bullet('Fiches de fonction (missions, responsabilités, tâches, exigences — ISO 21001 §7.1.2)'),
    bullet('Seeder organigramme ANEAQ (11 postes + fiches préconfigurées)'),
    bullet('Personnel : statut actif/inactif, type contrat (CDI/CDD/vacataire/prestataire)'),
    bullet('Équipements & infrastructure (état, maintenance, localisation)'),
    bullet('GED documents (versioning, statut, date de revue)'),
    spacer(),
    h3('T1 — Career Centre'),
    p('**Objectif** : Mesurer et améliorer l\'employabilité des étudiants'),
    bullet('Profils d\'employabilité étudiants (score, niveau, date insertion)'),
    bullet('Ateliers (CV, entretien, soft skills, LinkedIn, réseautage)'),
    bullet('Base entreprises partenaires (convention, contacts RH, placements)'),
    bullet('Offres emploi/stage (CDI, CDD, stage, alternance, freelance)'),
    bullet('Événements (salons, forums, conférences)'),
    bullet('Sessions de mentoring (mentor/étudiant, thème, durée, statut)'),
    spacer(),
    h3('T2 — Incubateur de Startups'),
    p('**Objectif** : Accompagner les projets entrepreneuriaux des étudiants et alumni'),
    bullet('Pipeline 5 stades : Idéation → Validation → Prototypage → MVP → Lancé'),
    bullet('Score de maturité (5 critères × 20% : business model, prototype, 1er client, financement, équipe)'),
    bullet('Équipe fondatrice (porteurs multiples, rôles)'),
    bullet('Sessions de coaching (expert, thème, durée, compte-rendu, actions)'),
    bullet('Pitchs (type, jury, score, statut)'),
    bullet('Financements (type : bourse/subvention/amorçage/love money/business angels/prêt/crowdfunding)'),
    bullet('Jalons & roadmap (suivi avancement, alertes retard)'),
    bullet('**Assistant IA Gemini** : copilot contextuel adapté au stade et aux critères du projet'),

    // ── SECTION 4 ──
    h1('4. Fonctionnalité Phare — Assistant IA'),
    h2('4.1 Description'),
    p('Un panel latéral dans la fiche projet incubateur, alimenté par **Google Gemini 2.0 Flash**. L\'assistant est contextuel : il connaît le stade, le score, les critères manquants et les jalons en retard du projet.'),
    spacer(),
    h2('4.2 Architecture'),
    ...codeBlock([
      'Porteur / Coach',
      '     ↓',
      'AIAssistant.tsx (client)   [useChat — @ai-sdk/react]',
      '     ↓',
      '/api/incubateur/assistant  [Edge Runtime — 30s max]',
      '     ↓',
      'streamText() → Gemini 2.0 Flash',
      '     ↓',
      'System Prompt contextuel (stade, score, critères, jalons, financements)'
    ]),
    spacer(),
    h2('4.3 Capacités'),
    bullet('**Brief statique** (sans coût API) : priorités par stade, critères manquants, jalons en retard'),
    bullet('**Chat libre** : questions stratégiques, pitch, financement, réglementation marocaine'),
    bullet('**Suggestions rapides** : 3 boutons prédéfinis selon le contexte'),
    bullet('**Connaissance terrain marocain** : OMPIC, CRI, CCG, MAROC PME, Innov Invest'),

    // ── SECTION 5 ──
    h1('5. Dashboard & Pilotage'),
    h2('5.1 Dashboard Admin (Super Admin)'),
    bullet('Total organisations, étudiants, utilisateurs, NC ouvertes'),
    bullet('10 dernières organisations créées'),
    bullet('Liens d\'accès rapide à tous les processus SMOE'),
    spacer(),
    h2('5.2 Dashboard Organisation'),
    bullet('KPIs par processus (étudiants actifs, formations valides, référentiels, NC, projets)'),
    bullet('Grille processus P1-P7 + modules transverses'),
    bullet('Alertes visuelles (NC ouvertes, jalons en retard)'),

    // ── SECTION 6 ──
    h1('6. Contraintes & Exigences Non-Fonctionnelles'),
    makeTable(
      ['Exigence', 'Détail'],
      [
        ['Conformité', 'ISO 21001:2018 — couverture §4 à §10'],
        ['Multi-tenant', 'Isolation totale par `organization_id` (RLS Supabase)'],
        ['Performance', 'SSR par défaut, Edge Runtime pour l\'IA'],
        ['Sécurité', 'Auth Supabase (JWT), RLS PostgreSQL, cookies HttpOnly'],
        ['Scalabilité', 'Vercel (auto-scale), Supabase (PostgreSQL managé)'],
        ['Accessibilité', 'aria-hidden sur éléments décoratifs, autocomplete sur formulaires'],
        ['Langues', 'Français uniquement (v1)'],
        ['Disponibilité', '99.9% (Vercel SLA)']
      ],
      [2600, 6426]
    ),

    // ── SECTION 7 ──
    h1('7. Roadmap Produit'),
    h2('Phase actuelle (Avril 2026) — v1.0 Production'),
    bullet('✅ 7 processus ISO 21001 complets'),
    bullet('✅ Career Centre complet'),
    bullet('✅ Incubateur complet avec assistant IA Gemini'),
    bullet('✅ Multi-tenant (isolation par org)'),
    bullet('✅ Déployé sur Vercel'),
    spacer(),
    h2('Phase 2 (T3 2026)'),
    bullet('Module rapports & exports PDF'),
    bullet('Tableau de bord analytique avancé (Recharts)'),
    bullet('Notifications en temps réel (Supabase Realtime)'),
    bullet('API publique pour intégrations tierces'),
    bullet('Module alumni'),
    spacer(),
    h2('Phase 3 (2027)'),
    bullet('Application mobile (React Native)'),
    bullet('Multi-langue (Arabe, Anglais)'),
    bullet('Marketplace de modules complémentaires'),
    bullet('Expansion Afrique subsaharienne'),

    // ── SECTION 8 ──
    h1('8. Métriques de Succès'),
    makeTable(
      ['KPI', 'Cible v1', 'Cible 2026'],
      [
        ['Organisations actives', '1 (SUP2I)', '5'],
        ['Étudiants gérés', '200', '1 000'],
        ['Taux de couverture ISO 21001', '100% processus', '—'],
        ['Projets incubés', '10', '50'],
        ['Score employabilité moyen', 'Baseline', '+15 pts']
      ],
      [4000, 2513, 2513]
    ),
    spacer(),
    divider(),
    p('Document propriétaire — Proximity Management SARL — SUP2I © 2026', { color: GRAY, alignment: AlignmentType.CENTER })
  ];

  return new Document({
    styles: makeStyles(),
    numbering: numberingConfig,
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      footers: { default: makeFooter('PRD VIZIA') },
      children: content
    }]
  });
}

// ═══════════════════════════════════════════════════════════════
// MANUEL TECHNIQUE
// ═══════════════════════════════════════════════════════════════
function buildManuelTechnique() {
  const content = [
    ...makeCoverPage(
      'Manuel Technique',
      'Architecture, stack, BDD, API, déploiement',
      '1.0', 'Avril 2026', 'CTO / Équipe Développement'
    ),

    new TableOfContents('Table des matières', { hyperlink: true, headingStyleRange: '1-3' }),
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } }),

    // ── SECTION 1 ──
    h1('1. Stack Technique', false),
    h2('1.1 Technologies principales'),
    makeTable(
      ['Couche', 'Technologie', 'Version', 'Rôle'],
      [
        ['Framework', 'Next.js', '^15.3.8', 'App Router, SSR, Edge Runtime'],
        ['UI', 'React', '^19.0.0', 'Composants client/serveur'],
        ['Langage', 'TypeScript', '^5', 'Type-safety'],
        ['Styling', 'Tailwind CSS', '^3.4.1', 'Utility-first CSS'],
        ['BDD & Auth', 'Supabase', '^2.103.3', 'PostgreSQL + Auth + Storage'],
        ['IA Streaming', 'Vercel AI SDK', 'ai@^6.0.168', 'Streaming LLM'],
        ['Provider IA', 'Google Gemini', '@ai-sdk/google@^3.0.64', 'Gemini 2.0 Flash'],
        ['Hooks IA', '@ai-sdk/react', '^1.2.12', 'useChat, useCompletion'],
        ['Icônes', 'Lucide React', '^0.469.0', 'Icon library'],
        ['Graphiques', 'Recharts', '^2.15.3', 'Data visualization'],
        ['Déploiement', 'Vercel', '—', 'PaaS, Edge Network'],
        ['SSR Auth', '@supabase/ssr', '^0.10.2', 'Cookie-based sessions']
      ],
      [1800, 2000, 2300, 2926]
    ),
    spacer(),
    h2('1.2 Dépendances UI complémentaires'),
    bullet('`@radix-ui/react-dialog` ^1.1.15 — Modales'),
    bullet('`@radix-ui/react-select` ^2.2.6 — Sélecteurs accessibles'),
    bullet('`@radix-ui/react-tabs` ^1.1.13 — Navigation par onglets'),
    bullet('`class-variance-authority` ^0.7.1 — Variantes de composants'),
    bullet('`clsx` + `tailwind-merge` — Gestion conditionnelle des classes CSS'),

    // ── SECTION 2 ──
    h1('2. Architecture Applicative'),
    h2('2.1 Structure des dossiers'),
    ...codeBlock([
      'smoe-saas/',
      '├── app/                          # Next.js App Router',
      '│   ├── (auth)/login/page.tsx     # Page connexion',
      '│   ├── admin/                    # Zone super_admin',
      '│   ├── api/incubateur/assistant/ # Gemini streaming endpoint',
      '│   └── org/[orgId]/             # Zone organisation (multi-tenant)',
      '│       ├── layout.tsx            # Auth check + sidebar',
      '│       ├── management/           # P1',
      '│       ├── conception/           # P2',
      '│       ├── inscription/          # P3',
      '│       ├── scolarite/            # P4',
      '│       ├── diplomation/          # P5',
      '│       ├── qualite/              # P6',
      '│       ├── support/              # P7',
      '│       ├── career-centre/        # T1',
      '│       └── incubateur/           # T2',
      '├── components/                   # 39 composants React réutilisables',
      '├── lib/                          # Utilitaires, templates, clients Supabase',
      '├── docs/                         # Documentation (ce dossier)',
      '└── package.json'
    ]),
    spacer(),
    h2('2.2 Patterns d\'architecture'),
    h3('Server vs Client Components'),
    p('**Server Component** (défaut) : fetch Supabase côté serveur, SSR, `await params` obligatoire (Next.js 15).'),
    p('**Client Component** : `\'use client\'` en première ligne, hooks React, client browser Supabase.'),
    ...codeBlock([
      '// Server Component — Next.js 15',
      'export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {',
      '  const { orgId } = await params  // IMPORTANT: await requis',
      '  const supabase = await createClient()  // server client',
      '  const { data } = await supabase.from(\'table\').select(\'*\')',
      '  return <div>...</div>',
      '}'
    ]),
    spacer(),
    h3('Multi-tenant isolation'),
    p('Toutes les requêtes Supabase incluent systématiquement un filtre `organization_id` :'),
    ...codeBlock([
      'const { data } = await supabase',
      '  .from(\'nonconformities\')',
      '  .select(\'*\')',
      '  .eq(\'organization_id\', orgId)  // isolation tenant obligatoire'
    ]),

    // ── SECTION 3 ──
    h1('3. Configuration Supabase'),
    h2('3.1 Variables d\'environnement'),
    ...codeBlock([
      '# .env.local (jamais versionné)',
      'NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[key]',
      'GOOGLE_GENERATIVE_AI_API_KEY=[gemini-api-key]'
    ]),
    spacer(),
    p('**Configuration Vercel** : Settings → Environment Variables → Ajouter les 3 variables ci-dessus.'),
    spacer(),
    h2('3.2 Clients Supabase'),
    p('**Server (SSR)** : `lib/supabase/server.ts` — utilisé dans les pages serveur, layouts, middleware.'),
    p('**Browser** : `lib/supabase/client.ts` — utilisé dans les composants client (`\'use client\'`).'),
    spacer(),
    h2('3.3 Auth Flow'),
    numbered('`supabase.auth.signInWithPassword({ email, password })` → JWT cookie'),
    numbered('Layout serveur vérifie session via `supabase.auth.getUser()`'),
    numbered('Redirect vers `/login` si non authentifié'),
    numbered('Table `user_profiles` → rôle + org associée'),

    // ── SECTION 4 ──
    h1('4. Schéma de Base de Données (48 tables)'),
    h2('4.1 Tables Core'),
    makeTable(
      ['Table', 'Colonnes clés', 'Description'],
      [
        ['organizations', 'id, name, city, code, is_active', 'Tenants de la plateforme'],
        ['user_profiles', 'id, full_name, email, role, organization_id', 'Profils utilisateurs + rôle'],
        ['students', 'id, student_code, full_name, status, filiere_id, academic_year, organization_id', 'Dossiers étudiants'],
        ['filieres', 'id, name, organization_id', 'Filières de formation']
      ],
      [2200, 3300, 3526]
    ),
    spacer(),
    h2('4.2 P2 — Conception (7 tables)'),
    ...codeBlock([
      'formations (id, code, title, statut, modalite, duree_totale_heures, version, organization_id)',
      'formation_modules (id, formation_id FK, code, title, type, volume_horaire, ordre)',
      'formation_seances (id, module_id FK, teacher_id FK, date, duree, salle, methode)',
      'formation_evaluations (id, formation_id FK, titre, type, coefficient, duree_minutes)',
      'formation_revues (id, formation_id FK, etape, statut, commentaire, reviewer_name)',
      'referentiels_competences (id, organization_id, code, title, source, is_active)',
      'competences (id, referentiel_id FK, code, bloc, title, niveau_bloom, description)'
    ]),
    spacer(),
    h2('4.3 P4 — Scolarité (5 tables)'),
    ...codeBlock([
      'teachers (id, full_name, email, organization_id, sup2i_validated bool, contract_type)',
      'courses (id, code, name, formation_id FK, organization_id)',
      'grades (id, student_id FK, course_id FK, note decimal, organization_id)',
      'attendance (id, student_id FK, course_id FK, date, present bool)',
      'schedules (id, course_id FK, teacher_id FK, day, time_slot, room, organization_id)'
    ]),
    spacer(),
    h2('4.4 P6 — Qualité (9 tables)'),
    ...codeBlock([
      'nonconformities (id, numero, title, category, severity, status, detected_at,',
      '                 ocap_deadline, root_cause, observation, action_plan, proof, organization_id)',
      'quality_policies (id, title, content, version, status, approver_name, organization_id)',
      'risks (id, title, type, category, probability int, impact int, score int, status, organization_id)',
      'swot_items (id, quadrant, content, is_active bool, organization_id)',
      'pestel_items (id, dimension, content, impact, is_active bool, organization_id)',
      'audit_plans (id, title, process_key, trimestre, audit_date, auditor, status, organization_id)',
      'audit_findings (id, audit_plan_id FK, finding_type, description, corrective_action)',
      'management_reviews (id, title, date, status, inputs jsonb, outputs jsonb, organization_id)',
      'ameliorations (id, numero, titre, source_type, source_id, priorite, statut, organization_id)'
    ]),
    spacer(),
    h2('4.5 Incubateur (6 tables)'),
    ...codeBlock([
      'incubateur_projets (id, nom, secteur, stade, score_maturite int,',
      '                    business_model bool, prototype bool, premier_client bool,',
      '                    financement_obtenu bool, equipe_complete bool, organization_id)',
      'incubateur_porteurs (id, projet_id FK, nom, email, role)',
      'incubateur_sessions (id, projet_id FK, expert_nom, theme, date_session, compte_rendu)',
      'incubateur_pitchs (id, projet_id FK, titre, type, date_pitch, note_obtenue)',
      'incubateur_financements (id, projet_id FK, titre, type, montant_obtenu)',
      'incubateur_jalons (id, projet_id FK, titre, echeance, statut)'
    ]),
    spacer(),
    h2('4.6 Career Centre (6 tables)'),
    ...codeBlock([
      'career_profils (id, student_id FK, score int, niveau, date_insertion, organization_id)',
      'career_ateliers (id, titre, type, date_atelier, formateur, statut, organization_id)',
      'career_entreprises (id, nom, secteur, contact_rh, convention bool, organization_id)',
      'career_offres (id, titre, type, date_limite, entreprise_id FK, filiere_id FK)',
      'career_evenements (id, titre, type, date_evenement, nb_places, statut)',
      'career_mentoring (id, profil_id FK, mentor_nom, theme, date_session, statut)'
    ]),

    // ── SECTION 5 ──
    h1('5. API Routes'),
    h2('5.1 POST /api/incubateur/assistant'),
    makeTable(
      ['Paramètre', 'Valeur'],
      [
        ['Runtime', 'Edge (Vercel Edge Network)'],
        ['Timeout', '30 secondes'],
        ['Modèle IA', '`gemini-2.0-flash-exp` via `@ai-sdk/google`'],
        ['Response', 'UIMessageStream (SSE — Server-Sent Events)'],
        ['Auth', 'Clé API côté serveur uniquement (`GOOGLE_GENERATIVE_AI_API_KEY`)']
      ],
      [2600, 6426]
    ),
    spacer(),
    h3('Request Body'),
    ...codeBlock([
      '{',
      '  messages: Message[],        // Historique conversation useChat',
      '  context: {',
      '    nom: string,              // Nom du projet',
      '    stade_label: string,      // Ex: "Idéation", "MVP"',
      '    stade_index: number,      // 1-5',
      '    score: number,            // Score maturité 0-100',
      '    business_model: boolean,',
      '    prototype: boolean,',
      '    premier_client: boolean,',
      '    financement_obtenu: boolean,',
      '    equipe_complete: boolean,',
      '    jalons_en_retard: number,',
      '    financement_total: number // MAD',
      '  }',
      '}'
    ]),

    // ── SECTION 6 ──
    h1('6. Authentification & Sécurité'),
    h2('6.1 Protection des routes'),
    ...codeBlock([
      '// app/org/[orgId]/layout.tsx',
      'const { data: { user } } = await supabase.auth.getUser()',
      'if (!user) redirect(\'/login\')',
      '',
      '// Vérification rôle & org',
      'if (profile.role !== \'super_admin\' && profile.organization_id !== orgId) {',
      '  redirect(\'/login\')',
      '}'
    ]),
    spacer(),
    h2('6.2 Row Level Security (RLS)'),
    p('Toutes les tables Supabase ont RLS activé avec policies de type :'),
    p('`organization_id = auth.jwt() -> organization_id`'),
    spacer(),
    h2('6.3 Variables sensibles'),
    bullet('`GOOGLE_GENERATIVE_AI_API_KEY` → Ne jamais exposer côté client (pas de préfixe NEXT_PUBLIC)'),
    bullet('Clé Supabase anon → lecture seule, requiert auth pour write'),
    bullet('Accès Supabase service role → **NON utilisé** par design'),

    // ── SECTION 7 ──
    h1('7. Déploiement'),
    h2('7.1 Configuration Vercel'),
    makeTable(
      ['Paramètre', 'Valeur'],
      [
        ['Framework', 'Next.js (auto-détecté)'],
        ['Branch', 'main (auto-deploy)'],
        ['Node.js', '20.x'],
        ['Build Command', '`npm run build`'],
        ['Output Directory', '`.next`']
      ],
      [3000, 6026]
    ),
    spacer(),
    h2('7.2 Variables d\'environnement Vercel'),
    makeTable(
      ['Variable', 'Scope', 'Requis'],
      [
        ['`NEXT_PUBLIC_SUPABASE_URL`', 'Production + Preview', 'Oui'],
        ['`NEXT_PUBLIC_SUPABASE_ANON_KEY`', 'Production + Preview', 'Oui'],
        ['`GOOGLE_GENERATIVE_AI_API_KEY`', 'Production', 'Oui (assistant IA)']
      ],
      [3800, 2600, 2626]
    ),
    spacer(),
    h2('7.3 Commandes'),
    ...codeBlock([
      'npm run dev          # Démarrage local http://localhost:3000',
      'npm run build        # Build production (vérification avant push)',
      'npm run lint         # ESLint',
      'git push origin main # → Déploiement Vercel automatique',
      '',
      '# Installation (évite conflits peer deps)',
      'npm install --legacy-peer-deps'
    ]),

    // ── SECTION 8 ──
    h1('8. Configuration Next.js & TypeScript'),
    h2('8.1 tsconfig.json'),
    ...codeBlock([
      '{',
      '  "compilerOptions": {',
      '    "target": "ES2017",',
      '    "strict": false,        // Migration strict en cours',
      '    "moduleResolution": "bundler",',
      '    "jsx": "preserve",',
      '    "paths": { "@/*": ["./*"] }',
      '  }',
      '}'
    ]),
    spacer(),
    h2('8.2 Couleurs Tailwind (tailwind.config.ts)'),
    bullet('Couleur principale : `#1B3A6B` (bleu SUP2I)'),
    bullet('Couleur secondaire : `#2E5BA8`'),
    bullet('Dark background landing : `#070B14`'),
    bullet('Breakpoints : sm (640), md (768), **lg (1024)**, xl (1280)'),

    // ── SECTION 9 ──
    h1('9. Conventions de Code'),
    h2('9.1 Nommage'),
    makeTable(
      ['Élément', 'Convention', 'Exemple'],
      [
        ['Pages', 'Convention Next.js', '`page.tsx`'],
        ['Composants', 'PascalCase', '`AIAssistant.tsx`, `RiskMatrix.tsx`'],
        ['Templates', 'kebab-case', '`risk-templates.ts`, `nc-ocap-templates.ts`'],
        ['Types', 'Exportés depuis templates', '`type RiskCategory`, `type NcSeverity`']
      ],
      [2200, 2200, 4626]
    ),
    spacer(),
    h2('9.2 Patterns clés'),
    bullet('**Params async** (Next.js 15 obligatoire) : `const { orgId } = await params`'),
    bullet('**cn()** pour className conditionnel : `import { cn } from \'@/lib/utils\'`'),
    bullet('**Tailwind arbitrary** : `h-[calc(100vh-6rem)]`, `grid-cols-[1fr_340px]`'),
    bullet('**Fallback vide** : `data ?? []` dans les server components'),

    // ── SECTION 10 ──
    h1('10. Breaking Changes & Migrations Connues'),
    h2('Vercel AI SDK v6 (migration depuis v3)'),
    makeTable(
      ['Ancienne API (v3)', 'Nouvelle API (v6)'],
      [
        ['`import { useChat } from \'ai/react\'`', '`import { useChat } from \'@ai-sdk/react\'`'],
        ['`result.toDataStreamResponse()`', '`result.toUIMessageStreamResponse()`'],
        ['Package `ai` seul', '`ai` + `@ai-sdk/react` (paquet séparé)']
      ],
      [4513, 4513]
    ),
    spacer(),
    h2('Next.js 15 — Params asynchrones'),
    ...codeBlock([
      '// ❌ Next.js 14 (synchrone)',
      'export default function Page({ params }: { params: { orgId: string } }) {',
      '  const { orgId } = params  // synchrone',
      '}',
      '',
      '// ✅ Next.js 15 (server components — asynchrone)',
      'export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {',
      '  const { orgId } = await params  // await obligatoire',
      '}',
      '',
      '// ✅ Next.js 15 (client components — useParams, pas de await)',
      'const params = useParams<{ orgId: string }>()',
      'const { orgId } = params'
    ]),
    spacer(),
    divider(),
    p('Document propriétaire — Proximity Management SARL — SUP2I © 2026', { color: GRAY, alignment: AlignmentType.CENTER })
  ];

  return new Document({
    styles: makeStyles(),
    numbering: numberingConfig,
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      footers: { default: makeFooter('Manuel Technique VIZIA') },
      children: content
    }]
  });
}

// ═══════════════════════════════════════════════════════════════
// MANUEL FONCTIONNEL
// ═══════════════════════════════════════════════════════════════
function buildManuelFonctionnel() {
  const content = [
    ...makeCoverPage(
      'Manuel Fonctionnel',
      'Guide d\'utilisation complet — tous les modules',
      '1.0', 'Avril 2026', 'CTO, Directeurs, Utilisateurs clés'
    ),

    new TableOfContents('Table des matières', { hyperlink: true, headingStyleRange: '1-3' }),
    new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } }),

    // ── SECTION 1 ──
    h1('1. Prise en Main', false),
    h2('1.1 Connexion'),
    numbered('Accéder à la page d\'accueil VIZIA'),
    numbered('Cliquer sur **"Connexion"** ou naviguer vers `/login`'),
    numbered('Saisir email + mot de passe'),
    numbered('Redirection automatique selon le rôle :'),
    bullet('**Super Admin** → `/admin` (gestion plateforme)', 1),
    bullet('**Utilisateur org** → `/org/{orgId}` (tableau de bord organisation)', 1),
    spacer(),
    h2('1.2 Navigation principale'),
    p('La sidebar gauche présente les 7 processus ISO 21001 + 2 modules transverses :'),
    makeTable(
      ['Module', 'Route', 'Norme ISO 21001'],
      [
        ['P1 — Management Stratégique', '/management', '§4-6'],
        ['P2 — Conception des Offres', '/conception', '§8.3'],
        ['P3 — Inscription & Accueil', '/inscription', '§8.2'],
        ['P4 — Scolarité & Pédagogie', '/scolarite', '§8.4'],
        ['P5 — Diplomation & PFE', '/diplomation', '§8.5'],
        ['P6 — Qualité & Amélioration', '/qualite', '§9-10'],
        ['P7 — Support (RH, Infra, Docs)', '/support', '§7'],
        ['Career Centre', '/career-centre', '—'],
        ['Incubateur de Startups', '/incubateur', '—']
      ],
      [3500, 2500, 3026]
    ),

    // ── SECTION 2 ──
    h1('2. Tableau de Bord Organisation'),
    p('**Route** : `/org/{orgId}`'),
    h2('KPIs affichés'),
    bullet('**Étudiants actifs** : nombre d\'étudiants avec statut `actif`'),
    bullet('**Formations valides** : programmes avec statut `valide`'),
    bullet('**Référentiels actifs** : référentiels de compétences activés'),
    bullet('**NC ouvertes** : non-conformités non clôturées'),
    bullet('**Projets incubés** : projets en cours d\'incubation'),
    spacer(),
    h2('Grille des processus'),
    p('Accès rapide à chaque module via cartes cliquables. Les cartes en alerte affichent un badge rouge/orange selon les données critiques (NC ouvertes, jalons en retard).'),

    // ── SECTION 3 ──
    h1('3. P1 — Management Stratégique'),
    h2('3.1 Contexte organisationnel (/management/contexte)'),
    h3('Onglet SWOT'),
    bullet('4 quadrants : **Forces** (vert), **Faiblesses** (rouge), **Opportunités** (bleu), **Menaces** (orange)'),
    bullet('Ajouter un item : formulaire en bas de chaque quadrant'),
    bullet('Désactiver : toggle sur chaque item (reste visible, grisé)'),
    bullet('**Seeder** : bouton "Initialiser SWOT" charge des données préconfigurées pour établissements éducatifs marocains'),
    spacer(),
    h3('Onglet PESTEL'),
    bullet('6 dimensions : Politique / Économique / Social / Technologique / Environnemental / Légal'),
    bullet('Chaque item : contenu + niveau d\'impact (faible/moyen/fort)'),
    bullet('**Seeder** : données PESTEL ESB marocain préconfigurées'),
    spacer(),
    h3('Onglet Parties intéressées'),
    bullet('Groupes clés : étudiants, parents, employeurs, État, enseignants, partenaires'),
    bullet('Pour chaque partie : besoins + attentes documentés'),
    spacer(),
    h2('3.2 Gestion des risques (/management/risques)'),
    bullet('**Matrice 5×5** (probabilité × impact) — visualisation colorée (vert → rouge)'),
    bullet('Ajouter un risque : titre, catégorie, type (risque/opportunité), probabilité (1-5), impact (1-5)'),
    bullet('Score calculé automatiquement = probabilité × impact'),
    bullet('Traitements : Accepter / Réduire / Transférer / Éviter / Exploiter / Partager'),
    bullet('**Seeder** : 15 risques types ISO 21001 préconfigurés'),
    spacer(),
    h2('3.3 Politiques qualité (/management/politique)'),
    bullet('Liste des politiques avec statut (brouillon/actif/archivé)'),
    bullet('Éditeur riche : contenu libre + versioning + approbation'),
    bullet('**5 templates** disponibles : Standard SUP2I, Insertion professionnelle, Pédagogie, RH, Développement continu'),

    // ── SECTION 4 ──
    h1('4. P2 — Conception des Offres de Formation'),
    h2('4.1 Catalogue formations (/conception/formations)'),
    p('**Statuts** : Brouillon → En validation → Valide → Archivé'),
    p('Créer une formation :'),
    numbered('Cliquer **"+ Nouvelle formation"**'),
    numbered('Renseigner : code, titre, modalité (présentiel/hybride/distance), durée totale heures'),
    numbered('Associer un référentiel de compétences'),
    numbered('Sélectionner une filière'),
    spacer(),
    h2('4.2 Plan pédagogique (/conception/formations/{id}/plan)'),
    bullet('**Modules** : créer des blocs thématiques (cours magistral, TD, projet, stage, séminaire)'),
    bullet('**Séances** : détail par module (objectif pédagogique, méthode, durée, enseignant)'),
    bullet('Volume horaire calculé automatiquement'),
    spacer(),
    h2('4.3 Évaluations (/conception/formations/{id}/evaluations)'),
    bullet('Types : Examen, Contrôle continu, Projet, Soutenance, TP, Quiz'),
    bullet('Coefficient par évaluation (total vérifié)'),
    bullet('Critères d\'évaluation documentés'),
    spacer(),
    h2('4.4 Revue de conception (/conception/formations/{id}/revue)'),
    p('Workflow multi-étapes conforme ISO 21001 §8.3.4 :'),
    numbered('Responsable pédagogique'),
    numbered('Directeur des études'),
    numbered('Partenaires professionnels'),
    numbered('Accréditation/Conformité'),
    p('Chaque étape : checklist + commentaire + reviewer + statut (en attente/validé/rejeté)'),
    spacer(),
    h2('4.5 Référentiels de compétences (/conception/referentiels)'),
    bullet('Créer un référentiel : code + titre + source (CNCPST/RNCP/maison)'),
    bullet('Ajouter des compétences : code, bloc, titre, niveau Bloom (1-6)'),
    bullet('**Seeder** : template SUP2I préconfigurée avec 12 compétences'),

    // ── SECTION 5 ──
    h1('5. P3 — Inscription & Accueil Étudiants'),
    h2('5.1 Dossiers étudiants (/inscription)'),
    bullet('Recherche par nom / code étudiant'),
    bullet('Filtres par statut, filière, année académique'),
    bullet('Vue synthétique : avatar initiales, filière, statut coloré'),
    spacer(),
    h2('5.2 Créer un dossier étudiant (/inscription/new)'),
    p('Informations obligatoires : nom complet, code étudiant, filière, année académique'),
    p('Optionnel : email, téléphone, date de naissance'),
    spacer(),
    h2('5.3 Fiche étudiant (/inscription/{studentId})'),
    bullet('**Données personnelles** : modification inline'),
    bullet('**Statut** : workflow visuel `inscrit → actif → diplômé` (boutons de transition)'),
    bullet('**Documents** : upload (CNI, baccalauréat, photos, formulaire) vers Supabase Storage'),
    bullet('Vérification documentaire : cocher chaque document vérifié'),

    // ── SECTION 6 ──
    h1('6. P4 — Scolarité & Suivi Pédagogique'),
    h2('6.1 Enseignants (/scolarite/enseignants)'),
    bullet('Liste avec statut validation SUP2I (badge vert/rouge)'),
    bullet('Type de contrat : permanent, vacataire, contractuel, prestataire'),
    bullet('Ajouter enseignant : nom, email, type contrat, validation SUP2I'),
    spacer(),
    h2('6.2 Cours (/scolarite/cours)'),
    bullet('Associés à une formation et une filière'),
    bullet('Code cours + intitulé'),
    spacer(),
    h2('6.3 Notes (/scolarite/notes)'),
    bullet('Saisie : étudiant + cours + note (sur 20 ou autre barème)'),
    bullet('Historique des notes par étudiant'),
    spacer(),
    h2('6.4 Présences (/scolarite/presences)'),
    bullet('Feuille de présence par cours et date'),
    bullet('Présent/absent par étudiant'),
    spacer(),
    h2('6.5 Emploi du temps (/scolarite/emploi-du-temps)'),
    bullet('Créneaux : cours + enseignant + jour + heure + salle'),
    bullet('Vue hebdomadaire'),

    // ── SECTION 7 ──
    h1('7. P5 — Diplomation & Projets de Fin d\'Études'),
    h2('7.1 PFE (/diplomation/pfe)'),
    p('Créer un PFE :'),
    bullet('Titre, étudiant (sélection), superviseur, entreprise d\'accueil'),
    bullet('Statut : En cours → Soutenu → Validé → Archivé'),
    bullet('Note jury (sur 20)'),
    spacer(),
    h2('7.2 Diplômes (/diplomation/diplomes)'),
    bullet('Enregistrer la diplomation : étudiant, promotion, filière'),
    bullet('Statut : En attente → Émis → Archivé'),

    // ── SECTION 8 ──
    h1('8. P6 — Qualité & Amélioration Continue'),
    h2('8.1 Non-conformités (/qualite/non-conformites)'),
    h3('Créer une NC'),
    numbered('Titre + description de l\'observation'),
    numbered('Catégorie : Pédagogique / RH / Financier / Infrastructure / Administratif / Étudiant'),
    numbered('Sévérité : Mineure / Majeure / Bloquante'),
    numbered('Date de détection + délai OCAP'),
    spacer(),
    h3('Cycle OCAP'),
    makeTable(
      ['Étape', 'Contenu'],
      [
        ['**O**bservation', 'Description factuelle du problème constaté'],
        ['**C**ause', 'Analyse des causes racines (5 pourquoi, Ishikawa)'],
        ['**A**ction', 'Plan d\'action corrective (responsable, délai)'],
        ['**P**reuve', 'Evidence de la mise en œuvre et de l\'efficacité']
      ],
      [2200, 6826]
    ),
    spacer(),
    p('Statuts : Ouverte → En cours → Clôturée'),
    spacer(),
    h2('8.2 Audits internes (/qualite/audits)'),
    bullet('Programme trimestriel par processus'),
    bullet('Créer un audit : processus, trimestre, date, auditeur, périmètre'),
    p('**Constatations** par type :'),
    bullet('Conforme — processus respecté'),
    bullet('Non-conforme — génère une NC automatiquement'),
    bullet('Observation — point de vigilance'),
    bullet('Opportunité d\'amélioration'),
    spacer(),
    h2('8.3 Revue de direction (/qualite/revue)'),
    p('Document formel compilant automatiquement :'),
    bullet('État des NC (ouvertes, clôturées, efficacité)'),
    bullet('Résultats audits'),
    bullet('Risques actifs et évolutions'),
    bullet('SWOT/PESTEL (synthèse)'),
    bullet('Indicateurs satisfaction'),
    bullet('Actions d\'amélioration en cours'),
    spacer(),
    h2('8.4 Réclamations (/qualite/reclamations)'),
    bullet('Source : étudiant, parent, entreprise, autorité'),
    bullet('Gravité : Faible / Moyenne / Élevée'),
    bullet('Suivi : Reçue → En traitement → Résolue → Archivée'),
    spacer(),
    h2('8.5 Enquêtes de satisfaction (/qualite/satisfaction)'),
    bullet('Créer une enquête : titre, type (étudiants/employeurs/enseignants)'),
    bullet('Saisir les résultats : notes par critère'),
    bullet('Score moyen calculé automatiquement'),
    spacer(),
    h2('8.6 Amélioration continue (/qualite/ameliorations)'),
    bullet('Sources linkées : NC / Risque / Audit / Réclamation / SWOT'),
    bullet('Priorité : Critique / Haute / Moyenne / Faible'),
    bullet('Statut : Identifiée → En cours → Réalisée'),
    bullet('Vérification d\'efficacité : checkbox après délai de vérification'),
    bullet('Sync automatique depuis NC, risques, audits (bouton "Synchroniser")'),

    // ── SECTION 9 ──
    h1('9. P7 — Support'),
    h2('9.1 Ressources Humaines (/support/rh)'),
    h3('Organigramme 3 niveaux'),
    bullet('**N1** : Direction (DG, etc.)'),
    bullet('**N2** : Responsables (pédagogie, finances, qualité...)'),
    bullet('**N3** : Chargés & Agents'),
    spacer(),
    h3('Seeder ANEAQ'),
    p('Pour les établissements qui démarrent, cliquer **"Initialiser avec modèle ANEAQ"** :'),
    bullet('Crée automatiquement 11 postes sur 3 niveaux'),
    bullet('Génère les fiches de fonction complètes pour chaque poste'),
    bullet('Données préconfigurées selon le référentiel ANEAQ'),
    spacer(),
    h3('Fiche de poste'),
    p('Chaque fiche contient (ISO 21001 §7.1.2 / §7.2) :'),
    bullet('Description du rôle + Missions principales'),
    bullet('Responsabilités + Tâches spécifiques'),
    bullet('Exigences diplôme + Exigences expérience'),
    bullet('Personnel affecté au poste'),
    spacer(),
    h2('9.2 Infrastructure (/support/infrastructure)'),
    bullet('Catégories : Informatique, Mobilier, Audiovisuel, Véhicule, Autre'),
    bullet('Statuts : Actif / En maintenance / Hors service'),
    bullet('Prochaine maintenance : alerte visuelle si date dépassée'),
    spacer(),
    h2('9.3 Documents (/support/documents)'),
    bullet('Types : Procédure, Instruction, Formulaire, Charte, Rapport, Politique, Manuel, Contrat'),
    bullet('Versioning : v1.0, v1.1, etc.'),
    bullet('Statuts : Actif / En révision / Archivé'),
    bullet('Date de revue périodique avec alerte'),
    spacer(),
    h2('9.4 Communication (/support/communication)'),
    bullet('Canaux internes : réunions, emails, intranet, panneau affichage'),
    bullet('Fréquence et responsable documentés'),

    // ── SECTION 10 ──
    h1('10. Career Centre (/career-centre)'),
    h2('10.1 Dashboard Career Centre'),
    p('KPIs : profils créés, ateliers planifiés, offres actives, entreprises partenaires, événements à venir'),
    spacer(),
    h2('10.2 Profils étudiants (/career-centre/profils)'),
    bullet('Score employabilité (0-100) par étudiant'),
    bullet('Niveau : Débutant / Intermédiaire / Avancé / Expert'),
    bullet('Date d\'insertion professionnelle (quand disponible)'),
    bullet('Nombre de sessions mentoring suivies'),
    spacer(),
    h2('10.3 Ateliers (/career-centre/ateliers)'),
    p('Types disponibles : CV, Lettre de motivation, Simulation entretien, Soft Skills, LinkedIn, Réseautage, Orientation, Veille métier'),
    p('Statuts : Planifiée → En cours → Archivée'),
    spacer(),
    h2('10.4 Entreprises partenaires (/career-centre/entreprises)'),
    bullet('Fiche entreprise : secteur, taille, contact RH, convention (oui/non)'),
    bullet('Suivi des placements par entreprise'),
    spacer(),
    h2('10.5 Offres (/career-centre/offres)'),
    bullet('Types : CDI, CDD, Stage, Alternance, Freelance, Bénévolat'),
    bullet('Associées à une entreprise + filière cible'),
    bullet('Date limite candidature + rémunération'),
    spacer(),
    h2('10.6 Événements (/career-centre/evenements)'),
    bullet('Salons, Forums emploi, Conférences, Networking, Ateliers collectifs'),
    bullet('Capacité (nb places), lieu, statut'),
    spacer(),
    h2('10.7 Mentoring (/career-centre/mentoring)'),
    bullet('Session mentor-étudiant : durée, thème, statut'),
    bullet('Thèmes : Orientation, Stratégie de carrière, Compétences techniques, Entrepreneuriat, Réseau'),

    // ── SECTION 11 ──
    h1('11. Incubateur de Startups (/incubateur)'),
    h2('11.1 Dashboard Incubateur'),
    bullet('**Pipeline par stade** : nombre de projets à chaque étape'),
    bullet('Pitchs planifiés / réalisés'),
    bullet('Financements obtenus (total MAD)'),
    spacer(),
    h2('11.2 Fiche projet (/incubateur/projets/{id})'),
    h3('Score de maturité'),
    p('5 critères, chacun vaut 20 points (total 100%) :'),
    makeTable(
      ['Critère', 'Description'],
      [
        ['Business Model', 'Le modèle économique est défini et documenté'],
        ['Prototype', 'Un prototype ou maquette fonctionnel existe'],
        ['1er Client', 'Au moins un client ou bêta-testeur validé'],
        ['Financement', 'Un financement a été obtenu (subvention, love money, etc.)'],
        ['Équipe', 'L\'équipe fondatrice est complète']
      ],
      [2200, 6826]
    ),
    spacer(),
    h3('Pipeline de stades'),
    p('Progression sur 5 étapes : Idéation → Validation → Prototypage → MVP → Lancé'),
    p('**Cliquer sur un stade** pour déplacer le projet. Bouton "Abandonner" en cas d\'arrêt.'),
    spacer(),
    h3('Sessions d\'accompagnement'),
    bullet('Expert/Coach + titre'),
    bullet('Thème : Business Model, Pitch, Marketing, Tech, Finance, Legal, Stratégie, Réseau'),
    bullet('Date, durée, compte-rendu, actions suivantes'),
    spacer(),
    h3('Financements'),
    makeTable(
      ['Type', 'Organismes concernés (Maroc)'],
      [
        ['Subvention publique', 'CCG, Innov Invest, MAROC PME, CRI'],
        ['Amorçage', 'Business Angels, Fonds d\'amorçage'],
        ['Love money', 'Famille, proches, premier cercle'],
        ['Prêt bancaire', 'Banques commerciales, micro-crédit'],
        ['Crowdfunding', 'Plateformes participatives']
      ],
      [3000, 6026]
    ),
    spacer(),
    h3('Jalons & Roadmap'),
    bullet('Créer des étapes clés avec date d\'échéance'),
    bullet('Statuts : À faire / En cours / Validé'),
    bullet('Barre de progression globale'),
    bullet('Alertes automatiques : jalons en retard affichés en rouge'),
    spacer(),
    h2('11.3 Assistant IA — VIZIA Assistant'),
    p('**Localisation** : Panel latéral droit de la fiche projet (affiché sur écrans ≥ 1024px)'),
    h3('Brief contextuel (sans coût API)'),
    bullet('**Priorités du stade actuel** : 3 actions recommandées selon Idéation/MVP/etc.'),
    bullet('**Critères manquants** : liste des critères non cochés'),
    bullet('**Jalons en retard** : alerte rouge si délais dépassés'),
    spacer(),
    h3('Chat IA (Gemini 2.0 Flash)'),
    p('Poser des questions libres sur :'),
    bullet('Stratégie et priorités'),
    bullet('Préparation du pitch'),
    bullet('Sources de financement marocaines'),
    bullet('Rédaction (email, pitch deck, business plan)'),
    bullet('Aspects juridiques (SARL, OMPIC, RC...)'),
    spacer(),
    p('**Suggestions rapides** : 3 boutons prédéfinis — "Que dois-je faire en priorité ?" / "Comment préparer mon pitch ?" / "Quels financements au Maroc ?"'),
    spacer(),
    p('Note : La clé `GOOGLE_GENERATIVE_AI_API_KEY` doit être configurée dans Vercel pour activer le chat IA. Le brief statique fonctionne sans clé.'),

    // ── SECTION 12 ──
    h1('12. Administration Plateforme (Super Admin)'),
    h2('12.1 Dashboard Admin (/admin)'),
    bullet('Total organisations actives'),
    bullet('Total étudiants toutes organisations'),
    bullet('Total utilisateurs'),
    bullet('NC ouvertes (toutes orgs)'),
    bullet('Tableau des 10 dernières organisations créées'),
    spacer(),
    h2('12.2 Créer une organisation (/admin/organisations/new)'),
    numbered('Renseigner nom + code (ex: SUP2I-MKC) + ville'),
    numbered('L\'organisation est créée avec `is_active: true`'),
    numbered('Créer ensuite les utilisateurs via Supabase Auth + `user_profiles`'),

    // ── SECTION 13 ──
    h1('13. Bonnes Pratiques d\'Utilisation'),
    h2('Pour la conformité ISO 21001'),
    numbered('**Renseigner le SWOT et PESTEL** dès l\'onboarding (utiliser les seeders)'),
    numbered('**Créer les risques** au minimum 5 (utiliser le seeder risques)'),
    numbered('**Toute NC ouverte** doit avoir un responsable et une deadline OCAP'),
    numbered('**Revue de direction** : minimum 2 fois par an (générée depuis la plateforme)'),
    numbered('**Fiches de fonction** : 100% des postes doivent avoir une fiche'),
    spacer(),
    h2('Pour l\'incubateur'),
    numbered('Maintenir le **score de maturité à jour** à chaque session de coaching'),
    numbered('**Documenter chaque session** : compte-rendu + actions suivantes'),
    numbered('**Créer des jalons** avec dates précises → alertes automatiques'),
    numbered('Utiliser l\'**assistant IA** pour préparer les pitchs et identifier les financements'),
    spacer(),
    h2('Pour le career centre'),
    numbered('Créer les **profils étudiants** dès la 2e année'),
    numbered('Lier les **offres aux filières** pour un ciblage précis'),
    numbered('Documenter les **insertions professionnelles** pour les indicateurs d\'employabilité'),

    // ── SECTION 14 ──
    h1('14. FAQ Utilisateurs'),
    h2('Questions fréquentes'),
    p('**Q : Le panel IA n\'apparaît pas sur la fiche projet ?**'),
    p('Il s\'affiche uniquement sur les écrans ≥ 1024px. Sur mobile, il apparaît en bas de la page.'),
    spacer(),
    p('**Q : Le chat IA ne répond pas ?**'),
    p('Vérifier que la clé `GOOGLE_GENERATIVE_AI_API_KEY` est configurée dans les variables d\'environnement Vercel.'),
    spacer(),
    p('**Q : Comment créer un utilisateur pour une organisation ?**'),
    p('Via Supabase Dashboard → Authentication → Users → Inviter l\'utilisateur → Puis créer manuellement la ligne dans `user_profiles` avec `role` et `organization_id`.'),
    spacer(),
    p('**Q : Comment exporter les données ?**'),
    p('Export natif disponible en Phase 2. En attendant, utiliser Supabase Dashboard → Table Editor → Export CSV.'),
    spacer(),
    p('**Q : Puis-je accéder à plusieurs organisations ?**'),
    p('Oui, un `super_admin` peut accéder à toutes les organisations. Un utilisateur standard est lié à une seule organisation.'),
    spacer(),
    p('**Q : Qu\'est-ce qu\'un seeder ?**'),
    p('Un bouton d\'initialisation rapide qui charge des données préconfigurées (templates ISO 21001, modèle ANEAQ, risques types...) pour éviter de partir d\'un module vide.'),
    spacer(),
    divider(),
    p('Document propriétaire — Proximity Management SARL — SUP2I © 2026', { color: GRAY, alignment: AlignmentType.CENTER })
  ];

  return new Document({
    styles: makeStyles(),
    numbering: numberingConfig,
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      footers: { default: makeFooter('Manuel Fonctionnel VIZIA') },
      children: content
    }]
  });
}

// ═══════════════════════════════════════════════════════════════
// GÉNÉRATION
// ═══════════════════════════════════════════════════════════════
async function generate() {
  const OUT = 'C:\\Dev\\smoe-saas\\docs';

  const docs = [
    { name: 'PRD_VIZIA.docx',             build: buildPRD },
    { name: 'MANUEL_TECHNIQUE.docx',      build: buildManuelTechnique },
    { name: 'MANUEL_FONCTIONNEL.docx',    build: buildManuelFonctionnel }
  ];

  for (const { name, build } of docs) {
    process.stdout.write(`Génération ${name}... `);
    try {
      const doc = build();
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(`${OUT}\\${name}`, buffer);
      console.log(`OK (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`ERREUR: ${err.message}`);
      throw err;
    }
  }

  console.log('\n✅ Les 3 documents ont été générés dans C:\\Dev\\smoe-saas\\docs\\');
}

generate().catch(err => { console.error(err); process.exit(1); });
