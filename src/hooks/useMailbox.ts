import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import type { Domain, Mailbox, MessageSummary } from '../lib/types'
const POLL = 10_000

export function useMailbox() {
  const [mailbox, setMailbox] = useState<Mailbox | null>(null)
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const busy = useRef(false)

  const refresh = useCallback(async () => {
    if (!mailbox || busy.current) return          // prevent overlapping requests
    busy.current = true; setRefreshing(true)
    try { setMessages(await api.messages(mailbox.id)); setError(null) }
    catch (e) { setError(e instanceof Error ? e.message : 'Network error. Retrying automatically.') }
    finally { busy.current = false; setRefreshing(false) }
  }, [mailbox])

  const create = useCallback(async (domain: Domain) => {
    setLoading(true)
    try { const mb = await api.createMailbox(domain); setMailbox(mb); setMessages([]); setError(null) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not create an address.') }
    finally { setLoading(false) }
  }, [])

  // Persistence across reloads arrives with the real backend (Phase C); demo mailboxes are memory-only.
  useEffect(() => { create('blr.isroot.in') }, [create])
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => {
    if (!mailbox) return
    const t = setInterval(() => { if (!document.hidden && mailbox.expiresAt > Date.now()) refresh() }, POLL)
    return () => clearInterval(t)
  }, [mailbox, refresh])

  const expired = !!mailbox && mailbox.expiresAt <= now
  return { mailbox, messages, loading, refreshing, error, expired, remaining: mailbox ? Math.max(0, mailbox.expiresAt - now) : 0, create, refresh }
}
