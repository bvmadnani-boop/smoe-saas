'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Brain, FileSearch, BarChart3, GraduationCap, Shield,
  TrendingUp, Briefcase, Rocket, ArrowRight, ChevronDown,
  Zap, Eye, Clock, CheckCircle, Star, Menu, X,
  Building2, Globe, Mail, User, Upload, Sparkles,
} from 'lucide-react'

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 2000
        const steps = 60
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>
}

// ─── GLOW CARD ────────────────────────────────────────────────────────────
function GlowCard({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/8 ${glow ? 'shadow-[0_0_40px_rgba(59,130,246,0.1)]' : ''} ${className}`}>
      {glow && <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />}
      {children}
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-widest border border-blue-500/30 bg-blue-500/10 text-blue-400">
      {children}
    </span>
  )
}

// ─── MAIN LANDING ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ nom: '', etablissement: '', email: '', pays: '' })
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-[#070B14] text-white overflow-x-hidden">

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

      {/* Radial glow top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Eye size={16} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">VIZIA</span>
          </div>

          {/* Nav links desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#solution" className="hover:text-white transition-colors">Solution</a>
            <a href="#intelligence" className="hover:text-white transition-colors">Intelligence IA</a>
            <a href="#piliers" className="hover:text-white transition-colors">Modules</a>
            <a href="#resultats" className="hover:text-white transition-colors">Résultats</a>
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
              Se connecter
            </Link>
            <a href="#demo" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 transition-all">
              <Zap size={14} /> Voir la démo
            </a>
          </div>

          {/* Mobile menu */}
          <button onClick={() => setMobileMenuOpen(v => !v)} className="md:hidden text-slate-400">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#070B14] px-6 py-4 space-y-3">
            {['#solution', '#intelligence', '#piliers', '#resultats'].map(href => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-white py-1 capitalize">{href.replace('#', '')}</a>
            ))}
            <Link href="/login" className="block text-sm text-blue-400 font-medium pt-2">Se connecter →</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">

        {/* Spotlight */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge><Sparkles size={10} /> Powered by AI</Badge>

          <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Dirigez.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              VIZIA
            </span>{' '}
            s'occupe du reste.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            De l'accréditation à l'employabilité — La première plateforme de pilotage par IA conçue pour les leaders de l'enseignement supérieur. Ne perdez plus de temps dans la paperasse, concentrez-vous sur le succès de votre établissement.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]">
              <Zap size={18} /> Voir la démo IA
            </a>
            <a href="#solution"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-base hover:bg-white/5 transition-all">
              Découvrir la plateforme <ChevronDown size={16} />
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { icon: GraduationCap, value: 120, suffix: '+', label: 'Formations sous contrôle' },
              { icon: Briefcase,     value: 78,  suffix: '%', label: 'Taux d\'insertion moyen' },
              { icon: Zap,          value: 5,   suffix: 's', label: 'Audit de conformité' },
            ].map(({ icon: Icon, value, suffix, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-3">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <p className="text-3xl font-black text-white tabular-nums">
                  <Counter target={value} suffix={suffix} />
                </p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} className="text-slate-600" />
        </div>
      </section>

      {/* ── PROBLÈME ───────────────────────────────────────────────────── */}
      <section id="solution" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge>Le diagnostic</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
              Diriger un établissement ne devrait pas<br />
              <span className="text-slate-500">être une gestion de crise permanente.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🧩',
                title: '"Je pilote à l\'aveugle"',
                text: 'Vos données sont éparpillées. Quand on vous demande un bilan stratégique, il vous faut 3 jours pour réunir les pièces du puzzle.',
                stat: '3 jours',
                statLabel: 'pour produire un bilan',
                color: 'from-red-500/10 to-transparent',
                border: 'border-red-500/20',
              },
              {
                icon: '⚡',
                title: '"L\'audit approche"',
                text: 'Chaque inspection génère un stress massif. Vos processus existent, mais la preuve de conformité est noyée dans des emails et des dossiers Excel.',
                stat: '100%',
                statLabel: 'de stress pré-audit',
                color: 'from-amber-500/10 to-transparent',
                border: 'border-amber-500/20',
              },
              {
                icon: '📉',
                title: '"Le coût du décrochage"',
                text: 'Un étudiant qui part, c\'est un échec académique et une perte financière. Sans signaux faibles, vous réagissez quand il est déjà trop tard.',
                stat: '×3',
                statLabel: 'le coût de réacquisition',
                color: 'from-violet-500/10 to-transparent',
                border: 'border-violet-500/20',
              },
            ].map(card => (
              <div key={card.title}
                className={`relative rounded-2xl border ${card.border} bg-white/3 p-6 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} pointer-events-none`} />
                <div className="relative">
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{card.text}</p>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-2xl font-black text-white">{card.stat}</p>
                    <p className="text-xs text-slate-500">{card.statLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENT INTELLIGENCE ─────────────────────────────────────── */}
      <section id="intelligence" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">

          <div className="text-center mb-16">
            <Badge><Brain size={10} /> Intelligence Artificielle</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
              Vos documents regorgent d'actions.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                VIZIA les active.
              </span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Uploadez n'importe quel document. En 5 secondes, l'IA extrait les exigences, identifie les risques et pré-remplit votre plan d'actions.
            </p>
          </div>

          {/* Demo visuelle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Upload zone */}
            <GlowCard glow className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <FileSearch size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Document Intelligence</p>
                  <p className="text-xs text-slate-500">Analyse en cours...</p>
                </div>
                <div className="ml-auto flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
                </div>
              </div>

              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center mb-4 hover:border-blue-500/30 transition-colors cursor-pointer group">
                <Upload size={28} className="text-slate-600 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                <p className="text-sm text-slate-500">Rapport d'audit · Circulaire ministérielle</p>
                <p className="text-sm text-slate-500">PV de réunion · Note de service</p>
                <p className="text-xs text-slate-600 mt-2">PDF, image, scan acceptés</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Rapport ANEAQ — Mars 2025.pdf', size: '2.4 MB', status: 'Analysé' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/4 border border-white/5">
                    <div className="w-7 h-7 rounded bg-blue-500/15 flex items-center justify-center shrink-0">
                      <FileSearch size={13} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate font-medium">{f.label}</p>
                      <p className="text-xs text-slate-500">{f.size}</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium shrink-0">✓ {f.status}</span>
                  </div>
                ))}
              </div>
            </GlowCard>

            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Résultats IA</span>
                <div className="h-px flex-1 bg-gradient-to-l from-blue-500/50 to-transparent" />
              </div>

              {[
                { icon: '🚨', type: 'Non-conformités', count: 3, cls: 'border-red-500/25 bg-red-500/5', badge: 'bg-red-500/15 text-red-400', desc: '3 écarts identifiés → NC pré-remplies' },
                { icon: '📈', type: 'Améliorations', count: 2, cls: 'border-amber-500/25 bg-amber-500/5', badge: 'bg-amber-500/15 text-amber-400', desc: '2 recommandations → Plan d\'actions §10.3' },
                { icon: '💡', type: 'Opportunités SWOT', count: 1, cls: 'border-emerald-500/25 bg-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-400', desc: '1 point fort → Opportunité ajoutée' },
              ].map(r => (
                <div key={r.type} className={`flex items-center gap-4 rounded-xl border ${r.cls} px-4 py-3.5`}>
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{r.type}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                  </div>
                  <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${r.badge} shrink-0`}>{r.count}</span>
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all">
                  ✓ Valider tout (6 actions)
                </button>
                <button className="px-4 py-3 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition-all">
                  Réviser
                </button>
              </div>

              <p className="text-center text-xs text-slate-600">
                Vous ne lisez plus pour subir — vous validez pour agir.
              </p>
            </div>
          </div>

          {/* 3 autres use cases IA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {[
              { icon: Brain, title: 'Revue de Direction', desc: 'Générez votre rapport complet en 1 clic depuis les données en temps réel.', tag: '−80% de temps de préparation' },
              { icon: BarChart3, title: 'Chatbot Direction', desc: 'Posez vos questions en langage naturel. VIZIA répond avec vos données.', tag: 'Réponse en <3 secondes' },
              { icon: GraduationCap, title: 'Ingénierie Pédagogique', desc: 'Décrivez votre filière, l\'IA génère la structure complète du programme.', tag: '2h de travail → 15 minutes' },
            ].map(({ icon: Icon, title, desc, tag }) => (
              <GlowCard key={title} className="group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:border-blue-400/40 transition-colors">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 mb-4">{desc}</p>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">{tag}</span>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 PILIERS ─────────────────────────────────────────────────── */}
      <section id="piliers" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge>La plateforme</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
              Une seule plateforme.<br />
              <span className="text-slate-500">Pour piloter. Pour prouver. Pour progresser.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: GraduationCap,
                emoji: '🎓',
                title: 'Ingénierie de Formation',
                desc: 'Concevez et lancez vos filières selon les standards nationaux sans aucune alerte de conformité.',
                color: 'from-blue-500/15 to-blue-500/5',
                border: 'hover:border-blue-500/30',
              },
              {
                icon: BarChart3,
                emoji: '📋',
                title: 'Scolarité Digitale',
                desc: 'Un suivi 360° de l\'étudiant, de l\'admission au diplôme, avec détection prédictive du décrochage.',
                color: 'from-violet-500/15 to-violet-500/5',
                border: 'hover:border-violet-500/30',
              },
              {
                icon: TrendingUp,
                emoji: '📊',
                title: 'Pilotage Stratégique',
                desc: 'Votre cockpit directionnel en temps réel : analyse de contexte, gestion des risques et décisions actées.',
                color: 'from-indigo-500/15 to-indigo-500/5',
                border: 'hover:border-indigo-500/30',
              },
              {
                icon: Shield,
                emoji: '✅',
                title: 'Qualité Augmentée',
                desc: 'Automatisez votre système qualité. Détecter un écart, c\'est déjà avoir le plan d\'action prêt.',
                color: 'from-emerald-500/15 to-emerald-500/5',
                border: 'hover:border-emerald-500/30',
              },
              {
                icon: Briefcase,
                emoji: '💼',
                title: 'Réputation & Insertion',
                desc: 'Mesurez l\'employabilité réelle de vos étudiants. Défendez votre marque avec des chiffres vérifiables.',
                color: 'from-amber-500/15 to-amber-500/5',
                border: 'hover:border-amber-500/30',
              },
              {
                icon: Rocket,
                emoji: '🚀',
                title: 'Incubateur',
                desc: 'Accompagnez l\'esprit d\'entreprise. Gérez les projets de vos étudiants du pitch au lancement.',
                color: 'from-rose-500/15 to-rose-500/5',
                border: 'hover:border-rose-500/30',
              },
            ].map(({ icon: Icon, emoji, title, desc, color, border }) => (
              <div key={title}
                className={`relative rounded-2xl border border-white/8 bg-gradient-to-br ${color} p-6 transition-all duration-300 ${border} hover:shadow-lg cursor-default`}>
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="font-bold text-white mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RÉSULTATS ──────────────────────────────────────────────────── */}
      <section id="resultats" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/15 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge><Star size={10} /> Résultats prouvés</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight">
              Le retour sur investissement<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">des leaders.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                stat: '−80%',
                label: 'Temps de préparation',
                desc: 'La Revue de Direction se génère en 1 clic depuis les données réelles. Fini les 3 jours de collecte manuelle.',
                color: 'text-blue-400',
                glow: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]',
              },
              {
                icon: CheckCircle,
                stat: '100%',
                label: 'Traçabilité',
                desc: 'Toutes vos preuves de conformité sont centralisées, datées et exportables pour vos audits d\'accréditation.',
                color: 'text-emerald-400',
                glow: 'shadow-[0_0_30px_rgba(16,185,129,0.1)]',
              },
              {
                icon: TrendingUp,
                stat: '+40%',
                label: 'Taux d\'insertion',
                desc: 'Un programme d\'employabilité structuré avec score individuel donne des résultats mesurables que vous pouvez défendre.',
                color: 'text-indigo-400',
                glow: 'shadow-[0_0_30px_rgba(99,102,241,0.1)]',
              },
            ].map(({ icon: Icon, stat, label, desc, color, glow }) => (
              <GlowCard key={label} className={glow} glow>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className={`text-4xl font-black ${color}`}>{stat}</p>
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">

          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 backdrop-blur-sm p-8 md:p-12 overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                <Eye size={28} className="text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Votre établissement<br />mérite d'être bien dirigé.
              </h2>
              <p className="mt-3 text-slate-400 text-sm">
                Rejoignez les directeurs qui ont choisi de piloter par la preuve et l'intelligence.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Nom & Prénom *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                        placeholder="Votre nom" value={formData.nom}
                        onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Établissement *</label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                        placeholder="Nom de l'établissement" value={formData.etablissement}
                        onChange={e => setFormData(f => ({ ...f, etablissement: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Email professionnel *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required type="email" className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                        placeholder="vous@etablissement.ma" value={formData.email}
                        onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Pays</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                        placeholder="Maroc, CIV, RDC..." value={formData.pays}
                        onChange={e => setFormData(f => ({ ...f, pays: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <button type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2">
                  Demander ma démo personnalisée <ArrowRight size={18} />
                </button>
                <p className="text-center text-xs text-slate-600">Réponse sous 24h · Aucun engagement</p>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Demande envoyée !</h3>
                <p className="text-slate-400 text-sm">Notre équipe vous contactera dans les 24h pour planifier votre démo personnalisée.</p>
                <Link href="/login" className="inline-flex items-center gap-2 mt-6 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Déjà client ? Se connecter <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Eye size={12} className="text-white" />
            </div>
            <span className="text-sm font-black text-white">VIZIA</span>
            <span className="text-xs text-slate-600 ml-2">Intelligence pour l'enseignement supérieur</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span>© 2025 VIZIA. Tous droits réservés.</span>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
