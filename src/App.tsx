import { useEffect, useState } from 'react'
import { Mail, Moon, Sun } from 'lucide-react'
import Generator from './components/Generator'
import Inbox from './components/Inbox'
import MessageView from './components/MessageView'
import { useMailbox } from './hooks/useMailbox'
import { api, DEMO_MODE, demoInject } from './lib/api'
import type { Message } from './lib/types'

export default function App() {
  const mb = useMailbox()
  const [open, setOpen] = useState<Message | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); try { localStorage.theme = dark ? 'dark' : 'light' } catch {} }, [dark])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t) }, [toast])

  const openMsg = async (id: string) => {
    if (!mb.mailbox) return
    try { setOpen(await api.message(id, mb.mailbox.id)); mb.refresh() } catch (e) { setToast(e instanceof Error ? e.message : 'Could not open message') }
  }
  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-ink"><Mail size={18} /></span>Blinkinbox</a>
        <div className="flex items-center gap-5 text-sm text-mute">
          <a className="hidden hover:text-ink sm:block" href="#top">Home</a><a className="hidden hover:text-ink sm:block" href="#features">Features</a>
          <a className="hidden hover:text-ink sm:block" href="#faq">FAQ</a><a className="hidden hover:text-ink sm:block" href="#privacy">Privacy</a>
          <button className="btn-ghost !p-2" aria-label="Toggle theme" onClick={() => setDark(d => !d)}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </nav>
      <main id="top" className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">Your inbox. Temporary. Instant.</h1>
        <p className="mt-5 max-w-xl text-lg text-mute">Create a free temporary email address in seconds. Receive emails instantly, protect your personal inbox, and leave no unnecessary digital footprint.</p>
        <div className="mt-7 flex gap-3"><a href="#generator" className="btn-primary">Generate Free Email</a><a href="#how" className="btn-ghost">How It Works</a></div>
        {DEMO_MODE && <p className="mt-8 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">Development mode: no mail server is connected, so this address cannot receive real email yet.</p>}
        <div className="mt-8"><Generator mailbox={mb.mailbox} loading={mb.loading} refreshing={mb.refreshing} expired={mb.expired} remaining={mb.remaining} locked={!!open}
          onGenerate={d => { mb.create(d); setOpen(null) }} onRefresh={() => mb.refresh()} onToast={setToast} /></div>
        {open ? <MessageView message={open} onBack={() => setOpen(null)} />
          : <Inbox messages={mb.messages} loading={mb.loading} error={mb.error} onOpen={m => openMsg(m.id)}
              demoAction={DEMO_MODE && mb.mailbox ? async () => { await demoInject(mb.mailbox!.id, mb.mailbox!.address); mb.refresh() } : undefined} />}
      </main>
      {toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg">{toast}</div>}
    </div>)
}
