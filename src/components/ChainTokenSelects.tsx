import { InlineSelect } from "./ui";
import { tokenKey } from "../lib/api";
import type { ChainTokenSelection } from "../lib/useChainTokenSelection";
import { shorten } from "../lib/format";

export function ChainSelect({ selection }: { selection: ChainTokenSelection }) {
  const { chainOptions, chainId, setChainId } = selection;
  return (
    <InlineSelect
      label="Chain"
      value={chainId == null ? "" : String(chainId)}
      disabled={chainOptions.length === 0}
      onChange={(value) => setChainId(Number(value))}
    >
      {chainOptions.length === 0 && <option value="">No chains</option>}
      {chainOptions.map((chain) => (
        <option key={chain.chainId} value={chain.chainId}>
          {chain.name}
        </option>
      ))}
    </InlineSelect>
  );
}

export function TokenSelect({ selection }: { selection: ChainTokenSelection }) {
  const { tokensOnChain, tokenKeyValue, setTokenKeyValue } = selection;
  return (
    <InlineSelect
      label="Token"
      value={tokenKeyValue}
      disabled={tokensOnChain.length === 0}
      onChange={setTokenKeyValue}
    >
      {tokensOnChain.length === 0 && <option value="">No tokens</option>}
      {tokensOnChain.map((token) => (
        <option key={tokenKey(token)} value={tokenKey(token)}>
          {token.symbol ?? "TOKEN"} · {shorten(token.tokenAddress, 6, 4)}
        </option>
      ))}
    </InlineSelect>
  );
}
