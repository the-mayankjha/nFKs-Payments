import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import { CheckoutSession } from '@/types/checkout';

// Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    invoiceDetails: {
        textAlign: 'right',
    },
    label: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 4,
    },
    value: {
        fontSize: 12,
        marginBottom: 8,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        padding: 10,
    },
    col1: { width: '40%' },
    col2: { width: '30%' },
    col3: { width: '30%', textAlign: 'right' },
    totalSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 15,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '200',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        color: '#666666',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    footerText: {
        fontSize: 10,
        color: '#999999',
        marginBottom: 5,
    }
});

interface InvoiceProps {
    session: CheckoutSession;
    invoice_number: string;
    issued_at: string;
    transaction_id: string;
}

const InvoiceDocument = ({ session, invoice_number, issued_at, transaction_id }: InvoiceProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logo}>NFKS Pay</Text>
                    <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>AyScroll Subscription</Text>
                </View>
                <View style={styles.invoiceDetails}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>INVOICE</Text>
                    <Text style={styles.label}>Invoice Number</Text>
                    <Text style={styles.value}>#{invoice_number}</Text>
                    <Text style={styles.label}>Issued Date</Text>
                    <Text style={styles.value}>{new Date(issued_at).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Bill To */}
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={styles.sectionTitle}>Bill To</Text>
                        <Text style={styles.value}>{session.customer.name}</Text>
                        <Text style={{ fontSize: 10, marginBottom: 3 }}>{session.customer.email}</Text>
                        {session.customer.address && (
                            <>
                                <Text style={{ fontSize: 10 }}>{session.customer.address.line1}</Text>
                                <Text style={{ fontSize: 10 }}>
                                    {session.customer.address.city}, {session.customer.address.state} {session.customer.address.postal_code}
                                </Text>
                                <Text style={{ fontSize: 10 }}>{session.customer.address.country}</Text>
                            </>
                        )}
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.sectionTitle}>Payment Details</Text>
                        <Text style={styles.label}>Transaction ID</Text>
                        <Text style={styles.value}>{transaction_id}</Text>
                        <Text style={styles.label}>Payment Method</Text>
                        <Text style={styles.value}>
                            {session.payment?.payment_method.type === 'card'
                                ? `Card ending in ${session.payment.payment_method.last4}`
                                : 'Online Payment'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Line Items */}
            <View style={styles.section}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.label, styles.col1]}>Item Description</Text>
                    <Text style={[styles.label, styles.col2]}>Billing Period</Text>
                    <Text style={[styles.label, styles.col3]}>Amount</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={[styles.value, styles.col1]}>{session.plan_name}</Text>
                    <Text style={[styles.value, styles.col2, { fontSize: 10 }]}>
                        {new Date(session.billing_period.start).toLocaleDateString()} - {new Date(session.billing_period.end).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.value, styles.col3]}>
                        {session.currency} {session.amount.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.value}>{session.currency} {session.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax (0%)</Text>
                    <Text style={styles.value}>{session.currency} 0.00</Text>
                </View>
                <View style={[styles.totalRow, { marginTop: 10 }]}>
                    <Text style={[styles.totalLabel, { color: '#000', fontWeight: 'bold' }]}>Total</Text>
                    <Text style={styles.totalAmount}>{session.currency} {session.amount.toFixed(2)}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Thank you for your business!</Text>
                <Text style={styles.footerText}>Questions? Email support@ayscroll.com</Text>
                <Text style={[styles.footerText, { marginTop: 10 }]}>
                    NFKS Payment Gateway Services • India
                </Text>
            </View>
        </Page>
    </Document>
);

export async function generateInvoicePDF(session: CheckoutSession, invoice_number: string, transaction_id: string): Promise<NodeJS.ReadableStream> {
    const stream = await renderToStream(
        <InvoiceDocument
            session={session}
            invoice_number={invoice_number}
            issued_at={new Date().toISOString()}
            transaction_id={transaction_id}
        />
    );
    return stream;
}
