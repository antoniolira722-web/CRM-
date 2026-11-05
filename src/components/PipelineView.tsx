import React from 'react';
import { useCrm } from '../context/CrmContext';
import { LeadStage, Deal } from '../types/crm';
import {
  TrendingUp,
  Table,
  Layers,
  Fuel,
  Store,
  Building,
  ArrowRight,
  UserCheck,
  Calendar,
  DollarSign
} from 'lucide-react';

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20' },
  { id: 'qualificado', label: 'Qualificado', color: 'border-blue-500/40 text-blue-300 bg-blue-950/20' },
  { id: 'proposta', label: 'Proposta', color: 'border-[#3ecf8e]/40 text-[#3ecf8e] bg-[#3ecf8e]/10' },
  { id: 'negociacao', label: 'Negociação', color: 'border-amber-500/40 text-amber-300 bg-amber-950/20' },
  { id: 'fechado', label: 'Fechado', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' }
];

export const PipelineView: React.FC = () => {
  const { deals, leads, updateDealStage, setActivePage } = useCrm();

  const formatMoney = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  // Group summary by stages
  const summaryRows = STAGES.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage.id);
    const totalLic = stageDeals.reduce((s, d) => s + (d.valor || 0), 0);

    let totalImpl = 0;
    let totalMens = 0;

    stageDeals.forEach(d => {
      const lead = leads.find(l => l.id === d.leadId);
      if (lead) {
        totalImpl += lead.valorImplantacao || 0;
        totalMens += lead.valorMensalidade || 0;
      }
    });

    return {
      stage,
      deals: stageDeals,
      qtd: stageDeals.length,
      totalLic,
      totalImpl,
      totalMens
    };
  });

  const totQtd = summaryRows.reduce((s, r) => s + r.qtd, 0);
  const totLic = summaryRows.reduce((s, r) => s + r.totalLic, 0);
  const totImpl = summaryRows.reduce((s, r) => s + r.totalImpl, 0);
  const totMens = summaryRows.reduce((s, r) => s + r.totalMens, 0);

  return (
    <div className="space-y-6">
      {/* 1. Analytical Table of Stages */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Table className="w-4 h-4 text-[#3ecf8e]" />
            <span>Tabela Analítica de Estágios do Funil</span>
          </h3>
          <span className="text-xs text-zinc-400">
            Visão consolidada de licença, implantação e receita mensal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5 font-semibold">Estágio</th>
                <th className="p-3.5 font-semibold">Qtd. Oportunidades</th>
                <th className="p-3.5 font-semibold">Total Licenças</th>
                <th className="p-3.5 font-semibold">Total Implantação</th>
                <th className="p-3.5 font-semibold">Total Mensalidade</th>
                <th className="p-3.5 font-semibold">% do Funil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {summaryRows.map(r => {
                const pct = totQtd > 0 ? Math.round((r.qtd / totQtd) * 100) : 0;
                return (
                  <tr key={r.stage.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${r.stage.color}`}>
                        {r.stage.label}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-zinc-100 text-sm">{r.qtd}</td>
                    <td className="p-3.5 font-semibold text-[#3ecf8e]">{formatMoney(r.totalLic)}</td>
                    <td className="p-3.5 text-zinc-300">{formatMoney(r.totalImpl)}</td>
                    <td className="p-3.5 text-[#3ecf8e] font-medium">{formatMoney(r.totalMens)}/mês</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-zinc-950 overflow-hidden">
                          <div
                            className="h-full bg-[#3ecf8e] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-zinc-400 font-semibold">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-zinc-950 font-bold text-zinc-100 text-xs border-t-2 border-zinc-800">
                <td className="p-3.5 uppercase tracking-wider">Total Geral</td>
                <td className="p-3.5 text-sm">{totQtd}</td>
                <td className="p-3.5 text-[#3ecf8e]">{formatMoney(totLic)}</td>
                <td className="p-3.5 text-zinc-200">{formatMoney(totImpl)}</td>
                <td className="p-3.5 text-[#3ecf8e]">{formatMoney(totMens)}/mês</td>
                <td className="p-3.5 text-zinc-300">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Kanban Columns View */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3ecf8e]" />
            <span>Colunas do Funil de Vendas</span>
          </h3>
          <span className="text-xs text-zinc-400">
            Altere o estágio com um clique no card para acionar follow-up automático
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const colTotal = stageDeals.reduce((s, d) => s + (d.valor || 0), 0);

            return (
              <div
                key={stage.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col max-h-[650px] shadow-sm overflow-hidden"
              >
                {/* Column Header */}
                <div className="px-3 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-100 tracking-wide uppercase">
                    {stage.label}
                  </span>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-[#3ecf8e]">
                      {stageDeals.length}
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1 bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-400 font-medium truncate">
                  Total: <span className="text-[#3ecf8e] font-semibold">{formatMoney(colTotal)}</span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-zinc-500">
                      Sem oportunidades
                    </div>
                  ) : (
                    stageDeals.map(d => {
                      const lead = leads.find(l => l.id === d.leadId);
                      return (
                        <div
                          key={d.id}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 hover:border-[#3ecf8e]/50 transition-all shadow-sm group"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="font-bold text-xs text-zinc-100 line-clamp-1 group-hover:text-[#3ecf8e] transition-colors">
                              {d.titulo}
                            </h4>
                          </div>

                          <div className="text-[11px] text-zinc-400 mb-2 truncate">
                            {d.contato} {lead?.telefone && `• ${lead.telefone}`}
                          </div>

                          <div className="flex items-baseline justify-between pt-1 border-t border-zinc-800">
                            <span className="text-xs font-bold text-[#3ecf8e]">
                              {formatMoney(d.valor)}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {lead ? `${formatMoney(lead.valorMensalidade)}/mês` : ''}
                            </span>
                          </div>

                          {/* Stage Switcher */}
                          <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-1">
                            <span className="text-[10px] text-zinc-400">Mover:</span>
                            <select
                              value={d.stage}
                              onChange={e => updateDealStage(d.id, e.target.value as LeadStage)}
                              className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-[#3ecf8e]"
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
