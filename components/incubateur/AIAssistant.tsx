'use client'

import { useChat } from 'ai/react'
import { useEffect, useRef } from 'react'
import { Bot, Send, Loader2, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProjectContext {
  nom: string
  secteur: string | null
  stade_label: string
  stade_index: number
  score: number
  description: string | null
  business_model: boolean
  prototype: boolean
  premier_client: boolean
  financement_obtenu: boolean
  equipe_complete: boolean
  besoins: string[]
  jalons_en_retard: number
  total_jalons: number
  financement_total: number
}

interface AIAssistantProps {
  context: ProjectContext
}

// ─── Brief contextuel statique (aucun appel API) ─────────────────────────────

function getBriefContextuel(ctx: ProjectContext) {
  const manquants = [
    !ctx.business_model && 'Business model',
    !ctx.prototype && 'Prototype',
    !ctx.premier_client && 'Premier client',
    !ctx.financement_obtenu && 'Financement',
    !ctx.equipe_complete && 'Équipe complète',
  ].filter(Boolean) as string[]

  const priorites: string[] = []

  // Priorités selon stade
  if (ctx.stade_label === 'Idéation') {
    priorites.push('Définir clairement le problème que vous résolvez')
    priorites.push('Identifier votre cible client principale')
    if (!ctx.business_model) priorites.push('Esquisser un premier business model (Canvas)')
  } else if (ctx.stade_label === 'Validation') {
    priorites.push('Conduire 10 entretiens avec des clients potentiels')
    if (!ctx.prototype) priorites.push('Créer un prototype ou maquette pour tester')
    priorites.push('Valider la proposition de valeur avec des données réelles')
  } else if (ctx.stade_label === 'Prototypage') {
    if (!ctx.prototype) priorites.push('Finaliser le prototype fonctionnel')
    if (!ctx.premier_client) priorites.push('Obtenir votre premier client ou bêta-testeur')
    priorites.push('Itérer sur le feedback utilisateur')
  } else if (ctx.stade_label === 'MVP') {
    if (!ctx.premier_client) priorites.push('Convertir votre premier client payant')
    if (!ctx.financement_obtenu) priorites.push('Identifier un programme de financement (CCG, Innov Invest, MAROC PME)')
    if (!ctx.equipe_complete) priorites.push('Compléter l\'équipe fondatrice')
  } else if (ctx.stade_label === 'Lancé') {
    priorites.push('Structurer votre stratégie d\'acquisition clients')
    if (!ctx.financement_obtenu) priorites.push('Préparer une levée de fonds ou rechercher des investisseurs')
    priorites.push('Mettre en place des indicateurs de croissance (MRR, CAC, LTV)')
  }

  return { manquants, priorites }
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AIAssistant({ context }: AIAssistantProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/incubateur/assistant',
    body: { context },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const { manquants, priorites } = getBriefContextuel(context)

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-[#1B3A6B] to-[#2E5BA8] rounded-t-xl">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Assistant IA</p>
          <p className="text-[10px] text-white/70">Powered by Gemini</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
            {context.score}% maturité
          </span>
        </div>
      </div>

      {/* Brief contextuel */}
      <div className="p-4 space-y-3 border-b border-slate-100 bg-slate-50/50">

        {/* Stade + priorités */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-[#1B3A6B]" />
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
              Priorités — {context.stade_label}
            </p>
          </div>
          <ul className="space-y-1">
            {priorites.slice(0, 3).map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                <span className="text-[#1B3A6B] font-bold mt-0.5 shrink-0">·</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Manquants */}
        {manquants.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={11} className="text-amber-500 shrink-0" />
              <p className="text-[11px] font-semibold text-amber-700">Critères manquants</p>
            </div>
            <p className="text-xs text-amber-600">{manquants.join(' · ')}</p>
          </div>
        )}

        {/* Jalons en retard */}
        {context.jalons_en_retard > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600 font-medium">
              ⚠ {context.jalons_en_retard} jalon{context.jalons_en_retard > 1 ? 's' : ''} en retard
            </p>
          </div>
        )}
      </div>

      {/* Messages chat */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Posez une question sur votre projet, votre stratégie, votre pitch, vos financements...
            </p>
            {/* Suggestions rapides */}
            <div className="mt-4 space-y-2">
              {[
                'Que dois-je faire en priorité ?',
                'Comment préparer mon pitch ?',
                'Quels financements au Maroc ?',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => append({ role: 'user', content: suggestion })}
                  className="block w-full text-left text-xs px-3 py-2 bg-white border border-slate-200
                             rounded-lg hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors text-slate-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#1B3A6B] text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2">
              <Loader2 size={12} className="text-[#1B3A6B] animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent
                       disabled:opacity-50 bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 flex items-center justify-center bg-[#1B3A6B] text-white
                       rounded-lg hover:bg-[#2E5BA8] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </form>
      </div>
    </div>
  )
}
