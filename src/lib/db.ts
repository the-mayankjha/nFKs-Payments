import { CheckoutSession } from '@/types/checkout';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'sessions.json');

// Helper to read DB
function readDb(): Map<string, CheckoutSession> {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return new Map();
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data || '[]');
        // Convert array of entries back to map
        return new Map(parsed.map((item: CheckoutSession) => [item.checkout_id, item]));
    } catch (error) {
        console.error('DB Read Error:', error);
        return new Map();
    }
}

// Helper to write DB
function writeDb(sessions: Map<string, CheckoutSession>) {
    try {
        const data = JSON.stringify(Array.from(sessions.values()), null, 2);
        fs.writeFileSync(DB_PATH, data);
    } catch (error) {
        console.error('DB Write Error:', error);
    }
}

export const db = {
    sessions: {
        create: async (session: CheckoutSession): Promise<CheckoutSession> => {
            const sessions = readDb();
            sessions.set(session.checkout_id, session);
            writeDb(sessions);
            return session;
        },

        findById: async (checkout_id: string): Promise<CheckoutSession | null> => {
            const sessions = readDb();
            return sessions.get(checkout_id) || null;
        },

        findByInvoiceId: async (invoice_id: string): Promise<CheckoutSession | null> => {
            const sessions = readDb();
            for (const session of sessions.values()) {
                if (session.invoice?.invoice_id === invoice_id) {
                    return session;
                }
            }
            return null;
        },

        update: async (checkout_id: string, data: Partial<CheckoutSession>): Promise<CheckoutSession | null> => {
            const sessions = readDb();
            const session = sessions.get(checkout_id);
            if (!session) return null;

            const updated = { ...session, ...data };
            sessions.set(checkout_id, updated);
            writeDb(sessions);
            return updated;
        },

        delete: async (checkout_id: string): Promise<boolean> => {
            const sessions = readDb();
            const result = sessions.delete(checkout_id);
            writeDb(sessions);
            return result;
        },

        cleanupExpired: async (): Promise<void> => {
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
