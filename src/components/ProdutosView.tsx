import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Produto, TipoEstabelecimento, ModuloProduto } from '../types/crm';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Fuel,
  Store,
  Building,
  Layers,
  Coins
} from 'lucide-react';

export const ProdutosView: React.FC = () => {
  const { produtos, addProduto, updateProduto, deleteProduto, addToast } = useCrm();

  const [filterTipo, setFilterTipo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoEstabelecimento>('posto');
  const [preco, setPreco] = useState<number>(0);
  const [implantacao, setImplantacao] = useState<number>(0);
  const [mensalidade, setMensalidade] = useState<number>(0);
  const [descricao, setDescricao] = useState('');
  const [modulos, setModulos] = useState<ModuloProduto[]>([]);

  // New module input
  const [modNome, setModNome] = useState('');
  const [modDesc, setModDesc] = useState('');

  const formatMoney = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  const openNewModal = () => {
    setEditingProduto(null);
    setNome('');
    setTipo('posto');
    setPreco(0);
    setImplantacao(0);
    setMensalidade(0);
    setDescricao('');
    setModulos([]);
    setModNome('');
    setModDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Produto) => {
    setEditingProduto(p);
    setNome(p.nome);
    setTipo(p.tipo);
    setPreco(p.preco);
    setImplantacao(p.implantacao);
    setMensalidade(p.mensalidade);
    setDescricao(p.descricao);
    setModulos(p.modulos || []);
    setModNome('');
    setModDesc('');
    setIsModalOpen(true);
  };

  const handleAddModulo = () => {
    if (!modNome.trim()) {
      addToast('Informe o nome do módulo.', 'error');
      return;
    }
    setModulos(prev => [...prev, { nome: modNome.trim(), descricao: modDesc.trim() }]);
    setModNome('');
    setModDesc('');
  };

  const handleRemoveModulo = (index: number) => {
    setModulos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      addToast('Preencha o nome do sistema.', 'error');
      return;
    }

    if (editingProduto) {
      updateProduto(editingProduto.id, {
        nome: nome.trim(),
        tipo,
        preco: Number(preco) || 0,
        implantacao: Number(implantacao) || 0,
        mensalidade: Number(mensalidade) || 0,
        descricao: descricao.trim(),
        modulos
      });
    } else {
      addProduto({
        nome: nome.trim(),
        tipo,
        preco: Number(preco) || 0,
        implantacao: Number(implantacao) || 0,
        mensalidade: Number(mensalidade) || 0,
        descricao: descricao.trim(),
        modulos
      });
    }
    setIsModalOpen(false);
  };

  const filtered = produtos.filter(p => {
    if (filterTipo && p.tipo !== filterTipo) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-3">
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="">Todos os Sistemas</option>
            <option value="posto">Postos de Combustíveis</option>
            <option value="conveniencia">Lojas de Conveniência</option>
            <option value="ambos">Integrados (Posto + Loja)</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Sistema / Módulo</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-[#3ecf8e]/40 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
                  {p.tipo === 'posto' && <Fuel className="w-3 h-3 text-amber-400" />}
                  {p.tipo === 'conveniencia' && <Store className="w-3 h-3 text-purple-400" />}
                  {p.tipo === 'ambos' && <Building className="w-3 h-3 text-blue-400" />}
                  <span>{p.tipo === 'posto' ? 'Posto' : p.tipo === 'conveniencia' ? 'Conveniência' : 'Integrado'}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir sistema "${p.nome}"?`)) {
                        deleteProduto(p.id);
                      }
                    }}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-base text-zinc-100">{p.nome}</h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{p.descricao}</p>

              {/* Modules list */}
              {p.modulos && p.modulos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Módulos Inclusos ({p.modulos.length})
                  </span>
                  <div className="space-y-1">
                    {p.modulos.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3ecf8e] shrink-0 mt-0.5" />
                        <div>
                          <strong>{m.nome}</strong>
                          {m.descricao && <span className="text-[11px] text-zinc-400"> — {m.descricao}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing details */}
            <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center bg-zinc-950 p-2.5 rounded-lg">
              <div>
                <span className="text-[10px] text-zinc-400 block">Licença</span>
                <strong className="text-xs text-emerald-400 font-bold">{formatMoney(p.preco)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Implantação</span>
                <strong className="text-xs text-zinc-200">{formatMoney(p.implantacao)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Mensalidade</span>
                <strong className="text-xs text-[#3ecf8e] font-bold">{formatMoney(p.mensalidade)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Cadastrar / Editar Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#3ecf8e]" />
                <span>{editingProduto ? 'Editar Sistema' : 'Novo Sistema no Catálogo'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nome do Sistema *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Linx Postos / AutoSystem"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tipo de Aplicação</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as TipoEstabelecimento)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="posto">Posto de Combustível</option>
                    <option value="conveniencia">Loja de Conveniência</option>
                    <option value="ambos">Posto + Conveniência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Visão geral dos benefícios e abrangência da solução..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Licença (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={preco}
                    onChange={e => setPreco(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Implantação (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={implantacao}
                    onChange={e => setImplantacao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Mensalidade (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={mensalidade}
                    onChange={e => setMensalidade(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>

              {/* Modulos Manager */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Módulos do Sistema ({modulos.length})</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={modNome}
                    onChange={e => setModNome(e.target.value)}
                    placeholder="Nome do Módulo (Ex: Concentrador de Bombas)"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                  <input
                    type="text"
                    value={modDesc}
                    onChange={e => setModDesc(e.target.value)}
                    placeholder="Descrição breve"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddModulo}
                    className="px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg shrink-0 transition-colors shadow-sm"
                  >
                    Adicionar
                  </button>
                </div>

                {modulos.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {modulos.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
                      >
                        <div className="text-zinc-200">
                          <strong>{m.nome}</strong>
                          {m.descricao && <span className="text-zinc-400"> — {m.descricao}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveModulo(idx)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  Salvar Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
