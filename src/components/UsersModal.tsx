import React from 'react';
import { Users, X } from 'lucide-react';
import { UserManager } from './UserManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Gerenciamento de Usuários e Limites de Acesso
              </h3>
              <p className="text-[11px] text-zinc-400">
                Cadastre e configure permissões de acesso aos módulos para cada colaborador.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <UserManager onClose={onClose} isModal={true} />
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors font-medium"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
