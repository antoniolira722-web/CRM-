import React from 'react';
import { useCrm } from '../context/CrmContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCrm();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        let borderCls = 'border-l-4 border-l-[#3ecf8e]';
        let icon = <Info className="w-5 h-5 text-[#3ecf8e] shrink-0" />;

        if (t.type === 'success') {
          borderCls = 'border-l-4 border-l-[#3ecf8e]';
          icon = <CheckCircle className="w-5 h-5 text-[#3ecf8e] shrink-0" />;
        } else if (t.type === 'error') {
          borderCls = 'border-l-4 border-l-rose-500';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl text-xs sm:text-sm ${borderCls} transition-all duration-200`}
          >
            {icon}
            <div className="flex-1 leading-snug">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
