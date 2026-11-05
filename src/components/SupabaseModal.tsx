import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { SUPABASE_SQL_SCHEMA } from '../lib/schemaSql';
import {
  Database,
  CheckCircle,
  AlertCircle,
  X,
  Copy,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  ExternalLink,
  Code,
  Layers,
  HelpCircle,
  KeyRound
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    supabaseConfig,
    updateSupabaseConfig,
    testSupabase,
    pushToSupabase,
    pullFromSupabase,
    addToast
  } = useCrm();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [enabled, setEnabled] = useState(supabaseConfig.enabled);
  const [realtime, setRealtime] = useState(supabaseConfig.realtime);

  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'guide'>('config');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabase(url.trim(), anonKey.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message || 'Falha ao testar conexão.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    updateSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      enabled,
      realtime,
      lastSync: supabaseConfig.lastSync
    });
    onClose();
  };

  const handlePush = async () => {
    if (!confirm('Deseja enviar todos os registros locais (leads, clientes, visitas, produtos, propostas) para o Supabase?')) return;
    setPushing(true);
    try {
      await pushToSupabase();
    } finally {
      setPushing(false);
    }
  };

  const handlePull = async () => {
    if (!confirm('Deseja baixar os dados do Supabase e sincronizar neste navegador?')) return;
    setPulling(true);
    try {
      await pullFromSupabase();
    } finally {
      setPulling(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    addToast('Script SQL copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                Publicar & Conectar no Supabase
              </h2>
              <p className="text-xs text-zinc-400">
                PostgreSQL na nuvem para persistência permanente do CRM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-zinc-900 px-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Credenciais & Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Script SQL (Tabelas)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Passo a Passo</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'config' && (
            <>
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
                  supabaseConfig.enabled && supabaseConfig.url
                    ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {supabaseConfig.enabled && supabaseConfig.url ? (
                    <CheckCircle className="w-5 h-5 text-[#3ecf8e] shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold">
                      {supabaseConfig.enabled && supabaseConfig.url
                        ? 'Supabase Ativo & Configurado'
                        : 'Modo Local (Supabase não conectado)'}
                    </span>
                    {supabaseConfig.lastSync && (
                      <span className="block text-[11px] opacity-80 mt-0.5">
                        Última sincronização: {supabaseConfig.lastSync}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-[#3ecf8e] text-zinc-200 hover:text-white transition-colors shrink-0"
                >
                  <span>Abrir Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div>
                    <span className="text-sm font-semibold text-zinc-100">Ativar Conexão com Supabase</span>
                    <p className="text-xs text-zinc-400">Grava e sincroniza os dados no PostgreSQL online</p>
                  </div>
                  <input
                    type="checkbox"
                    id="enable-supabase"
                    checked={enabled}
                    onChange={e => setEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#3ecf8e] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Project URL do Supabase *
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://seu-projeto-id.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-[#3ecf8e] placeholder-zinc-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Encontrado no Supabase em: <em>Project Settings → API → Project URL</em>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Anon / Public Key do Supabase *
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={e => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-[#3ecf8e] placeholder-zinc-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Encontrado no Supabase em: <em>Project Settings → API → Project API keys (anon public)</em>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="realtime-check"
                    checked={realtime}
                    onChange={e => setRealtime(e.target.checked)}
                    className="w-4 h-4 accent-[#3ecf8e]"
                  />
                  <label htmlFor="realtime-check" className="text-xs text-zinc-300 cursor-pointer">
                    Ativar sincronização em tempo real (atualização multi-dispositivo)
                  </label>
                </div>
              </div>

              {/* Connection test result */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    testResult.ok
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    {testResult.ok ? <CheckCircle className="w-4 h-4 text-[#3ecf8e]" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{testResult.ok ? 'Diagnóstico Positivo' : 'Diagnóstico de Erro'}</span>
                  </div>
                  <p>{testResult.message}</p>
                </div>
              )}

              {/* Data actions */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#3ecf8e]" />
                  <span>Ações de Sincronização e Publicação</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Envie sua base atual deste computador para o banco do Supabase ou baixe os dados da nuvem.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePush}
                    disabled={pushing || !url || !anonKey}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{pushing ? 'Enviando...' : 'Publicar Dados (Push Inicial)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePull}
                    disabled={pulling || !url || !anonKey}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>{pulling ? 'Baixando...' : 'Baixar da Nuvem (Pull)'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-400">
                  Execute este script no <strong>SQL Editor</strong> do painel Supabase para criar todas as 9 tabelas e políticas RLS.
                </p>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-semibold shrink-0 transition-colors shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#0a0a0a] border border-zinc-800 text-[#3ecf8e] font-mono text-[11px] sm:text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="font-bold text-sm text-zinc-100 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3ecf8e] text-black font-bold flex items-center justify-center text-xs">1</span>
                  Criar projeto gratuito no Supabase
                </h4>
                <p className="text-zinc-400">
                  Acesse <strong>supabase.com</strong>, crie uma conta e inicie um novo projeto na região <em>South America (São Paulo)</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="font-bold text-sm text-zinc-100 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3ecf8e] text-black font-bold flex items-center justify-center text-xs">2</span>
                  Executar o Script SQL
                </h4>
                <p className="text-zinc-400">
                  Vá na aba <strong>SQL Editor</strong> do Supabase, clique em <strong>New Query</strong>, cole o código da aba <em>Script SQL</em> deste modal e clique em <strong>Run</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="font-bold text-sm text-zinc-100 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3ecf8e] text-black font-bold flex items-center justify-center text-xs">3</span>
                  Copiar as Chaves de API
                </h4>
                <p className="text-zinc-400">
                  Vá em <strong>Project Settings → API</strong> e copie a <strong>Project URL</strong> e a <strong>anon key</strong>. Cole aqui na aba <em>Credenciais</em> e clique em <em>Testar Conexão</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="font-bold text-sm text-zinc-100 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3ecf8e] text-black font-bold flex items-center justify-center text-xs">4</span>
                  Publicar os dados existentes (Push)
                </h4>
                <p className="text-zinc-400">
                  Clique no botão <strong>Publicar Dados (Push Inicial)</strong>. Todos os leads, propostas e clientes deste app serão gravados no PostgreSQL na nuvem instantaneamente!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !url || !anonKey}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-xs font-semibold text-black transition-colors shadow-sm"
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
