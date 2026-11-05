import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Fuel, Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, empresa } = useCrm();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const ok = login(username, password);
    if (!ok) {
      setErrorMsg('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e] mb-4 shadow-lg shadow-[#3ecf8e]/5">
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <Fuel className="w-8 h-8" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            {empresa.nomeFantasia || 'FERA SISTEMA DO BRASIL'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            {empresa.slogan || 'Sistemas para Postos e Conveniências'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Usuário
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#3ecf8e] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#3ecf8e] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-[#3ecf8e]/10 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar no Sistema</span>
          </button>

          <div className="pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => login('admin', 'admin123')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
            >
              <span>Entrar Direto como Administrador</span>
            </button>
            <p className="text-center text-[11px] text-zinc-500 mt-2">
              Usuários padrão: <strong>admin / admin123</strong> ou <strong>vendas / vendas123</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
