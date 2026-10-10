import { useEffect, useState } from 'react';
import { ChainSelect } from '../components/ChainTokenSelects';
import { Alert, Badge, Card, Kv } from '../components/ui';
import { api, type TokenDto, tokenKey } from '../lib/api';
import { shorten } from '../lib/format';
import type { ChainTokenSelection } from '../lib/useChainTokenSelection';

export function TokensView({ selection }: { selection: ChainTokenSelection }) {
  const { tokensOnChain, tokenKeyValue, setTokenKeyValue, chain } = selection;
  const [detail, setDetail] = useState<TokenDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chainLabel = chain ? `${chain.name} · ${chain.chainId}` : 'Chain';

  useEffect(() => {
    const token = tokensOnChain.find((item) => tokenKey(item) === tokenKeyValue);
    if (!token) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    api
      .getToken(token.chainId, token.tokenAddress)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [tokenKeyValue, tokensOnChain]);

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8">
      <div className="mb-3.5 text-[13px] text-muted">Tokens / {chainLabel}</div>
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <section className="overflow-hidden rounded-lg border border-line bg-paper">
          <div className="border-b border-line px-[18px] py-3.5 text-[15px] font-semibold">
            Tracked tokens
          </div>
          <div className="border-b border-line px-[18px] py-3">
            <ChainSelect selection={selection} />
          </div>
          {tokensOnChain.length === 0 && (
            <p className="px-[18px] py-6 text-sm text-muted">No tokens on this chain.</p>
          )}
          <ul>
            {tokensOnChain.map((token) => {
              const key = tokenKey(token);
              const active = key === tokenKeyValue;
              return (
                <li key={key} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setTokenKeyValue(key)}
                    className={`w-full px-[18px] py-3 text-left ${active ? 'bg-slate-50' : ''}`}
                  >
                    <div className="font-semibold">{token.symbol ?? 'TOKEN'}</div>
                    <div className="font-mono text-xs text-muted">
                      {shorten(token.tokenAddress, 8, 6)}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {detail && (
          <Card
            title="Token metadata"
            badge={<Badge tone={detail.enabled ? 'ok' : 'muted'}>{detail.enabled ? 'Enabled' : 'Disabled'}</Badge>}
          >
            <Kv
              rows={[
                ['Name', detail.name ?? '—'],
                ['Symbol', detail.symbol ?? '—'],
                ['Chain', chainLabel],
                [
                  'Address',
                  <span className="font-mono text-[13px]">{detail.tokenAddress}</span>,
                ],
                ['Decimals', detail.decimals ?? '—'],
                [
                  'Start block',
                  <span className="font-mono text-[13px]">{detail.deploymentBlock}</span>,
                ],
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
