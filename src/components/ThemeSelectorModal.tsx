import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { THEME_OPTIONS, ThemeId } from '../types/crm';
import { Palette, Check, Sparkles, X, Sun, Moon, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { theme, setTheme, addToast } = useCrm();
  const [filterCategory, setFilterCategory] = useState<'todos' | 'escuro' | 'claro' | 'especial'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleSelect = (tId: ThemeId) => {
    setTheme(tId);
    const selected = THEME_OPTIONS.find(o => o.id === tId);
    addToast(`Tema alterado para "${selected?.name || tId}"!`, 'success');
  };

  const filteredThemes = THEME_OPTIONS.filter(opt => {
    if (filterCategory !== 'todos' && opt.category !== filterCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        opt.name.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q) ||
        opt.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 no-print"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 flex items-center justify-center text-[#3ecf8e]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Personalizar Cores do Layout</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3ecf8e]/15 text-[#3ecf8e] font-semibold">
                  {THEME_OPTIONS.length} Opções Disponíveis
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Escolha o tema visual que melhor se adapta à sua empresa e preferência de trabalho
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterCategory('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'todos'
                  ? 'bg-[#3ecf8e] text-black shadow-xs'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Todos ({THEME_OPTIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('escuro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterCategory === 'escuro'
                  ? 'bg-[#3ecf8e] text-black shadow-xs'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Escuros ({THEME_OPTIONS.filter(o => o.category === 'escuro').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('claro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterCategory === 'claro'
                  ? 'bg-[#3ecf8e] text-black shadow-xs'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Claros ({THEME_OPTIONS.filter(o => o.category === 'claro').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('especial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === 'especial'
                  ? 'bg-[#3ecf8e] text-black shadow-xs'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              OLED Preto Puro
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar cor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#3ecf8e]"
            />
          </div>
        </div>

        {/* Content: Theme grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredThemes.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs">
              Nenhuma opção de cor encontrada para "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredThemes.map(opt => {
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#3ecf8e] bg-zinc-800/90 shadow-md ring-2 ring-[#3ecf8e]/30'
                        : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Top Bar inside Card */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full shadow-sm shrink-0 border border-white/20"
                            style={{ backgroundColor: opt.primaryColor }}
                          />
                          <span className="text-xs font-bold text-zinc-100 group-hover:text-white line-clamp-1">
                            {opt.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {opt.isDark ? (
                            <Moon className="w-3 h-3 text-zinc-500" />
                          ) : (
                            <Sun className="w-3 h-3 text-amber-400" />
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#3ecf8e] border-[#3ecf8e] text-black'
                                : 'border-zinc-700 bg-zinc-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    {/* Visual Preview Swatches */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">Paleta:</span>
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: opt.primaryColor }}
                            title="Destaque Principal"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: opt.previewCard }}
                            title="Fundo dos Cards"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: opt.previewBg }}
                            title="Fundo do Sistema"
                          />
                        </div>
                      </div>

                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${opt.primaryColor}22`,
                          color: opt.primaryColor
                        }}
                      >
                        {opt.category === 'especial' ? 'OLED' : opt.isDark ? 'Escuro' : 'Claro'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3ecf8e] shrink-0" />
              <span>A cor selecionada é salva automaticamente no seu navegador e aplicada instantaneamente a todas as telas do sistema.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Tema ativo:{' '}
            <strong className="text-zinc-200">
              {THEME_OPTIONS.find(o => o.id === theme)?.label || theme}
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
