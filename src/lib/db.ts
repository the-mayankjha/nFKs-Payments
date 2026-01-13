import { CheckoutSession } from '@/types/checkout';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

const DB_PATH = path.join(process.cwd(), 'data', 'sessions.json');
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

// --- File DB Helpers ---
function readDb(): Map<string, CheckoutSession> {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return new Map();
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data || '[]');
        return new Map(parsed.map((item: CheckoutSession) => [item.checkout_id, item]));
    } catch (error) {
        console.error('File DB Read Error:', error);
        return new Map();
    }
}

function writeDb(sessions: Map<string, CheckoutSession>) {
    try {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = JSON.stringify(Array.from(sessions.values()), null, 2);
        fs.writeFileSync(DB_PATH, data);
        console.log(`File DB Saved: ${sessions.size} sessions.`);
    } catch (error) {
        console.error('File DB Write Error:', error);
        throw error;
    }
}

// --- DB Interface ---
export const db = {
    sessions: {
        create: async (session: CheckoutSession): Promise<CheckoutSession> => {
            if (USE_SUPABASE) {
                const { error } = await supabase.from('payment_sessions').insert({
                    checkout_id: session.checkout_id,
                    data: session,
                    expires_at: session.expires_at
                });
                if (error) throw new Error(`Supabase Error: ${error.message}`);
                return session;
            }

            const sessions = readDb();
            sessions.set(session.checkout_id, session);
            writeDb(sessions);
            return session;
        },

        findById: async (checkout_id: string): Promise<CheckoutSession | null> => {
            if (USE_SUPABASE) {
                const { data, error } = await supabase
                    .from('payment_sessions')
                    .select('data')
                    .eq('checkout_id', checkout_id)
                    .single();

                if (error || !data) return null;
                return data.data as CheckoutSession;
            }

            const sessions = readDb();
            return sessions.get(checkout_id) || null;
        },

        findByInvoiceId: async (invoice_id: string): Promise<CheckoutSession | null> => {
            if (USE_SUPABASE) {
                // Query JSONB column. Note: This assumes 'data' column has 'invoice' -> 'invoice_id'
                // Supabase syntax for JSONB: data->invoice->>invoice_id
                const { data, error } = await supabase
                    .from('payment_sessions')
                    .select('data')
                    .eq('data->invoice->>invoice_id', invoice_id)
                    .single();

                if (error || !data) return null;
                return data.data as CheckoutSession;
            }

            const sessions = readDb();
            for (const session of sessions.values()) {
                if (session.invoice?.invoice_id === invoice_id) {
                    return session;
                }
            }
            return null;
        },

        update: async (checkout_id: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession | null> => {
            if (USE_SUPABASE) {
                // Fetch current first to merge? Or just merge jsonb?
                // Supabase doesn't auto-merge deep JSONB easily in one update unless using specific functions.
                // Best approach: Fetch, Merge, Update.
                const { data: currentData } = await supabase
                    .from('payment_sessions')
                    .select('data')
                    .eq('checkout_id', checkout_id)
                    .single();

                if (!currentData) return null;

                const currentSession = currentData.data as CheckoutSession;
                const updatedSession = { ...currentSession, ...updates };

                const { error } = await supabase
                    .from('payment_sessions')
                    .update({
                        data: updatedSession,
                        // Update expires_at if it changed (unlikely for update, but good practice)
                        expires_at: updatedSession.expires_at
                    })
                    .eq('checkout_id', checkout_id);

                if (error) throw new Error(`Supabase Update Error: ${error.message}`);
                return updatedSession;
            }

            const sessions = readDb();
            const session = sessions.get(checkout_id);
            if (!session) return null;

            const updated = { ...session, ...updates };
            sessions.set(checkout_id, updated);
            writeDb(sessions);
            return updated;
        },

        delete: async (checkout_id: string): Promise<boolean> => {
            if (USE_SUPABASE) {
                const { error } = await supabase
                    .from('payment_sessions')
                    .delete()
                    .eq('checkout_id', checkout_id);
                return !error;
            }

            const sessions = readDb();
            const result = sessions.delete(checkout_id);
            writeDb(sessions);
            return result;
        },

        cleanupExpired: async (): Promise<void> => {
            if (USE_SUPABASE) {
                // Let Supabase handle this via cron or just delete on query
                await supabase
                    .from('payment_sessions')
                    .delete()
                    .lt('expires_at', new Date().toISOString());
                return;
            }

            const sessions = readDb();
            const now = new Date();
            let changed = false;
            for (const [id, session] of sessions.entries()) {
                if (new Date(session.expires_at) < now) {
                    sessions.delete(id);
                    changed = true;
                }
            }
            if (changed) writeDb(sessions);
        }
    }
};
