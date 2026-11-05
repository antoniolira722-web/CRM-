import React, { useState } from 'react';
import { Mail, X, Send, Sparkles } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTo: string;
  initialName: string;
  initialSubject: string;
  initialMessage: string;
}

export const EmailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTo,
  initialName,
  initialSubject,
  initialMessage
}) => {
  const { addToast, addAtividade } = useCrm();

  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) {
      addToast('Preencha destinatário e assunto.', 'error');
      return;
    }

    // Opens user's default email client via mailto
    const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message)}`;

    window.open(mailtoLink, '_blank');

    // Automatically record activity in CRM
    addAtividade({
      tipo: 'email',
      titulo: `E-mail enviado: ${subject}`,
      descricao: message.slice(0, 150) + (message.length > 150 ? '...' : ''),
      data: new Date().toISOString(),
      concluida: true,
      relacionado: initialName ? `${initialName} (${to})` : to
    });

    addToast('Cliente de e-mail acionado e atividade registrada no CRM!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#3ecf8e]" />
            <span>Enviar E-mail Comercial</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Para (E-mail do Destinatário) *</label>
            <input
              type="email"
              required
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="cliente@posto.com.br"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Assunto *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Apresentação Comercial — FERA SISTEMA DO BRASIL"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Mensagem</label>
            <textarea
              rows={8}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 leading-relaxed font-sans focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px]">
            💡 Ao clicar em <strong>Enviar Mensagem</strong>, seu cliente de e-mail padrão será acionado com o texto preenchido e uma atividade concluída será salva no CRM.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Mensagem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
