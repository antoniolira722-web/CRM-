import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Cliente, TipoEstabelecimento, Filial } from '../types/crm';
import {
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Edit2,
  Trash2,
  Plus,
  X,
  Fuel,
  Store,
  Building,
  CheckCircle2,
  Layers,
  Coins
} from 'lucide-react';
import { CnpjSearchInput } from './CnpjSearchInput';
import { formatCnpj, fetchCnpjData, CnpjData } from '../lib/cnpj';

interface Props {
  onOpenEmailModal: (toEmail: string, toName: string, subject: string, message: string) => void;
}

export const ClientesView: React.FC<Props> = ({ onOpenEmailModal }) => {
  const { clientes, produtos, addCliente, updateCliente, deleteCliente, searchQuery, addToast } = useCrm();

  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [tipo, setTipo] = useState<TipoEstabelecimento>('posto');
  const [cnpj, setCnpj] = useState('');
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [bombas, setBombas] = useState('');
  const [tamanhoLoja, setTamanhoLoja] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [selectedProdutosIds, setSelectedProdutosIds] = useState<string[]>([]);
  const [valorContrato, setValorContrato] = useState<number>(0);
  const [valorImplantacao, setValorImplantacao] = useState<number>(0);
  const [valorMensalidade, setValorMensalidade] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  const [filialCnpj, setFilialCnpj] = useState('');
  const [filialNome, setFilialNome] = useState('');

  const formatMoney = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  const getWhatsappLink = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return null;
    const fullPhone = clean.startsWith('55') ? clean : '55' + clean;
    const text = encodeURIComponent(
      `Olá ${name}! Sou da FERA SISTEMA DO BRASIL — LINX/TOTVS. Passando para acompanhar o uso do seu sistema.`
    );
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  const openNewModal = () => {
    setEditingCliente(null);
    setNome('');
    setEmpresa('');
    setTipo('posto');
    setCnpj('');
    setFiliais([]);
    setTelefone('');
    setEmail('');
    setCidade('');
    setBombas('');
    setTamanhoLoja('');
    setStatus('ativo');
    setSelectedProdutosIds([]);
    setValorContrato(0);
    setValorImplantacao(0);
    setValorMensalidade(0);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setNome(c.nome);
    setEmpresa(c.empresa);
    setTipo(c.tipo);
    setCnpj(c.cnpj);
    setFiliais(c.filiais || []);
    setTelefone(c.telefone);
    setEmail(c.email);
    setCidade(c.cidade);
    setBombas(c.bombas || '');
    setTamanhoLoja(c.tamanhoLoja || '');
    setStatus(c.status);
    setSelectedProdutosIds(c.produtosIds || []);
    setValorContrato(c.valorContrato);
    setValorImplantacao(c.valorImplantacao);
    setValorMensalidade(c.valorMensalidade);
    setObservacoes(c.observacoes || '');
    setIsModalOpen(true);
  };

  // Auto-sum when selecting products in modal
  const handleProductToggle = (prodId: string) => {
    let nextIds: string[];
    if (selectedProdutosIds.includes(prodId)) {
      nextIds = selectedProdutosIds.filter(id => id !== prodId);
    } else {
      nextIds = [...selectedProdutosIds, prodId];
    }
    setSelectedProdutosIds(nextIds);

    // Sum prices
    let totalLic = 0;
    let totalImpl = 0;
    let totalMens = 0;

    nextIds.forEach(id => {
      const p = produtos.find(item => item.id === id);
      if (p) {
        totalLic += p.preco;
        totalImpl += p.implantacao;
        totalMens += p.mensalidade;
      }
    });

    setValorContrato(totalLic);
    setValorImplantacao(totalImpl);
    setValorMensalidade(totalMens);
  };

  const handleAddFilial = () => {
    if (!filialCnpj.trim()) {
      addToast('Informe o CNPJ da filial.', 'error');
      return;
    }
    setFiliais(prev => [...prev, { cnpj: filialCnpj.trim(), nome: filialNome.trim() || 'Filial' }]);
    setFilialCnpj('');
    setFilialNome('');
  };

  const handleRemoveFilial = (idx: number) => {
    setFiliais(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCnpjFound = (data: CnpjData) => {
    if (data.empresa) setEmpresa(data.empresa);
    if (data.tipoSugerido) setTipo(data.tipoSugerido);
    if (data.telefone && (!telefone || telefone === '')) setTelefone(data.telefone);
    if (data.email && (!email || email === '')) setEmail(data.email);
    if (data.cidade) setCidade(data.cidade);
    if (data.contato && (!nome || nome === '')) setNome(data.contato);
    addToast(`Dados da empresa "${data.empresa}" preenchidos via Receita!`, 'success');
  };

  const handleFilialCnpjChange = async (val: string) => {
    const formatted = formatCnpj(val);
    setFilialCnpj(formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 14 && !filialNome) {
      const res = await fetchCnpjData(clean);
      if (res.ok && res.data) {
        setFilialNome(res.data.empresa || res.data.razaoSocial);
        addToast(`Filial "${res.data.empresa}" identificada!`, 'info');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !empresa.trim()) {
      addToast('Preencha nome do contato e empresa.', 'error');
      return;
    }

    const sistemas = selectedProdutosIds
      .map(id => produtos.find(p => p.id === id)?.nome)
      .filter(Boolean) as string[];

    const modulos: string[] = [];
    selectedProdutosIds.forEach(id => {
      const p = produtos.find(prod => prod.id === id);
      if (p && p.modulos) {
        p.modulos.forEach(m => {
          if (!modulos.includes(m.nome)) modulos.push(m.nome);
        });
      }
    });

    if (editingCliente) {
      updateCliente(editingCliente.id, {
        nome: nome.trim(),
        empresa: empresa.trim(),
        tipo,
        cnpj: cnpj.trim(),
        filiais,
        telefone: telefone.trim(),
        email: email.trim(),
        cidade: cidade.trim(),
        bombas: bombas.trim(),
        tamanhoLoja: tamanhoLoja.trim(),
        status,
        sistemas,
        produtosIds: selectedProdutosIds,
        modulos,
        valorContrato: Number(valorContrato) || 0,
        valorImplantacao: Number(valorImplantacao) || 0,
        valorMensalidade: Number(valorMensalidade) || 0,
        observacoes: observacoes.trim()
      });
    } else {
      addCliente({
        leadId: null,
        nome: nome.trim(),
        empresa: empresa.trim(),
        tipo,
        cnpj: cnpj.trim(),
        filiais,
        telefone: telefone.trim(),
        email: email.trim(),
        cidade: cidade.trim(),
        bombas: bombas.trim(),
        tamanhoLoja: tamanhoLoja.trim(),
        status,
        sistemas,
        produtosIds: selectedProdutosIds,
        modulos,
        valorContrato: Number(valorContrato) || 0,
        valorImplantacao: Number(valorImplantacao) || 0,
        valorMensalidade: Number(valorMensalidade) || 0,
        observacoes: observacoes.trim()
      });
    }
    setIsModalOpen(false);
  };

  const filtered = clientes.filter(c => {
    if (filterTipo && c.tipo !== filterTipo) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.nome.toLowerCase().includes(q);
      const matchComp = c.empresa.toLowerCase().includes(q);
      const matchCity = (c.cidade || '').toLowerCase().includes(q);
      const matchCnpj = (c.cnpj || '').includes(q);
      if (!matchName && !matchComp && !matchCity && !matchCnpj) return false;
    }
    return true;
  });

  const totalMRR = clientes
    .filter(c => c.status === 'ativo')
    .reduce((s, c) => s + (c.valorMensalidade || 0), 0);

  const totalContratos = clientes.reduce((s, c) => s + (c.valorContrato || 0), 0);

  return (
    <div className="space-y-4">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#3ecf8e]/10 text-[#3ecf8e]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">Clientes Ativos</span>
            <div className="text-xl font-bold text-zinc-100">
              {clientes.filter(c => c.status === 'ativo').length} / {clientes.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#3ecf8e]/10 text-[#3ecf8e]">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">MRR (Mensalidades Recorrentes)</span>
            <div className="text-xl font-bold text-[#3ecf8e]">
              {formatMoney(totalMRR)}<span className="text-xs font-normal text-zinc-400">/mês</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Licenças Fechadas</span>
            <div className="text-xl font-bold text-zinc-100">
              {formatMoney(totalContratos)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="">Todos os Tipos</option>
            <option value="posto">Posto</option>
            <option value="conveniencia">Conveniência</option>
            <option value="ambos">Posto + Loja</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Clientes Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5 font-semibold">Posto / Empresa & Contato</th>
                <th className="p-3.5 font-semibold">Tipo</th>
                <th className="p-3.5 font-semibold">Cidade</th>
                <th className="p-3.5 font-semibold">Sistemas Contratados</th>
                <th className="p-3.5 font-semibold">Contrato / Mensalidade</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const waLink = getWhatsappLink(c.telefone, c.nome);
                  return (
                    <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-zinc-100 text-sm">{c.empresa}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {c.nome} {c.telefone && `• ${c.telefone}`} {c.cnpj && `• ${c.cnpj}`}
                          {c.filiais && c.filiais.length > 0 && (
                            <span className="text-[#3ecf8e] font-medium"> • {c.filiais.length} filial(is)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
                          {c.tipo === 'posto' && <Fuel className="w-3 h-3 text-amber-400" />}
                          {c.tipo === 'conveniencia' && <Store className="w-3 h-3 text-purple-400" />}
                          {c.tipo === 'ambos' && <Building className="w-3 h-3 text-blue-400" />}
                          <span>{c.tipo === 'posto' ? 'Posto' : c.tipo === 'conveniencia' ? 'Conveniência' : 'Posto + Loja'}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300">{c.cidade || '—'}</td>
                      <td className="p-3.5 max-w-xs">
                        <div className="text-zinc-200 font-medium">{c.sistemas.join(', ') || 'Nenhum'}</div>
                        {c.modulos && c.modulos.length > 0 && (
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                            Módulos: {c.modulos.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#3ecf8e]">{formatMoney(c.valorContrato)}</div>
                        <div className="text-[11px] text-zinc-300 font-medium">
                          {formatMoney(c.valorMensalidade)}/mês
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'ativo'
                              ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 border border-zinc-800 transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {c.email && (
                            <button
                              onClick={() => {
                                onOpenEmailModal(
                                  c.email,
                                  c.nome,
                                  `Acompanhamento Comercial — ${c.empresa}`,
                                  `Olá ${c.nome}!\n\nPassando para acompanhar os sistemas em funcionamento no posto ${c.empresa}.\n\nAtenciosamente,\nFERA SISTEMA DO BRASIL`
                                );
                              }}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-blue-950 text-blue-400 hover:text-blue-300 border border-zinc-800 transition-colors"
                              title="Enviar E-mail"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title="Editar Cliente"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remover cliente "${c.empresa}"?`)) {
                                deleteCliente(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                            title="Remover Cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo / Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3ecf8e]" />
                <span>{editingCliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</span>
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
                  <label className="block text-zinc-400 font-semibold mb-1">Nome do Contato *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Fernando Alves"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Empresa / Posto *</label>
                  <input
                    type="text"
                    required
                    value={empresa}
                    onChange={e => setEmpresa(e.target.value)}
                    placeholder="Ex: Posto Bandeira Branca"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as TipoEstabelecimento)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="posto">Posto de Combustível</option>
                    <option value="conveniencia">Conveniência</option>
                    <option value="ambos">Posto + Conveniência</option>
                  </select>
                </div>

                <CnpjSearchInput
                  value={cnpj}
                  onChange={setCnpj}
                  onCompanyFound={handleCnpjFound}
                  label="CNPJ Matriz (Busca Automática na Receita)"
                  placeholder="00.000.000/0001-00"
                />

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(19) 99999-9999"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contato@posto.com.br"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Ex: Campinas / SP"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'ativo' | 'inativo')}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Filiais Manager */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-100 text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Filiais do Cliente</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">{filiais.length} filial(is)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={filialCnpj}
                    onChange={e => handleFilialCnpjChange(e.target.value)}
                    placeholder="CNPJ Filial"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                  <input
                    type="text"
                    value={filialNome}
                    onChange={e => setFilialNome(e.target.value)}
                    placeholder="Nome da Filial / Posto"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFilial}
                    className="px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg shrink-0 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {filiais.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {filiais.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
                      >
                        <span className="text-zinc-200">
                          <strong>{f.cnpj}</strong> — {f.nome}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFilial(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sistemas Contratados Checklist with auto sum */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <label className="font-bold text-zinc-100 block">Sistemas Contratados (Catálogo Interligado)</label>
                <p className="text-[11px] text-zinc-400">
                  Ao marcar um sistema, os valores de licença, implantação e mensalidade são calculados automaticamente.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                  {produtos.map(p => {
                    const isChecked = selectedProdutosIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/40 text-zinc-100'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleProductToggle(p.id)}
                          className="w-3.5 h-3.5 mt-0.5 accent-[#3ecf8e]"
                        />
                        <div className="min-w-0">
                          <strong className="block text-zinc-100 truncate">{p.nome}</strong>
                          <span className="text-[10px] text-zinc-400 block">
                            Lic: {formatMoney(p.preco)} • Mens: {formatMoney(p.mensalidade)}/mês
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Financial values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Valor Contrato / Licenças (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={valorContrato}
                    onChange={e => setValorContrato(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Implantação (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={valorImplantacao}
                    onChange={e => setValorImplantacao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Mensalidade (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={valorMensalidade}
                    onChange={e => setValorMensalidade(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Observações do Cliente</label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações de suporte, histórico de fechamento, data de renovação..."
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
