import type { Domain, Mailbox, Message, MessageSummary } from './types'
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
export const DEMO_MODE = BASE === ''
const TTL = 10 * 60 * 1000
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

export function randomLocalPart(len = 10): string {
  const b = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(b, x => ALPHABET[x % ALPHABET.length]).join('')
}

// ---- Real backend (Phase C implements these endpoints) ----
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(BASE + path, { ...init, headers: { 'Content-Type': 'application/json' } })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Request failed (${r.status})`)
  return r.json() as Promise<T>
}

// ---- Demo mode: in-memory only. Nothing here is a real email. ----
const demo = new Map<string, Message[]>()
export async function demoInject(id: string, address: string) {
  const list = demo.get(id) ?? []
  list.unshift({ id: crypto.randomUUID(), sender: 'demo@blinkinbox.local', subject: 'Demo message (not a real email)', preview: 'Generated locally to preview the inbox UI.',
    receivedAt: Date.now(), isRead: false, isDemo: true, recipient: address,
    html: '<p>This is a <b>demo</b> message created in your browser. Real mail needs the mail server (Phase D).</p><img src="https://example.com/track.png"><script>alert(1)</script>' })
  demo.set(id, list)
}

export const api = {
  async createMailbox(domain: Domain): Promise<Mailbox> {
    if (!DEMO_MODE) return http('/api/mailboxes', { method: 'POST', body: JSON.stringify({ domain }) })
    const id = crypto.randomUUID(); demo.set(id, [])
    return { id, address: `${randomLocalPart()}@${domain}`, domain, expiresAt: Date.now() + TTL, status: 'active' }
  },
  async messages(id: string): Promise<MessageSummary[]> {
    if (!DEMO_MODE) return http(`/api/mailboxes/${id}/messages`)
    return (demo.get(id) ?? []).map(({ html, text, recipient, ...s }) => s)
  },
  async message(mid: string, mailboxId: string): Promise<Message> {
    if (!DEMO_MODE) return http(`/api/messages/${mid}`)
    const m = demo.get(mailboxId)?.find(x => x.id === mid); if (!m) throw new Error('Message not found')
    m.isRead = true; return m
  },
}
