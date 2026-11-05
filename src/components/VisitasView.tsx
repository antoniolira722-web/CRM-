import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Visita, NivelInteresse, TipoEstabelecimento } from '../types/crm';
import {
  MapPin,
  Filter,
  FileText,
  FileSpreadsheet,
  Mail,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  CalendarCheck,
  Compass,
  X,
  Printer,
  Sparkles,
  Fuel,
  Store,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';
import { CnpjSearchInput } from './CnpjSearchInput';
import { CnpjData } from '../lib/cnpj';

interface Props {
  onOpenEmailModal: (toEmail: string, toName: string, subject: string, message: string) => void;
}

export const VisitasView: React.FC<Props> = ({ onOpenEmailModal }) => {
  const { visitas, produtos, addVisita, updateVisita, deleteVisita, addToast, empresa } = useCrm();

  // Filters State
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');
  const [interesseFiltro, setInteresseFiltro] = useState('');
  const [tipoVisitaFiltro, setTipoVisitaFiltro] = useState('');
  const [tipoEstabFiltro, setTipoEstabFiltro] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [vinculoFiltro, setVinculoFiltro] = useState('');
  const [busca, setBusca] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Form State
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [tipoVisita, setTipoVisita] = useState('Visita presencial');
  const [empresaNome, setEmpresaNome] = useState('');
  const [contato, setContato] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [lat, setLat] = useState<number | string>('');
  const [lng, setLng] = useState<number | string>('');
  const [tipo, setTipo] = useState<TipoEstabelecimento>('posto');
  const [bombas, setBombas] = useState('');
  const [tamanhoLoja, setTamanhoLoja] = useState('');
  const [sistemaAtual, setSistemaAtual] = useState('');
  const [interesse, setInteresse] = useState<NivelInteresse>('medio');
  const [produtosIds, setProdutosIds] = useState<string[]>([]);
  const [resultado, setResultado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [autoCreateLead, setAutoCreateLead] = useState(true);

  // Filter application
  const filtered = visitas.filter(v => {
    if (dataDe) {
      const vDate = v.data.slice(0, 10);
      if (vDate < dataDe) return false;
    }
    if (dataAte) {
      const vDate = v.data.slice(0, 10);
      if (vDate > dataAte) return false;
    }
    if (interesseFiltro && v.interesse !== interesseFiltro) return false;
    if (tipoVisitaFiltro && v.tipoVisita !== tipoVisitaFiltro) return false;
    if (tipoEstabFiltro && v.tipo !== tipoEstabFiltro) return false;
    if (cidadeFiltro && !v.cidade.toLowerCase().includes(cidadeFiltro.toLowerCase())) return false;
    if (vinculoFiltro === 'com_vinculo' && !v.leadId && !v.clienteId) return false;
    if (vinculoFiltro === 'sem_vinculo' && (v.leadId || v.clienteId)) return false;

    if (busca) {
      const q = busca.toLowerCase();
      const matchComp = v.empresa.toLowerCase().includes(q);
      const matchCont = v.contato.toLowerCase().includes(q);
      const matchCid = v.cidade.toLowerCase().includes(q);
      const matchRes = (v.resultado || '').toLowerCase().includes(q);
      if (!matchComp && !matchCont && !matchCid && !matchRes) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setDataDe('');
    setDataAte('');
    setInteresseFiltro('');
    setTipoVisitaFiltro('');
    setTipoEstabFiltro('');
    setCidadeFiltro('');
    setVinculoFiltro('');
    setBusca('');
  };

  const openNewModal = () => {
    setEditingVisita(null);
    setData(new Date().toISOString().slice(0, 10));
    setTipoVisita('Visita presencial');
    setEmpresaNome('');
    setContato('');
    setCnpj('');
    setTelefone('');
    setEmail('');
    setCidade('');
    setEndereco('');
    setLat('');
    setLng('');
    setTipo('posto');
    setBombas('');
    setTamanhoLoja('');
    setSistemaAtual('');
    setInteresse('medio');
    setProdutosIds([]);
    setResultado('');
    setObservacoes('');
    setAutoCreateLead(true);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Visita) => {
    setEditingVisita(v);
    setData(v.data.slice(0, 10));
    setTipoVisita(v.tipoVisita);
    setEmpresaNome(v.empresa);
    setContato(v.contato);
    setCnpj(v.cnpj || '');
    setTelefone(v.telefone || '');
    setEmail(v.email || '');
    setCidade(v.cidade);
    setEndereco(v.endereco || '');
    setLat(v.lat || '');
    setLng(v.lng || '');
    setTipo(v.tipo);
    setBombas(v.bombas || '');
    setTamanhoLoja(v.tamanhoLoja || '');
    setSistemaAtual(v.sistemaAtual || '');
    setInteresse(v.interesse);
    setProdutosIds(v.produtosIds || []);
    setResultado(v.resultado || '');
    setObservacoes(v.observacoes || '');
    setAutoCreateLead(false);
    setIsModalOpen(true);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocalização não suportada no seu navegador.', 'error');
      return;
    }
    addToast('Obtendo coordenadas GPS...', 'info');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        addToast('Coordenadas de localização capturadas com sucesso!', 'success');
      },
      err => {
        addToast('Não foi possível obter a localização: ' + err.message, 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCnpjFound = (data: CnpjData) => {
    if (data.empresa) setEmpresaNome(data.empresa);
    if (data.contato && (!contato || contato === '')) setContato(data.contato);
    if (data.telefone && (!telefone || telefone === '')) setTelefone(data.telefone);
    if (data.email && (!email || email === '')) setEmail(data.email);
    if (data.cidade) setCidade(data.cidade);
    if (data.endereco) setEndereco(data.endereco);
    if (data.tipoSugerido) setTipo(data.tipoSugerido);
    addToast(`Dados da empresa "${data.empresa}" preenchidos via Receita!`, 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaNome.trim() || !contato.trim()) {
      addToast('Preencha o posto/empresa e contato.', 'error');
      return;
    }

    const produtosNomes = produtosIds
      .map(id => produtos.find(p => p.id === id)?.nome)
      .filter(Boolean) as string[];

    if (editingVisita) {
      updateVisita(editingVisita.id, {
        data: new Date(data + 'T12:00:00').toISOString(),
        tipoVisita,
        empresa: empresaNome.trim(),
        contato: contato.trim(),
        cnpj: cnpj.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        lat,
        lng,
        tipo,
        bombas: bombas.trim(),
        tamanhoLoja: tamanhoLoja.trim(),
        sistemaAtual: sistemaAtual.trim(),
        interesse,
        produtosIds,
        produtosNomes,
        resultado: resultado.trim(),
        observacoes: observacoes.trim()
      });
    } else {
      addVisita(
        {
          data: new Date(data + 'T12:00:00').toISOString(),
          tipoVisita,
          empresa: empresaNome.trim(),
          contato: contato.trim(),
          cnpj: cnpj.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          cidade: cidade.trim(),
          endereco: endereco.trim(),
          lat,
          lng,
          tipo,
          bombas: bombas.trim(),
          tamanhoLoja: tamanhoLoja.trim(),
          sistemaAtual: sistemaAtual.trim(),
          interesse,
          produtosIds,
          produtosNomes,
          resultado: resultado.trim(),
          observacoes: observacoes.trim(),
          leadId: null,
          clienteId: null
        },
        autoCreateLead
      );
    }
    setIsModalOpen(false);
  };

  const exportExcelCsv = () => {
    if (filtered.length === 0) {
      addToast('Nenhum registro para exportar.', 'error');
      return;
    }
    const headers = [
      'Data',
      'Tipo Visita',
      'Posto / Empresa',
      'Contato',
      'CNPJ',
      'Telefone',
      'E-mail',
      'Cidade',
      'Endereço',
      'Latitude',
      'Longitude',
      'Tipo Estabelecimento',
      'Bombas',
      'Tamanho Loja',
      'Sistema Atual',
      'Interesse',
      'Sistemas de Interesse',
      'Resultado da Visita',
      'Observações'
    ];

    const sep = ';';
    const rows = filtered.map(v => [
      new Date(v.data).toLocaleDateString('pt-BR'),
      v.tipoVisita,
      v.empresa,
      v.contato,
      v.cnpj || '',
      v.telefone || '',
      v.email || '',
      v.cidade,
      v.endereco || '',
      v.lat || '',
      v.lng || '',
      v.tipo,
      v.bombas || '',
      v.tamanhoLoja || '',
      v.sistemaAtual || '',
      v.interesse,
      (v.produtosNomes || []).join(' | '),
      (v.resultado || '').replace(/(\r\n|\n|\r)/gm, ' '),
      (v.observacoes || '').replace(/(\r\n|\n|\r)/gm, ' ')
    ]);

    const csvContent =
      '\uFEFF' +
      headers.join(sep) +
      '\n' +
      rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(sep)).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-postos-visitados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Planilha Excel (CSV) baixada com sucesso!', 'success');
  };

  const handleSendEmailReport = () => {
    const list = filtered.slice(0, 25);
    const text = `Relatório de Postos Visitados — FERA SISTEMA DO BRASIL\nData: ${new Date().toLocaleDateString('pt-BR')}\nTotal filtrado: ${filtered.length} postos\n\nResumo:\n${list
      .map(
        v =>
          `• ${new Date(v.data).toLocaleDateString('pt-BR')} — ${v.empresa} (${v.contato}) | Interesse: ${v.interesse.toUpperCase()} | ${v.resultado || 'Sem resultado'}`
      )
      .join('\n')}`;

    onOpenEmailModal(
      empresa.email || '',
      'Diretoria Comercial',
      `Relatório de Postos Visitados — ${new Date().toLocaleDateString('pt-BR')}`,
      text
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div>
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total Visitados</span>
          <div className="text-xl font-bold text-zinc-100 mt-0.5">{visitas.length}</div>
        </div>
        <div>
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Interesse Alto / Médio</span>
          <div className="text-xl font-bold text-amber-400 mt-0.5">
            {visitas.filter(v => v.interesse === 'alto' || v.interesse === 'medio').length}
          </div>
        </div>
        <div>
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Convertidos em Lead</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">
            {visitas.filter(v => v.leadId || v.clienteId).length}
          </div>
        </div>
        <div>
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Exibindo no Filtro</span>
          <div className="text-xl font-bold text-[#3ecf8e] mt-0.5">{filtered.length}</div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#3ecf8e]" />
            <span>Filtros Avançados de Prospecção</span>
          </h3>
          <button
            onClick={clearFilters}
            className="text-xs text-zinc-400 hover:text-white underline transition-colors"
          >
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Data De</label>
            <input
              type="date"
              value={dataDe}
              onChange={e => setDataDe(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Data Até</label>
            <input
              type="date"
              value={dataAte}
              onChange={e => setDataAte(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Nível de Interesse</label>
            <select
              value={interesseFiltro}
              onChange={e => setInteresseFiltro(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            >
              <option value="">Todos os Interesses</option>
              <option value="alto">Alto</option>
              <option value="medio">Médio</option>
              <option value="baixo">Baixo</option>
              <option value="nenhum">Nenhum</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Tipo de Prospecção</label>
            <select
              value={tipoVisitaFiltro}
              onChange={e => setTipoVisitaFiltro(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            >
              <option value="">Todos</option>
              <option>Visita presencial</option>
              <option>Cold call no local</option>
              <option>Indicação</option>
              <option>Feira / evento</option>
              <option>Retorno</option>
              <option>Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Estabelecimento</label>
            <select
              value={tipoEstabFiltro}
              onChange={e => setTipoEstabFiltro(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            >
              <option value="">Todos</option>
              <option value="posto">Posto</option>
              <option value="conveniencia">Conveniência</option>
              <option value="ambos">Posto + Conveniência</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Vínculo</label>
            <select
              value={vinculoFiltro}
              onChange={e => setVinculoFiltro(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            >
              <option value="">Todos</option>
              <option value="com_vinculo">Convertido em Lead / Cliente</option>
              <option value="sem_vinculo">Sem Vínculo (Apenas Visita)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Cidade</label>
            <input
              type="text"
              placeholder="Ex: São Paulo"
              value={cidadeFiltro}
              onChange={e => setCidadeFiltro(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Busca Textual</label>
            <input
              type="text"
              placeholder="Posto, contato ou notas..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#3ecf8e]" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={exportExcelCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Planilha Excel (CSV)</span>
          </button>

          <button
            onClick={handleSendEmailReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Enviar por E-mail</span>
          </button>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Visita</span>
        </button>
      </div>

      {/* Visitas Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5 font-semibold">Data</th>
                <th className="p-3.5 font-semibold">Posto / Empresa & Contato</th>
                <th className="p-3.5 font-semibold">Cidade & Endereço</th>
                <th className="p-3.5 font-semibold">Tipo</th>
                <th className="p-3.5 font-semibold">Interesse</th>
                <th className="p-3.5 font-semibold">Resultado / Diálogo</th>
                <th className="p-3.5 font-semibold">Vínculo</th>
                <th className="p-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    Nenhuma visita encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map(v => {
                  let interesseBadge = 'bg-zinc-800 text-zinc-300 border-zinc-700';
                  if (v.interesse === 'alto') interesseBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                  if (v.interesse === 'medio') interesseBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  if (v.interesse === 'baixo') interesseBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/40';

                  return (
                    <tr key={v.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3.5 whitespace-nowrap text-zinc-300">
                        {new Date(v.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-zinc-100 text-sm">{v.empresa}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {v.contato} {v.telefone && `• ${v.telefone}`} {v.cnpj && `• ${v.cnpj}`}
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        <div>{v.cidade}</div>
                        {v.endereco && <div className="text-[11px] text-zinc-400 truncate max-w-xs">{v.endereco}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
                          {v.tipo === 'posto' && <Fuel className="w-3 h-3 text-amber-400" />}
                          {v.tipo === 'conveniencia' && <Store className="w-3 h-3 text-purple-400" />}
                          {v.tipo === 'ambos' && <Building className="w-3 h-3 text-blue-400" />}
                          <span>{v.tipo === 'posto' ? 'Posto' : v.tipo === 'conveniencia' ? 'Conveniência' : 'Posto + Loja'}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${interesseBadge}`}>
                          {v.interesse}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-200 max-w-xs truncate" title={v.resultado}>
                        {v.resultado || '—'}
                      </td>
                      <td className="p-3.5">
                        {v.clienteId ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Cliente
                          </span>
                        ) : v.leadId ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/40">
                            Lead
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">Sem Vínculo</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title="Editar Visita"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Excluir registro da visita em "${v.empresa}"?`)) {
                                deleteVisita(v.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                            title="Excluir Visita"
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

      {/* Modal: Nova / Editar Visita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3ecf8e]" />
                <span>{editingVisita ? 'Editar Posto Visitado' : 'Registrar Visita / Prospecção'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Data da Visita *</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tipo de Prospecção</label>
                  <select
                    value={tipoVisita}
                    onChange={e => setTipoVisita(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option>Visita presencial</option>
                    <option>Cold call no local</option>
                    <option>Indicação</option>
                    <option>Feira / evento</option>
                    <option>Retorno</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nome do Posto / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={empresaNome}
                    onChange={e => setEmpresaNome(e.target.value)}
                    placeholder="Ex: Posto Rota do Sol"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Contato com quem conversou *</label>
                  <input
                    type="text"
                    required
                    value={contato}
                    onChange={e => setContato(e.target.value)}
                    placeholder="Ex: Roberto (Gerente de Pista)"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <CnpjSearchInput
                  value={cnpj}
                  onChange={setCnpj}
                  onCompanyFound={handleCnpjFound}
                  label="CNPJ (Busca Automática na Receita)"
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
                    placeholder="gerencia@posto.com.br"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Cidade / UF *</label>
                  <input
                    type="text"
                    required
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Ex: Campinas / SP"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>

              {/* Address & GPS */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-100">Endereço & Localização GPS</label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[#3ecf8e] text-[11px] font-semibold transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Usar Minha Localização (GPS)</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Endereço do posto / rodovia / km..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />

                {(lat || lng) && (
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <span>Latitude: {lat}</span>
                    <span>Longitude: {lng}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tipo Estabelecimento</label>
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

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nº de Bombas</label>
                  <input
                    type="text"
                    value={bombas}
                    onChange={e => setBombas(e.target.value)}
                    placeholder="Ex: 6 bombas"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nível de Interesse</label>
                  <select
                    value={interesse}
                    onChange={e => setInteresse(e.target.value as NivelInteresse)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="alto">Alto</option>
                    <option value="medio">Médio</option>
                    <option value="baixo">Baixo</option>
                    <option value="nenhum">Nenhum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Sistema Atual do Posto</label>
                <input
                  type="text"
                  value={sistemaAtual}
                  onChange={e => setSistemaAtual(e.target.value)}
                  placeholder="Ex: Concorrente X, planilha, sistema sem nota..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Sistemas de Interesse (Catálogo FERA)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800 max-h-36 overflow-y-auto">
                  {produtos.map(p => {
                    const isSelected = produtosIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#3ecf8e]/20 text-zinc-100 font-medium' : 'text-zinc-400 hover:bg-zinc-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) setProdutosIds(prev => [...prev, p.id]);
                            else setProdutosIds(prev => prev.filter(x => x !== p.id));
                          }}
                          className="w-3.5 h-3.5 accent-[#3ecf8e]"
                        />
                        <span className="truncate">{p.nome}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Resultado da Visita / Diálogo Comercial *</label>
                <textarea
                  rows={3}
                  required
                  value={resultado}
                  onChange={e => setResultado(e.target.value)}
                  placeholder="Descreva o que foi conversado, objeções, interesse em automação ou PDV, prazos acordados..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              {!editingVisita && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <input
                    type="checkbox"
                    id="auto-lead"
                    checked={autoCreateLead}
                    onChange={e => setAutoCreateLead(e.target.checked)}
                    className="w-4 h-4 accent-[#3ecf8e]"
                  />
                  <label htmlFor="auto-lead" className="text-zinc-300 font-medium cursor-pointer">
                    Gerar / vincular automaticamente Lead no Funil de Vendas com Follow-up em 3 dias
                  </label>
                </div>
              )}

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
                  Salvar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Relatório PDF / Impressão */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100 no-print">
              <div>
                <h3 className="text-base font-bold text-slate-900">Relatório de Postos Visitados — Prospecção</h3>
                <p className="text-xs text-slate-600">FERA SISTEMA DO BRASIL — LINX/TOTVS</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-xs text-slate-800 printable-area">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-emerald-700">{empresa.nomeFantasia || 'FERA SISTEMA DO BRASIL'}</h1>
                  <p className="text-xs text-slate-600">{empresa.razaoSocial} • CNPJ: {empresa.cnpj || '—'}</p>
                  <p className="text-xs text-slate-600">{empresa.telefone} • {empresa.email}</p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div className="font-bold text-slate-900">Relatório de Prospecção</div>
                  <div>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
                  <div>Total de registros: {filtered.length} postos</div>
                </div>
              </div>

              {/* Stats pill */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase">Total Visitados</span>
                  <strong className="text-base text-slate-900">{filtered.length}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase">Interesse Alto</span>
                  <strong className="text-base text-emerald-600">
                    {filtered.filter(v => v.interesse === 'alto').length}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase">Interesse Médio</span>
                  <strong className="text-base text-amber-600">
                    {filtered.filter(v => v.interesse === 'medio').length}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase">Convertidos em Lead</span>
                  <strong className="text-base text-emerald-700">
                    {filtered.filter(v => v.leadId || v.clienteId).length}
                  </strong>
                </div>
              </div>

              {/* Report Table */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 text-left text-[11px]">
                    <th className="p-2">Data</th>
                    <th className="p-2">Posto / Empresa</th>
                    <th className="p-2">Contato</th>
                    <th className="p-2">Cidade</th>
                    <th className="p-2">Interesse</th>
                    <th className="p-2">Resultado da Prospecção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map(v => (
                    <tr key={v.id}>
                      <td className="p-2 whitespace-nowrap">{new Date(v.data).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">
                        <strong className="text-slate-900">{v.empresa}</strong>
                        {v.cnpj && <div className="text-[10px] text-slate-500">{v.cnpj}</div>}
                        {v.endereco && <div className="text-[10px] text-slate-500">{v.endereco}</div>}
                      </td>
                      <td className="p-2">
                        <div>{v.contato}</div>
                        {v.telefone && <div className="text-[10px] text-slate-500">{v.telefone}</div>}
                      </td>
                      <td className="p-2">{v.cidade}</td>
                      <td className="p-2 uppercase font-bold text-[10px]">
                        <span className={v.interesse === 'alto' ? 'text-emerald-700' : v.interesse === 'medio' ? 'text-amber-700' : 'text-slate-700'}>
                          {v.interesse}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700">{v.resultado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
                FERA SISTEMA DO BRASIL — LINX/TOTVS • Documento comercial interno
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
