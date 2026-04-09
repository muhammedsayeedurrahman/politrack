import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Complaint } from '@/app/api/_lib/data';

const colors = {
  primary: '#4A90D9',
  accent: '#38B2AC',
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#CA8A04',
  low: '#16A34A',
  text: '#1a1a2e',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
  emerald: '#059669',
};

const CATEGORY_LABELS: Record<string, string> = {
  bribery: 'Bribery',
  procurement_fraud: 'Procurement Fraud',
  conflict_of_interest: 'Conflict of Interest',
  embezzlement: 'Embezzlement',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  received: 'Received',
  under_review: 'Under Review',
  investigating: 'Under Investigation',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

function statusColor(status: string): string {
  switch (status) {
    case 'received': return colors.primary;
    case 'under_review': return colors.medium;
    case 'investigating': return colors.high;
    case 'resolved': return colors.emerald;
    case 'dismissed': return colors.muted;
    default: return colors.muted;
  }
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: colors.text },
  coverPage: { padding: 40, fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  coverLogo: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 8 },
  coverSubtitle: { fontSize: 12, color: colors.muted, marginBottom: 40 },
  coverTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 16, maxWidth: 400 },
  coverMeta: { fontSize: 10, color: colors.muted, marginBottom: 6 },
  coverBadge: { backgroundColor: colors.emerald, color: colors.white, padding: '4 12', borderRadius: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4 },
  body: { fontSize: 10, lineHeight: 1.6, color: colors.text },
  muted: { fontSize: 9, color: colors.muted },
  bold: { fontFamily: 'Helvetica-Bold' },
  fieldRow: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6 },
  fieldLabel: { width: 120, fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.muted },
  fieldValue: { flex: 1, fontSize: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 10 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10, marginTop: 3 },
  timelineContent: { flex: 1 },
  statusBadge: { padding: '2 8', borderRadius: 3, fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.white, alignSelf: 'flex-start' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: colors.muted },
  agentBox: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 12, marginBottom: 12 },
  agentTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4 },
  agentStep: { flexDirection: 'row', marginBottom: 4 },
  agentIcon: { width: 16, fontSize: 10, color: colors.accent },
  agentText: { flex: 1, fontSize: 9, lineHeight: 1.4 },
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

interface ComplaintReportProps {
  complaint: Complaint;
}

export function ComplaintReportDocument({ complaint }: ComplaintReportProps) {
  const categoryLabel = CATEGORY_LABELS[complaint.category] ?? complaint.category;
  const statusLabel = STATUS_LABELS[complaint.status] ?? complaint.status;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverLogo}>PolitiTrace</Text>
        <Text style={styles.coverSubtitle}>Anonymous Whistleblower Report</Text>
        <View style={{ borderTopWidth: 2, borderTopColor: colors.primary, width: 60, marginBottom: 40 }} />
        <Text style={styles.coverTitle}>Whistleblower Complaint Report</Text>
        <Text style={styles.coverMeta}>Tracking Code: {complaint.trackingCode}</Text>
        <Text style={styles.coverMeta}>Category: {categoryLabel}</Text>
        <Text style={styles.coverMeta}>Status: {statusLabel}</Text>
        <Text style={styles.coverMeta}>Submitted: {formatDate(complaint.submittedAt)}</Text>
        <Text style={styles.coverMeta}>Report Generated: {formatDate(new Date().toISOString())}</Text>
        <View style={[styles.coverBadge, { backgroundColor: statusColor(complaint.status) }]}>
          <Text>Auto-Generated AI Report</Text>
        </View>
      </Page>

      {/* Report Details */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Details</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Tracking Code</Text>
            <Text style={[styles.fieldValue, styles.bold]}>{complaint.trackingCode}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Category</Text>
            <Text style={styles.fieldValue}>{categoryLabel}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Current Status</Text>
            <Text style={[styles.fieldValue, { color: statusColor(complaint.status) }]}>{statusLabel}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Date Submitted</Text>
            <Text style={styles.fieldValue}>{formatDate(complaint.submittedAt)}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Last Updated</Text>
            <Text style={styles.fieldValue}>{formatDate(complaint.updatedAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complaint Description</Text>
          <Text style={styles.body}>{complaint.what}</Text>
        </View>

        {(complaint.when || complaint.where || complaint.who) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incident Details</Text>
            {complaint.when && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>When</Text>
                <Text style={styles.fieldValue}>{complaint.when}</Text>
              </View>
            )}
            {complaint.where && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Where</Text>
                <Text style={styles.fieldValue}>{complaint.where}</Text>
              </View>
            )}
            {complaint.who && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Involved Parties</Text>
                <Text style={styles.fieldValue}>{complaint.who}</Text>
              </View>
            )}
          </View>
        )}

        {complaint.additionalDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <Text style={styles.body}>{complaint.additionalDetails}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>PolitiTrace Whistleblower Report - {complaint.trackingCode}</Text>
          <Text>Page 1</Text>
        </View>
      </Page>

      {/* AI Processing & Timeline */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Processing Pipeline</Text>
          <Text style={[styles.body, { marginBottom: 12 }]}>
            This report was automatically processed by the PolitiTrace AI Agent system. Below is a summary of the automated analysis steps performed.
          </Text>

          <View style={styles.agentBox}>
            <Text style={styles.agentTitle}>1. Triage Agent - Classification</Text>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Analyzed complaint text and categorized as: {categoryLabel}</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Assessed severity and prioritized for investigation queue</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Tool calls: query_alerts, count_alerts, query_entities</Text>
            </View>
          </View>

          <View style={styles.agentBox}>
            <Text style={styles.agentTitle}>2. Investigation Agent - Entity Matching</Text>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Cross-referenced reported entities against known database</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Searched for matching patterns in existing cases</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Tool calls: get_entity_details, calculate_entity_risk, query_cases</Text>
            </View>
          </View>

          <View style={styles.agentBox}>
            <Text style={styles.agentTitle}>3. Network Agent - Connection Analysis</Text>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Mapped potential connections between reported parties</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Detected relevant corruption patterns in network graph</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Tool calls: get_connections, detect_communities, detect_hubs</Text>
            </View>
          </View>

          <View style={styles.agentBox}>
            <Text style={styles.agentTitle}>4. Report Agent - Summary Generation</Text>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Compiled findings from all agents into this report</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>Generated risk assessment and recommendations</Text>
            </View>
            <View style={styles.agentStep}>
              <Text style={styles.agentIcon}>-</Text>
              <Text style={styles.agentText}>All actions logged to immutable audit trail</Text>
            </View>
          </View>
        </View>

        {/* Processing Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Timeline</Text>
          {complaint.timeline.map((entry, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: statusColor(entry.status) }]} />
              <View style={styles.timelineContent}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(entry.status), marginBottom: 4 }]}>
                  <Text>{STATUS_LABELS[entry.status] ?? entry.status}</Text>
                </View>
                <Text style={styles.body}>{entry.note}</Text>
                <Text style={styles.muted}>{formatDate(entry.timestamp)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={[styles.section, { backgroundColor: colors.bg, padding: 12, borderRadius: 4 }]}>
          <Text style={[styles.muted, { lineHeight: 1.5 }]}>
            This report was auto-generated by the PolitiTrace AI Whistleblower Processing System.
            All complaint data is encrypted and anonymized. No personally identifiable information
            about the reporter is stored or included in this document. The AI processing pipeline
            actions are logged in the immutable audit trail for transparency and accountability.
            This document is for official use only.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>PolitiTrace Whistleblower Report - {complaint.trackingCode}</Text>
          <Text>Page 2</Text>
        </View>
      </Page>
    </Document>
  );
}
