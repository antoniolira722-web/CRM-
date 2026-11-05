import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { Proposta, ItemProposta, StatusProposta } from '../types/crm';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Loader2,
  MessageSquare,
  Mail,
  X,
  Building,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { CnpjSearchInput } from './CnpjSearchInput';
import { CnpjData } from '../lib/cnpj';

interface Props {
  onOpenEmailModal: (toEmail: string, toName: string, subject: string, message: string) => void;
}

export const PropostasView: React.FC<Props> = ({ onOpenEmailModal }) => {
  const {
    propostas,
    clientes,
    leads,
    produtos,
    empresa,
    addProposta,
    updateProposta,
    deleteProposta,
    addToast
  } = useCrm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [previewProposta, setPreviewProposta] = useState<Proposta | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Form State
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmpresa, setClienteEmpresa] = useState('');
  const [clienteCnpj, setClienteCnpj] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteCidade, setClienteCidade] = useState('');
  const [replicarFiliais, setReplicarFiliais] = useState(false);
  const [filiaisList, setFiliaisList] = useState<{ cnpj: string; nome: string }[]>([]);

  const [itens, setItens] = useState<ItemProposta[]>([]);
  const [validadeDias, setValidadeDias] = useState(15);
  const [condicoesPagamento, setCondicoesPagamento] = useState(
    'Implantação: 50% de entrada + 50% na conclusão dos treinamentos. Mensalidade com vencimento todo dia 10.'
  );
  const [observacoes, setObservacoes] = useState(
    'Inclusos atualizações legais, suporte técnico remoto em horário comercial e plantão emergencial para bombas/PDV.'
  );
  const [status, setStatus] = useState<StatusProposta>('enviada');
  const [isPrinting, setIsPrinting] = useState(false);

  // Estados de Desconto Comercial Separados (Licença, Implantação e Mensalidade)
  const [descontoLicencaPercentual, setDescontoLicencaPercentual] = useState<number>(0);
  const [descontoLicencaValor, setDescontoLicencaValor] = useState<number>(0);

  const [descontoImplantacaoPercentual, setDescontoImplantacaoPercentual] = useState<number>(0);
  const [descontoImplantacaoValor, setDescontoImplantacaoValor] = useState<number>(0);

  const [descontoMensalidadePercentual, setDescontoMensalidadePercentual] = useState<number>(0);
  const [descontoMensalidadeValor, setDescontoMensalidadeValor] = useState<number>(0);

  // Estados legados mantidos para compatibilidade
  const [descontoPercentual, setDescontoPercentual] = useState<number>(0);
  const [descontoValor, setDescontoValor] = useState<number>(0);
  const [descontoAplicarEm, setDescontoAplicarEm] = useState<'investimento' | 'licenca' | 'implantacao' | 'mensalidade'>('investimento');

  // Cálculos dinâmicos da proposta em edição
  const multiplier = replicarFiliais && filiaisList.length > 0 ? filiaisList.length + 1 : 1;
  const currentLicenca = itens.reduce((s, i) => s + (i.precoUnitario * i.quantidade), 0) * multiplier;
  const currentImplantacao = itens.reduce((s, i) => s + (i.implantacao * i.quantidade), 0) * multiplier;
  const currentMensalidade = itens.reduce((s, i) => s + (i.mensalidade * i.quantidade), 0) * multiplier;
  const currentInvestimento = currentLicenca + currentImplantacao;

  // Valores líquidos calculados
  const currentLicencaLiquida = Math.max(0, currentLicenca - descontoLicencaValor);
  const currentImplantacaoLiquida = Math.max(0, currentImplantacao - descontoImplantacaoValor);
  const currentMensalidadeLiquida = Math.max(0, currentMensalidade - descontoMensalidadeValor);
  const currentInvestimentoLiquido = currentLicencaLiquida + currentImplantacaoLiquida;
  const totalDescontoInvestimento = descontoLicencaValor + descontoImplantacaoValor;

  // Handlers para Desconto de Licença (Cálculo Recíproco %)
  const handleLicencaPercentualChange = (rawVal: string) => {
    if (rawVal === '') {
      setDescontoLicencaPercentual(0);
      setDescontoLicencaValor(0);
      return;
    }
    const pct = parseFloat(rawVal.replace(',', '.')) || 0;
    const clampedPct = Math.max(0, Math.min(100, pct));
    setDescontoLicencaPercentual(clampedPct);
    const val = currentLicenca > 0 ? (currentLicenca * clampedPct) / 100 : 0;
    setDescontoLicencaValor(parseFloat(val.toFixed(2)));
  };

  // Handlers para Desconto de Licença (Cálculo Recíproco R$)
  const handleLicencaValorChange = (rawVal: string) => {
    if (rawVal === '') {
      setDescontoLicencaValor(0);
      setDescontoLicencaPercentual(0);
      return;
    }
    const val = parseFloat(rawVal.replace(',', '.')) || 0;
    const clampedVal = Math.max(0, val);
    setDescontoLicencaValor(clampedVal);
    if (currentLicenca > 0) {
      const pct = (clampedVal / currentLicenca) * 100;
      setDescontoLicencaPercentual(parseFloat(pct.toFixed(2)));
    } else {
      setDescontoLicencaPercentual(0);
    }
  };

  // Handlers para Desconto de Implantação (Cálculo Recíproco %)
  const handleImplantacaoPercentualChange = (rawVal: string) => {
    if (rawVal === '') {
      setDescontoImplantacaoPercentual(0);
      setDescontoImplantacaoValor(0);
      return;
    }
    const pct = parseFloat(rawVal.replace(',', '.')) || 0;
    const clampedPct = Math.max(0, Math.min(100, pct));
    setDescontoImplantacaoPercentual(clampedPct);
    const val = currentImplantacao > 0 ? (currentImplantacao * clampedPct) / 100 : 0;
    setDescontoImplantacaoValor(parseFloat(val.toFixed(2)));
  };

  // Handlers para Desconto de Implantação (Cálculo Recíproco R$)
  const handleImplantacaoValorChange = (rawVal: string) => {
    if (rawVal === '') {
      setDescontoImplantacaoValor(0);
      setDescontoImplantacaoPercentual(0);
      return;
    }
    const val = parseFloat(rawVal.replace(',', '.')) || 0;
    const clampedVal = Math.max(0, val);
    setDescontoImplantacaoValor(clampedVal);
    if (currentImplantacao > 0) {
      const pct = (clampedVal / currentImplantacao) * 100;
      setDescontoImplantacaoPercentual(parseFloat(pct.toFixed(2)));
    } else {
      setDescontoImplantacaoPercentual(0);
    }
  };

  // Handlers para Desconto de Mensalidade (Cálculo Recíproco %)
  const handleMensalidadePercentualChange = (rawVal: string) => {
    if (rawVal === '') {
      setDescontoMensalidadePercentual(0);
      setDescontoMensalidadeValor(0);
      return;
    }
    const pct = parseFloat(rawVal.replace(',', '.')) || 0;
    const clampedPct = Math.max(0, Math.min(100, pct));
    setDescontoMensalidadePercentual(clampedPct);
    const val = currentMensalidade > 0 ? (currentMensalidade * clampedPct) / 100 : 0;
    setDescontoMensalidadeValor(parseFloat(val.toFixed(2)));
  };

  // Handlers para Desconto de Mensalidade (Cálculo Recíproco R$)
  const handleMensalidadeValorChange = (rawVal: string) => {
    if (rawVal === '') {
      setDescontoMensalidadeValor(0);
      setDescontoMensalidadePercentual(0);
      return;
    }
    const val = parseFloat(rawVal.replace(',', '.')) || 0;
    const clampedVal = Math.max(0, val);
    setDescontoMensalidadeValor(clampedVal);
    if (currentMensalidade > 0) {
      const pct = (clampedVal / currentMensalidade) * 100;
      setDescontoMensalidadePercentual(parseFloat(pct.toFixed(2)));
    } else {
      setDescontoMensalidadePercentual(0);
    }
  };

  // Monitora disparos de impressão nativos (Ctrl+P / Menu) para ocultar a barra de botões
  useEffect(() => {
    const onBeforePrint = () => setIsPrinting(true);
    const onAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  // Fechar modal de visualização de proposta ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewProposta) {
        setPreviewProposta(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewProposta]);

  const formatMoney = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  const getValorLicenca = (p: Proposta) => {
    if (typeof p.valorTotalLicenca === 'number' && p.valorTotalLicenca > 0) return p.valorTotalLicenca;
    if (typeof (p as any).valorLicencaCadastro === 'number' && (p as any).valorLicencaCadastro > 0) return (p as any).valorLicencaCadastro;
    return (p.itens || []).reduce((s, it: any) => s + ((it.quantidade || it.qtd || 1) * (it.precoUnitario ?? it.preco ?? 0)), 0);
  };

  const getValorImplantacao = (p: Proposta) => {
    if (typeof p.valorTotalImplantacao === 'number') return p.valorTotalImplantacao;
    if (typeof (p as any).valorImplantacaoCadastro === 'number') return (p as any).valorImplantacaoCadastro;
    return (p.itens || []).reduce((s, it: any) => s + ((it.quantidade || it.qtd || 1) * (it.implantacao ?? 0)), 0);
  };

  const getValorMensalidade = (p: Proposta) => {
    if (typeof p.valorTotalMensalidade === 'number') return p.valorTotalMensalidade;
    if (typeof (p as any).valorMensalidadeCadastro === 'number') return (p as any).valorMensalidadeCadastro;
    return (p.itens || []).reduce((s, it: any) => s + ((it.quantidade || it.qtd || 1) * (it.mensalidade ?? 0)), 0);
  };

  const getValorMensalidadeLiquida = (p: Proposta) => {
    const vMen = getValorMensalidade(p);
    const dMen = p.descontoMensalidadeValor ?? (p.descontoMensalidade || 0);
    if (dMen > 0) return Math.max(0, vMen - dMen);
    if (p.descontoAplicarEm === 'mensalidade' && (p.descontoValor || p.desconto)) {
      return Math.max(0, vMen - (p.descontoValor ?? p.desconto ?? 0));
    }
    if (typeof p.valorMensalidadeLiquida === 'number' && p.valorMensalidadeLiquida > 0) {
      return p.valorMensalidadeLiquida;
    }
    return vMen;
  };

  const getWhatsappProposalText = (p: Proposta) => {
    const rawPhone = p.clienteTelefone || p.telefone || '';
    const clean = rawPhone.replace(/\D/g, '');
    if (!clean) return null;
    const fullPhone = clean.startsWith('55') ? clean : '55' + clean;
    const clientName = p.clienteNome || p.contato || 'Cliente';
    const companyName = p.clienteEmpresa || p.empresa || 'seu posto';

    const dLicVal = p.descontoLicencaValor ?? 0;
    const dImpVal = p.descontoImplantacaoValor ?? (p.descontoImplantacao ?? 0);
    const dMenVal = p.descontoMensalidadeValor ?? (p.descontoMensalidade ?? 0);
    const legacyDesc = (!dLicVal && !dImpVal && !dMenVal) ? (p.descontoValor ?? p.desconto ?? 0) : 0;

    let descTexto = '';
    if (dLicVal > 0) {
      descTexto += `• Desconto Licença: -${formatMoney(dLicVal)} (${p.descontoLicencaPercentual || 0}%)\n`;
    }
    if (dImpVal > 0) {
      descTexto += `• Desconto Implantação: -${formatMoney(dImpVal)} (${p.descontoImplantacaoPercentual || 0}%)\n`;
    }
    if (dMenVal > 0) {
      descTexto += `• Desconto Mensalidade: -${formatMoney(dMenVal)}/mês (${p.descontoMensalidadePercentual || 0}%)\n`;
    }
    if (legacyDesc > 0) {
      descTexto += `• Desconto Comercial: -${formatMoney(legacyDesc)} (${p.descontoPercentual || 0}%)\n`;
    }

    const vLic = getValorLicenca(p);
    const vImp = getValorImplantacao(p);
    const vMen = getValorMensalidade(p);
    const vMenLiq = getValorMensalidadeLiquida(p);
    const totalInvestLiquido = Math.max(0, (vLic - dLicVal) + (vImp - dImpVal) - (p.descontoAplicarEm !== 'mensalidade' ? legacyDesc : 0));

    const msg = encodeURIComponent(
      `Olá ${clientName}! Segue o resumo da sua proposta comercial da FERA SISTEMA DO BRASIL para ${companyName}:\n\n` +
        `• Licenças de Software: ${formatMoney(vLic)}\n` +
        `• Serviços de Implantação: ${formatMoney(vImp)}\n` +
        descTexto +
        `• Investimento Total Líquido: ${formatMoney(totalInvestLiquido)}\n` +
        `• Mensalidade Recorrente Líquida: ${formatMoney(vMenLiq)}/mês` + (dMenVal > 0 ? ` (De ${formatMoney(vMen)} com desconto)` : '') + `\n\n` +
        `Estamos à disposição para alinhar o cronograma de implantação!`
    );
    return `https://wa.me/${fullPhone}?text=${msg}`;
  };

  const handleSelectClient = (clientId: string) => {
    const c = clientes.find(item => item.id === clientId);
    if (!c) return;
    setClienteNome(c.nome);
    setClienteEmpresa(c.empresa);
    setClienteCnpj(c.cnpj || '');
    setClienteEmail(c.email || '');
    setClienteTelefone(c.telefone || '');
    setClienteCidade(c.cidade || '');
    setFiliaisList(c.filiais || []);
  };

  const handleSelectLead = (leadId: string) => {
    const l = leads.find(item => item.id === leadId);
    if (!l) return;
    setClienteNome(l.nome);
    setClienteEmpresa(l.empresa);
    setClienteCnpj(l.cnpj || '');
    setClienteEmail(l.email || '');
    setClienteTelefone(l.telefone || '');
    setClienteCidade(l.cidade || '');
    setFiliaisList(l.filiais || []);
  };

  const handleAddProductItem = (prodId: string) => {
    const p = produtos.find(item => item.id === prodId);
    if (!p) return;

    const newItem: ItemProposta = {
      produtoId: p.id,
      nome: p.nome,
      descricao: p.descricao,
      tipo: p.tipo,
      quantidade: 1,
      precoUnitario: p.preco,
      implantacao: p.implantacao,
      mensalidade: p.mensalidade,
      modulosInclusos: p.modulos.map(m => m.nome)
    };

    setItens(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const handleCnpjFound = (data: CnpjData) => {
    if (data.empresa) setClienteEmpresa(data.empresa);
    if (data.contato && (!clienteNome || clienteNome === '')) setClienteNome(data.contato);
    if (data.telefone && (!clienteTelefone || clienteTelefone === '')) setClienteTelefone(data.telefone);
    if (data.email && (!clienteEmail || clienteEmail === '')) setClienteEmail(data.email);
    if (data.cidade) setClienteCidade(data.cidade);
    addToast(`Dados da empresa "${data.empresa}" preenchidos via Receita!`, 'success');
  };

  const openNewModal = () => {
    setEditingProposta(null);
    setClienteNome('');
    setClienteEmpresa('');
    setClienteCnpj('');
    setClienteEmail('');
    setClienteTelefone('');
    setClienteCidade('');
    setReplicarFiliais(false);
    setFiliaisList([]);
    setItens([]);
    setDescontoLicencaPercentual(0);
    setDescontoLicencaValor(0);
    setDescontoImplantacaoPercentual(0);
    setDescontoImplantacaoValor(0);
    setDescontoMensalidadePercentual(0);
    setDescontoMensalidadeValor(0);
    setDescontoPercentual(0);
    setDescontoValor(0);
    setDescontoAplicarEm('investimento');
    setValidadeDias(15);
    setCondicoesPagamento(
      'Implantação: 50% de entrada + 50% na conclusão dos treinamentos. Mensalidade com vencimento todo dia 10.'
    );
    setObservacoes(
      'Inclusos atualizações legais, suporte técnico remoto em horário comercial e plantão emergencial para bombas/PDV.'
    );
    setStatus('enviada');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Proposta) => {
    setEditingProposta(p);
    setClienteNome(p.clienteNome || p.contato || '');
    setClienteEmpresa(p.clienteEmpresa || p.empresa || '');
    setClienteCnpj(p.clienteCnpj || p.cnpj || '');
    setClienteEmail(p.clienteEmail || p.email || '');
    setClienteTelefone(p.clienteTelefone || p.telefone || '');
    setClienteCidade(p.clienteCidade || p.cidade || '');
    setReplicarFiliais(p.replicarFiliais || false);
    setFiliaisList(p.filiais || []);
    setItens((p.itens || []).map((it: any) => ({
      produtoId: it.produtoId || it.id || '',
      nome: it.nome || 'Sistema',
      descricao: it.descricao || '',
      tipo: it.tipo || 'sistema',
      quantidade: it.quantidade || it.qtd || 1,
      precoUnitario: it.precoUnitario ?? it.preco ?? 0,
      implantacao: it.implantacao ?? 0,
      mensalidade: it.mensalidade ?? 0,
      modulosInclusos: it.modulosInclusos || (it.modulos ? it.modulos.map((m: any) => m.nome) : [])
    })));

    const dLicVal = p.descontoLicencaValor ?? 0;
    const dLicPct = p.descontoLicencaPercentual ?? 0;
    const dImpVal = p.descontoImplantacaoValor ?? (p.descontoImplantacao ?? 0);
    const dImpPct = p.descontoImplantacaoPercentual ?? 0;
    const dMenVal = p.descontoMensalidadeValor ?? (p.descontoMensalidade ?? 0);
    const dMenPct = p.descontoMensalidadePercentual ?? 0;

    let finalLicVal = dLicVal;
    let finalLicPct = dLicPct;
    let finalImpVal = dImpVal;
    let finalImpPct = dImpPct;
    let finalMenVal = dMenVal;
    let finalMenPct = dMenPct;

    if (!finalLicVal && !finalImpVal && !finalMenVal) {
      const legacyVal = p.descontoValor ?? p.desconto ?? 0;
      const legacyPct = p.descontoPercentual ?? 0;
      const legacyTipo = p.descontoAplicarEm ?? 'investimento';
      if (legacyTipo === 'licenca') {
        finalLicVal = legacyVal;
        finalLicPct = legacyPct;
      } else if (legacyTipo === 'implantacao') {
        finalImpVal = legacyVal;
        finalImpPct = legacyPct;
      } else if (legacyTipo === 'mensalidade') {
        finalMenVal = legacyVal;
        finalMenPct = legacyPct;
      } else if (legacyTipo === 'investimento' && legacyVal > 0) {
        finalLicVal = legacyVal;
        finalLicPct = legacyPct;
      }
    }

    setDescontoLicencaValor(finalLicVal);
    setDescontoLicencaPercentual(finalLicPct);
    setDescontoImplantacaoValor(finalImpVal);
    setDescontoImplantacaoPercentual(finalImpPct);
    setDescontoMensalidadeValor(finalMenVal);
    setDescontoMensalidadePercentual(finalMenPct);

    const totalDesc = finalLicVal + finalImpVal + finalMenVal;
    setDescontoValor(totalDesc);
    setDescontoAplicarEm('investimento');
    setDescontoPercentual(p.descontoPercentual || 0);

    setValidadeDias(p.validadeDias || 15);
    setCondicoesPagamento(p.condicoesPagamento || '');
    setObservacoes(p.observacoes || '');
    setStatus(p.status || 'enviada');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEmpresa.trim() || !clienteNome.trim()) {
      addToast('Informe os dados do posto e contato.', 'error');
      return;
    }
    if (itens.length === 0) {
      addToast('Adicione ao menos 1 sistema/produto na proposta.', 'error');
      return;
    }

    const multiplier = replicarFiliais && filiaisList.length > 0 ? filiaisList.length + 1 : 1;

    const baseLic = itens.reduce((s, i) => s + (i.precoUnitario * i.quantidade), 0);
    const baseImpl = itens.reduce((s, i) => s + (i.implantacao * i.quantidade), 0);
    const baseMens = itens.reduce((s, i) => s + (i.mensalidade * i.quantidade), 0);

    const valorTotalLicenca = baseLic * multiplier;
    const valorTotalImplantacao = baseImpl * multiplier;
    const valorTotalMensalidade = baseMens * multiplier;

    const formattedItens = itens.map(it => ({
      ...it,
      qtd: it.quantidade,
      preco: it.precoUnitario
    }));

    const valorLicencaLiquida = Math.max(0, valorTotalLicenca - (Number(descontoLicencaValor) || 0));
    const valorImplantacaoLiquida = Math.max(0, valorTotalImplantacao - (Number(descontoImplantacaoValor) || 0));
    const valorMensalidadeLiquida = Math.max(0, valorTotalMensalidade - (Number(descontoMensalidadeValor) || 0));
    const totalDescontoInvest = (Number(descontoLicencaValor) || 0) + (Number(descontoImplantacaoValor) || 0);
    const valorTotalLiquido = valorLicencaLiquida + valorImplantacaoLiquida;

    const propData = {
      clienteNome: clienteNome.trim(),
      contato: clienteNome.trim(),
      clienteEmpresa: clienteEmpresa.trim(),
      empresa: clienteEmpresa.trim(),
      clienteCnpj: clienteCnpj.trim(),
      cnpj: clienteCnpj.trim(),
      clienteEmail: clienteEmail.trim(),
      email: clienteEmail.trim(),
      clienteTelefone: clienteTelefone.trim(),
      telefone: clienteTelefone.trim(),
      clienteCidade: clienteCidade.trim(),
      cidade: clienteCidade.trim(),
      replicarFiliais,
      filiais: filiaisList,
      itens: formattedItens,
      valorTotalLicenca,
      valorLicencaCadastro: valorTotalLicenca,
      valorTotalImplantacao,
      valorImplantacaoCadastro: valorTotalImplantacao,
      valorTotalMensalidade,
      valorMensalidadeCadastro: valorTotalMensalidade,
      // Descontos dedicados solicitados
      descontoLicencaPercentual: Number(descontoLicencaPercentual) || 0,
      descontoLicencaValor: Number(descontoLicencaValor) || 0,
      descontoImplantacaoPercentual: Number(descontoImplantacaoPercentual) || 0,
      descontoImplantacaoValor: Number(descontoImplantacaoValor) || 0,
      descontoMensalidadePercentual: Number(descontoMensalidadePercentual) || 0,
      descontoMensalidadeValor: Number(descontoMensalidadeValor) || 0,
      valorLicencaLiquida,
      valorImplantacaoLiquida,
      valorMensalidadeLiquida,
      valorTotalLiquido,
      // Retrocompatibilidade
      desconto: totalDescontoInvest + (Number(descontoMensalidadeValor) || 0),
      descontoValor: totalDescontoInvest + (Number(descontoMensalidadeValor) || 0),
      descontoPercentual: valorTotalLicenca + valorTotalImplantacao > 0 ? parseFloat(((totalDescontoInvest / (valorTotalLicenca + valorTotalImplantacao)) * 100).toFixed(2)) : 0,
      descontoAplicarEm: 'investimento' as const,
      descontoImplantacao: Number(descontoImplantacaoValor) || 0,
      descontoMensalidade: Number(descontoMensalidadeValor) || 0,
      validadeDias: Number(validadeDias) || 15,
      condicoesPagamento: condicoesPagamento.trim(),
      observacoes: observacoes.trim(),
      status
    };

    if (editingProposta) {
      updateProposta(editingProposta.id, propData);
    } else {
      const nextNum = propostas.length + 1;
      const numero = `PROP-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
      const nowIso = new Date().toISOString();
      addProposta({
        numero,
        dataCriacao: nowIso,
        criadoEm: nowIso,
        ...propData
      });
    }
    setIsModalOpen(false);
  };

  const handleDownloadPdf = async () => {
    if (!previewProposta) return;
    const element = document.getElementById('proposta-documento-folha');
    if (!element) {
      addToast('Elemento da proposta não localizado.', 'error');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      addToast('Gerando documento PDF formatado em página única...', 'info');

      const element = document.getElementById('proposta-documento-folha');
      if (!element) {
        throw new Error('Elemento da proposta não encontrado');
      }

      // Ativa modo de renderização compacta de alta precisão A4
      element.classList.add('pdf-rendering-mode');

      const html2pdfModule: any = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const nomeCliente = (previewProposta.clienteEmpresa || previewProposta.empresa || 'Cliente')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const numProp = (previewProposta.numero || 'PROP').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Proposta_${numProp}_${nomeCliente}.pdf`;

      const opt = {
        margin: [4, 6, 4, 6],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 794
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      addToast('PDF baixado com sucesso em página única!', 'success');
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      addToast('Não foi possível gerar PDF diretamente. Tentando modo impressão...', 'info');
      handleImprimir();
    } finally {
      const element = document.getElementById('proposta-documento-folha');
      if (element) {
        element.classList.remove('pdf-rendering-mode');
      }
      setIsGeneratingPdf(false);
    }
  };

  const handleImprimir = () => {
    if (!previewProposta) return;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false);
      }, 600);
    }, 80);
  };

  return (
    <div className="space-y-4">
      {/* Header and Table (strictly removed when printing proposal) */}
      {!isPrinting && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl no-print print:hidden">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3ecf8e]" />
                <span>Gerador de Propostas Comerciais</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Propostas integradas com catálogo Linx/TOTVS, filiais e exportação PDF
              </p>
            </div>

            <button
              onClick={openNewModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Proposta</span>
            </button>
          </div>

          {/* Propostas Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg no-print print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5 font-semibold">Nº Proposta</th>
                <th className="p-3.5 font-semibold">Posto / Cliente</th>
                <th className="p-3.5 font-semibold">Data & Validade</th>
                <th className="p-3.5 font-semibold">Valores (Lic / Impl / Mens)</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {propostas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    Nenhuma proposta comercial gerada ainda.
                  </td>
                </tr>
              ) : (
                propostas.map(p => {
                  const waLink = getWhatsappProposalText(p);
                  const nomeEmpresa = p.clienteEmpresa || p.empresa || 'Cliente';
                  const nomeContato = p.clienteNome || p.contato || '';
                  const foneContato = p.clienteTelefone || p.telefone || '';
                  const dtFormatada = p.dataCriacao || p.criadoEm || new Date().toISOString();
                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-zinc-100">{p.numero}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-zinc-100 text-sm">{nomeEmpresa}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {nomeContato} {foneContato && `• ${foneContato}`}
                          {p.filiais && p.filiais.length > 0 && p.replicarFiliais && (
                            <span className="text-emerald-400 font-medium">
                              {' '}
                              • {p.filiais.length + 1} unidades
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        <div>{new Date(dtFormatada).toLocaleDateString('pt-BR')}</div>
                        <div className="text-[10px] text-zinc-400">Validade: {p.validadeDias || 15} dias</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-emerald-400 font-semibold">
                          Lic: {formatMoney(getValorLicenca(p))}
                          {p.descontoLicencaValor && p.descontoLicencaValor > 0 ? (
                            <span className="text-amber-400 text-[10px] ml-1 font-normal">
                              (-{formatMoney(p.descontoLicencaValor)})
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-zinc-300">
                          Impl: {formatMoney(getValorImplantacao(p))}
                          {p.descontoImplantacaoValor && p.descontoImplantacaoValor > 0 ? (
                            <span className="text-amber-400 text-[10px] ml-1 font-normal">
                              (-{formatMoney(p.descontoImplantacaoValor)})
                            </span>
                          ) : null}
                          {' '}• Mens:{' '}
                          <span className="font-medium text-[#3ecf8e]">
                            {formatMoney(getValorMensalidadeLiquida(p))}/mês
                          </span>
                          {(p.descontoMensalidadeValor ?? p.descontoMensalidade ?? 0) > 0 ? (
                            <span className="text-amber-400 text-[10px] ml-1 font-normal">
                              (-{formatMoney(p.descontoMensalidadeValor ?? p.descontoMensalidade ?? 0)})
                            </span>
                          ) : null}
                        </div>
                        {((p.descontoLicencaValor && p.descontoLicencaValor > 0) || 
                          (p.descontoImplantacaoValor && p.descontoImplantacaoValor > 0) || 
                          ((p.descontoMensalidadeValor ?? p.descontoMensalidade ?? 0) > 0) || 
                          (p.descontoValor && p.descontoValor > 0) || 
                          (p.desconto && p.desconto > 0)) && (
                          <div className="text-[10px] text-amber-400 font-semibold mt-0.5 space-x-1 flex flex-wrap gap-y-0.5">
                            {p.descontoLicencaValor && p.descontoLicencaValor > 0 ? (
                              <span>Desc. Lic: -{formatMoney(p.descontoLicencaValor)}{p.descontoLicencaPercentual ? ` (${p.descontoLicencaPercentual}%)` : ''}</span>
                            ) : null}
                            {p.descontoImplantacaoValor && p.descontoImplantacaoValor > 0 ? (
                              <span>Desc. Impl: -{formatMoney(p.descontoImplantacaoValor)}{p.descontoImplantacaoPercentual ? ` (${p.descontoImplantacaoPercentual}%)` : ''}</span>
                            ) : null}
                            {(p.descontoMensalidadeValor ?? p.descontoMensalidade ?? 0) > 0 ? (
                              <span>Desc. Mens: -{formatMoney(p.descontoMensalidadeValor ?? p.descontoMensalidade ?? 0)}{p.descontoMensalidadePercentual ? ` (${p.descontoMensalidadePercentual}%)` : ''}</span>
                            ) : null}
                            {!p.descontoLicencaValor && !p.descontoImplantacaoValor && !(p.descontoMensalidadeValor ?? p.descontoMensalidade) && (p.descontoValor || p.desconto) ? (
                              <span>Desc: -{formatMoney(p.descontoValor || p.desconto || 0)}{p.descontoPercentual ? ` (${p.descontoPercentual}%)` : ''}</span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'aprovada'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : p.status === 'enviada'
                              ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/40'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewProposta(p)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title="Visualizar Proposta / Imprimir PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 border border-zinc-800 transition-colors"
                              title="Enviar Proposta por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {p.clienteEmail && (
                            <button
                              onClick={() => {
                                const descVal = p.descontoValor ?? p.desconto ?? 0;
                                const descTxt = descVal > 0 ? `\nDesconto Comercial: -${formatMoney(descVal)} (${p.descontoPercentual || 0}%)` : '';
                                onOpenEmailModal(
                                  p.clienteEmail,
                                  p.clienteNome,
                                  `Proposta Comercial ${p.numero} — FERA SISTEMA DO BRASIL`,
                                  `Olá ${p.clienteNome}!\n\nSegue em anexo os detalhes da proposta comercial ${p.numero} para ${p.clienteEmpresa}.\n\nTotal Licenças: ${formatMoney(getValorLicenca(p))}\nTotal Implantação: ${formatMoney(getValorImplantacao(p))}${descTxt}\nMensalidade Recorrente: ${formatMoney(getValorMensalidade(p))}/mês\n\nFicamos à total disposição para esclarecer qualquer dúvida.\n\nAtenciosamente,\nFERA SISTEMA DO BRASIL`
                                );
                              }}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-blue-950 text-blue-400 hover:text-blue-300 border border-zinc-800 transition-colors"
                              title="Enviar por E-mail"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                            title="Editar Proposta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Excluir proposta ${p.numero}?`)) {
                                deleteProposta(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                            title="Excluir Proposta"
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
      </>
      )}

      {/* Modal: Criar / Editar Proposta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3ecf8e]" />
                <span>{editingProposta ? 'Editar Proposta' : 'Nova Proposta Comercial'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Quick Select Client / Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-zinc-400 mb-1">Preencher a partir de um Lead:</label>
                  <select
                    onChange={e => {
                      if (e.target.value) handleSelectLead(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="">— Selecione um Lead —</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.empresa} ({l.nome})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Ou a partir de um Cliente:</label>
                  <select
                    onChange={e => {
                      if (e.target.value) handleSelectClient(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="">— Selecione um Cliente —</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.empresa} ({c.nome})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Empresa / Posto *</label>
                  <input
                    type="text"
                    required
                    value={clienteEmpresa}
                    onChange={e => setClienteEmpresa(e.target.value)}
                    placeholder="Auto Posto Central"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nome do Contato *</label>
                  <input
                    type="text"
                    required
                    value={clienteNome}
                    onChange={e => setClienteNome(e.target.value)}
                    placeholder="Sr. Marcos"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <CnpjSearchInput
                  value={clienteCnpj}
                  onChange={setClienteCnpj}
                  onCompanyFound={handleCnpjFound}
                  label="CNPJ Matriz (Busca Automática na Receita)"
                  placeholder="00.000.000/0001-00"
                />

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={clienteTelefone}
                    onChange={e => setClienteTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={clienteEmail}
                    onChange={e => setClienteEmail(e.target.value)}
                    placeholder="contato@posto.com.br"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={clienteCidade}
                    onChange={e => setClienteCidade(e.target.value)}
                    placeholder="Campinas / SP"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>

              {/* Multi-company / Filiais replication toggle */}
              {filiaisList.length > 0 && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rep-filiais"
                      checked={replicarFiliais}
                      onChange={e => setReplicarFiliais(e.target.checked)}
                      className="w-4 h-4 accent-[#3ecf8e]"
                    />
                    <label htmlFor="rep-filiais" className="text-zinc-100 font-medium cursor-pointer">
                      Replicar proposta nas {filiaisList.length} filial(is) cadastradas (multiplicar valores para {filiaisList.length + 1} unidades)
                    </label>
                  </div>
                  <Building className="w-4 h-4 text-[#3ecf8e]" />
                </div>
              )}

              {/* Items Selector */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Sistemas & Módulos da Proposta</span>
                  </label>

                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAddProductItem(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="">+ Adicionar do Catálogo FERA</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — Lic: {formatMoney(p.preco)}
                      </option>
                    ))}
                  </select>
                </div>

                {itens.length === 0 ? (
                  <div className="py-6 text-center text-zinc-400 text-xs">
                    Nenhum sistema adicionado à proposta. Selecione no catálogo acima.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itens.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <strong className="text-zinc-100 text-xs">{item.nome}</strong>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            Licença: {formatMoney(item.precoUnitario)} • Implantação:{' '}
                            {formatMoney(item.implantacao)} • Mensalidade:{' '}
                            <span className="text-emerald-400 font-semibold">
                              {formatMoney(item.mensalidade)}/mês
                            </span>
                          </div>
                          {item.modulosInclusos && (
                            <div className="text-[10px] text-zinc-400 mt-1">
                              Módulos: {item.modulosInclusos.join(', ')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-zinc-400">Qtd:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={e => {
                              const q = parseInt(e.target.value) || 1;
                              setItens(prev =>
                                prev.map((it, i) => (i === idx ? { ...it, quantidade: q } : it))
                              );
                            }}
                            className="w-14 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 text-center focus:outline-none focus:border-[#3ecf8e]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desconto da Licença (Caixa 1) */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Desconto da Licença (Percentual % e Valor R$)</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Digite o percentual ou o valor em R$ para cálculo recíproco imediato (Base Licenças: {formatMoney(currentLicenca)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Espaço 1: Desconto em Percentual (%) */}
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">
                      Desconto em Percentual (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ex: 10"
                        value={descontoLicencaPercentual === 0 ? '' : descontoLicencaPercentual}
                        onChange={e => handleLicencaPercentualChange(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#3ecf8e]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                    {/* Botões rápidos de % */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-zinc-500">Atalhos:</span>
                      {[5, 10, 15, 20].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleLicencaPercentualChange(pct.toString())}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                            descontoLicencaPercentual === pct
                              ? 'bg-[#3ecf8e] text-black font-bold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                      {descontoLicencaPercentual > 0 && (
                        <button
                          type="button"
                          onClick={() => handleLicencaPercentualChange('')}
                          className="px-1.5 py-0.5 rounded text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
                        >
                          Zerar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Espaço 2: Desconto em Valor (R$) */}
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">
                      Desconto em Valor (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 500,00"
                        value={descontoLicencaValor === 0 ? '' : descontoLicencaValor}
                        onChange={e => handleLicencaValorChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#3ecf8e]"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5">
                      <span>Calcula o percentual automaticamente</span>
                      {descontoLicencaValor > 0 && (
                        <span className="text-emerald-400 font-bold">
                          Economia: {formatMoney(descontoLicencaValor)} • Líquido: {formatMoney(currentLicencaLiquida)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desconto da Implantação (Caixa 2) */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Desconto da Implantação (Percentual % e Valor R$)</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Digite o percentual ou o valor em R$ para cálculo recíproco imediato (Base Implantação: {formatMoney(currentImplantacao)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Espaço 1: Desconto em Percentual (%) */}
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">
                      Desconto em Percentual (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ex: 10"
                        value={descontoImplantacaoPercentual === 0 ? '' : descontoImplantacaoPercentual}
                        onChange={e => handleImplantacaoPercentualChange(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#3ecf8e]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                    {/* Botões rápidos de % */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-zinc-500">Atalhos:</span>
                      {[5, 10, 15, 20].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleImplantacaoPercentualChange(pct.toString())}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                            descontoImplantacaoPercentual === pct
                              ? 'bg-[#3ecf8e] text-black font-bold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                      {descontoImplantacaoPercentual > 0 && (
                        <button
                          type="button"
                          onClick={() => handleImplantacaoPercentualChange('')}
                          className="px-1.5 py-0.5 rounded text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
                        >
                          Zerar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Espaço 2: Desconto em Valor (R$) */}
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">
                      Desconto em Valor (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 500,00"
                        value={descontoImplantacaoValor === 0 ? '' : descontoImplantacaoValor}
                        onChange={e => handleImplantacaoValorChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#3ecf8e]"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5">
                      <span>Calcula o percentual automaticamente</span>
                      {descontoImplantacaoValor > 0 && (
                        <span className="text-emerald-400 font-bold">
                          Economia: {formatMoney(descontoImplantacaoValor)} • Líquido: {formatMoney(currentImplantacaoLiquida)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desconto na Mensalidade (Caixa 3) */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-bold text-zinc-100 flex items-center gap-1.5 text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-[#3ecf8e]" />
                    <span>Desconto na Mensalidade Recorrente (Percentual % e Valor R$)</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Digite o percentual ou o valor em R$ para cálculo recíproco imediato (Base Mensalidade: {formatMoney(currentMensalidade)}/mês)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Espaço 1: Desconto em Percentual (%) */}
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">
                      Desconto em Percentual (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ex: 10"
                        value={descontoMensalidadePercentual === 0 ? '' : descontoMensalidadePercentual}
                        onChange={e => handleMensalidadePercentualChange(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#3ecf8e]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                    {/* Botões rápidos de % */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-zinc-500">Atalhos:</span>
                      {[5, 10, 15, 20].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleMensalidadePercentualChange(pct.toString())}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                            descontoMensalidadePercentual === pct
                              ? 'bg-[#3ecf8e] text-black font-bold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                      {descontoMensalidadePercentual > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMensalidadePercentualChange('')}
                          className="px-1.5 py-0.5 rounded text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
                        >
                          Zerar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Espaço 2: Desconto em Valor (R$) */}
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">
                      Desconto em Valor (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs pointer-events-none">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 100,00"
                        value={descontoMensalidadeValor === 0 ? '' : descontoMensalidadeValor}
                        onChange={e => handleMensalidadeValorChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#3ecf8e]"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5">
                      <span>Calcula o percentual automaticamente</span>
                      {descontoMensalidadeValor > 0 && (
                        <span className="text-emerald-400 font-bold">
                          Economia: {formatMoney(descontoMensalidadeValor)}/mês • Líquido: {formatMoney(currentMensalidadeLiquida)}/mês
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro da Proposta */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 block">Licenças (Líquido)</span>
                  <span className="font-bold text-zinc-100 block">{formatMoney(currentLicencaLiquida)}</span>
                  {descontoLicencaValor > 0 ? (
                    <span className="text-[9px] text-amber-400 block mt-0.5">
                      Bruto: {formatMoney(currentLicenca)} (-{formatMoney(descontoLicencaValor)})
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 block mt-0.5">Sem desconto</span>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 block">Implantação (Líquido)</span>
                  <span className="font-bold text-zinc-100 block">{formatMoney(currentImplantacaoLiquida)}</span>
                  {descontoImplantacaoValor > 0 ? (
                    <span className="text-[9px] text-amber-400 block mt-0.5">
                      Bruto: {formatMoney(currentImplantacao)} (-{formatMoney(descontoImplantacaoValor)})
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 block mt-0.5">Sem desconto</span>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 block">Investimento Total Líquido</span>
                  <span className={`font-extrabold text-sm block ${totalDescontoInvestimento > 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                    {formatMoney(currentInvestimentoLiquido)}
                  </span>
                  {totalDescontoInvestimento > 0 ? (
                    <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">
                      Economia: -{formatMoney(totalDescontoInvestimento)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 block mt-0.5">Total inicial</span>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 block">Mensalidade (Líquida)</span>
                  <span className={`font-extrabold text-sm block ${descontoMensalidadeValor > 0 ? 'text-emerald-400' : 'text-[#3ecf8e]'}`}>
                    {formatMoney(currentMensalidadeLiquida)}/mês
                  </span>
                  {descontoMensalidadeValor > 0 ? (
                    <span className="text-[9px] text-amber-400 block mt-0.5">
                      Bruto: {formatMoney(currentMensalidade)} (-{formatMoney(descontoMensalidadeValor)}/mês)
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-500 block mt-0.5">Recorrente pós-implantação</span>
                  )}
                </div>
              </div>

              {/* Conditions & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Validade (dias)</label>
                  <input
                    type="number"
                    value={validadeDias}
                    onChange={e => setValidadeDias(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Status da Proposta</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusProposta)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="enviada">Enviada</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="recusada">Recusada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Condições de Pagamento</label>
                <textarea
                  rows={2}
                  value={condicoesPagamento}
                  onChange={e => setCondicoesPagamento(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Termos Comerciais / Garantias</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
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
                  Salvar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar / Imprimir PDF da Proposta */}
      {previewProposta && (
        <div
          onClick={() => setPreviewProposta(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm print-modal-overlay cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print-modal-container relative cursor-default"
          >
            {/* Top Bar for Screen Preview (Excluded from PDF & Print) */}
            {!isPrinting && (
              <div
                id="proposta-modal-topbar"
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 bg-slate-50 no-print print:hidden print:!hidden print-modal-header"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Proposta Comercial {previewProposta.numero}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {previewProposta.clienteEmpresa || previewProposta.empresa}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
                    title="Baixar arquivo PDF limpo e formatado no seu computador"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Baixar PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleImprimir}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    title="Imprimir documento"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPreviewProposta(null);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 hover:bg-red-500 hover:text-white text-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
                    title="Fechar visualização (Esc)"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* Document Body (Clean Printable Area - Pure White) */}
            <div
              id="proposta-documento-folha"
              className="flex-1 overflow-y-auto p-4 sm:p-5 print:p-0 print:m-0 print:overflow-visible text-[11px] text-slate-800 bg-white printable-area max-w-[794px] w-full mx-auto"
            >
              {/* Proposal Header */}
              <div className="flex justify-between items-start pb-1.5">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-[#047857] tracking-tight uppercase leading-tight">
                    {empresa.nomeFantasia || 'FERA SISTEMA DO BRASIL — LINX/TOTVS'}
                  </h1>
                  <p className="text-[10px] text-slate-700 font-semibold uppercase tracking-wide mt-0.5">
                    {empresa.razaoSocial || 'FERA SISTEMA DO BRASIL'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    CNPJ: {empresa.cnpj || '08.323.625/0001-04'} • {empresa.telefone || '—'} • {empresa.email || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {previewProposta.numero}
                  </div>
                  <div className="text-[10px] text-slate-600 font-normal mt-0.5">
                    Emissão: {new Date(previewProposta.dataCriacao || previewProposta.criadoEm || Date.now()).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-slate-600 font-normal">
                    Validade: {previewProposta.validadeDias || 15} dias
                  </div>
                </div>
              </div>

              {/* Green divider bar matching exact branding */}
              <div className="h-[2px] bg-[#047857] w-full my-1.5"></div>

              {/* Client Info Card */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-[#f8fafc] border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wide block mb-0.5">
                    CLIENTE / POSTO:
                  </span>
                  <div className="font-black text-slate-900 text-xs uppercase leading-tight">
                    {previewProposta.clienteEmpresa || previewProposta.empresa}
                  </div>
                  <div className="text-slate-600 text-[10px] mt-0.5 font-medium">
                    A/C: {(previewProposta.clienteNome || previewProposta.contato || '—').toUpperCase()}
                  </div>
                  {(previewProposta.clienteCnpj || previewProposta.cnpj) && (
                    <div className="text-slate-600 text-[10px] mt-0.5 font-medium">
                      CNPJ: {previewProposta.clienteCnpj || previewProposta.cnpj}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wide block mb-0.5">
                    CONTATO & LOCALIDADE:
                  </span>
                  <div className="text-slate-700 text-[10px] font-semibold uppercase leading-tight">
                    {previewProposta.clienteCidade || previewProposta.cidade || '—'}
                  </div>
                  <div className="text-slate-700 text-[10px] mt-0.5 font-medium">
                    {previewProposta.clienteTelefone || previewProposta.telefone || '—'}
                  </div>
                  <div className="text-slate-700 text-[10px] mt-0.5 font-medium">
                    {previewProposta.clienteEmail || previewProposta.email || '—'}
                  </div>
                </div>
              </div>

              {/* Filiais list if replicated */}
              {previewProposta.replicarFiliais && previewProposta.filiais && previewProposta.filiais.length > 0 && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 mb-2">
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1 tracking-wide">
                    Unidades / Filiais Inclusas nesta Proposta:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[9.5px] text-slate-700">
                    <li>• Matriz: {previewProposta.clienteCnpj || previewProposta.cnpj || '00.000.000/0001-00'}</li>
                    {previewProposta.filiais.map((f, i) => (
                      <li key={i}>• {f.nome}: {f.cnpj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Items Table */}
              <table className="w-full text-[10.5px] border-collapse mb-2">
                <thead>
                  <tr className="border-y border-slate-200 bg-[#f1f5f9] text-left text-[10px] font-bold text-slate-800">
                    <th className="py-1.5 px-2.5 text-left font-bold text-slate-800">Sistema / Solução</th>
                    <th className="py-1.5 px-2.5 text-center font-bold text-slate-800 w-14">Qtd</th>
                    <th className="py-1.5 px-2.5 text-right font-bold text-slate-800 w-24">Licença</th>
                    <th className="py-1.5 px-2.5 text-right font-bold text-slate-800 w-28">Implantação</th>
                    <th className="py-1.5 px-2.5 text-right font-bold text-slate-800 w-32">Mensalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {(previewProposta.itens || []).map((it: any, i: number) => {
                    const qtd = it.quantidade || it.qtd || 1;
                    const preco = it.precoUnitario ?? it.preco ?? 0;
                    const impl = it.implantacao ?? 0;
                    const mens = it.mensalidade ?? 0;
                    const modulos = it.modulosInclusos || (it.modulos ? it.modulos.map((m: any) => m.nome) : []);
                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2.5">
                          <div className="font-bold text-slate-900 text-[11px] leading-snug">{it.nome}</div>
                          {modulos.length > 0 ? (
                            <div className="text-[9.5px] text-slate-500 mt-0.5 leading-tight font-normal">
                              Módulos: {modulos.join(' • ')}
                            </div>
                          ) : it.descricao ? (
                            <div className="text-[9.5px] text-slate-500 mt-0.5 leading-tight font-normal">
                              {it.descricao}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-1.5 px-2.5 text-center text-[10px] text-slate-700 font-normal">{qtd}</td>
                        <td className="py-1.5 px-2.5 text-right text-[10px] text-slate-800 font-medium">
                          {formatMoney(preco * qtd)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right text-[10px] text-slate-800 font-medium">
                          {formatMoney(impl * qtd)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right text-[10px] font-bold text-[#059669]">
                          {formatMoney(mens * qtd)}/mês
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-[#f8fafc] font-bold text-[10.5px] text-slate-900">
                    <td colSpan={2} className="py-1.5 px-2.5 text-right uppercase tracking-wider text-[10px] text-slate-600">
                      Subtotal da Proposta:
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                      {formatMoney(getValorLicenca(previewProposta))}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                      {formatMoney(getValorImplantacao(previewProposta))}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-[#059669]">
                      {formatMoney(getValorMensalidade(previewProposta))}/mês
                    </td>
                  </tr>
                  {/* Linhas de Desconto Comercial e Total Líquido */}
                  {(() => {
                    const dLicVal = previewProposta.descontoLicencaValor ?? 0;
                    const dLicPct = previewProposta.descontoLicencaPercentual ?? 0;
                    const dImpVal = previewProposta.descontoImplantacaoValor ?? (previewProposta.descontoImplantacao ?? 0);
                    const dImpPct = previewProposta.descontoImplantacaoPercentual ?? 0;
                    const dMenVal = previewProposta.descontoMensalidadeValor ?? (previewProposta.descontoMensalidade ?? 0);
                    const dMenPct = previewProposta.descontoMensalidadePercentual ?? 0;

                    // Fallback para propostas anteriores
                    const legacyVal = previewProposta.descontoValor ?? previewProposta.desconto ?? 0;
                    const legacyPct = previewProposta.descontoPercentual;
                    const aplicarEm = previewProposta.descontoAplicarEm || 'investimento';

                    const hasDedicatedDiscount = dLicVal > 0 || dImpVal > 0 || dMenVal > 0;
                    const hasLegacyDiscount = !hasDedicatedDiscount && legacyVal > 0;

                    if (!hasDedicatedDiscount && !hasLegacyDiscount) return null;

                    const vLic = getValorLicenca(previewProposta);
                    const vImp = getValorImplantacao(previewProposta);
                    const vMen = getValorMensalidade(previewProposta);
                    const vTotalInvestimento = vLic + vImp;

                    const finalLicLiquida = Math.max(0, vLic - dLicVal);
                    const finalImpLiquida = Math.max(0, vImp - dImpVal);
                    const finalMenLiquida = Math.max(0, vMen - dMenVal);
                    const finalInvestimento = hasDedicatedDiscount
                      ? finalLicLiquida + finalImpLiquida
                      : (aplicarEm !== 'mensalidade' ? Math.max(0, vTotalInvestimento - legacyVal) : vTotalInvestimento);
                    const finalMensalidade = dMenVal > 0
                      ? finalMenLiquida
                      : (hasLegacyDiscount && aplicarEm === 'mensalidade'
                          ? Math.max(0, vMen - legacyVal)
                          : vMen);

                    return (
                      <>
                        {dLicVal > 0 && (
                          <tr className="border-t border-slate-200 bg-amber-50/70 font-semibold text-[10px] text-amber-950">
                            <td colSpan={2} className="py-1.5 px-2.5 text-right text-amber-900 font-bold">
                              Desconto Comercial Especial (Licenças de Software) {dLicPct ? `[ -${dLicPct}% ]` : ''}:
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-extrabold text-amber-800">
                              - {formatMoney(dLicVal)}
                            </td>
                            <td colSpan={2} className="py-1.5 px-2.5 text-right text-[9.5px] text-amber-900 font-medium">
                              Líquido Licenças: {formatMoney(finalLicLiquida)}
                            </td>
                          </tr>
                        )}

                        {dImpVal > 0 && (
                          <tr className="border-t border-slate-200 bg-amber-50/70 font-semibold text-[10px] text-amber-950">
                            <td colSpan={2} className="py-1.5 px-2.5 text-right text-amber-900 font-bold">
                              Desconto Comercial Especial (Serviços de Implantação) {dImpPct ? `[ -${dImpPct}% ]` : ''}:
                            </td>
                            <td className="py-1.5 px-2.5"></td>
                            <td className="py-1.5 px-2.5 text-right font-extrabold text-amber-800">
                              - {formatMoney(dImpVal)}
                            </td>
                            <td className="py-1.5 px-2.5 text-right text-[9.5px] text-amber-900 font-medium">
                              Líquido Implantação: {formatMoney(finalImpLiquida)}
                            </td>
                          </tr>
                        )}

                        {dMenVal > 0 && (
                          <tr className="border-t border-slate-200 bg-amber-50/70 font-semibold text-[10px] text-amber-950">
                            <td colSpan={2} className="py-1.5 px-2.5 text-right text-amber-900 font-bold">
                              Desconto Comercial Especial (Mensalidade Recorrente) {dMenPct ? `[ -${dMenPct}% ]` : ''}:
                            </td>
                            <td colSpan={2} className="py-1.5 px-2.5 text-right text-[9.5px] text-amber-900 font-medium">
                              Líquido Mensal: {formatMoney(finalMenLiquida)}/mês
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-extrabold text-amber-800">
                              - {formatMoney(dMenVal)}/mês
                            </td>
                          </tr>
                        )}

                        {hasLegacyDiscount && (
                          <tr className="border-t border-slate-200 bg-amber-50/70 font-semibold text-[10px] text-amber-950">
                            <td colSpan={2} className="py-1.5 px-2.5 text-right text-amber-900 font-bold">
                              Desconto Comercial Especial ({aplicarEm}) {legacyPct ? `[ -${legacyPct}% ]` : ''}:
                            </td>
                            <td colSpan={3} className="py-1.5 px-2.5 text-right font-extrabold text-amber-800">
                              - {formatMoney(legacyVal)} {aplicarEm === 'mensalidade' ? '/mês' : ''}
                            </td>
                          </tr>
                        )}

                        <tr className="border-t-2 border-emerald-600 bg-emerald-50/90 font-bold text-[10.5px] text-emerald-950">
                          <td colSpan={2} className="py-1.5 px-2.5 text-right uppercase tracking-wider text-[10px] text-emerald-950">
                            Total Líquido Final:
                          </td>
                          <td colSpan={2} className="py-1.5 px-2.5 text-right font-extrabold text-xs text-emerald-800">
                            Investimento Inicial: {formatMoney(finalInvestimento)}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-extrabold text-xs text-emerald-800">
                            {formatMoney(finalMensalidade)}/mês
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tfoot>
              </table>

              {/* Conditions & Notes side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] mb-2">
                <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Condições de Pagamento:</span>
                  <p className="text-slate-700 leading-snug">{previewProposta.condicoesPagamento || 'Conforme alinhamento comercial.'}</p>
                </div>

                <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Termos Comerciais, Suporte e Garantia:</span>
                  <p className="text-slate-700 leading-snug">{previewProposta.observacoes || 'Inclusos suporte técnico homologado e atualizações legais Linx / TOTVS.'}</p>
                </div>
              </div>

              {/* Signature Options & Client Formal Acceptance (Opções de Assinatura & Termo de Aceite) */}
              <div className="rounded-lg border border-slate-300 bg-white p-2.5 text-[10px] text-slate-800 space-y-2 page-break-inside-avoid break-inside-avoid shadow-xs">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[9.5px] mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                    Opções de Assinatura & Modalidade de Aceite do Cliente
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9.5px] text-slate-700 bg-slate-50 p-1.5 rounded-md border border-slate-200">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="w-3.5 h-3.5 rounded border border-slate-400 inline-block bg-white shrink-0"></span>
                      <span><strong>Assinatura Digital</strong> (Gov.br, ZapSign, ClickSign, DocuSign)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="w-3.5 h-3.5 rounded border border-slate-400 inline-block bg-white shrink-0"></span>
                      <span><strong>Assinatura Física / Manuscrita</strong> (Impressa e digitalizada)</span>
                    </label>
                  </div>
                </div>

                <div className="text-[9.5px] text-slate-600 bg-amber-50/70 p-1.5 rounded-md border border-amber-200 leading-tight">
                  <strong>Termo de Aceite:</strong> Declaramos expressamente estar cientes e de acordo com as especificações dos sistemas, quantidades de unidades/bombas, investimentos de implantação e valores de mensalidade descritos nesta proposta comercial, autorizando o faturamento e o agendamento da implantação.
                </div>

                {/* Billing and Technical Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9.5px] pt-0.5">
                  <div className="border-b border-slate-300 pb-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Responsável pela Implantação / Pista:</span>
                    <span className="text-slate-800 font-medium truncate block">{previewProposta.clienteNome || previewProposta.contato || '______________________'}</span>
                  </div>
                  <div className="border-b border-slate-300 pb-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">E-mail Envio NF-e & Boletos:</span>
                    <span className="text-slate-800 font-medium truncate block">{previewProposta.clienteEmail || previewProposta.email || '______________________'}</span>
                  </div>
                  <div className="border-b border-slate-300 pb-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Data Desejada para Início:</span>
                    <span className="text-slate-800 font-medium">____ / ____ / ________</span>
                  </div>
                </div>

                {/* Formal Signature Lines */}
                <div className="pt-3 grid grid-cols-2 gap-6 text-center text-[10px]">
                  <div className="flex flex-col justify-end">
                    <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 text-[10px]">
                      {empresa.nomeFantasia || 'FERA SISTEMA DO BRASIL'}
                    </div>
                    <div className="text-[9px] text-slate-600 font-normal">
                      CNPJ: {empresa.cnpj || '00.000.000/0001-00'} • Consultor Comercial Autorizado
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      Data: _____/_____/_________
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 text-[10px]">
                      {previewProposta.clienteEmpresa || previewProposta.empresa}
                    </div>
                    <div className="text-[9px] text-slate-600 font-normal">
                      CNPJ: {previewProposta.clienteCnpj || previewProposta.cnpj || '___.___.___/____-__'} • Aceite do Cliente / Repr. Legal
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      Nome Legível & CPF: ___________________________
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar for Screen Preview (Excluded from PDF & Print) */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 no-print">
              <span className="text-[11px] text-slate-500">
                Pressione <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-[10px]">Esc</kbd> ou clique fora para fechar
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPreviewProposta(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
