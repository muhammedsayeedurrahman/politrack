import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Case } from '@/types';
import type { AICaseAnalysis } from '@/services/ai-analysis-service';

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
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: colors.text },
  // Cover
  coverPage: { padding: 40, fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  coverLogo: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 8 },
  coverSubtitle: { fontSize: 12, color: colors.muted, marginBottom: 40 },
  coverTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 16, maxWidth: 400 },
  coverMeta: { fontSize: 10, color: colors.muted, marginBottom: 6 },
  coverBadge: { backgroundColor: colors.primary, color: colors.white, padding: '4 12', borderRadius: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 20 },
  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4 },
  // Common
  body: { fontSize: 10, lineHeight: 1.6, color: colors.text },
  muted: { fontSize: 9, color: colors.muted },
  bold: { fontFamily: 'Helvetica-Bold' },
  // Risk
  riskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  riskBar: { height: 6, borderRadius: 3, marginTop: 2 },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: colors.bg, padding: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableCell: { flex: 1, fontSize: 9 },
  tableCellSmall: { width: 60, fontSize: 9 },
  // Timeline
  timelineItem: { flexDirection: 'row', marginBottom: 8 },
  timelineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 8, marginTop: 4 },
  timelineContent: { flex: 1 },
  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: colors.muted },
  // Pattern / Recommendation items
  listItem: { flexDirection: 'row', marginBottom: 6 },
  bullet: { width: 12, fontSize: 10, color: colors.primary },
  listText: { flex: 1, fontSize: 10, lineHeight: 1.5 },
});

function getRiskColor(score: number): string {
  if (score >= 70) return colors.critical;
  if (score >= 50) return colors.high;
  if (score >= 30) return colors.medium;
  return colors.low;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface CaseReportProps {
  caseData: Case;
  analysis: AICaseAnalysis;
}

export function CaseReportDocument({ caseData, analysis }: CaseReportProps) {
  const sortedActivities = [...caseData.activities].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverLogo}>PolitiTrace</Text>
        <Text style={styles.coverSubtitle}>Corruption Intelligence Platform</Text>
        <View style={{ borderTopWidth: 2, borderTopColor: colors.primary, width: 60, marginBottom: 40 }} />
        <Text style={styles.coverTitle}>{caseData.title}</Text>
        <Text style={styles.coverMeta}>Case ID: {caseData.id}</Text>
        <Text style={styles.coverMeta}>Classification: {caseData.priority.toUpperCase()} Priority</Text>
        <Text style={styles.coverMeta}>Status: {caseData.status.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.coverMeta}>Assignee: {caseData.assignee}</Text>
        <Text style={styles.coverMeta}>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        <View style={styles.coverBadge}>
          <Text>AI-Assisted Investigation Report</Text>
        </View>
      </Page>

      {/* Main Content */}
      <Page size="A4" style={styles.page}>
        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.body}>{analysis.summary}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Text style={styles.muted}>AI Confidence: {analysis.confidence}% | Generated: {formatDate(analysis.generatedAt)}</Text>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: getRiskColor(caseData.riskScore) }}>
              {caseData.riskScore}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 8 }}>/100 Overall Risk Score</Text>
          </View>
          {analysis.riskFactors.map((factor) => (
            <View key={factor.name} style={styles.riskRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.body, styles.bold]}>{factor.name}</Text>
                  <Text style={styles.body}>{factor.score}% (weight: {factor.weight}%)</Text>
                </View>
                <Text style={styles.muted}>{factor.description}</Text>
                <View style={[styles.riskBar, { width: `${factor.score}%`, backgroundColor: getRiskColor(factor.score) }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated by PolitiTrace AI Investigation Platform</Text>
          <Text>Page 1</Text>
        </View>
      </Page>

      {/* Timeline & Patterns */}
      <Page size="A4" style={styles.page}>
        {/* Detected Patterns */}
        {analysis.patterns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected Patterns</Text>
            {analysis.patterns.map((pattern, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>!</Text>
                <Text style={styles.listText}>{pattern}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          {analysis.recommendations.map((rec, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.bullet, { color: rec.priority === 'high' ? colors.critical : colors.primary }]}>
                {rec.priority === 'high' ? '!' : '-'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.listText}>{rec.text}</Text>
                <Text style={styles.muted}>Priority: {rec.priority.toUpperCase()} | Category: {rec.category}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investigation Timeline</Text>
          {sortedActivities.map((activity) => (
            <View key={activity.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.body}>{activity.description}</Text>
                <Text style={styles.muted}>
                  {activity.user} — {formatDate(activity.timestamp)} — {activity.type.replace('_', ' ')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated by PolitiTrace AI Investigation Platform</Text>
          <Text>Page 2</Text>
        </View>
      </Page>

      {/* Evidence Index */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Index</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.bold]}>Title</Text>
            <Text style={[styles.tableCellSmall, styles.bold]}>Type</Text>
            <Text style={[styles.tableCell, styles.bold]}>Source</Text>
            <Text style={[styles.tableCellSmall, styles.bold]}>Date</Text>
          </View>
          {caseData.evidence.map((ev) => (
            <View key={ev.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{ev.title}</Text>
              <Text style={styles.tableCellSmall}>{ev.type}</Text>
              <Text style={styles.tableCell}>{ev.source}</Text>
              <Text style={styles.tableCellSmall}>{formatDate(ev.timestamp)}</Text>
            </View>
          ))}
          {caseData.evidence.length === 0 && (
            <Text style={[styles.body, { marginTop: 8 }]}>No evidence documents attached to this case.</Text>
          )}
        </View>

        {/* Case Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Details</Text>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellSmall, styles.bold]}>Case ID</Text>
            <Text style={styles.tableCell}>{caseData.id}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellSmall, styles.bold]}>Created</Text>
            <Text style={styles.tableCell}>{formatDate(caseData.createdAt)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellSmall, styles.bold]}>Updated</Text>
            <Text style={styles.tableCell}>{formatDate(caseData.updatedAt)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellSmall, styles.bold]}>Tags</Text>
            <Text style={styles.tableCell}>{caseData.tags.join(', ')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellSmall, styles.bold]}>Entities</Text>
            <Text style={styles.tableCell}>{caseData.entityIds.length} linked entities</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellSmall, styles.bold]}>Alerts</Text>
            <Text style={styles.tableCell}>{caseData.alertIds.length} linked alerts</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.section, { backgroundColor: colors.bg, padding: 12, borderRadius: 4 }]}>
          <Text style={[styles.muted, { lineHeight: 1.5 }]}>
            This report was generated by PolitiTrace AI Investigation Platform. AI analysis is provided
            as investigative support and should not be used as sole evidence in legal proceedings. All
            findings require independent verification by qualified investigators. Agent reasoning and
            tool calls are logged in the immutable audit trail for transparency and accountability.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated by PolitiTrace AI Investigation Platform</Text>
          <Text>Page 3</Text>
        </View>
      </Page>
    </Document>
  );
}
