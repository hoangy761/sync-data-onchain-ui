const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3000';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export interface TokenDto {
  chainId: number;
  tokenAddress: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  deploymentBlock: string;
  enabled: boolean;
}

export interface ChainDto {
  chainId: number;
  name: string;
  rpcUrl: string;
  enabled: boolean;
}

export interface BalanceDto {
  chainId: number;
  tokenAddress: string;
  holderAddress: string;
  balanceRaw: string;
  decimals: number;
  balanceFormatted: string;
  updatedBlock: string | null;
  balanceSource?: 'confirmed' | 'indexed' | 'snapshot';
}

export interface HistoryItem {
  blockNumber: string;
  timestamp: string;
  txHash: string;
  logIndex: number;
  deltaRaw: string;
  balanceBeforeRaw: string;
  balanceAfterRaw: string;
}

export interface HistoryDto {
  items: HistoryItem[];
  nextCursor: string | null;
  message: string | null;
}

export interface SyncStatusDto {
  chainId: number;
  tokenAddress: string;
  symbol: string | null;
  enabled: boolean;
  deploymentBlock: string;
  lastProcessedBlock: string;
  lastBlockHash: string | null;
  latestBlock: string | null;
  safeHead: string | null;
  lagBlocks: string | null;
  syncPercent: string | null;
  updatedAt: string;
}

export function tokenKey(token: Pick<TokenDto, 'chainId' | 'tokenAddress'>): string {
  return `${token.chainId}:${token.tokenAddress.toLowerCase()}`;
}

export function parseTokenKey(key: string): { chainId: number; tokenAddress: string } {
  const [chainId, tokenAddress] = key.split(':');
  return { chainId: Number(chainId), tokenAddress };
}

export const api = {
  health: () => getJson<{ status: string }>('/health'),
  listTokens: () => getJson<TokenDto[]>('/api/v1/tokens'),
  getToken: (chainId: number, tokenAddress: string) =>
    getJson<TokenDto>(`/api/v1/tokens/${chainId}/${tokenAddress}`),
  listChains: () => getJson<ChainDto[]>('/api/v1/chains'),
  getChain: (chainId: number) => getJson<ChainDto>(`/api/v1/chains/${chainId}`),
  getBalance: (chainId: number, tokenAddress: string, holder: string) =>
    getJson<BalanceDto>(
      `/api/v1/tokens/${chainId}/${tokenAddress}/holders/${holder}/balance`,
    ),
  getHistory: (
    chainId: number,
    tokenAddress: string,
    holder: string,
    limit = 20,
    cursor?: string | null,
  ) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return getJson<HistoryDto>(
      `/api/v1/tokens/${chainId}/${tokenAddress}/holders/${holder}/history?${params}`,
    );
  },
  getSyncStatus: (chainId: number, tokenAddress: string) =>
    getJson<SyncStatusDto>(`/api/v1/tokens/${chainId}/${tokenAddress}/sync-status`),
};
