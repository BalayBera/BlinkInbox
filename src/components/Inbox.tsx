import { Inbox as InboxIcon } from 'lucide-react'
import type { MessageSummary } from '../lib/types'
export default function Inbox({ messages, loading, error, onOpen, demoAction }: { messages: MessageSummary[]; loading: boolean; error: string | null; onOpen: (m: MessageSummary) => void; demoAction?: () => void }) {
  return (
    <section aria-label="Inbox" className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-display text-lg font-semibold">Inbox <span className="text-mute">({messages.length})</span></h2>
        <span className="text-xs text-mute">Auto-refreshes every 10s</span>
      </header>
      {error && <p role="alert" className="border-b border-line bg-warn/10 px-5 py-3 text-sm text-warn">{error}</p>}
      {loading ? <div className="space-y-3 p-5">{[0, 1, 2].map(i => <div key={i} className="sk h-12" />)}</div>
        : messages.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <InboxIcon className="mx-auto text-mute" size={40} strokeWidth={1.4} />
            <p className="mt-3 font-medium">Waiting for your first email</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-mute">Use the address above on any sign-up form. Messages appear here automatically.</p>
            {demoAction && <button className="btn-ghost mt-4" onClick={demoAction}>Add a demo message (DEMO ONLY)</button>}
          </div>)
        : <ul className="divide-y divide-line">{messages.map(m => (
          <li key={m.id}><button onClick={() => onOpen(m)} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-bg">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.isRead ? 'bg-transparent' : 'bg-brand'}`} aria-label={m.isRead ? 'Read' : 'Unread'} />
            <span className="min-w-0 flex-1">
              <span className="flex justify-between gap-3"><b className="truncate">{m.sender}</b><time className="shrink-0 text-xs text-mute">{new Date(m.receivedAt).toLocaleTimeString()}</time></span>
              <span className="block truncate text-sm">{m.isDemo && <span className="mr-1 text-warn">[DEMO]</span>}{m.subject}</span>
              <span className="block truncate text-sm text-mute">{m.preview}</span>
            </span></button></li>))}</ul>}
    </section>)
}
