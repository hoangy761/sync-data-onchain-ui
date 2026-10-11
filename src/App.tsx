import { useEffect, useState } from 'react';
import { api, type ChainDto, type TokenDto } from './lib/api';
import { useChainTokenSelection } from './lib/useChainTokenSelection';
import { ChainsView } from './views/ChainsView';
import { HoldersView } from './views/HoldersView';
import { LookupView } from './views/LookupView';
import { SyncView } from './views/SyncView';
import { TokensView } from './views/TokensView';

type Page = 'lookup' | 'tokens' | 'holders' | 'chains' | 'sync';

const NAV: Array<{ id: Page; label: string }> = [
  { id: 'lookup', label: 'Home' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'holders', label: 'Holders' },
  { id: 'chains', label: 'Chains' },
  { id: 'sync', label: 'Sync' },
];

export default function App() {
  const [page, setPage] = useState<Page>('lookup');
  const [tokens, setTokens] = useState<TokenDto[]>([]);
  const [chains, setChains] = useState<ChainDto[]>([]);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const selection = useChainTokenSelection(chains, tokens);

  useEffect(() => {
    let cancelled = false;
    api
      .listTokens()
      .then((rows) => {
        if (!cancelled) setTokens(rows);
      })
      .catch((err: Error) => {
        if (!cancelled) setBootError(err.message);
      });
    api
      .listChains()
      .then((rows) => {
        if (!cancelled) setChains(rows);
      })
      .catch(() => {
        // Token rows still carry chain ids, so lookup can fall back.
      });
    api
      .health()
      .then((row) => {
        if (!cancelled) setHealthy(row.status === 'ok');
      })
      .catch(() => {
        if (!cancelled) setHealthy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="flex items-center gap-6 bg-header px-7 py-3.5 text-white">
        <button
          type="button"
          className="text-[18px] font-bold tracking-tight"
          onClick={() => setPage('lookup')}
        >
          Index<em className="not-italic text-sky-300">er</em>
        </button>
        <nav className="flex gap-4 text-[13px]">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              className={page === item.id ? 'text-white' : 'text-slate-300'}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto text-xs text-slate-400">
          API {healthy == null ? '…' : healthy ? 'ok' : 'down'}
        </div>
      </header>

      {bootError && page === 'lookup' && (
        <div className="mx-auto mt-6 max-w-[1100px] px-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-bad">
            Cannot load tokens: {bootError}
          </div>
        </div>
      )}

      {page === 'lookup' && <LookupView selection={selection} />}
      {page === 'tokens' && <TokensView selection={selection} />}
      {page === 'holders' && <HoldersView selection={selection} />}
      {page === 'chains' && <ChainsView />}
      {page === 'sync' && <SyncView selection={selection} />}
    </div>
  );
}
