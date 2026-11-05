import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Atividade, TipoAtividade } from '../types/crm';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  Circle,
  Phone,
  Users,
  Mail,
  MessageSquare,
  Clock,
  Trash2,
  Edit2,
  X,
  Filter
} from 'lucide-react';

interface Props {
  onOpenEmailModal: (toEmail: string, toName: string, subject: string, message: string) => void;
}

export const AtividadesView: React.FC<Props> = ({ onOpenEmailModal }) => {
  const { atividades, leads, clientes, addAtividade, updateAtividade, deleteAtividade, addToast } = useCrm();

  const [filterStatus, setFilterStatus] = useState<'pendente' | 'concluida' | 'todas'>('pendente');
  const [filterTipo, setFilterTipo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null);

  // Form State
  const [tipo, setTipo] = useState<TipoAtividade>('ligacao');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 16));
  const [relacionado, setRelacionado] = useState('');

  const openNewModal = () => {
    setEditingAtividade(null);
    setTipo('ligacao');
    setTitulo('');
    setDescricao('');
    setData(new Date().toISOString().slice(0, 16));
    setRelacionado('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: Atividade) => {
    setEditingAtividade(a);
    setTipo(a.tipo);
    setTitulo(a.titulo);
    setDescricao(a.descricao || '');
    setData(a.data.slice(0, 16));
    setRelacionado(a.relacionado || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      addToast('Preencha o título da atividade.', 'error');
      return;
    }

    if (editingAtividade) {
      updateAtividade(editingAtividade.id, {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: new Date(data).toISOString(),
        relacionado: relacionado.trim()
      });
    } else {
      addAtividade({
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: new Date(data).toISOString(),
        concluida: false,
        relacionado: relacionado.trim()
      });
    }
    setIsModalOpen(false);
  };

  const getActivityIcon = (tipo: TipoAtividade) => {
    switch (tipo) {
      case 'ligacao': return <Phone className="w-4 h-4 text-blue-400" />;
      case 'reuniao': return <Users className="w-4 h-4 text-purple-400" />;
      case 'email': return <Mail className="w-4 h-4 text-amber-400" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      default: return <Clock className="w-4 h-4 text-[#3ecf8e]" />;
    }
  };

  const filtered = atividades.filter(a => {
    if (filterStatus === 'pendente' && a.concluida) return false;
    if (filterStatus === 'concluida' && !a.concluida) return false;
    if (filterTipo && a.tipo !== filterTipo) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="pendente">Pendentes (Follow-ups)</option>
            <option value="concluida">Concluídas</option>
            <option value="todas">Todas as Atividades</option>
          </select>

          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="">Todos os Tipos</option>
            <option value="ligacao">Ligação</option>
            <option value="reuniao">Reunião / Apresentação</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">E-mail</option>
            <option value="visita">Visita</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade / Follow-up</span>
        </button>
      </div>

      {/* Atividades List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-400 text-xs">
            Nenhuma atividade encontrada com os filtros selecionados.
          </div>
        ) : (
          filtered.map(a => {
            const isLate = !a.concluida && new Date(a.data).getTime() < Date.now();
            return (
              <div
                key={a.id}
                className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  a.concluida
                    ? 'bg-zinc-950/60 border-zinc-800/60 opacity-75'
                    : isLate
                    ? 'bg-zinc-900 border-rose-500/50 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => updateAtividade(a.id, { concluida: !a.concluida })}
                    className="mt-1 text-zinc-400 hover:text-[#3ecf8e] transition-colors shrink-0"
                    title={a.concluida ? 'Reabrir atividade' : 'Concluir atividade'}
                  >
                    {a.concluida ? (
                      <CheckCircle2 className="w-5 h-5 text-[#3ecf8e]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1 rounded bg-zinc-950 border border-zinc-800">
                        {getActivityIcon(a.tipo)}
                      </div>
                      <span className={`font-bold text-sm ${a.concluida ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                        {a.titulo}
                      </span>
                      {isLate && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Atrasada
                        </span>
                      )}
                      {a.concluida && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Concluída
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-1">
                      {a.relacionado && <strong className="text-zinc-200 mr-2">{a.relacionado}</strong>}
                      {a.descricao}
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      <span>
                        {new Date(a.data).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(a.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(a)}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Excluir atividade?')) deleteAtividade(a.id);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Nova / Editar Atividade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#3ecf8e]" />
                <span>{editingAtividade ? 'Editar Atividade' : 'Nova Atividade / Follow-up'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tipo de Ação</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as TipoAtividade)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="ligacao">Ligação Telefônica</option>
                    <option value="reuniao">Reunião / Demo</option>
                    <option value="whatsapp">Mensagem WhatsApp</option>
                    <option value="email">E-mail Comercial</option>
                    <option value="visita">Visita no Posto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Título da Atividade *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Ligar para verificar aprovação da proposta"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Relacionado ao Posto / Lead</label>
                <input
                  type="text"
                  value={relacionado}
                  onChange={e => setRelacionado(e.target.value)}
                  placeholder="Ex: Auto Posto Estrela do Sul (Carlos)"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Notas / Descrição</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Instruções ou pautas para a conversa..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold shadow-sm transition-colors"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
