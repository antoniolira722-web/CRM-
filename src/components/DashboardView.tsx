import React from 'react';
import { useCrm } from '../context/CrmContext';
import {
  UserPlus,
  Building2,
  TrendingUp,
  Handshake,
  CalendarCheck,
  Fuel,
  ArrowUpRight,
  Clock,
  Phone,
  Users,
  Mail,
  CheckCircle2,
  Check,
  MessageSquare,
  Database
} from 'lucide-react';

export const DashboardView: React.FC<{ onOpenSupabase: () => void }> = ({ onOpenSupabase }) => {
  const { leads, clientes, deals, atividades, propostas, setActivePage, supabaseConfig } = useCrm();

  const totalLeads = leads.filter(l => l.status !== 'fechado').length;
  const totalClientes = clientes.filter(c => c.status === 'ativo').length;
  const valorFechado = clientes.reduce((s, c) => s + (c.valorContrato || 0), 0);
  const mensalidadeRecorrente = clientes
    .filter(c => c.status === 'ativo')
    .reduce((s, c) => s + (c.valorMensalidade || 0), 0);

  const pipelineValue = deals
    .filter(d => d.stage !== 'fechado' && d.stage !== 'perdido')
    .reduce((s, d) => s + (d.valor || 0), 0);

  const totalFechados = deals.filter(d => d.stage === 'fechado').length;
  const atividadesPendentes = atividades.filter(a => !a.concluida).length;

  const topDeals = [...deals]
    .filter(d => d.stage !== 'fechado' && d.stage !== 'perdido')
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
    .slice(0, 5);

  const recentAtividades = [...atividades]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'ligacao': return <Phone className="w-4 h-4 text-blue-400" />;
      case 'reuniao': return <Users className="w-4 h-4 text-purple-400" />;
      case 'email': return <Mail className="w-4 h-4 text-amber-400" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-[#3ecf8e]" />;
      default: return <CheckCircle2 className="w-4 h-4 text-[#3ecf8e]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner about Supabase status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Estrutura Supabase Integrada
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  supabaseConfig.enabled && supabaseConfig.url
                    ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}
              >
                {supabaseConfig.enabled && supabaseConfig.url ? 'Online' : 'Local'}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {supabaseConfig.enabled && supabaseConfig.url
                ? `Conectado ao Supabase. Sincronização e publicação ativas.`
                : `Operando localmente. Conecte sua URL e Chave Anon do Supabase para sincronizar multi-dispositivo.`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSupabase}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white transition-colors shrink-0"
        >
          {supabaseConfig.enabled && supabaseConfig.url ? 'Gerenciar Supabase' : 'Publicar no Supabase'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Leads */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Leads no Funil</span>
            <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100">{totalLeads}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Oportunidades em aberto</div>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Clientes Ativos</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100">{totalClientes}</div>
            <div className="text-[11px] text-[#3ecf8e] font-medium mt-0.5 truncate">
              {formatMoney(mensalidadeRecorrente)}/mês
            </div>
          </div>
        </div>

        {/* Funil / Pipeline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Pipeline Aberto</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-100 truncate">
              {formatMoney(pipelineValue)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Em negociação</div>
          </div>
        </div>

        {/* Fechados */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Contratos Fechados</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100">{totalFechados}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Total: {formatMoney(valorFechado)}</div>
          </div>
        </div>

        {/* Atividades */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Follow-ups Pendentes</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100">{atividadesPendentes}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Acompanhamentos</div>
          </div>
        </div>
      </div>

      {/* Two Columns: Major Opportunities & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Major Opportunities */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3ecf8e]" />
              <span>Maiores Oportunidades no Funil</span>
            </h3>
            <button
              onClick={() => setActivePage('pipeline')}
              className="text-xs text-[#3ecf8e] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Ver Funil</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {topDeals.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Nenhuma oportunidade aberta no momento.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                    <th className="pb-2 text-left font-semibold">Posto / Empresa</th>
                    <th className="pb-2 text-left font-semibold">Valor Estimado</th>
                    <th className="pb-2 text-left font-semibold">Estágio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {topDeals.map(d => (
                    <tr key={d.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-2.5">
                        <div className="font-bold text-zinc-100">{d.titulo}</div>
                        <div className="text-zinc-400 text-[11px]">{d.contato}</div>
                      </td>
                      <td className="py-2.5 font-semibold text-[#3ecf8e]">
                        {formatMoney(d.valor)}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30">
                          {d.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Atividades e Follow-ups Recentes</span>
            </h3>
            <button
              onClick={() => setActivePage('atividades')}
              className="text-xs text-[#3ecf8e] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Ver Todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {recentAtividades.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Nenhuma atividade registrada ainda.
              </div>
            ) : (
              recentAtividades.map(a => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-zinc-900 shrink-0 mt-0.5">
                    {getActivityIcon(a.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-100 truncate">{a.titulo}</span>
                      {a.concluida ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
                          Concluída
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0">
                          Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {a.relacionado} {a.descricao ? `— ${a.descricao}` : ''}
                    </p>
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      {new Date(a.data).toLocaleDateString('pt-BR')} às {new Date(a.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
