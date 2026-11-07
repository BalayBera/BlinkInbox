export const DOMAINS = ['blr.isroot.in', 'faah.isroot.in'] as const
export type Domain = (typeof DOMAINS)[number]
export interface Mailbox { id: string; address: string; domain: Domain; expiresAt: number; status: 'active' | 'expired' }
export interface MessageSummary { id: string; sender: string; subject: string; preview: string; receivedAt: number; isRead: boolean; isDemo?: boolean }
export interface Message extends MessageSummary { recipient: string; html?: string; text?: string }
