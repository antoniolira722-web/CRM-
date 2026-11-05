import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { formatCnpj, fetchCnpjData, CnpjData } from '../lib/cnpj';

interface CnpjSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onCompanyFound: (data: CnpjData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showStatusBadge?: boolean;
}

export const CnpjSearchInput: React.FC<CnpjSearchInputProps> = ({
  value,
  onChange,
  onCompanyFound,
  label = 'CNPJ',
  placeholder = '00.000.000/0001-00',
  required = false,
  disabled = false,
  className = '',
  showStatusBadge = true
}) => {
  const [loading, setLoading] = useState(false);
  const [lastFound, setLastFound] = useState<CnpjData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastSearchedRef = useRef<string>('');

  const handleLookup = async (cnpjToSearch: string, isAuto = false) => {
    const clean = cnpjToSearch.replace(/\D/g, '');
    if (clean.length !== 14) {
      if (!isAuto) {
        setErrorMessage('Digite os 14 números do CNPJ.');
      }
      return;
    }

    if (clean === lastSearchedRef.current && lastFound) {
      return; // already searched this one
    }

    setLoading(true);
    setErrorMessage(null);
    lastSearchedRef.current = clean;

    const res = await fetchCnpjData(clean);
    setLoading(false);

    if (res.ok && res.data) {
      setLastFound(res.data);
      setErrorMessage(null);
      onCompanyFound(res.data);
    } else {
      setLastFound(null);
      setErrorMessage(res.error || 'Empresa não localizada na Receita Federal.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCnpj(raw);
    onChange(formatted);
    setErrorMessage(null);

    const clean = formatted.replace(/\D/g, '');
    // Auto-search when 14 digits are typed
    if (clean.length === 14 && clean !== lastSearchedRef.current) {
      handleLookup(clean, true);
    } else if (clean.length < 14) {
      setLastFound(null);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-zinc-400 font-semibold text-sm flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
          {label}
        </label>
        {loading && (
          <span className="text-[11px] text-[#3ecf8e] flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Buscando dados na Receita...
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || loading}
          className="w-full pl-3 pr-24 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#3ecf8e] transition-colors text-sm"
        />

        <button
          type="button"
          onClick={() => handleLookup(value, false)}
          disabled={disabled || loading || value.replace(/\D/g, '').length !== 14}
          title="Buscar dados da empresa pelo CNPJ"
          className="absolute right-1 px-2.5 py-1.5 rounded-md bg-zinc-800/80 hover:bg-[#3ecf8e] text-zinc-300 hover:text-black text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span>Buscar</span>
        </button>
      </div>

      {/* Status Feedback */}
      {showStatusBadge && lastFound && (
        <div className="flex items-center gap-1.5 text-xs text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 px-2.5 py-1.5 rounded-md mt-0.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-medium">
            {lastFound.razaoSocial || lastFound.nomeFantasia} • {lastFound.situacao}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/20 border border-amber-800/40 px-2.5 py-1.5 rounded-md mt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
