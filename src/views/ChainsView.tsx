import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Kv } from '../components/ui';
import { api, type ChainDto } from '../lib/api';

export function ChainsView() {
  const [chains, setChains] = useState<ChainDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ChainDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listChains()
      .then((rows) => {
        if (cancelled) return;
        setChains(rows);
        if (rows[0]) setSelectedId(rows[0].chainId);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;
    api
      .getChain(selectedId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8">
      <div className="mb-3.5 text-[13px] text-muted">Chains</div>
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <section className="overflow-hidden rounded-lg border border-line bg-paper">
          <div className="border-b border-line px-[18px] py-3.5 text-[15px] font-semibold">
            Networks
          </div>
          <ul>
            {chains.map((chain) => (
              <li key={chain.chainId} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(chain.chainId)}
                  className={`w-full px-[18px] py-3 text-left ${
                    selectedId === chain.chainId ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="font-semibold">{chain.name}</div>
                  <div className="font-mono text-xs text-muted">chain_id {chain.chainId}</div>
                </button>
              </li>
            ))}
          </ul>
        </section>
        {detail && (
          <Card
            title="Chain"
            badge={
              <Badge tone={detail.enabled ? 'ok' : 'muted'}>
                {detail.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            }
          >
            <Kv
              rows={[
                ['Name', detail.name],
                ['Chain ID', detail.chainId],
                [
                  'RPC',
                  <span className="break-all font-mono text-[12px]">{detail.rpcUrl}</span>,
                ],
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
