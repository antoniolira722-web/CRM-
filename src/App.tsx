import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { LeadsView } from './components/LeadsView';
import { VisitasView } from './components/VisitasView';
import { ClientesView } from './components/ClientesView';
import { PipelineView } from './components/PipelineView';
import { ProdutosView } from './components/ProdutosView';
import { PropostasView } from './components/PropostasView';
import { AtividadesView } from './components/AtividadesView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { SupabaseModal } from './components/SupabaseModal';
import { UsersModal } from './components/UsersModal';
import { EmailModal } from './components/EmailModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { ToastContainer } from './components/ToastContainer';
import { ShieldAlert } from 'lucide-react';
import { hasUserPermission } from './types/crm';

function MainApp() {
  const { currentUser, activePage, setActivePage, theme } = useCrm();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Email modal state
  const [emailModalState, setEmailModalState] = useState<{
    isOpen: boolean;
    to: string;
    name: string;
    subject: string;
    message: string;
  }>({
    isOpen: false,
    to: '',
    name: '',
    subject: '',
    message: ''
  });

  const handleOpenEmailModal = (to: string, name: string, subject: string, message: string) => {
    setEmailModalState({
      isOpen: true,
      to,
      name,
      subject,
      message
    });
  };

  const handleCloseEmailModal = () => {
    setEmailModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleNewAction = (actionType: 'lead' | 'visita' | 'proposta' | 'cliente' | 'atividade' | 'produto') => {
    switch (actionType) {
      case 'lead':
        setActivePage('leads');
        break;
      case 'visita':
        setActivePage('visitas');
        break;
      case 'proposta':
        setActivePage('propostas');
        break;
      case 'cliente':
        setActivePage('clientes');
        break;
      case 'atividade':
        setActivePage('atividades');
        break;
      case 'produto':
        setActivePage('produtos');
        break;
    }
  };

  if (!currentUser) {
    return (
      <>
        <LoginScreen onOpenSupabase={() => setIsSupabaseModalOpen(true)} />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div
      data-theme={theme}
      className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:text-black"
    >
      {/* Sidebar Navigation */}
      <div className="no-print print:hidden">
        <Sidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onOpenUsers={() => setIsUsersModalOpen(true)}
          onOpenBackup={(tab) => {
            setActivePage('empresa');
          }}
          onOpenTheme={() => setIsThemeModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:overflow-visible print:h-auto">
        {/* Topbar */}
        <div className="no-print print:hidden">
          <Topbar
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
            onOpenSupabase={() => setIsSupabaseModalOpen(true)}
            onNewAction={handleNewAction}
            onOpenBackup={(tab) => {
              setActivePage('empresa');
            }}
            onOpenTheme={() => setIsThemeModalOpen(true)}
          />
        </div>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-6 print:p-0 print:m-0 print:overflow-visible print:h-auto print:bg-white">
          {!hasUserPermission(currentUser, activePage) && activePage !== 'empresa' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-base font-bold text-zinc-100">Acesso Restrito a este Módulo</h3>
                <p className="text-xs text-zinc-400">
                  O seu usuário (<strong className="text-zinc-200">{currentUser?.nome || currentUser?.user}</strong>) não possui permissão configurada para acessar esta área.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Solicite a um administrador no menu <strong>Empresa &rarr; Usuários</strong> a liberação do módulo desejado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('dashboard')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors border border-zinc-700"
              >
                Voltar ao Painel Principal
              </button>
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <DashboardView onOpenSupabase={() => setIsSupabaseModalOpen(true)} />
              )}
              {activePage === 'leads' && (
                <LeadsView onOpenEmailModal={handleOpenEmailModal} />
              )}
              {activePage === 'visitas' && (
                <VisitasView onOpenEmailModal={handleOpenEmailModal} />
              )}
              {activePage === 'clientes' && (
                <ClientesView onOpenEmailModal={handleOpenEmailModal} />
              )}
              {activePage === 'pipeline' && <PipelineView />}
              {activePage === 'produtos' && <ProdutosView />}
              {activePage === 'propostas' && (
                <PropostasView onOpenEmailModal={handleOpenEmailModal} />
              )}
              {activePage === 'atividades' && (
                <AtividadesView onOpenEmailModal={handleOpenEmailModal} />
              )}
              {activePage === 'empresa' && (
                <ConfiguracoesView onOpenSupabase={() => setIsSupabaseModalOpen(true)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <UsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />

      <EmailModal
        isOpen={emailModalState.isOpen}
        onClose={handleCloseEmailModal}
        initialTo={emailModalState.to}
        initialName={emailModalState.name}
        initialSubject={emailModalState.subject}
        initialMessage={emailModalState.message}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <CrmProvider>
      <MainApp />
    </CrmProvider>
  );
}
