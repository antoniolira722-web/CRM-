import React, { useState, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Image,
  Upload,
  Trash2,
  Check,
  Sparkles,
  RefreshCw,
  ExternalLink,
  FileText,
  Layout,
  AlertCircle
} from 'lucide-react';

export const LogoManager: React.FC = () => {
  const { empresa, updateEmpresa, addToast } = useCrm();

  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and convert image to base64 DataURL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG).', 'error');
      return;
    }

    // If SVG, read as text/dataURL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) {
          applyNewLogo(result, 'Logomarca SVG atualizada com sucesso!');
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        try {
          // Max dimension 800px to maintain supreme quality without bloating storage
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export as PNG for transparency support
            const dataUrl = canvas.toDataURL('image/png', 0.92);
            applyNewLogo(dataUrl, 'Nova logomarca carregada e salva com sucesso!');
          }
        } catch (err) {
          console.error(err);
          addToast('Não foi possível processar a imagem.', 'error');
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        addToast('Erro ao carregar os dados da imagem.', 'error');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyNewLogo = (logoData: string, message: string) => {
    updateEmpresa({
      ...empresa,
      logo: logoData
    });
    addToast(message, 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const trimmed = urlInput.trim();
    applyNewLogo(trimmed, 'Logomarca definida por URL com sucesso!');
    setUrlInput('');
  };

  const handleRemoveLogo = () => {
    if (confirm('Deseja realmente remover a logomarca da empresa?')) {
      updateEmpresa({
        ...empresa,
        logo: ''
      });
      addToast('Logomarca removida. O sistema usará o nome textual da empresa.', 'info');
    }
  };

  // Preset Logos
  const handlePresetFera = () => {
    // Generate an SVG data URI of the FERA LINX/TOTVS branding
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" width="360" height="80">
      <defs>
        <linearGradient id="gradFera" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#047857" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="80" height="80" rx="16" fill="url(#gradFera)" />
      <path d="M22 24 L58 24 L58 32 L34 32 L34 40 L52 40 L52 48 L34 48 L34 60 L22 60 Z" fill="#ffffff" />
      <text x="96" y="38" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="900" fill="#047857" letter-spacing="-0.5">FERA SISTEMA</text>
      <text x="96" y="58" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#475569" letter-spacing="1">LINX • TOTVS • POSTOS</text>
    </svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    applyNewLogo(dataUri, 'Logomarca oficial FERA SISTEMA aplicada!');
  };

  const handlePresetTotvsLinx = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 80" width="380" height="80">
      <rect x="0" y="0" width="80" height="80" rx="16" fill="#0f172a" />
      <circle cx="40" cy="40" r="22" fill="none" stroke="#3ecf8e" stroke-width="6" />
      <path d="M32 40 L38 46 L50 32" fill="none" stroke="#3ecf8e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="96" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#0f172a">AUTOSYSTEM</text>
      <text x="96" y="56" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#047857" letter-spacing="1.5">LINX / TOTVS PARCEIRO HOMOLOGADO</text>
    </svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    applyNewLogo(dataUri, 'Logomarca Autosystem / Linx aplicada!');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Espaço da Logomarca da Empresa
              {empresa.logo ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Logomarca Ativa
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Sem Logomarca (Texto Padrão)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Personalize o logotipo que aparece no menu lateral, no topo do sistema e nas Propostas Comerciais impressas em PDF.
            </p>
          </div>
        </div>

        {empresa.logo && (
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover Logomarca</span>
          </button>
        )}
      </div>

      {/* Main Grid: Upload Area & Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upload & Dropzone Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#3ecf8e] bg-[#3ecf8e]/10 scale-[0.99]'
                : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-950'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-[#3ecf8e] mb-3 shadow-inner">
              <Upload className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-200">
                {isProcessing ? 'Processando imagem...' : 'Clique para selecionar ou arraste o arquivo da logomarca aqui'}
              </p>
              <p className="text-[11px] text-zinc-400">
                Formatos suportados: <strong className="text-zinc-300">PNG</strong> (fundo transparente recomendado), <strong className="text-zinc-300">SVG</strong>, <strong className="text-zinc-300">JPG</strong> ou <strong className="text-zinc-300">WEBP</strong>
              </p>
              <p className="text-[10px] text-zinc-500">
                Tamanho recomendado: proporção retangular (~300x80px) ou quadrada (~200x200px)
              </p>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                onClick={e => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Escolher Arquivo do Computador</span>
              </button>
            </div>
          </div>

          {/* Option: Paste URL */}
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="Ou cole a URL direta de uma imagem na internet (ex: https://.../logo.png)"
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#3ecf8e]"
            />
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              Carregar URL
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
              Modelos Rápidos Homologados:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePresetFera}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Usar Modelo FERA SISTEMA</span>
              </button>
              <button
                type="button"
                onClick={handlePresetTotvsLinx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Usar Modelo Autosystem / Linx</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Previews Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-zinc-200 block">
            Pré-visualização em Tempo Real
          </span>

          {/* 1. Preview on Light / Proposal Paper (A4) */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-sm text-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#047857]" />
                Como sai na Proposta Comercial (PDF A4)
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                Folha Branca
              </span>
            </div>

            <div className="h-16 flex items-center justify-start gap-3 px-2 bg-slate-50/50 rounded border border-dashed border-slate-200">
              {empresa.logo ? (
                <img
                  src={empresa.logo}
                  alt="Prévia Proposta"
                  className="max-h-12 max-w-[150px] object-contain"
                />
              ) : (
                <div className="text-xs font-black text-[#047857] tracking-tight uppercase">
                  {empresa.nomeFantasia || 'FERA SISTEMA'}
                </div>
              )}
              <div className="border-l border-slate-300 pl-3">
                <div className="text-[11px] font-bold text-slate-900 leading-tight">
                  {empresa.razaoSocial || 'FERA SISTEMA DO BRASIL'}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  CNPJ: {empresa.cnpj || '08.323.625/0001-04'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Preview in Dark Mode (Sidebar & System Theme) */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm text-zinc-100 space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Layout className="w-3 h-3 text-[#3ecf8e]" />
                Como aparece no Menu Lateral do CRM
              </span>
              <span className="text-[10px] text-[#3ecf8e] font-bold bg-[#3ecf8e]/10 px-1.5 py-0.5 rounded">
                Tema Escuro
              </span>
            </div>

            <div className="flex items-center gap-3 p-2 bg-zinc-900/80 rounded-lg border border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 flex items-center justify-center text-[#3ecf8e] shrink-0 overflow-hidden">
                {empresa.logo ? (
                  <img
                    src={empresa.logo}
                    alt="Logo Sidebar"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="font-black text-sm">F</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-zinc-100 truncate">
                  {empresa.nomeFantasia || 'FERA SISTEMA'}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {empresa.slogan || 'LINX / TOTVS'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-300/90 flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Ao carregar a imagem, ela é salva instantaneamente e sincronizada com o banco de dados central e o gerador de propostas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
