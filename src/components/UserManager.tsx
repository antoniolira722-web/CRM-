import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  UserAccount,
  Role,
  UserPermissions,
  MODULOS_SISTEMA,
  DEFAULT_PERMISSIONS_BY_ROLE
} from '../types/crm';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  Check,
  X,
  Key,
  Eye,
  EyeOff,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Briefcase,
  Sliders,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface UserManagerProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const UserManager: React.FC<UserManagerProps> = ({ onClose, isModal = false }) => {
  const {
    users,
    saveUser,
    deleteUser,
    toggleUserStatus,
    currentUser,
    addToast
  } = useCrm();

  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [user, setUser] = useState('');
  const [senha, setSenha] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [role, setRole] = useState<Role>('vendedor');
  const [ativo, setAtivo] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Granular module permissions state
  const [permissoes, setPermissoes] = useState<UserPermissions>({
    ...DEFAULT_PERMISSIONS_BY_ROLE.vendedor
  });

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    // Apply default permissions for the chosen role
    const defaults = DEFAULT_PERMISSIONS_BY_ROLE[newRole] || DEFAULT_PERMISSIONS_BY_ROLE.user;
    setPermissoes({ ...defaults });
  };

  const handleTogglePermission = (moduleId: keyof UserPermissions) => {
    setPermissoes(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSelectAllPermissions = (value: boolean) => {
    setPermissoes({
      dashboard: value,
      leads: value,
      visitas: value,
      clientes: value,
      pipeline: value,
      produtos: value,
      propostas: value,
      atividades: value,
      empresa: value
    });
  };

  const handleResetForm = () => {
    setIsEditingId(null);
    setNome('');
    setUser('');
    setSenha('');
    setEmail('');
    setCargo('');
    setTelefone('');
    setRole('vendedor');
    setAtivo(true);
    setPermissoes({ ...DEFAULT_PERMISSIONS_BY_ROLE.vendedor });
    setShowPassword(false);
  };

  const handleStartEdit = (u: UserAccount) => {
    setIsEditingId(u.id);
    setNome(u.nome || '');
    setUser(u.user || '');
    setSenha(u.pass || u.senha || '');
    setEmail(u.email || '');
    setCargo(u.cargo || '');
    setTelefone(u.telefone || '');
    setRole(u.role || 'vendedor');
    setAtivo(u.ativo !== false);

    // Merge custom permissions with role defaults
    const roleDefault = DEFAULT_PERMISSIONS_BY_ROLE[u.role] || DEFAULT_PERMISSIONS_BY_ROLE.user;
    setPermissoes({
      ...roleDefault,
      ...(u.permissoes || {})
    });

    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSenha(result);
    setShowPassword(true);
    addToast('Senha gerada com sucesso!', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      addToast('Informe o nome completo do usuário.', 'error');
      return;
    }
    if (!user.trim()) {
      addToast('Informe o login/usuário.', 'error');
      return;
    }
    if (!senha.trim()) {
      addToast('Informe uma senha de acesso.', 'error');
      return;
    }

    // Check duplicate username if new user
    const cleanUser = user.trim().toLowerCase();
    const existing = users.find(u => u.user.toLowerCase() === cleanUser && u.id !== isEditingId);
    if (existing) {
      addToast(`O login "${cleanUser}" já está em uso por outro colaborador.`, 'error');
      return;
    }

    saveUser({
      id: isEditingId || undefined,
      nome: nome.trim(),
      user: cleanUser,
      pass: senha.trim(),
      senha: senha.trim(),
      email: email.trim(),
      cargo: cargo.trim(),
      telefone: telefone.trim(),
      role,
      ativo,
      permissoes
    });

    handleResetForm();
  };

  const handleDelete = (u: UserAccount) => {
    if (currentUser?.id === u.id) {
      addToast('Você não pode excluir o usuário conectado no momento.', 'error');
      return;
    }
    if (users.length <= 1) {
      addToast('O sistema precisa de pelo menos 1 usuário cadastrado.', 'error');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o acesso de "${u.nome || u.user}"?`)) {
      deleteUser(u.id);
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.nome.toLowerCase().includes(term) ||
      u.user.toLowerCase().includes(term) ||
      (u.cargo && u.cargo.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            Administrador
          </span>
        );
      case 'gerente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Shield className="w-3 h-3 text-blue-400" />
            Gerente
          </span>
        );
      case 'vendedor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Briefcase className="w-3 h-3 text-emerald-400" />
            Vendedor
          </span>
        );
      case 'operador':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sliders className="w-3 h-3 text-amber-400" />
            Operador
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            Usuário
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. Form de Cadastro / Edição com Limites de Acesso */}
      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm">
        {/* Header do Formulário */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                {isEditingId ? `Editar Usuário: ${user}` : 'Cadastrar Novo Usuário com Limite de Acesso'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Configure os dados do colaborador e determine exatamente quais módulos do sistema ele poderá acessar.
              </p>
            </div>
          </div>

          {isEditingId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 transition-colors"
            >
              Cancelar Edição
            </button>
          )}
        </div>

        {/* Linha 1: Dados Pessoais & Login */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Nome Completo <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silva"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Cargo / Função no CRM
            </label>
            <input
              type="text"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              placeholder="Ex: Consultor Comercial de Postos"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Login de Usuário <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={user}
              onChange={e => setUser(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="ex: carlos.vendas"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-300 font-semibold">
                Senha de Acesso <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[10px] text-[#3ecf8e] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gerar Senha</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono focus:outline-none focus:border-[#3ecf8e]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              E-mail de Contato
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="carlos@ferasistemas.com.br"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>
        </div>

        {/* Linha 2: Perfil Base e Status da Conta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
          <div>
            <label className="block text-zinc-300 font-bold mb-1.5">
              Perfil Base do Usuário
            </label>
            <select
              value={role}
              onChange={e => handleRoleChange(e.target.value as Role)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e] text-xs font-medium"
            >
              <option value="admin">👑 Administrador (Acesso Total irrestrito)</option>
              <option value="gerente">💼 Gerente (Painel, Clientes, Funil, Propostas, Catálogo e Equipe)</option>
              <option value="vendedor">🎯 Vendedor / Representante (Leads, Postos, Clientes, Funil, Propostas e Tarefas)</option>
              <option value="operador">🔧 Operador / Técnico (Postos visitados, Clientes e Atividades)</option>
              <option value="user">👤 Padrão (Leads, Clientes e Propostas)</option>
            </select>
            <p className="text-[10px] text-zinc-400 mt-1">
              Ao trocar o perfil, os limites de acesso abaixo são ajustados automaticamente, mas você pode marcar ou desmarcar qualquer módulo.
            </p>
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1.5">
              Situação do Acesso
            </label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status_ativo"
                  checked={ativo}
                  onChange={() => setAtivo(true)}
                  className="accent-[#3ecf8e] w-4 h-4"
                />
                <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Conta Ativa (Pode Fazer Login)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status_ativo"
                  checked={!ativo}
                  onChange={() => setAtivo(false)}
                  className="accent-rose-500 w-4 h-4"
                />
                <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Bloqueado / Inativo
                </span>
              </label>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Usuários desativados não conseguem fazer login, mas seus históricos e propostas continuam preservados.
            </p>
          </div>
        </div>

        {/* Linha 3: Limites de Acesso Detalhados (Módulos) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#3ecf8e]" />
                <span>Limites de Acesso às Telas e Módulos do Sistema</span>
              </h4>
              <p className="text-[10px] text-zinc-400">
                Selecione quais telas este usuário poderá visualizar e operar no menu lateral:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAllPermissions(true)}
                className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
              >
                Liberar Todos
              </button>
              <button
                type="button"
                onClick={() => handleSelectAllPermissions(false)}
                className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
              >
                Bloquear Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {MODULOS_SISTEMA.map(mod => {
              const isAllowed = permissoes[mod.id];
              return (
                <div
                  key={mod.id}
                  onClick={() => handleTogglePermission(mod.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isAllowed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-100 hover:bg-emerald-950/30'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 opacity-60'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                      isAllowed
                        ? 'bg-[#3ecf8e] border-[#3ecf8e] text-black'
                        : 'border-zinc-700 bg-zinc-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs block leading-tight">
                      {mod.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 block leading-tight mt-0.5">
                      {mod.descricao}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          {isEditingId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEditingId ? 'Salvar Alterações do Usuário' : 'Cadastrar Usuário com Permissões'}</span>
          </button>
        </div>
      </form>

      {/* 2. Lista de Usuários Cadastrados */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3ecf8e]" />
              <span>Usuários e Colaboradores Cadastrados ({users.length})</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Gerencie permissões, redefina senhas ou suspenda o acesso de qualquer usuário do sistema.
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, login ou cargo..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>
        </div>

        {/* Tabela / Cards de Usuários */}
        <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Nenhum usuário encontrado para a busca informada.
            </div>
          ) : (
            filteredUsers.map(u => {
              const isCurrentUser = currentUser?.id === u.id;
              const isAtivo = u.ativo !== false;

              return (
                <div
                  key={u.id}
                  className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                    isEditingId === u.id ? 'bg-[#3ecf8e]/5 border-l-2 border-[#3ecf8e]' : 'hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Avatar & Identificação */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-[#3ecf8e] shrink-0 shadow-inner">
                      {u.nome
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || u.user.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-zinc-100 text-sm">{u.nome}</strong>
                        {getRoleBadge(u.role)}
                        {isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            Você
                          </span>
                        )}
                        {isAtivo ? (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Bloqueado
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>
                          Login: <strong className="text-zinc-200 font-mono">{u.user}</strong>
                        </span>
                        {u.cargo && (
                          <span>
                            Cargo: <span className="text-zinc-300">{u.cargo}</span>
                          </span>
                        )}
                        {u.email && (
                          <span>
                            E-mail: <span className="text-zinc-300">{u.email}</span>
                          </span>
                        )}
                        {u.telefone && (
                          <span>
                            Tel: <span className="text-zinc-300">{u.telefone}</span>
                          </span>
                        )}
                      </div>

                      {/* Resumo de Permissões */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {MODULOS_SISTEMA.map(mod => {
                          const hasAccess =
                            u.role === 'admin'
                              ? true
                              : u.permissoes && typeof (u.permissoes as any)[mod.id] === 'boolean'
                              ? (u.permissoes as any)[mod.id]
                              : (DEFAULT_PERMISSIONS_BY_ROLE[u.role] || DEFAULT_PERMISSIONS_BY_ROLE.user)[mod.id];

                          if (!hasAccess) return null;

                          return (
                            <span
                              key={mod.id}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                            >
                              {mod.label.split('/')[0].trim()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isAtivo
                          ? 'bg-zinc-900 hover:bg-rose-950/40 border-zinc-800 text-zinc-300 hover:text-rose-300 hover:border-rose-800/60'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/60 text-emerald-300'
                      }`}
                      title={isAtivo ? 'Desativar / Bloquear acesso' : 'Reativar acesso'}
                    >
                      {isAtivo ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{isAtivo ? 'Bloquear' : 'Ativar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(u)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      title="Editar usuário e limites"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={isCurrentUser || users.length <= 1}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400"
                      title={isCurrentUser ? 'Não é possível excluir seu próprio usuário' : 'Excluir usuário'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
