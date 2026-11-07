import { useState } from 'react'
import { Check, Copy, RefreshCw, Shuffle } from 'lucide-react'
import { DOMAINS, type Domain, type Mailbox } from '../lib/types'
import { DEMO_MODE } from '../lib/api'
interface Props { mailbox: Mailbox | null; loading: boolean; refreshing: boolean; expired: boolean; remaining: number; locked: boolean
  onGenerate: (d: Domain) => void; onRefresh: () => void; onToast: (m: string) => void }
const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`

export default function Generator(p: Props) {
  const [domain, setDomain] = useState<Domain>('blr.isroot.in')
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!p.mailbox) return
    try { await navigator.clipboard.writeText(p.mailbox.address); setCopied(true); p.onToast('Address copied'); setTimeout(() => setCopied(false), 1800) }
    catch { p.onToast('Copy blocked by your browser. Select the address and copy it manually.') }
  }
  const status = p.expired ? 'Expired' : DEMO_MODE ? 'Demo mode: no mail server connected' : 'Active'
  return (
    <section id="generator" aria-label="Temporary email generator" className="rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-brand/5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className={`rounded-full px-3 py-1 font-medium ${p.expired ? 'bg-warn/15 text-warn' : 'bg-brand/10 text-brand'}`}>{status}</span>
        <span className="tabular-nums text-mute">{p.expired ? 'Create a new address to continue' : `Expires in ${fmt(p.remaining)}`}</span>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <output aria-live="polite" className="flex-1 truncate rounded-2xl border border-line bg-bg px-4 py-4 font-display text-xl font-semibold sm:text-2xl">
          {p.loading ? <span className="sk inline-block h-6 w-56" /> : p.mailbox?.address ?? '—'}
        </output>
        <button className="btn-primary sm:px-6" onClick={copy} disabled={!p.mailbox || p.expired}>
          {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy address'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="domain">Domain</label>
        <select id="domain" value={domain} onChange={e => setDomain(e.target.value as Domain)} className="btn-ghost">
          {DOMAINS.map(d => <option key={d} value={d}>@{d}</option>)}
        </select>
        <button className="btn-ghost" disabled={p.loading || (p.locked && !p.expired)} title={p.locked ? 'Close the open message first' : undefined} onClick={() => p.onGenerate(domain)}>
          <Shuffle size={16} />New address
        </button>
        <button className="btn-ghost" onClick={p.onRefresh} disabled={!p.mailbox || p.expired}>
          <RefreshCw size={16} className={p.refreshing ? 'animate-spin' : ''} />Refresh inbox
        </button>
      </div>
    </section>)
}
