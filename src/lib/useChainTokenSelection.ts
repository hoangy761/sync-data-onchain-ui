import { useEffect, useMemo, useState } from 'react';
import { tokenKey, type ChainDto, type TokenDto } from './api';

export interface ChainOption {
  chainId: number;
  name: string;
}

export interface ChainTokenSelection {
  chainOptions: ChainOption[];
  chainId: number | null;
  setChainId: (chainId: number) => void;
  tokensOnChain: TokenDto[];
  tokenKeyValue: string;
  setTokenKeyValue: (key: string) => void;
  selected: TokenDto | null;
  chain: ChainOption | null;
}

export function useChainTokenSelection(
  chains: ChainDto[],
  tokens: TokenDto[],
): ChainTokenSelection {
  const chainOptions = useMemo(() => mergeChainOptions(chains, tokens), [chains, tokens]);
  const [chainId, setChainIdState] = useState<number | null>(null);
  const [tokenKeyValue, setTokenKeyValue] = useState('');

  useEffect(() => {
    if (chainOptions.length === 0) return;
    if (chainId != null && chainOptions.some((chain) => chain.chainId === chainId)) return;
    setChainIdState(chainOptions[0].chainId);
  }, [chainOptions, chainId]);

  const tokensOnChain = useMemo(
    () => (chainId == null ? [] : tokens.filter((token) => token.chainId === chainId)),
    [tokens, chainId],
  );

  useEffect(() => {
    if (tokensOnChain.some((token) => tokenKey(token) === tokenKeyValue)) return;
    setTokenKeyValue(tokensOnChain[0] ? tokenKey(tokensOnChain[0]) : '');
  }, [tokensOnChain, tokenKeyValue]);

  function setChainId(next: number) {
    setChainIdState(next);
    const nextTokens = tokens.filter((token) => token.chainId === next);
    setTokenKeyValue(nextTokens[0] ? tokenKey(nextTokens[0]) : '');
  }

  const selected = tokensOnChain.find((token) => tokenKey(token) === tokenKeyValue) ?? null;
  const chain = chainOptions.find((option) => option.chainId === chainId) ?? null;

  return {
    chainOptions,
    chainId,
    setChainId,
    tokensOnChain,
    tokenKeyValue,
    setTokenKeyValue,
    selected,
    chain,
  };
}

function mergeChainOptions(chains: ChainDto[], tokens: TokenDto[]): ChainOption[] {
  const byId = new Map<number, ChainOption>();
  for (const chain of chains) {
    byId.set(chain.chainId, { chainId: chain.chainId, name: chain.name });
  }
  for (const token of tokens) {
    if (!byId.has(token.chainId)) {
      byId.set(token.chainId, { chainId: token.chainId, name: `Chain ${token.chainId}` });
    }
  }
  return [...byId.values()].sort((a, b) => a.chainId - b.chainId);
}
