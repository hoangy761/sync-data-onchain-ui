import { useState, type FormEvent } from "react";
import { ChainSelect, TokenSelect } from "../components/ChainTokenSelects";
import { Alert, Badge, Card, Kv } from "../components/ui";
import { api, type BalanceDto, type HistoryItem } from "../lib/api";
import {
  formatDelta,
  formatRaw,
  formatTimestamp,
  relativeAge,
  shorten,
} from "../lib/format";
import type { ChainTokenSelection } from "../lib/useChainTokenSelection";

export function LookupView({ selection }: { selection: ChainTokenSelection }) {
  const [holderInput, setHolderInput] = useState("");
  const [balance, setBalance] = useState<BalanceDto | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queried, setQueried] = useState<{
    chainId: number;
    tokenAddress: string;
    holder: string;
  } | null>(null);

  const { selected, chain } = selection;
  const decimals = balance?.decimals ?? selected?.decimals ?? 18;
  const symbol = selected?.symbol ?? "TOKEN";
  const chainLabel = chain ? `${chain.name} · ${chain.chainId}` : "Chain";

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const holder = holderInput.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(holder)) {
      setError("Holder must be a valid 0x address (40 hex characters).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [bal, hist] = await Promise.all([
        api.getBalance(selected.chainId, selected.tokenAddress, holder),
        api.getHistory(selected.chainId, selected.tokenAddress, holder, 20),
      ]);
      setBalance(bal);
      setHistory(hist.items);
      setHistoryMessage(hist.message);
      setNextCursor(hist.nextCursor);
      setQueried({
        chainId: selected.chainId,
        tokenAddress: selected.tokenAddress,
        holder,
      });
    } catch (err) {
      setError((err as Error).message);
      setBalance(null);
      setHistory([]);
      setHistoryMessage(null);
      setNextCursor(null);
      setQueried(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!queried || !nextCursor) return;
    setLoadingMore(true);
    try {
      const hist = await api.getHistory(
        queried.chainId,
        queried.tokenAddress,
        queried.holder,
        20,
        nextCursor,
      );
      setHistory((prev) => [...prev, ...hist.items]);
      setNextCursor(hist.nextCursor);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <div className="mx-auto mt-6 max-w-[1100px] px-6">
        <form
          onSubmit={search}
          className="grid grid-cols-1 gap-2.5 rounded-lg border border-line bg-paper p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:grid-cols-2 lg:grid-cols-[220px_240px_minmax(0,1fr)_auto]"
        >
          <ChainSelect selection={selection} />
          <TokenSelect selection={selection} />
          <input
            className="font-mono rounded-md border border-line px-3 py-2.5 text-[13px] outline-none focus:border-link"
            placeholder="0x holder address"
            value={holderInput}
            onChange={(e) => setHolderInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !selected}
            className="rounded-md bg-link px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-7">
        <div className="mb-3.5 text-[13px] text-muted">
          Home / {chainLabel} / {symbol}
          {queried ? " / Holder" : ""}
        </div>
        {error && <Alert>{error}</Alert>}

        {balance && (
          <Card title="Address" badge={<Badge>Confirmed</Badge>}>
            <Kv
              rows={[
                [
                  "Holder",
                  <span className="font-mono text-[13px] text-link">
                    {balance.holderAddress}
                  </span>,
                ],
                [
                  "Token",
                  <>
                    {symbol}{" "}
                    <span className="font-mono text-[13px] text-muted">
                      ({shorten(balance.tokenAddress, 10, 4)})
                    </span>
                  </>,
                ],
                [
                  "Balance",
                  <>
                    <strong>
                      {balance.balanceFormatted} {symbol}
                    </strong>
                  </>,
                ],
                [
                  "Updated block",
                  <span className="font-mono text-[13px]">
                    {balance.updatedBlock ?? "—"}
                  </span>,
                ],
                [
                  "Source",
                  `On-chain balance at block ${balance.updatedBlock ?? "—"} (head − confirmation depth)`,
                ],
              ]}
            />
          </Card>
        )}

        {queried && (
          <section className="overflow-hidden rounded-lg border border-line bg-paper">
            <div className="border-b border-line px-[18px] py-3.5 text-[15px] font-semibold">
              Balance history
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-medium text-muted">
                  <tr>
                    <th className="px-4 py-3">Block</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Txn</th>
                    <th className="px-4 py-3">Log</th>
                    <th className="px-4 py-3">Delta</th>
                    <th className="px-4 py-3">Before</th>
                    <th className="px-4 py-3">After</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-muted" colSpan={7}>
                        {historyMessage ?? "No transactions."}
                      </td>
                    </tr>
                  )}
                  {history.map((item) => {
                    const delta = formatDelta(item.deltaRaw, decimals);
                    return (
                      <tr
                        key={`${item.txHash}-${item.logIndex}`}
                        className="border-t border-line"
                      >
                        <td className="font-mono px-4 py-3 text-link">
                          {item.blockNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div>{relativeAge(item.timestamp)}</div>
                          <div className="text-xs text-muted">
                            {formatTimestamp(item.timestamp)}
                          </div>
                        </td>
                        <td className="font-mono px-4 py-3 text-link">
                          {shorten(item.txHash, 10, 6)}
                        </td>
                        <td className="font-mono px-4 py-3">{item.logIndex}</td>
                        <td
                          className={`font-mono px-4 py-3 ${
                            delta.zero
                              ? "text-muted"
                              : delta.positive
                                ? "text-ok"
                                : "text-bad"
                          }`}
                        >
                          {delta.text}
                        </td>
                        <td className="font-mono px-4 py-3">
                          {formatRaw(item.balanceBeforeRaw, decimals)}
                        </td>
                        <td className="font-mono px-4 py-3">
                          {formatRaw(item.balanceAfterRaw, decimals)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {nextCursor && (
              <div className="border-t border-line px-4 py-3">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="text-sm font-medium text-link disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Load older transfers"}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
