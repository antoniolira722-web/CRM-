import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  UserAccount,
  EmpresaConfig,
  Produto,
  Lead,
  Cliente,
  Deal,
  Proposta,
  Visita,
  Atividade,
  SupabaseConfig,
  LeadStage,
  ThemeId
} from '../types/crm';
import {
  DEFAULT_USERS,
  DEFAULT_EMPRESA,
  DEFAULT_PRODUCTS,
  SEED_LEADS,
  SEED_CLIENTES,
  SEED_DEALS,
  SEED_PROPOSTAS,
  SEED_VISITAS,
  SEED_ATIVIDADES
} from '../data/defaultData';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  pushAllDataToSupabase,
  pullAllDataFromSupabase,
  testSupabaseConnection,
  getSupabaseClient
} from '../lib/supabase';

const STORAGE_KEY = 'crm_postos_fera_v5';
const USERS_KEY = 'crm_postos_users_v5';
const SESSION_KEY = 'crm_postos_session_v5';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CrmContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  usuarios: UserAccount[];
  login: (u: string, p: string) => boolean;
  logout: () => void;
  saveUser: (user: Partial<UserAccount> & { user: string }) => void;
  addUsuario: (user: Omit<UserAccount, 'id'>) => void;
  updateUsuario: (id: string, user: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  deleteUsuario: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  updateMyPassword: (oldP: string, newP: string) => boolean;

  // Navigation & Search
  activePage: string;
  setActivePage: (p: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Data
  empresa: EmpresaConfig;
  updateEmpresa: (data: EmpresaConfig) => void;
  produtos: Produto[];
  addProduto: (p: Omit<Produto, 'id'>) => void;
  updateProduto: (id: string, p: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;

  leads: Lead[];
  addLead: (l: Omit<Lead, 'id' | 'criadoEm' | 'historico'>) => void;
  updateLead: (id: string, l: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCliente: (leadId: string) => void;

  clientes: Cliente[];
  addCliente: (c: Omit<Cliente, 'id' | 'dataFechamento'>) => void;
  updateCliente: (id: string, c: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;

  deals: Deal[];
  updateDealStage: (dealId: string, newStage: LeadStage) => void;

  propostas: Proposta[];
  addProposta: (p: Omit<Proposta, 'id' | 'criadoEm'>) => void;
  updateProposta: (id: string, p: Partial<Proposta>) => void;
  deleteProposta: (id: string) => void;

  visitas: Visita[];
  addVisita: (v: Omit<Visita, 'id' | 'criadoEm'>, autoCreateLead?: boolean) => void;
  updateVisita: (id: string, v: Partial<Visita>) => void;
  deleteVisita: (id: string) => void;

  atividades: Atividade[];
  addAtividade: (a: Omit<Atividade, 'id'>) => void;
  updateAtividade: (id: string, a: Partial<Atividade>) => void;
  deleteAtividade: (id: string) => void;
  toggleConcluirAtividade: (id: string) => void;

  // Supabase
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (cfg: SupabaseConfig) => void;
  testSupabase: (url?: string, key?: string) => Promise<{ ok: boolean; message: string }>;
  pushToSupabase: () => Promise<{ ok: boolean; message: string }>;
  pullFromSupabase: () => Promise<{ ok: boolean; message: string }>;

  // Sincronização em Nuvem / Servidor Central (Compartilhamento entre múltiplos PCs e navegadores)
  isServerConnected: boolean;
  isSyncing: boolean;
  refreshFromServer: () => Promise<void>;
  restoreBackup: (data: any) => Promise<{ ok: boolean; message: string }>;

  // Theme & Layout Colors
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('crm_theme_fera_v1');
      if (saved && ['ocean', 'emerald', 'amber', 'indigo', 'slate', 'light'].includes(saved)) {
        return saved as ThemeId;
      }
    } catch {}
    return 'ocean'; // Novo tema padrão moderno: Azul Petróleo Linx/TOTVS
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('crm_theme_fera_v1', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }, [theme]);

  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default to admin user so system never gets stuck on login screen unexpectedly
    return DEFAULT_USERS[0];
  });

  // Main CRM state
  const [empresa, setEmpresa] = useState<EmpresaConfig>(DEFAULT_EMPRESA);
  const [produtos, setProdutos] = useState<Produto[]>(DEFAULT_PRODUCTS);
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [clientes, setClientes] = useState<Cliente[]>(SEED_CLIENTES);
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);
  const [propostas, setPropostas] = useState<Proposta[]>(() => {
    try {
      const vault = localStorage.getItem('crm_propostas_vault_v1');
      if (vault) {
        const parsed = JSON.parse(vault);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.propostas && Array.isArray(parsed.propostas) && parsed.propostas.length > 0) return parsed.propostas;
      }
    } catch {}
    return SEED_PROPOSTAS;
  });
  const [visitas, setVisitas] = useState<Visita[]>(SEED_VISITAS);
  const [atividades, setAtividades] = useState<Atividade[]>(SEED_ATIVIDADES);

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(getSupabaseConfig());

  // Estado de sincronização com o Servidor Central
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const lastSyncedTimestampRef = useRef<number>(0);
  const isInitialLoadCompletedRef = useRef<boolean>(false);
  const isRemoteUpdatingRef = useRef<boolean>(false);
  const saveTimerRef = useRef<any>(null);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sincronizar com o Servidor Central (compartilhado entre todos os PCs, navegadores e usuários)
  const refreshFromServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/crm/data');
      if (!res.ok) throw new Error('Servidor não respondeu');
      const json = await res.json();
      if (json.success && json.data) {
        isRemoteUpdatingRef.current = true;
        const d = json.data;
        if (d.empresa) setEmpresa(d.empresa);
        if (d.produtos && Array.isArray(d.produtos) && d.produtos.length) setProdutos(d.produtos);
        if (d.leads && Array.isArray(d.leads)) setLeads(d.leads);
        if (d.clientes && Array.isArray(d.clientes)) setClientes(d.clientes);
        if (d.deals && Array.isArray(d.deals)) setDeals(d.deals);
        if (d.propostas && Array.isArray(d.propostas)) {
          const normProps = d.propostas.map((p: any) => ({
            ...p,
            empresa: p.empresa || p.clienteEmpresa || '',
            clienteEmpresa: p.clienteEmpresa || p.empresa || '',
            contato: p.contato || p.clienteNome || '',
            clienteNome: p.clienteNome || p.contato || '',
            dataCriacao: p.dataCriacao || p.criadoEm || new Date().toISOString(),
            criadoEm: p.criadoEm || p.dataCriacao || new Date().toISOString(),
            cnpj: p.cnpj || p.clienteCnpj || '',
            clienteCnpj: p.clienteCnpj || p.cnpj || '',
            telefone: p.telefone || p.clienteTelefone || '',
            clienteTelefone: p.clienteTelefone || p.telefone || '',
            email: p.email || p.clienteEmail || '',
            clienteEmail: p.clienteEmail || p.email || '',
            cidade: p.cidade || p.clienteCidade || '',
            clienteCidade: p.clienteCidade || p.cidade || '',
          }));

          // Read local vault to make sure NO proposal created locally is ever lost
          let vaultProps: Proposta[] = [];
          try {
            const rawVault = localStorage.getItem('crm_propostas_vault_v1');
            if (rawVault) vaultProps = JSON.parse(rawVault);
          } catch {}

          if (normProps.length === 0 && vaultProps.length > 0) {
            setPropostas(vaultProps);
          } else {
            const serverKeys = new Set(normProps.map((p: any) => p.id || p.numero));
            const missing = vaultProps.filter(vp => vp && (vp.id || vp.numero) && !serverKeys.has(vp.id) && !serverKeys.has(vp.numero));
            const finalProps = [...missing, ...normProps];
            setPropostas(finalProps);
            try {
              localStorage.setItem('crm_propostas_vault_v1', JSON.stringify(finalProps));
            } catch {}
          }
        }
        if (d.visitas && Array.isArray(d.visitas)) setVisitas(d.visitas);
        if (d.atividades && Array.isArray(d.atividades)) setAtividades(d.atividades);
        if (d.users && Array.isArray(d.users) && d.users.length) {
          setUsers(d.users);
          try { localStorage.setItem(USERS_KEY, JSON.stringify(d.users)); } catch {}
        }
        if (d.supabaseConfig && (d.supabaseConfig.url || d.supabaseConfig.anonKey)) {
          setSupabaseConfigState(d.supabaseConfig);
          try { localStorage.setItem('crm_supabase_config_v1', JSON.stringify(d.supabaseConfig)); } catch {}
        }
        if (d.lastUpdated) {
          lastSyncedTimestampRef.current = d.lastUpdated;
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            empresa: d.empresa,
            produtos: d.produtos,
            leads: d.leads,
            clientes: d.clientes,
            deals: d.deals,
            propostas: d.propostas,
            visitas: d.visitas,
            atividades: d.atividades
          }));
        } catch {}
        setIsServerConnected(true);
      }
    } catch (e) {
      console.warn('Servidor central não respondeu, operando com dados locais:', e);
      setIsServerConnected(false);
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
        isInitialLoadCompletedRef.current = true;
      }, 100);
    }
  }, []);

  // 1. Carga inicial e sincronização contínua com polling e eventos de foco
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const rawVault = localStorage.getItem('crm_propostas_vault_v1');
      let loadedProps: Proposta[] = [];
      if (rawVault) {
        try { loadedProps = JSON.parse(rawVault); } catch {}
      }
      if (raw) {
        const d = JSON.parse(raw);
        if (d.empresa) setEmpresa(d.empresa);
        if (d.produtos && d.produtos.length) setProdutos(d.produtos);
        if (d.leads) setLeads(d.leads);
        if (d.clientes) setClientes(d.clientes);
        if (d.deals) setDeals(d.deals);
        if (d.propostas && Array.isArray(d.propostas) && d.propostas.length > 0 && loadedProps.length === 0) {
          loadedProps = d.propostas;
        }
        if (d.visitas) setVisitas(d.visitas);
        if (d.atividades) setAtividades(d.atividades);
      }
      if (loadedProps.length > 0) {
        setPropostas(loadedProps);
      }
    } catch (e) {
      console.warn('Erro ao carregar cache local', e);
    }

    // Puxa do servidor central compartilhado
    refreshFromServer();

    // Monitora alterações feitas por outros computadores/navegadores a cada 10 segundos
    const interval = setInterval(async () => {
      if (document.hidden || saveTimerRef.current || isRemoteUpdatingRef.current) return;
      try {
        const res = await fetch('/api/crm/status');
        if (!res.ok) return;
        const status = await res.json();
        if (status.success && status.lastUpdated && status.lastUpdated > lastSyncedTimestampRef.current) {
          refreshFromServer();
        }
      } catch {}
    }, 10000);

    const onFocus = async () => {
      // Não sobrescreve edições locais pendentes de envio
      if (saveTimerRef.current || isRemoteUpdatingRef.current) return;
      try {
        const res = await fetch('/api/crm/status');
        if (!res.ok) return;
        const status = await res.json();
        if (status.success && status.lastUpdated && status.lastUpdated > lastSyncedTimestampRef.current) {
          refreshFromServer();
        }
      } catch {}
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshFromServer]);

  // 2. Salva alterações no Servidor Central e em cache local para todos os dispositivos
  useEffect(() => {
    if (!isInitialLoadCompletedRef.current || isRemoteUpdatingRef.current) {
      return;
    }

    const payload = {
      empresa,
      produtos,
      leads,
      clientes,
      deals,
      propostas,
      visitas,
      atividades,
      users
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Erro ao salvar em cache local', e);
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSyncing(true);
        const res = await fetch('/api/crm/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const result = await res.json();
          if (result.lastUpdated) {
            lastSyncedTimestampRef.current = result.lastUpdated;
          }
          setIsServerConnected(true);
        }
      } catch (err) {
        console.warn('Falha na persistência central:', err);
        setIsServerConnected(false);
      } finally {
        setIsSyncing(false);
      }
    }, 400);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [empresa, produtos, leads, clientes, deals, propostas, visitas, atividades, users]);

  // Auth methods
  const login = useCallback((userStr: string, passStr: string): boolean => {
    const u = userStr.trim().toLowerCase();
    const found = users.find(x => x.user.toLowerCase() === u && (x.pass === passStr || x.senha === passStr));
    if (found) {
      if (found.ativo === false) {
        addToast('Este usuário está inativo/bloqueado. Entre em contato com o administrador.', 'error');
        return false;
      }
      setCurrentUser(found);
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(found));
        localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      } catch {}
      addToast(`Bem-vindo, ${found.nome || found.user}!`, 'success');

      // Auto-pull from Supabase if configured
      const cfg = getSupabaseConfig();
      if (cfg.enabled && cfg.url && cfg.anonKey) {
        pullAllDataFromSupabase().then(res => {
          if (res.ok && res.data) {
            if (res.data.empresa) setEmpresa(res.data.empresa);
            if (res.data.produtos?.length) setProdutos(res.data.produtos);
            if (res.data.leads) setLeads(res.data.leads);
            if (res.data.clientes) setClientes(res.data.clientes);
            if (res.data.deals) setDeals(res.data.deals);
            if (res.data.propostas) setPropostas(res.data.propostas);
            if (res.data.visitas) setVisitas(res.data.visitas);
            if (res.data.atividades) setAtividades(res.data.atividades);
            addToast('Dados sincronizados com o Supabase!', 'success');
          }
        });
      }
      return true;
    }
    addToast('Usuário ou senha inválidos.', 'error');
    return false;
  }, [users, addToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    addToast('Sessão encerrada.', 'info');
  }, [addToast]);

  const saveUser = useCallback((userObj: Partial<UserAccount> & { user: string }) => {
    setUsers(prev => {
      const password = userObj.pass || userObj.senha || '1234';
      if (userObj.id) {
        return prev.map(u => {
          if (u.id === userObj.id) {
            return {
              ...u,
              ...userObj,
              pass: password,
              senha: password,
              permissoes: userObj.permissoes ?? u.permissoes
            } as UserAccount;
          }
          return u;
        });
      }
      const newUser: UserAccount = {
        id: 'u_' + Date.now().toString(36),
        nome: userObj.nome || userObj.user,
        user: userObj.user.toLowerCase().trim(),
        pass: password,
        senha: password,
        email: userObj.email || '',
        cargo: userObj.cargo || '',
        telefone: userObj.telefone || '',
        role: userObj.role || 'vendedor',
        ativo: userObj.ativo !== false,
        permissoes: userObj.permissoes,
        criadoEm: new Date().toISOString()
      };
      return [...prev, newUser];
    });
    addToast('Usuário salvo com sucesso!', 'success');
  }, [addToast]);

  const addUsuario = useCallback((user: Omit<UserAccount, 'id'>) => {
    saveUser(user);
  }, [saveUser]);

  const updateUsuario = useCallback((id: string, user: Partial<UserAccount>) => {
    saveUser({ id, ...user, user: user.user || '' });
  }, [saveUser]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addToast('Usuário removido.', 'info');
  }, [addToast]);

  const deleteUsuario = deleteUser;

  const toggleUserStatus = useCallback((id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.ativo === false;
        addToast(`Usuário "${u.nome || u.user}" ${newStatus ? 'ativado' : 'desativado'}.`, 'info');
        return { ...u, ativo: newStatus };
      }
      return u;
    }));
  }, [addToast]);

  const updateMyPassword = useCallback((oldP: string, newP: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.pass !== oldP) {
      addToast('Senha atual incorreta.', 'error');
      return false;
    }
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, pass: newP } : u));
    setCurrentUser(prev => prev ? { ...prev, pass: newP } : null);
    addToast('Senha alterada com sucesso!', 'success');
    return true;
  }, [currentUser, addToast]);

  // Empresa
  const updateEmpresa = useCallback((data: EmpresaConfig) => {
    setEmpresa(data);
    addToast('Dados da empresa atualizados!', 'success');
  }, [addToast]);

  // Produtos
  const addProduto = useCallback((p: Omit<Produto, 'id'>) => {
    const id = 'p_' + Date.now().toString(36);
    setProdutos(prev => [...prev, { id, ...p }]);
    addToast('Sistema adicionado ao catálogo!', 'success');
  }, [addToast]);

  const updateProduto = useCallback((id: string, p: Partial<Produto>) => {
    setProdutos(prev => prev.map(prod => prod.id === id ? { ...prod, ...p } : prod));
    addToast('Sistema atualizado!', 'success');
  }, [addToast]);

  const deleteProduto = useCallback((id: string) => {
    setProdutos(prev => prev.filter(prod => prod.id !== id));
    addToast('Sistema removido.', 'info');
  }, [addToast]);

  // Leads
  const addLead = useCallback((l: Omit<Lead, 'id' | 'criadoEm' | 'historico'>) => {
    const id = 'lead_' + Date.now().toString(36);
    const criadoEm = new Date().toISOString();
    const newLead: Lead = {
      id,
      criadoEm,
      historico: [{ data: criadoEm, texto: 'Lead criado no sistema' }],
      ...l
    };
    setLeads(prev => [newLead, ...prev]);

    // Also auto-add to Deals (Pipeline)
    const newDeal: Deal = {
      id: 'deal_' + id,
      leadId: id,
      titulo: l.empresa,
      contato: l.nome,
      valor: l.valorEstimado || 0,
      stage: l.status || 'lead',
      tipo: l.tipo,
      criadoEm
    };
    setDeals(prev => [newDeal, ...prev]);

    addToast('Lead cadastrado e adicionado ao funil!', 'success');
  }, [addToast]);

  const updateLead = useCallback((id: string, l: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id !== id) return lead;
      const updated = { ...lead, ...l };
      if (l.status && l.status !== lead.status) {
        updated.historico = [
          { data: new Date().toISOString(), texto: `Status alterado para ${l.status.toUpperCase()}` },
          ...(updated.historico || [])
        ];
      }
      return updated;
    }));

    // Keep deal in sync
    setDeals(prev => prev.map(d => {
      if (d.leadId !== id) return d;
      return {
        ...d,
        titulo: l.empresa || d.titulo,
        contato: l.nome || d.contato,
        valor: l.valorEstimado !== undefined ? l.valorEstimado : d.valor,
        stage: l.status || d.stage,
        tipo: l.tipo || d.tipo
      };
    }));

    addToast('Lead atualizado!', 'success');
  }, [addToast]);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setDeals(prev => prev.filter(d => d.leadId !== id));
    addToast('Lead removido.', 'info');
  }, [addToast]);

  const convertLeadToCliente = useCallback((leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Search proposals of this lead for systems and modules
    const leadProps = propostas.filter(p => p.leadId === leadId);
    const sistemas: string[] = [];
    const produtosIds: string[] = [];
    const modulos: string[] = [];

    leadProps.forEach(p => {
      (p.itens || []).forEach(i => {
        if (i.nome && !sistemas.includes(i.nome)) sistemas.push(i.nome);
        if (i.produtoId && !produtosIds.includes(i.produtoId)) produtosIds.push(i.produtoId);
        (i.modulos || []).forEach(m => {
          if (!modulos.includes(m.nome)) modulos.push(m.nome);
        });
      });
    });

    const newCliente: Cliente = {
      id: 'cli_' + Date.now().toString(36),
      leadId: lead.id,
      nome: lead.nome,
      empresa: lead.empresa,
      tipo: lead.tipo,
      cnpj: lead.cnpj,
      filiais: lead.filiais,
      telefone: lead.telefone,
      email: lead.email,
      cidade: lead.cidade,
      bombas: lead.bombas,
      tamanhoLoja: lead.tamanhoLoja,
      status: 'ativo',
      sistemas,
      produtosIds,
      modulos,
      valorContrato: lead.valorEstimado,
      valorImplantacao: lead.valorImplantacao,
      valorMensalidade: lead.valorMensalidade,
      dataFechamento: new Date().toISOString(),
      observacoes: lead.observacoes
    };

    setClientes(prev => [newCliente, ...prev]);

    // Mark lead as 'fechado'
    updateLead(leadId, { status: 'fechado' });
    addToast(`"${lead.empresa}" foi convertido em cliente com sucesso!`, 'success');
  }, [leads, propostas, updateLead, addToast]);

  // Clientes
  const addCliente = useCallback((c: Omit<Cliente, 'id' | 'dataFechamento'>) => {
    const id = 'cli_' + Date.now().toString(36);
    const newCli: Cliente = {
      id,
      dataFechamento: new Date().toISOString(),
      ...c
    };
    setClientes(prev => [newCli, ...prev]);
    addToast('Cliente cadastrado com sucesso!', 'success');
  }, [addToast]);

  const updateCliente = useCallback((id: string, c: Partial<Cliente>) => {
    setClientes(prev => prev.map(cli => cli.id === id ? { ...cli, ...c } : cli));
    addToast('Cliente atualizado!', 'success');
  }, [addToast]);

  const deleteCliente = useCallback((id: string) => {
    setClientes(prev => prev.filter(cli => cli.id !== id));
    addToast('Cliente removido.', 'info');
  }, [addToast]);

  // Deals
  const updateDealStage = useCallback((dealId: string, newStage: LeadStage) => {
    let targetLeadId: string | null = null;
    let targetEmpresa: string = '';

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        targetLeadId = d.leadId;
        targetEmpresa = d.titulo;
        return { ...d, stage: newStage };
      }
      return d;
    }));

    if (targetLeadId) {
      setLeads(prev => prev.map(l => {
        if (l.id === targetLeadId) {
          return {
            ...l,
            status: newStage,
            historico: [
              { data: new Date().toISOString(), texto: `Estágio alterado para ${newStage.toUpperCase()} no funil` },
              ...(l.historico || [])
            ]
          };
        }
        return l;
      }));

      // Create automatic follow-up activity when advanced
      if (['qualificado', 'proposta', 'negociacao'].includes(newStage)) {
        const in2Days = new Date();
        in2Days.setDate(in2Days.getDate() + 2);
        setAtividades(prev => [
          {
            id: 'ativ_' + Date.now().toString(36),
            tipo: 'tarefa',
            titulo: `Follow-up funil (${newStage}) — ${targetEmpresa}`,
            descricao: `Contato automático gerado pelo avanço para ${newStage}.`,
            relacionado: targetEmpresa,
            leadId: targetLeadId,
            data: in2Days.toISOString(),
            concluida: false
          },
          ...prev
        ]);
      }
    }
    addToast(`Movido para ${newStage.toUpperCase()}`, 'info');
  }, [addToast]);

  // Propostas
  const addProposta = useCallback((p: Omit<Proposta, 'id' | 'criadoEm'>) => {
    const id = 'prop_' + Date.now().toString(36);
    const dataHora = p.dataCriacao || (p as any).criadoEm || new Date().toISOString();
    const nomePosto = p.clienteEmpresa || p.empresa || 'Cliente';
    const nomeContato = p.clienteNome || p.contato || '';

    const newProp: Proposta = {
      id,
      criadoEm: dataHora,
      dataCriacao: dataHora,
      ...p,
      empresa: nomePosto,
      clienteEmpresa: nomePosto,
      contato: nomeContato,
      clienteNome: nomeContato,
      cnpj: p.clienteCnpj || p.cnpj || '',
      clienteCnpj: p.clienteCnpj || p.cnpj || '',
      telefone: p.clienteTelefone || p.telefone || '',
      clienteTelefone: p.clienteTelefone || p.telefone || '',
      email: p.clienteEmail || p.email || '',
      clienteEmail: p.clienteEmail || p.email || '',
      cidade: p.clienteCidade || p.cidade || '',
      clienteCidade: p.clienteCidade || p.cidade || '',
      validadeDias: p.validadeDias || 15
    };

    setPropostas(prev => {
      const filtered = prev.filter(x => x.id !== id && (x.numero ? x.numero !== newProp.numero : true));
      const updated = [newProp, ...filtered];
      try {
        localStorage.setItem('crm_propostas_vault_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Immediate server save to guarantee disk persistence
    fetch('/api/crm/proposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposta: newProp })
    }).catch(err => console.warn('Erro ao salvar proposta no servidor:', err));

    // If linked to lead, update lead financial amounts and status
    if (p.leadId) {
      const subtotal = (p.itens || []).reduce((s, i) => s + ((i.qtd || i.quantidade || 1) * (i.preco || i.precoUnitario || 0)), 0) * (p.unidadesRede || 1);
      const totalLic = p.valorTotalLicenca ?? (subtotal * (1 - (p.desconto || 0) / 100));
      const totImpl = p.valorTotalImplantacao ?? ((p.itens || []).reduce((s, i) => s + ((i.qtd || i.quantidade || 1) * (i.implantacao || 0)), 0) * (p.unidadesRede || 1));
      const totMens = p.valorTotalMensalidade ?? ((p.itens || []).reduce((s, i) => s + ((i.qtd || i.quantidade || 1) * (i.mensalidade || 0)), 0) * (p.unidadesRede || 1));

      updateLead(p.leadId, {
        status: 'proposta',
        valorEstimado: totalLic,
        valorImplantacao: totImpl,
        valorMensalidade: totMens
      });
    }

    // Schedule 3-day follow-up
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    setAtividades(prev => [
      {
        id: 'ativ_' + Date.now().toString(36),
        tipo: 'tarefa',
        titulo: `Follow-up da proposta ${p.numero}`,
        descricao: `Retornar contato comercial sobre a proposta de ${nomePosto}.`,
        relacionado: `${p.numero} — ${nomePosto}`,
        leadId: p.leadId || null,
        clienteId: p.clienteId || null,
        propostaId: id,
        data: in3Days.toISOString(),
        concluida: false
      },
      ...prev
    ]);

    addToast(`Proposta ${p.numero} gerada e salva com sucesso!`, 'success');
  }, [updateLead, addToast]);

  const updateProposta = useCallback((id: string, p: Partial<Proposta>) => {
    let savedProp: Proposta | null = null;
    setPropostas(prev => {
      const list = prev.map(item => {
        if (item.id !== id && (item.numero ? item.numero !== (p as any).numero : true)) return item;
        const nomePosto = p.clienteEmpresa || p.empresa || item.clienteEmpresa || item.empresa;
        const nomeContato = p.clienteNome || p.contato || item.clienteNome || item.contato;
        const updated = {
          ...item,
          ...p,
          empresa: nomePosto,
          clienteEmpresa: nomePosto,
          contato: nomeContato,
          clienteNome: nomeContato,
          cnpj: p.clienteCnpj || p.cnpj || item.clienteCnpj || item.cnpj,
          clienteCnpj: p.clienteCnpj || p.cnpj || item.clienteCnpj || item.cnpj,
          telefone: p.clienteTelefone || p.telefone || item.clienteTelefone || item.telefone,
          clienteTelefone: p.clienteTelefone || p.telefone || item.clienteTelefone || item.telefone,
          email: p.clienteEmail || p.email || item.clienteEmail || item.email,
          clienteEmail: p.clienteEmail || p.email || item.clienteEmail || item.email,
          cidade: p.clienteCidade || p.cidade || item.clienteCidade || item.cidade,
          clienteCidade: p.clienteCidade || p.cidade || item.clienteCidade || item.cidade,
        };
        savedProp = updated;
        return updated;
      });
      try {
        localStorage.setItem('crm_propostas_vault_v1', JSON.stringify(list));
      } catch {}
      return list;
    });

    if (savedProp) {
      fetch('/api/crm/proposta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposta: savedProp })
      }).catch(err => console.warn('Erro ao atualizar proposta no servidor:', err));
    }

    addToast('Proposta atualizada e gravada com sucesso!', 'success');
  }, [addToast]);

  const deleteProposta = useCallback((id: string) => {
    setPropostas(prev => {
      const list = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('crm_propostas_vault_v1', JSON.stringify(list));
      } catch {}
      return list;
    });

    fetch(`/api/crm/proposta/${id}`, { method: 'DELETE' })
      .catch(err => console.warn('Erro ao excluir proposta no servidor:', err));

    addToast('Proposta removida.', 'info');
  }, [addToast]);

  // Visitas
  const addVisita = useCallback((v: Omit<Visita, 'id' | 'criadoEm'>, autoCreateLead = true) => {
    const id = 'vis_' + Date.now().toString(36);
    const criadoEm = new Date().toISOString();
    let assignedLeadId = v.leadId;

    if (autoCreateLead && !v.leadId && !v.clienteId) {
      // Find existing lead by company name
      const existing = leads.find(l => l.empresa.toLowerCase() === v.empresa.toLowerCase());
      if (existing) {
        assignedLeadId = existing.id;
        updateLead(existing.id, {
          nome: v.contato,
          telefone: v.telefone || existing.telefone,
          email: v.email || existing.email,
          cidade: v.cidade || existing.cidade,
          endereco: v.endereco || existing.endereco
        });
      } else {
        const newLeadId = 'lead_' + Date.now().toString(36);
        assignedLeadId = newLeadId;
        const newLead: Lead = {
          id: newLeadId,
          nome: v.contato,
          empresa: v.empresa,
          tipo: v.tipo,
          cnpj: v.cnpj || '',
          telefone: v.telefone || '',
          email: v.email || '',
          cidade: v.cidade,
          endereco: v.endereco || '',
          lat: v.lat,
          lng: v.lng,
          bombas: v.bombas,
          tamanhoLoja: v.tamanhoLoja,
          origem: 'Visita presencial / prospecção',
          status: v.interesse === 'alto' ? 'qualificado' : 'lead',
          valorEstimado: 0,
          valorImplantacao: 0,
          valorMensalidade: 0,
          observacoes: v.resultado || v.observacoes,
          historico: [{ data: criadoEm, texto: `Lead gerado automaticamente de visita de prospecção (${v.tipoVisita})` }],
          criadoEm
        };
        setLeads(prev => [newLead, ...prev]);
        setDeals(prev => [{
          id: 'deal_' + newLeadId,
          leadId: newLeadId,
          titulo: v.empresa,
          contato: v.contato,
          valor: 0,
          stage: newLead.status,
          tipo: v.tipo,
          criadoEm
        }, ...prev]);
      }
    }

    const newVis: Visita = {
      id,
      criadoEm,
      ...v,
      leadId: assignedLeadId
    };

    setVisitas(prev => [newVis, ...prev]);

    // Schedule 3-day follow-up
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    setAtividades(prev => [
      {
        id: 'ativ_' + Date.now().toString(36),
        tipo: 'tarefa',
        titulo: `Follow-up visita — ${v.empresa}`,
        descricao: v.resultado || `Retorno da visita realizada em ${v.empresa}.`,
        relacionado: v.empresa,
        leadId: assignedLeadId,
        data: in3Days.toISOString(),
        concluida: false
      },
      ...prev
    ]);

    addToast('Posto visitado cadastrado com sucesso!', 'success');
  }, [leads, updateLead, addToast]);

  const updateVisita = useCallback((id: string, v: Partial<Visita>) => {
    setVisitas(prev => prev.map(item => item.id === id ? { ...item, ...v } : item));
    addToast('Registro de visita atualizado!', 'success');
  }, [addToast]);

  const deleteVisita = useCallback((id: string) => {
    setVisitas(prev => prev.filter(item => item.id !== id));
    addToast('Visita removida.', 'info');
  }, [addToast]);

  // Atividades
  const addAtividade = useCallback((a: Omit<Atividade, 'id'>) => {
    const id = 'ativ_' + Date.now().toString(36);
    const newAtiv: Atividade = { id, ...a };
    setAtividades(prev => [newAtiv, ...prev]);

    if (a.leadId) {
      setLeads(prev => prev.map(l => {
        if (l.id !== a.leadId) return l;
        return {
          ...l,
          historico: [
            { data: new Date().toISOString(), texto: `Atividade: ${a.titulo}` },
            ...(l.historico || [])
          ]
        };
      }));
    }

    addToast('Atividade agendada com sucesso!', 'success');
  }, [addToast]);

  const updateAtividade = useCallback((id: string, a: Partial<Atividade>) => {
    setAtividades(prev => prev.map(item => item.id === id ? { ...item, ...a } : item));
    addToast('Atividade atualizada!', 'success');
  }, [addToast]);

  const deleteAtividade = useCallback((id: string) => {
    setAtividades(prev => prev.filter(item => item.id !== id));
    addToast('Atividade removida.', 'info');
  }, [addToast]);

  const toggleConcluirAtividade = useCallback((id: string) => {
    setAtividades(prev => prev.map(item => {
      if (item.id === id) {
        const next = !item.concluida;
        if (next && item.leadId) {
          setLeads(lprev => lprev.map(l => {
            if (l.id !== item.leadId) return l;
            return {
              ...l,
              historico: [
                { data: new Date().toISOString(), texto: `Atividade concluída: ${item.titulo}` },
                ...(l.historico || [])
              ]
            };
          }));
        }
        return { ...item, concluida: next };
      }
      return item;
    }));
    addToast('Status da atividade atualizado!', 'success');
  }, [addToast]);

  // Supabase sync
  const updateSupabaseConfig = useCallback((cfg: SupabaseConfig) => {
    saveSupabaseConfig(cfg);
    setSupabaseConfigState(cfg);
    addToast('Configuração do Supabase salva!', 'success');
  }, [addToast]);

  const testSupabase = useCallback(async (url?: string, key?: string) => {
    return testSupabaseConnection(url, key);
  }, []);

  const pushToSupabase = useCallback(async () => {
    const res = await pushAllDataToSupabase({
      leads,
      clientes,
      deals,
      produtos,
      propostas,
      visitas,
      atividades,
      empresa
    });
    if (res.ok) {
      addToast(res.message, 'success');
      setSupabaseConfigState(getSupabaseConfig());
    } else {
      addToast(res.message, 'error');
    }
    return res;
  }, [leads, clientes, deals, produtos, propostas, visitas, atividades, empresa, addToast]);

  const pullFromSupabase = useCallback(async () => {
    const res = await pullAllDataFromSupabase();
    if (res.ok && res.data) {
      if (res.data.empresa) setEmpresa(res.data.empresa);
      if (res.data.produtos?.length) setProdutos(res.data.produtos);
      if (res.data.leads) setLeads(res.data.leads);
      if (res.data.clientes) setClientes(res.data.clientes);
      if (res.data.deals) setDeals(res.data.deals);
      if (res.data.propostas) setPropostas(res.data.propostas);
      if (res.data.visitas) setVisitas(res.data.visitas);
      if (res.data.atividades) setAtividades(res.data.atividades);
      addToast(res.message, 'success');
      setSupabaseConfigState(getSupabaseConfig());
    } else {
      addToast(res.message, 'error');
    }
    return { ok: res.ok, message: res.message };
  }, [addToast]);

  const restoreBackup = useCallback(async (data: any): Promise<{ ok: boolean; message: string }> => {
    try {
      if (!data || typeof data !== 'object') {
        return { ok: false, message: 'Arquivo ou formato de backup inválido.' };
      }

      isRemoteUpdatingRef.current = true;

      if (data.empresa) setEmpresa(data.empresa);
      if (Array.isArray(data.produtos)) setProdutos(data.produtos);
      if (Array.isArray(data.leads)) setLeads(data.leads);
      if (Array.isArray(data.clientes)) setClientes(data.clientes);
      if (Array.isArray(data.deals)) setDeals(data.deals);
      if (Array.isArray(data.propostas)) setPropostas(data.propostas);
      if (Array.isArray(data.visitas)) setVisitas(data.visitas);
      if (Array.isArray(data.atividades)) setAtividades(data.atividades);
      if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);

      const payload = {
        empresa: data.empresa || empresa,
        produtos: Array.isArray(data.produtos) ? data.produtos : produtos,
        leads: Array.isArray(data.leads) ? data.leads : leads,
        clientes: Array.isArray(data.clientes) ? data.clientes : clientes,
        deals: Array.isArray(data.deals) ? data.deals : deals,
        propostas: Array.isArray(data.propostas) ? data.propostas : propostas,
        visitas: Array.isArray(data.visitas) ? data.visitas : visitas,
        atividades: Array.isArray(data.atividades) ? data.atividades : atividades,
        users: Array.isArray(data.users) ? data.users : users
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        if (Array.isArray(data.users)) {
          localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
        }
      } catch (e) {
        console.warn('Falha ao salvar no cache local:', e);
      }

      try {
        const res = await fetch('/api/crm/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson.lastUpdated) {
            lastSyncedTimestampRef.current = resJson.lastUpdated;
          }
          setIsServerConnected(true);
        }
      } catch (e) {
        console.warn('Falha ao enviar backup para o servidor central:', e);
      }

      addToast('Backup restaurado e sincronizado com sucesso!', 'success');
      return { ok: true, message: 'Backup restaurado com sucesso!' };
    } catch (err: any) {
      const msg = err?.message || 'Erro ao processar dados de backup.';
      addToast(msg, 'error');
      return { ok: false, message: msg };
    } finally {
      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 300);
    }
  }, [empresa, produtos, leads, clientes, deals, propostas, visitas, atividades, users, addToast]);

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        users,
        usuarios: users,
        login,
        logout,
        saveUser,
        addUsuario,
        updateUsuario,
        deleteUser,
        deleteUsuario,
        toggleUserStatus,
        updateMyPassword,
        activePage,
        setActivePage,
        searchQuery,
        setSearchQuery,
        empresa,
        updateEmpresa,
        produtos,
        addProduto,
        updateProduto,
        deleteProduto,
        leads,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToCliente,
        clientes,
        addCliente,
        updateCliente,
        deleteCliente,
        deals,
        updateDealStage,
        propostas,
        addProposta,
        updateProposta,
        deleteProposta,
        visitas,
        addVisita,
        updateVisita,
        deleteVisita,
        atividades,
        addAtividade,
        updateAtividade,
        deleteAtividade,
        toggleConcluirAtividade,
        supabaseConfig,
        updateSupabaseConfig,
        testSupabase,
        pushToSupabase,
        pullFromSupabase,
        isServerConnected,
        isSyncing,
        refreshFromServer,
        restoreBackup,
        toasts,
        addToast,
        removeToast,
        theme,
        setTheme
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
