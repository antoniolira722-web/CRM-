export interface CnpjData {
  cnpj: string;
  cnpjLimpo: string;
  razaoSocial: string;
  nomeFantasia: string;
  empresa: string;
  telefone: string;
  email: string;
  endereco: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  municipio: string;
  uf: string;
  cep: string;
  contato: string;
  atividadePrincipal: string;
  tipoSugerido: 'posto' | 'conveniencia' | 'ambos';
  situacao: string;
}

/**
 * Formata string para máscara de CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 14);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Consulta os dados da empresa via CNPJ na API local (BrasilAPI / ReceitaWS)
 */
export async function fetchCnpjData(rawCnpj: string): Promise<{ ok: boolean; data?: CnpjData; error?: string }> {
  const clean = (rawCnpj || '').replace(/\D/g, '');
  if (clean.length !== 14) {
    return { ok: false, error: 'O CNPJ deve conter 14 dígitos.' };
  }

  try {
    const res = await fetch(`/api/cnpj/${clean}`);
    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return { ok: true, data: json.data };
    }
    return { ok: false, error: json.error || 'Empresa não encontrada para este CNPJ.' };
  } catch (err: any) {
    return { ok: false, error: 'Não foi possível conectar ao serviço de busca de CNPJ.' };
  }
}
