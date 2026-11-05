import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Menu,
  Search,
  Plus,
  Database,
  UserPlus,
  MapPin,
  FileSignature,
  Building2,
  CalendarCheck,
  Package,
  RefreshCw,
  Cloud,
  HardDrive,
  Briefcase,
  Palette
} from 'lucide-react';
import { THEME_OPTIONS } from '../types/crm';

interface Props {
  onToggleMobileMenu: () => void;
  onOpenSupabase: () => void;
  onNewAction: (actionType: 'lead' | 'visita' | 'proposta' | 'cliente' | 'atividade' | 'produto') => void;
  onOpenBackup: (tab?: 'backup' | 'planilhas') => void;
  onOpenTheme: () => void;
}

export const Topbar: React.FC<Props> = ({
  onToggleMobileMenu,
  onOpenSupabase,
  onNewAction,
  onOpenBackup,
  onOpenTheme
}) => {
  const { activePage, setActivePage, searchQuery, setSearchQuery, supabaseConfig, isServerConnected, isSyncing, refreshFromServer, theme } = useCrm();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeThemeOption = THEME_OPTIONS.find(o => o.id === theme);

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Painel de Vendas';
      case 'leads': return 'Leads & Prospectos';
      case 'visitas': return 'Postos Visitados & Prospecção';
      case 'clientes': return 'Clientes Ativos';
      case 'pipeline': return 'Funil de Vendas (Pipeline)';
      case 'produtos': return 'Catálogo de Sistemas & Módulos';
      case 'propostas': return 'Propostas Comerciais';
      case 'atividades': return 'Atividades & Follow-ups';
      case 'empresa': return 'Configuração da Empresa';
      default: return 'CRM';
    }
  };

  return (
    <header
      id="crm-topbar-main"
      className="crm-topbar-lightblue h-16 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-xs"
      style={{
        backgroundColor: '#e1effc',
        backgroundImage: 'linear-gradient(180deg, #edf5fd 0%, #e0edfd 100%)',
        borderBottom: '1px solid #bfdbfe'
      }}
    >
      {/* Left side: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          id="btn-topbar-mobile-menu"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg bg-white/90 border border-blue-200 text-blue-900 hover:bg-white hover:text-blue-700 lg:hidden shadow-xs cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base font-bold text-[#0f2a4a] tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Search, Supabase quick button, New Action Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search input */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-4 h-4 text-blue-500/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="topbar-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar leads, postos, clientes..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-blue-200/90 rounded-lg text-xs text-[#0f2a4a] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400/40 transition-colors shadow-xs"
          />
        </div>

        {/* Central Sync & Status Indicator */}
        <button
          id="btn-topbar-sync"
          onClick={() => refreshFromServer()}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            isServerConnected
              ? 'bg-white/95 border-blue-200 text-blue-900 hover:bg-white hover:border-blue-300'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
          title={isServerConnected ? 'Dados sincronizados entre navegadores e computadores. Clique para forçar atualização.' : 'Conectando ao servidor central...'}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : (
            <Cloud className={`w-3.5 h-3.5 ${isServerConnected ? 'text-blue-600' : 'text-amber-500'}`} />
          )}
          <span className="hidden xl:inline text-[11px] text-blue-950">
            {isSyncing ? 'Sincronizando...' : isServerConnected ? 'Compartilhado' : 'Reconectando...'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-600 animate-pulse' : isServerConnected ? 'bg-blue-600' : 'bg-amber-400'}`} />
        </button>

        {/* Theme / Colors Button */}
        <button
          id="btn-topbar-colors"
          onClick={onOpenTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-white/95 border-blue-200 text-blue-900 hover:bg-white hover:border-blue-300 transition-all cursor-pointer shadow-xs"
          title={`Personalizar Cores do Layout (Atual: ${activeThemeOption?.name || 'Tema'})`}
        >
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline text-blue-950">Cores</span>
          <span
            className="w-2 h-2 rounded-full border border-blue-300 shadow-xs shrink-0"
            style={{ backgroundColor: activeThemeOption?.primaryColor || '#2563eb' }}
          />
        </button>

        {/* Empresa Hub Button */}
        <button
          id="btn-topbar-empresa"
          onClick={() => setActivePage('empresa')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            activePage === 'empresa'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white/95 border-blue-200 text-blue-900 hover:bg-white hover:border-blue-300'
          }`}
          title="Menu Empresa: Dados Cadastrais, Logomarca e Controle de Usuários"
        >
          <Briefcase className={`w-3.5 h-3.5 ${activePage === 'empresa' ? 'text-white' : 'text-blue-600'}`} />
          <span className={activePage === 'empresa' ? 'text-white' : 'text-blue-950'}>Empresa</span>
        </button>

        {/* Backup & Export Hub Button */}
        <button
          id="btn-topbar-backup"
          onClick={() => onOpenBackup('backup')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-white/95 border-blue-200 text-blue-900 hover:bg-white hover:border-blue-300 transition-all cursor-pointer shadow-xs"
          title="Central de Backup e Exportação para Excel (CSV) e JSON"
        >
          <HardDrive className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline text-blue-950">Backup / Exportar</span>
        </button>

        {/* Supabase Hub Button */}
        <button
          id="btn-topbar-supabase"
          onClick={onOpenSupabase}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            supabaseConfig.enabled && supabaseConfig.url
              ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100/80'
              : 'bg-white/95 border border-blue-200 text-blue-900 hover:bg-white hover:border-blue-300'
          }`}
          title="Configuração e Publicação no Supabase"
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline text-blue-950">Supabase</span>
          {supabaseConfig.enabled && supabaseConfig.url && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
        </button>

        {/* New Action Button with Dropdown */}
        <div className="relative">
          <button
            id="btn-topbar-novo-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>

          {dropdownOpen && (
            <>
              <div
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-30"
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-200 rounded-xl shadow-2xl py-1.5 z-40 text-xs text-slate-800">
                <button
                  id="btn-topbar-novo-lead"
                  onClick={() => { onNewAction('lead'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-blue-50 text-left transition-colors font-medium text-slate-800"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Novo Lead</span>
                </button>
                <button
                  id="btn-topbar-novo-visita"
                  onClick={() => { onNewAction('visita'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-blue-50 text-left transition-colors font-medium text-slate-800"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nova Visita / Posto</span>
                </button>
                <button
                  id="btn-topbar-novo-proposta"
                  onClick={() => { onNewAction('proposta'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-blue-50 text-left transition-colors font-medium text-slate-800"
                >
                  <FileSignature className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nova Proposta</span>
                </button>
                <button
                  id="btn-topbar-novo-cliente"
                  onClick={() => { onNewAction('cliente'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-blue-50 text-left transition-colors font-medium text-slate-800"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Novo Cliente</span>
                </button>
                <button
                  id="btn-topbar-novo-atividade"
                  onClick={() => { onNewAction('atividade'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-blue-50 text-left transition-colors font-medium text-slate-800"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nova Atividade</span>
                </button>
                <div className="border-t border-slate-200 my-1" />
                <button
                  id="btn-topbar-novo-produto"
                  onClick={() => { onNewAction('produto'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-blue-50 text-left transition-colors font-medium text-slate-800"
                >
                  <Package className="w-3.5 h-3.5 text-orange-600" />
                  <span>Novo Sistema</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
