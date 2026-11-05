import React from 'react';
import { useCrm } from '../context/CrmContext';
import { hasUserPermission } from '../types/crm';
import {
  LayoutDashboard,
  UserPlus,
  MapPin,
  Building2,
  TrendingUp,
  Package,
  FileSignature,
  CalendarCheck,
  Briefcase,
  Database,
  Users,
  LogOut,
  Download,
  Upload,
  Fuel,
  HardDrive,
  FileSpreadsheet,
  Palette
} from 'lucide-react';
import { THEME_OPTIONS } from '../types/crm';

interface Props {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSupabase: () => void;
  onOpenUsers: () => void;
  onOpenBackup: (tab?: 'backup' | 'planilhas') => void;
  onOpenTheme: () => void;
}

export const Sidebar: React.FC<Props> = ({
  isOpenMobile,
  onCloseMobile,
  onOpenSupabase,
  onOpenUsers,
  onOpenBackup,
  onOpenTheme
}) => {
  const {
    activePage,
    setActivePage,
    currentUser,
    logout,
    empresa,
    supabaseConfig,
    leads,
    clientes,
    deals,
    produtos,
    propostas,
    visitas,
    atividades,
    addToast,
    theme
  } = useCrm();

  const activeThemeOption = THEME_OPTIONS.find(o => o.id === theme);

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: UserPlus, badge: leads.filter(l => l.status !== 'fechado').length },
    { id: 'visitas', label: 'Postos Visitados', icon: MapPin, badge: visitas.length },
    { id: 'clientes', label: 'Clientes', icon: Building2, badge: clientes.length },
    { id: 'pipeline', label: 'Funil de Vendas', icon: TrendingUp },
    { id: 'produtos', label: 'Catálogo Sistemas', icon: Package },
    { id: 'propostas', label: 'Gerar Proposta', icon: FileSignature, badge: propostas.length },
    { id: 'atividades', label: 'Atividades', icon: CalendarCheck, badge: atividades.filter(a => !a.concluida).length },
    { id: 'empresa', label: 'Empresa', icon: Briefcase }
  ];

  const handleNav = (pageId: string) => {
    setActivePage(pageId);
    onCloseMobile();
  };

  const handleExportBackup = () => {
    const backup = {
      empresa,
      produtos,
      leads,
      clientes,
      deals,
      propostas,
      visitas,
      atividades,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-fera-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup JSON exportado com sucesso!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data) {
          localStorage.setItem('crm_postos_fera_v5', JSON.stringify(data));
          window.location.reload();
        }
      } catch {
        addToast('Arquivo de backup inválido.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        id="crm-sidebar-main"
        className={`crm-sidebar-blue fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: '#0d213e',
          backgroundImage: 'linear-gradient(180deg, #102a4e 0%, #0d213e 50%, #08172c 100%)',
          borderRight: '1px solid #1c3860'
        }}
      >
        {/* Header Branding (Clique para abrir Empresa & Logomarca) */}
        <button
          id="btn-sidebar-empresa-header"
          type="button"
          onClick={() => handleNav('empresa')}
          className="w-full text-left flex items-center gap-3 px-4 py-4 border-b border-[#1c3860] bg-[#0b1b36]/90 hover:bg-[#132c52] transition-colors group cursor-pointer"
          title="Clique para abrir: Dados da Empresa, Logomarca e Usuários"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/25 border border-blue-400/50 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm group-hover:border-white transition-colors">
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <Fuel className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white tracking-wide truncate group-hover:text-blue-100 transition-colors">
              {empresa.nomeFantasia || 'FERA SISTEMA'}
            </h1>
            <p className="text-[11px] text-blue-200/80 truncate">
              {empresa.slogan || 'LINX / TOTVS'}
            </p>
          </div>
        </button>

        {/* Supabase Status Pill */}
        <div className="p-3 border-b border-[#1c3860] bg-[#0a1830]/70">
          <button
            id="btn-sidebar-supabase-status"
            onClick={onOpenSupabase}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              supabaseConfig.enabled && supabaseConfig.url
                ? 'bg-blue-600/25 border-blue-400/60 text-white hover:bg-blue-600/35'
                : 'bg-[#0b1c36] border-[#1c3860] text-blue-100 hover:border-blue-400/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Database className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span className="truncate text-white font-medium">
                {supabaseConfig.enabled && supabaseConfig.url ? 'Supabase Conectado' : 'Supabase (Offline)'}
              </span>
            </div>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                supabaseConfig.enabled && supabaseConfig.url ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems
            .filter(item => item.id === 'empresa' || hasUserPermission(currentUser, item.id))
            .map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`btn-sidebar-nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/60 border border-blue-400/50'
                    : 'text-white hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  <span className="text-white">{item.label}</span>
                </div>
                {item.id === 'empresa' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive
                      ? 'bg-white/25 text-white border border-white/40'
                      : 'bg-[#0b1c36] border border-[#1c3860] text-blue-200'
                  }`}>
                    Config
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'bg-blue-950/90 text-white border border-blue-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & quick buttons */}
        <div className="p-3 border-t border-[#1c3860] bg-[#08172c] space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-blue-200">
              <span className="truncate text-white">
                Logado: <strong className="text-white font-bold">{currentUser.nome || currentUser.user}</strong>
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-900/80 text-white border border-blue-700/60">
                {currentUser.role}
              </span>
            </div>
          )}

          <button
            id="btn-sidebar-backup-principal"
            type="button"
            onClick={() => onOpenBackup('backup')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0d213e] hover:bg-[#132c52] border border-[#1c3860] hover:border-blue-400/80 text-xs font-semibold text-white transition-all shadow-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
              <span className="text-white">Backup & Exportar</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800 font-mono font-bold">
              JSON / CSV
            </span>
          </button>

          <div className="grid grid-cols-5 gap-1 pt-1">
            <button
              id="btn-sidebar-quick-backup"
              type="button"
              onClick={() => onOpenBackup('backup')}
              title="Backup Completo JSON"
              className="p-2 rounded-lg bg-[#0d213e] hover:bg-[#132c52] border border-[#1c3860] text-white hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
            </button>

            <button
              id="btn-sidebar-quick-csv"
              type="button"
              onClick={() => onOpenBackup('planilhas')}
              title="Exportar Planilhas Excel (CSV)"
              className="p-2 rounded-lg bg-[#0d213e] hover:bg-[#132c52] border border-[#1c3860] text-white hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </button>

            <button
              id="btn-sidebar-quick-theme"
              type="button"
              onClick={onOpenTheme}
              title={`Personalizar Cores do Layout (${activeThemeOption?.name || 'Tema'})`}
              className="p-2 rounded-lg bg-[#0d213e] hover:bg-[#132c52] border border-[#1c3860] text-white hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer relative"
            >
              <Palette className="w-4 h-4 text-white" />
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-black/50"
                style={{ backgroundColor: activeThemeOption?.primaryColor || '#2563eb' }}
              />
            </button>

            <button
              id="btn-sidebar-quick-users"
              type="button"
              onClick={onOpenUsers}
              title="Gerenciar Usuários & Senhas"
              className="p-2 rounded-lg bg-[#0d213e] hover:bg-[#132c52] border border-[#1c3860] text-white hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-white" />
            </button>

            <button
              id="btn-sidebar-quick-logout"
              type="button"
              onClick={logout}
              title="Sair do sistema"
              className="p-2 rounded-lg bg-[#0d213e] hover:bg-rose-950/70 border border-[#1c3860] hover:border-rose-700 text-blue-200 hover:text-rose-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
