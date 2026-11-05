import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { DadosEmpresa } from '../types/crm';
import {
  Building2,
  Users,
  Image as ImageIcon,
  Database,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Layers,
  Save,
  ShieldAlert,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import { THEME_OPTIONS, ThemeId } from '../types/crm';
import { SCHEMA_SQL } from '../lib/schemaSql';
import { CnpjSearchInput } from './CnpjSearchInput';
import { CnpjData } from '../lib/cnpj';
import { LogoManager } from './LogoManager';
import { UserManager } from './UserManager';

interface Props {
  onOpenSupabase: () => void;
  defaultTab?: 'empresa' | 'usuarios' | 'supabase' | 'backup' | 'tema';
}

export const ConfiguracoesView: React.FC<Props> = ({ onOpenSupabase, defaultTab = 'empresa' }) => {
  const {
    empresa,
    updateEmpresa,
    users,
    currentUser,
    supabaseConfig,
    testSupabase,
    pushToSupabase,
    pullFromSupabase,
    addToast,
    theme,
    setTheme
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'empresa' | 'usuarios' | 'supabase' | 'backup' | 'tema'>(defaultTab);
  const [themeFilter, setThemeFilter] = useState<'todos' | 'escuro' | 'claro' | 'especial'>('todos');
  const [formEmpresa, setFormEmpresa] = useState<DadosEmpresa>({ ...empresa });
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);

  // Sync formEmpresa when context empresa changes (e.g. logo updated)
  useEffect(() => {
    setFormEmpresa(prev => ({
      ...prev,
      ...empresa
    }));
  }, [empresa]);

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmpresa(formEmpresa);
    addToast('Dados da empresa FERA atualizados com sucesso!', 'success');
  };

  const handleCnpjFound = (data: CnpjData) => {
    setFormEmpresa(prev => ({
      ...prev,
      cnpj: data.cnpj,
      razaoSocial: data.razaoSocial || prev.razaoSocial,
      nomeFantasia: data.nomeFantasia || data.razaoSocial || prev.nomeFantasia,
      telefone: data.telefone || prev.telefone,
      email: data.email || prev.email,
      cidade: data.cidade || prev.cidade,
      endereco: data.endereco || prev.endereco
    }));
    addToast(`Dados da empresa "${data.razaoSocial}" preenchidos via Receita!`, 'success');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    addToast('Script SQL completo copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTest = async () => {
    setTestingSupabase(true);
    const res = await testSupabase();
    setTestingSupabase(false);
    if (res.ok) {
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handlePush = async () => {
    setPushing(true);
    const res = await pushToSupabase();
    setPushing(false);
    if (res.ok) {
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handlePull = async () => {
    setPulling(true);
    const res = await pullFromSupabase();
    setPulling(false);
    if (res.ok) {
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleExportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      empresa,
      users,
      leads: localStorage.getItem('crm_leads_v1') ? JSON.parse(localStorage.getItem('crm_leads_v1')!) : [],
      clientes: localStorage.getItem('crm_clientes_v1') ? JSON.parse(localStorage.getItem('crm_clientes_v1')!) : [],
      deals: localStorage.getItem('crm_deals_v1') ? JSON.parse(localStorage.getItem('crm_deals_v1')!) : [],
      atividades: localStorage.getItem('crm_atividades_v1') ? JSON.parse(localStorage.getItem('crm_atividades_v1')!) : [],
      produtos: localStorage.getItem('crm_produtos_v1') ? JSON.parse(localStorage.getItem('crm_produtos_v1')!) : [],
      propostas: localStorage.getItem('crm_propostas_v1') ? JSON.parse(localStorage.getItem('crm_propostas_v1')!) : [],
      visitas: localStorage.getItem('crm_visitas_v1') ? JSON.parse(localStorage.getItem('crm_visitas_v1')!) : []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-fera-crm-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup do CRM exportado com sucesso!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.leads) localStorage.setItem('crm_leads_v1', JSON.stringify(json.leads));
        if (json.clientes) localStorage.setItem('crm_clientes_v1', JSON.stringify(json.clientes));
        if (json.deals) localStorage.setItem('crm_deals_v1', JSON.stringify(json.deals));
        if (json.atividades) localStorage.setItem('crm_atividades_v1', JSON.stringify(json.atividades));
        if (json.produtos) localStorage.setItem('crm_produtos_v1', JSON.stringify(json.produtos));
        if (json.propostas) localStorage.setItem('crm_propostas_v1', JSON.stringify(json.propostas));
        if (json.visitas) localStorage.setItem('crm_visitas_v1', JSON.stringify(json.visitas));
        if (json.empresa) {
          updateEmpresa(json.empresa);
        }

        addToast('Backup restaurado com sucesso! Recarregando aplicação...', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err: any) {
        addToast('Falha ao restaurar backup: arquivo inválido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-xs pb-10">
      {/* 1. Header do Módulo Empresa */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 flex items-center justify-center text-[#3ecf8e] shrink-0 shadow-sm overflow-hidden">
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              Menu Empresa & Configurações
              <span className="text-[11px] font-normal text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-2 py-0.5 rounded-full">
                {empresa.nomeFantasia || 'FERA SISTEMA'}
              </span>
            </h2>
            <p className="text-zinc-400 text-xs">
              Cadastre usuários com limite de acesso, troque a logomarca da empresa e gerencie integrações.
            </p>
          </div>
        </div>

        {/* Status rápido do Usuário Logado */}
        {currentUser && (
          <div className="text-right text-[11px] text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            Logado como: <strong className="text-zinc-200">{currentUser.nome}</strong> ({currentUser.user}) • Perfil:{' '}
            <span className="text-[#3ecf8e] font-bold uppercase">{currentUser.role}</span>
          </div>
        )}
      </div>

      {/* 2. Navegação em Abas Modernas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'empresa'
              ? 'bg-[#3ecf8e] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Logomarca & Dados da Empresa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'usuarios'
              ? 'bg-[#3ecf8e] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários e Limites de Acesso</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'usuarios' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-[#3ecf8e]'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'supabase'
              ? 'bg-[#3ecf8e] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Nuvem & Supabase</span>
          {supabaseConfig.enabled && supabaseConfig.url && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'backup'
              ? 'bg-[#3ecf8e] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Backup & Restauração</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tema')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'tema'
              ? 'bg-[#3ecf8e] text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Cores & Layout</span>
        </button>
      </div>

      {/* 3. Conteúdo da Aba 1: Dados & Logomarca da Empresa */}
      {activeTab === 'empresa' && (
        <div className="space-y-6">
          {/* Espaço para Trocar a Logomarca */}
          <LogoManager />

          {/* Formulário de Dados Cadastrais da Empresa */}
          <form
            onSubmit={handleSaveEmpresa}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#3ecf8e]" />
                  <span>Dados Cadastrais da Empresa (Razão Social e CNPJ)</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Estes dados e a logomarca acima saem automaticamente no cabeçalho das propostas comerciais em PDF e nos relatórios de visitas.
                </p>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Dados</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={formEmpresa.nomeFantasia}
                  onChange={e => setFormEmpresa({ ...formEmpresa, nomeFantasia: e.target.value })}
                  placeholder="Ex: FERA SISTEMA DO BRASIL — LINX/TOTVS"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Razão Social</label>
                <input
                  type="text"
                  value={formEmpresa.razaoSocial}
                  onChange={e => setFormEmpresa({ ...formEmpresa, razaoSocial: e.target.value })}
                  placeholder="Ex: FERA SISTEMAS E TECNOLOGIA LTDA"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <CnpjSearchInput
                value={formEmpresa.cnpj}
                onChange={val => setFormEmpresa({ ...formEmpresa, cnpj: val })}
                onCompanyFound={handleCnpjFound}
                label="CNPJ da Empresa (Busca na Receita)"
                placeholder="00.000.000/0001-00"
              />

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Inscrição Estadual (IE)</label>
                <input
                  type="text"
                  value={formEmpresa.inscricaoEstadual || ''}
                  onChange={e => setFormEmpresa({ ...formEmpresa, inscricaoEstadual: e.target.value })}
                  placeholder="Isento ou 123.456.789.000"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Telefone / WhatsApp Comercial</label>
                <input
                  type="text"
                  value={formEmpresa.telefone}
                  onChange={e => setFormEmpresa({ ...formEmpresa, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">E-mail Comercial / Propostas</label>
                <input
                  type="email"
                  value={formEmpresa.email}
                  onChange={e => setFormEmpresa({ ...formEmpresa, email: e.target.value })}
                  placeholder="comercial@ferasistemas.com.br"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Cidade / Estado (UF)</label>
                <input
                  type="text"
                  value={formEmpresa.cidade}
                  onChange={e => setFormEmpresa({ ...formEmpresa, cidade: e.target.value })}
                  placeholder="São Paulo / SP"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Website Oficial</label>
                <input
                  type="text"
                  value={formEmpresa.site || ''}
                  onChange={e => setFormEmpresa({ ...formEmpresa, site: e.target.value })}
                  placeholder="https://ferasistemas.com.br"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Responsável / Diretoria</label>
                <input
                  type="text"
                  value={formEmpresa.responsavel || ''}
                  onChange={e => setFormEmpresa({ ...formEmpresa, responsavel: e.target.value })}
                  placeholder="Diretoria Comercial"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Endereço Comercial Completo</label>
              <input
                type="text"
                value={formEmpresa.endereco || ''}
                onChange={e => setFormEmpresa({ ...formEmpresa, endereco: e.target.value })}
                placeholder="Av. Paulista, 1000, 10º andar - Bela Vista - CEP 01310-100"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Slogan ou Mensagem Institucional</label>
              <input
                type="text"
                value={formEmpresa.slogan || ''}
                onChange={e => setFormEmpresa({ ...formEmpresa, slogan: e.target.value })}
                placeholder="Sistemas inteligentes para postos de combustíveis e conveniências"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Dados da Empresa</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Conteúdo da Aba 2: Gestão de Usuários & Limites de Acesso */}
      {activeTab === 'usuarios' && <UserManager />}

      {/* 5. Conteúdo da Aba 3: Supabase Cloud Integration Panel */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    Conexão e Publicação no Supabase Cloud
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        supabaseConfig.enabled && supabaseConfig.url
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {supabaseConfig.enabled && supabaseConfig.url ? 'Conectado' : 'Modo Offline Local'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Sincronização em nuvem com PostgreSQL, Row Level Security (RLS) e atualização em tempo real entre computadores.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenSupabase}
                className="px-3.5 py-1.5 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold shadow-sm transition-colors"
              >
                Configurar Chaves Supabase
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-zinc-400 font-semibold block">Status da Conexão</span>
                <div className="space-y-1 text-zinc-300">
                  <div className="truncate">
                    <strong>Project URL:</strong>{' '}
                    <span className="font-mono text-[#3ecf8e]">
                      {supabaseConfig.url || 'Não configurada (armazenamento local)'}
                    </span>
                  </div>
                  <div className="truncate">
                    <strong>Anon Public Key:</strong>{' '}
                    <span className="font-mono text-zinc-400">
                      {supabaseConfig.anonKey ? '••••••••••••••••••••••••' : 'Não configurada'}
                    </span>
                  </div>
                  <div>
                    <strong>Sincronização Ativa:</strong>{' '}
                    <span className={supabaseConfig.enabled ? 'text-[#3ecf8e] font-bold' : 'text-amber-400'}>
                      {supabaseConfig.enabled ? 'Sim (Habilitada)' : 'Não'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testingSupabase || !supabaseConfig.url}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {testingSupabase ? 'Testando...' : 'Testar Conexão'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePush}
                    disabled={pushing || !supabaseConfig.url}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950 border border-zinc-800 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    {pushing ? 'Enviando...' : 'Fazer Push (Local → Supabase)'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePull}
                    disabled={pulling || !supabaseConfig.url}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-blue-950 border border-zinc-800 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    {pulling ? 'Baixando...' : 'Fazer Pull (Supabase → Local)'}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-100 font-bold">Estrutura SQL de Tabelas (PostgreSQL)</span>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="flex items-center gap-1 text-[11px] text-[#3ecf8e] hover:underline"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                    </button>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    Execute este script no <em>SQL Editor</em> do painel do seu Supabase para criar as tabelas com RLS e Realtime.
                  </p>
                </div>

                <pre className="p-2 rounded bg-zinc-900 text-[10px] font-mono text-emerald-300/80 overflow-x-auto max-h-24 border border-zinc-800">
                  {SCHEMA_SQL.slice(0, 320)}...
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Conteúdo da Aba 4: Backup, Restore & Reset */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#3ecf8e]" />
                <span>Backup e Restauração de Dados Completos</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Exporte uma cópia completa de todos os usuários, logomarca, leads, clientes, visitas e propostas para segurança.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Backup Completo (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurar Arquivo de Backup (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 5. Conteúdo da Aba: Personalização das Cores do Layout */}
      {activeTab === 'tema' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#3ecf8e]" />
                <span>Cores e Identidade Visual do CRM</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Selecione uma paleta de cores corporativa de alto contraste para o layout do sistema. A escolha é aplicada imediatamente e memorizada em seu navegador.
              </p>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              <button
                type="button"
                onClick={() => setThemeFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  themeFilter === 'todos'
                    ? 'bg-[#3ecf8e] text-black shadow-xs'
                    : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Todos ({THEME_OPTIONS.length})
              </button>
              <button
                type="button"
                onClick={() => setThemeFilter('escuro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  themeFilter === 'escuro'
                    ? 'bg-[#3ecf8e] text-black shadow-xs'
                    : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Escuros ({THEME_OPTIONS.filter(o => o.category === 'escuro').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeFilter('claro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  themeFilter === 'claro'
                    ? 'bg-[#3ecf8e] text-black shadow-xs'
                    : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Claros ({THEME_OPTIONS.filter(o => o.category === 'claro').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeFilter('especial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  themeFilter === 'especial'
                    ? 'bg-[#3ecf8e] text-black shadow-xs'
                    : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                OLED Preto Puro
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {THEME_OPTIONS.filter(opt => themeFilter === 'todos' || opt.category === themeFilter).map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id);
                      addToast(`Tema "${opt.name}" ativado com sucesso!`, 'success');
                    }}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#3ecf8e] bg-zinc-800/90 shadow-md ring-2 ring-[#3ecf8e]/30'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: opt.primaryColor }}
                          />
                          <span className="text-xs font-bold text-zinc-100 group-hover:text-white">
                            {opt.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {opt.isDark ? (
                            <Moon className="w-3.5 h-3.5 text-zinc-500" />
                          ) : (
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#3ecf8e] border-[#3ecf8e] text-black'
                                : 'border-zinc-700 bg-zinc-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">Amostras:</span>
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: opt.primaryColor }}
                            title="Destaque Principal"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: opt.previewCard }}
                            title="Fundo dos Cards"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: opt.previewBg }}
                            title="Fundo Principal"
                          />
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${opt.primaryColor}22`,
                          color: opt.primaryColor
                        }}
                      >
                        {opt.isDark ? 'Escuro' : 'Claro'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
