import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { ArrowLeft } from 'lucide-react'
import type { Message } from '../lib/types'
// Untrusted HTML: sanitize, strip remote images/forms, then render in a fully sandboxed iframe with a no-network CSP.
function safeDoc(html: string) {
  const clean = DOMPurify.sanitize(html, { FORBID_TAGS: ['img', 'style', 'form', 'iframe', 'object', 'embed', 'link', 'meta'], FORBID_ATTR: ['style', 'srcset'] })
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'"><base target="_blank"><body style="font:14px system-ui;margin:12px;color:#222">${clean}</body>`
}
export default function MessageView({ message, onBack }: { message: Message; onBack: () => void }) {
  const doc = useMemo(() => message.html ? safeDoc(message.html) : null, [message])
  return (
    <article className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <button className="btn-ghost mb-5" onClick={onBack}><ArrowLeft size={16} />Back to inbox</button>
      <h2 className="font-display text-2xl font-semibold">{message.subject}</h2>
      <dl className="mt-3 grid grid-cols-[4.5rem_1fr] gap-y-1 text-sm"><dt className="text-mute">From</dt><dd className="break-all">{message.sender}</dd>
        <dt className="text-mute">To</dt><dd className="break-all">{message.recipient}</dd><dt className="text-mute">Received</dt><dd>{new Date(message.receivedAt).toLocaleString()}</dd></dl>
      {message.isDemo && <p className="mt-4 rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn">Demo message. Not a real email.</p>}
      <p className="mt-4 text-xs text-mute">Remote images and scripts are blocked for your safety.</p>
      {doc ? <iframe title="Email content" sandbox="" srcDoc={doc} className="mt-2 h-96 w-full rounded-xl border border-line bg-white" />
        : <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{message.text}</pre>}
    </article>)
}
