import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Lead, LeadStage, TipoEstabelecimento, Filial } from '../types/crm';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Building,
  Fuel,
  Store,
  Plus,
  X,
  Link as LinkIcon,
  ChevronRight,
  Send
} from 'lucide-react';
import { CnpjSearchInput } from './CnpjSearchInput';
import { formatCnpj, fetchCnpjData, CnpjData } from '../lib/cnpj';

interface Props {
  onOpenEmailModal: (toEmail: string, toName: string, subject: string, message: string) => void;
}

export const LeadsView: React.FC<Props> = ({ onOpenEmailModal }) => {
  const {
    leads,
    clientes,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToCliente,
    searchQuery,
    addToast
  } = useCrm();

  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingLinksLead, setViewingLinksLead] = useState<Lead | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [tipo, setTipo] = useState<TipoEstabelecimento>('posto');
  const [cnpj, setCnpj] = useState('');
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bombas, setBombas] = useState('');
  const [tamanhoLoja, setTamanhoLoja] = useState('');
  const [origem, setOrigem] = useState('Indicação');
  const [status, setStatus] = useState<LeadStage>('lead');
  const [valorEstimado, setValorEstimado] = useState<number>(0);
  const [valorImplantacao, setValorImplantacao] = useState<number>(0);
  const [valorMensalidade, setValorMensalidade] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  // Filiais editor state inside modal
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
      `Olá ${name}! Sou da FERA SISTEMA DO BRASIL — LINX/TOTVS. Gostaria de apresentar nossas soluções para postos e conveniências.`
    );
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  const openNewModal = () => {
    setEditingLead(null);
    setNome('');
    setEmpresa('');
    setTipo('posto');
    setCnpj('');
    setFiliais([]);
    setTelefone('');
    setEmail('');
    setCidade('');
    setEndereco('');
    setBombas('');
    setTamanhoLoja('');
    setOrigem('Indicação');
    setStatus('lead');
    setValorEstimado(0);
    setValorImplantacao(0);
    setValorMensalidade(0);
    setObservacoes('');
    setIsModalOpen(true);
  };

  const openEditModal = (l: Lead) => {
    setEditingLead(l);
    setNome(l.nome);
    setEmpresa(l.empresa);
    setTipo(l.tipo);
    setCnpj(l.cnpj);
    setFiliais(l.filiais || []);
    setTelefone(l.telefone);
    setEmail(l.email);
    setCidade(l.cidade);
    setEndereco(l.endereco || '');
    setBombas(l.bombas || '');
    setTamanhoLoja(l.tamanhoLoja || '');
    setOrigem(l.origem);
    setStatus(l.status);
    setValorEstimado(l.valorEstimado);
    setValorImplantacao(l.valorImplantacao);
    setValorMensalidade(l.valorMensalidade);
    setObservacoes(l.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !empresa.trim()) {
      addToast('Preencha nome do contato e empresa.', 'error');
      return;
    }

    if (editingLead) {
      updateLead(editingLead.id, {
        nome: nome.trim(),
        empresa: empresa.trim(),
        tipo,
        cnpj: cnpj.trim(),
        filiais,
        telefone: telefone.trim(),
        email: email.trim(),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        bombas: bombas.trim(),
        tamanhoLoja: tamanhoLoja.trim(),
        origem,
        status,
        valorEstimado: Number(valorEstimado) || 0,
        valorImplantacao: Number(valorImplantacao) || 0,
        valorMensalidade: Number(valorMensalidade) || 0,
        observacoes: observacoes.trim()
      });
    } else {
      addLead({
        nome: nome.trim(),
        empresa: empresa.trim(),
        tipo,
        cnpj: cnpj.trim(),
        filiais,
        telefone: telefone.trim(),
        email: email.trim(),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        bombas: bombas.trim(),
        tamanhoLoja: tamanhoLoja.trim(),
        origem,
        status,
        valorEstimado: Number(valorEstimado) || 0,
        valorImplantacao: Number(valorImplantacao) || 0,
        valorMensalidade: Number(valorMensalidade) || 0,
        observacoes: observacoes.trim()
      });
    }
    setIsModalOpen(false);
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

  const handleRemoveFilial = (index: number) => {
    setFiliais(prev => prev.filter((_, i) => i !== index));
  };

  const handleCnpjFound = (data: CnpjData) => {
    if (data.empresa) setEmpresa(data.empresa);
    if (data.telefone && (!telefone || telefone === '')) setTelefone(data.telefone);
    if (data.email && (!email || email === '')) setEmail(data.email);
    if (data.cidade) setCidade(data.cidade);
    if (data.endereco) setEndereco(data.endereco);
    if (data.tipoSugerido) setTipo(data.tipoSugerido);
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

  const handleImportClientData = (cliId: string) => {
    const cli = clientes.find(c => c.id === cliId);
    if (!cli) return;
    setNome(cli.nome);
    setEmpresa(cli.empresa);
    setTipo(cli.tipo);
    setCnpj(cli.cnpj);
    setFiliais(cli.filiais || []);
    setTelefone(cli.telefone);
    setEmail(cli.email);
    setCidade(cli.cidade);
    setBombas(cli.bombas || '');
    setTamanhoLoja(cli.tamanhoLoja || '');
    setValorEstimado(cli.valorContrato);
    setValorImplantacao(cli.valorImplantacao);
    setValorMensalidade(cli.valorMensalidade);
    setObservacoes(cli.observacoes || '');
    addToast('Dados do cliente importados com sucesso!', 'info');
  };

  // Filtered leads
  const filtered = leads.filter(l => {
    if (filterTipo && l.tipo !== filterTipo) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = l.nome.toLowerCase().includes(q);
      const matchCompany = l.empresa.toLowerCase().includes(q);
      const matchCity = (l.cidade || '').toLowerCase().includes(q);
      const matchCnpj = (l.cnpj || '').includes(q);
      if (!matchName && !matchCompany && !matchCity && !matchCnpj) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Actions & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="">Todos os Tipos</option>
            <option value="posto">Posto de Combustível</option>
            <option value="conveniencia">Conveniência</option>
            <option value="ambos">Posto + Conveniência</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
          >
            <option value="">Todos os Status</option>
            <option value="lead">Lead</option>
            <option value="qualificado">Qualificado</option>
            <option value="proposta">Proposta</option>
            <option value="negociacao">Negociação</option>
            <option value="fechado">Fechado</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Lead</span>
        </button>
      </div>

      {/* Leads Table Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5 font-semibold">Posto / Empresa & Contato</th>
                <th className="p-3.5 font-semibold">Tipo</th>
                <th className="p-3.5 font-semibold">Cidade</th>
                <th className="p-3.5 font-semibold">Bombas / Loja</th>
                <th className="p-3.5 font-semibold">Valor Estimado</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map(l => {
                  const waLink = getWhatsappLink(l.telefone, l.nome);
                  return (
                    <tr key={l.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-zinc-100 text-sm">{l.empresa}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{l.nome}</span>
                          {l.telefone && <span>• {l.telefone}</span>}
                          {l.cnpj && <span>• Matriz: {l.cnpj}</span>}
                          {l.filiais && l.filiais.length > 0 && (
                            <span className="text-[#3ecf8e] font-medium">
                              • {l.filiais.length} filial(is)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
                          {l.tipo === 'posto' && <Fuel className="w-3 h-3 text-amber-400" />}
                          {l.tipo === 'conveniencia' && <Store className="w-3 h-3 text-purple-400" />}
                          {l.tipo === 'ambos' && <Building className="w-3 h-3 text-blue-400" />}
                          <span>{l.tipo === 'posto' ? 'Posto' : l.tipo === 'conveniencia' ? 'Conveniência' : 'Posto + Loja'}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300">{l.cidade || '—'}</td>
                      <td className="p-3.5 text-zinc-300">
                        {l.bombas ? `${l.bombas}` : ''}
                        {l.bombas && l.tamanhoLoja ? ' / ' : ''}
                        {l.tamanhoLoja ? `${l.tamanhoLoja}` : ''}
                        {!l.bombas && !l.tamanhoLoja && '—'}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[#3ecf8e]">
                          {formatMoney(l.valorEstimado)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Impl: {formatMoney(l.valorImplantacao)} • Mens: {formatMoney(l.valorMensalidade)}/mês
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30">
                          {l.status}
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

                          {l.email && (
                            <button
                              onClick={() => {
                                onOpenEmailModal(
                                  l.email,
                                  l.nome,
                                  `Apresentação Comercial FERA Sistemas — ${l.empresa}`,
                                  `Olá ${l.nome}!\n\nSou da FERA SISTEMA DO BRASIL — LINX/TOTVS, especialista em sistemas para postos de combustíveis e lojas de conveniência.\n\nGostaria de apresentar nossas soluções para o posto ${l.empresa}.\n\nAtenciosamente,\nFERA SISTEMA DO BRASIL`
                                );
                              }}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-blue-950 text-blue-400 hover:text-blue-300 border border-zinc-800 transition-colors"
                              title="Enviar E-mail"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setViewingLinksLead(l)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title="Ver Histórico & Vínculos"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(l)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title="Editar Lead"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {l.status !== 'fechado' && (
                            <button
                              onClick={() => {
                                if (confirm(`Deseja converter o lead "${l.empresa}" em cliente ativo?`)) {
                                  convertLeadToCliente(l.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-emerald-900/40 text-[#3ecf8e] hover:text-emerald-300 border border-zinc-800 transition-colors"
                              title="Converter em Cliente Ativo"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Excluir o lead "${l.empresa}"?`)) {
                                deleteLead(l.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                            title="Excluir Lead"
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

      {/* Modal: Cadastrar / Editar Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#3ecf8e]" />
                <span>{editingLead ? 'Editar Lead' : 'Cadastrar Novo Lead'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              {/* Client Auto-import */}
              {!editingLead && clientes.length > 0 && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-zinc-400">Preencher com dados de cliente já existente:</span>
                  <select
                    onChange={e => {
                      if (e.target.value) handleImportClientData(e.target.value);
                    }}
                    defaultValue=""
                    className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs"
                  >
                    <option value="">— Selecione um cliente —</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.empresa} ({c.nome})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nome do Contato *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Carlos Mendes"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nome da Empresa / Posto *</label>
                  <input
                    type="text"
                    required
                    value={empresa}
                    onChange={e => setEmpresa(e.target.value)}
                    placeholder="Ex: Auto Posto Estrela do Sul"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tipo de Estabelecimento</label>
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
                    placeholder="(11) 99999-9999"
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
                    placeholder="Ex: São Paulo / SP"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={e => setEndereco(e.target.value)}
                    placeholder="Ex: Av. Brasil, 1500"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nº de Bombas / Bicos</label>
                  <input
                    type="text"
                    value={bombas}
                    onChange={e => setBombas(e.target.value)}
                    placeholder="Ex: 8 bombas (16 bicos)"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tamanho da Loja</label>
                  <input
                    type="text"
                    value={tamanhoLoja}
                    onChange={e => setTamanhoLoja(e.target.value)}
                    placeholder="Ex: 100m²"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Origem do Lead</label>
                  <select
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option>Indicação</option>
                    <option>Site</option>
                    <option>Feira / Evento</option>
                    <option>Cold call</option>
                    <option>Visita presencial</option>
                    <option>Redes sociais</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Estágio no Funil</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as LeadStage)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualificado">Qualificado</option>
                    <option value="proposta">Proposta</option>
                    <option value="negociacao">Negociação</option>
                    <option value="fechado">Fechado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
              </div>

              {/* Filiais Manager */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-100 text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Filiais da Rede (Replicar na Proposta)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">{filiais.length} filial(is) adicionada(s)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={filialCnpj}
                    onChange={e => handleFilialCnpjChange(e.target.value)}
                    placeholder="CNPJ Filial (00.000.000/0002-00)"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-[#3ecf8e]"
                  />
                  <input
                    type="text"
                    value={filialNome}
                    onChange={e => setFilialNome(e.target.value)}
                    placeholder="Nome da Filial / Unidade"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-[#3ecf8e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFilial}
                    className="px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg text-xs transition-colors shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                {filiais.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {filiais.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px]"
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

              {/* Financial values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Licença Estimada (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={valorEstimado}
                    onChange={e => setValorEstimado(parseFloat(e.target.value) || 0)}
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
                <label className="block text-zinc-400 font-semibold mb-1">Observações Comerciais</label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Detalhes da negociação, sistemas atuais, bandeira do posto..."
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
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Histórico & Vínculos */}
      {viewingLinksLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <div>
                <h3 className="text-base font-bold text-zinc-100">{viewingLinksLead.empresa}</h3>
                <p className="text-[11px] text-zinc-400">Histórico de interações e dados do lead</p>
              </div>
              <button
                onClick={() => setViewingLinksLead(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="text-zinc-400">Contato:</span>{' '}
                  <strong className="text-zinc-100">{viewingLinksLead.nome}</strong>
                </div>
                <div>
                  <span className="text-zinc-400">Status:</span>{' '}
                  <strong className="text-[#3ecf8e] uppercase">{viewingLinksLead.status}</strong>
                </div>
                <div>
                  <span className="text-zinc-400">Telefone:</span>{' '}
                  <span className="text-zinc-200">{viewingLinksLead.telefone || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400">E-mail:</span>{' '}
                  <span className="text-zinc-200">{viewingLinksLead.email || '—'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-100 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Linha do Tempo / Histórico</span>
                </h4>
                <div className="space-y-2 border-l-2 border-zinc-800 pl-4 ml-2">
                  {viewingLinksLead.historico && viewingLinksLead.historico.length > 0 ? (
                    viewingLinksLead.historico.map((h, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#3ecf8e]" />
                        <div className="text-[10px] text-zinc-400">
                          {new Date(h.data).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(h.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-zinc-200 text-xs font-medium mt-0.5">{h.texto}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400">Nenhum histórico registrado.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
              <button
                onClick={() => setViewingLinksLead(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
