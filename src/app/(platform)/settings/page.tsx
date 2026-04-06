'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTheme } from 'next-themes';
import { useAIStore } from '@/stores/ai-store';
import { Moon, Sun, Monitor, Bell, Shield, User, Palette, Bot, Sparkles, ShieldAlert, Brain, Filter, Network, Keyboard, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const AI_FEATURES = [
  {
    icon: Bot,
    title: 'AI Copilot',
    location: 'Floating button (bottom-right) or Ctrl+J',
    description: 'A chat assistant available on every page. It understands which page you\'re on and what case, entity, or alert you\'re looking at. Ask it questions in plain language like "analyze this case" or "which alerts should I escalate?" and it responds with data-driven analysis.',
    howItWorks: 'The Copilot reads the current context (page, selected case/entity) and queries the platform\'s data to generate contextual responses. It adapts its suggested prompts based on the page you\'re viewing.',
  },
  {
    icon: ShieldAlert,
    title: 'AI Threat Briefing',
    location: 'Top of Dashboard page',
    description: 'A daily threat assessment that summarizes everything happening on the platform. Shows the current threat level, highlights the most critical findings, recommends where to focus your time, and predicts emerging risks with confidence scores.',
    howItWorks: 'The AI aggregates all active alerts (by priority and category), all entity risk scores, and open case data. It calculates a threat level, identifies the dominant alert categories, and uses pattern analysis to generate predictions about emerging risks.',
  },
  {
    icon: Brain,
    title: 'AI Investigation Intel',
    location: 'Right sidebar when viewing a case in Investigations',
    description: 'Replaces the old static intel panel with dynamic, per-case analysis. Shows risk factors computed from the actual linked entities, AI-generated narrative analysis, detected corruption patterns, and prioritized recommendations for next steps.',
    howItWorks: 'When you select a case, the AI reads all linked entities\' risk scores, examines the case tags (e.g., shell-company, procurement), counts evidence items, and generates custom risk factor breakdowns. Each recommendation is tailored to the specific case type.',
  },
  {
    icon: Filter,
    title: 'AI Alert Triage',
    location: 'Alerts page — insight cards above the table + triage column',
    description: 'Each alert gets a colored badge (Escalate / Investigate / Monitor / Auto-dismiss) with a confidence score. Hover over any badge to see the AI\'s reasoning. The insight cards above show detected alert clusters — groups of related alerts targeting the same entity or following the same pattern.',
    howItWorks: 'For each alert, the AI combines the alert\'s own risk score (60% weight) with the linked entity\'s risk score (40% weight) to compute a combined score. Based on thresholds, it assigns a triage recommendation. Clusters are detected by grouping alerts that share the same entity or category.',
  },
  {
    icon: Network,
    title: 'AI Network Pattern Detection',
    location: 'Network Graph page — right panel when no node is selected',
    description: 'Scans the entire network graph to find patterns invisible to the naked eye: hub entities with the most connections, tightly connected clusters of high-risk nodes, chains between government officials and companies, and suspicious low-confidence inferred connections.',
    howItWorks: 'The AI computes degree centrality for every node to find hubs, then identifies subgraphs where high-risk nodes are interconnected. It looks for cross-type edges (official → company) to flag potential conflicts of interest, and flags inferred connections below 40% confidence for verification.',
  },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { resetOnboarding, onboardingDismissed } = useAIStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and platform preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={18} /> Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              AT
            </div>
            <div>
              <p className="font-semibold">Aditya Thakur</p>
              <p className="text-sm text-muted-foreground">Senior Investigator</p>
              <Badge variant="outline" className="mt-1 text-xs">Admin</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <Input defaultValue="Aditya Thakur" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input defaultValue="aditya.thakur@cbi.gov.in" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Department</label>
              <Input defaultValue="Anti-Corruption Bureau" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Designation</label>
              <Input defaultValue="Deputy Superintendent" />
            </div>
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette size={18} /> Appearance
          </CardTitle>
          <CardDescription>Customize the platform look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  theme === value ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50 hover:bg-muted'
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={18} /> Notifications
          </CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Critical alerts', desc: 'Immediate notification for critical-priority alerts', enabled: true },
            { label: 'Case updates', desc: 'When cases you are assigned to are updated', enabled: true },
            { label: 'Daily digest', desc: 'Morning summary of overnight activities', enabled: true },
            { label: 'Low priority alerts', desc: 'Notifications for low-priority items', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Button variant={item.enabled ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
                {item.enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={18} /> Security
          </CardTitle>
          <CardDescription>Account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Badge variant="outline" className="text-low border-low">Enabled</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Session Timeout</p>
              <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <span className="text-sm font-mono">30 min</span>
          </div>
          <Separator />
          <Button variant="outline" size="sm" className="text-destructive">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* AI Intelligence — How It Works */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> AI Intelligence
          </CardTitle>
          <CardDescription>
            How PolitiTrace&apos;s Agentic AI works and what each feature does
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bot size={16} className="text-primary" />
              What is Agentic AI?
            </h3>
            <p className="text-sm leading-relaxed">
              PolitiTrace uses an <strong>Agentic AI</strong> system — an AI that doesn&apos;t just answer questions, but actively works alongside you. Unlike a simple chatbot that waits for your input, the Agentic AI <strong>continuously analyzes</strong> all entities, alerts, cases, and network connections in the background to proactively surface insights.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md bg-background p-3 text-center">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-xs text-muted-foreground">AI-powered features</p>
              </div>
              <div className="rounded-md bg-background p-3 text-center">
                <p className="text-2xl font-bold text-primary">Every</p>
                <p className="text-xs text-muted-foreground">page has AI insights</p>
              </div>
              <div className="rounded-md bg-background p-3 text-center">
                <p className="text-2xl font-bold text-primary">You</p>
                <p className="text-xs text-muted-foreground">stay in control</p>
              </div>
            </div>
          </div>

          {/* How to tell what's AI */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-semibold">How do I know what&apos;s AI-generated?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every AI-generated element is marked with a <Sparkles size={10} className="inline text-primary" /> sparkle icon or labeled &quot;AI&quot;. AI suggestions are <strong>recommendations</strong> — they help you prioritize and understand, but you make the final decisions. All analysis runs on platform data only; nothing is sent externally.
            </p>
          </div>

          {/* Keyboard shortcut */}
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Keyboard size={20} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Quick Access: AI Copilot</p>
              <p className="text-xs text-muted-foreground">
                Press <kbd className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border">Ctrl</kbd> + <kbd className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border">J</kbd> from any page to open the AI Copilot chat. Or click the floating <Bot size={10} className="inline" /> button at the bottom-right.
              </p>
            </div>
          </div>

          <Separator />

          {/* Feature-by-feature breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Feature-by-Feature Guide</h3>
            <div className="space-y-4">
              {AI_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-primary" />
                      <h4 className="text-sm font-semibold">{feature.title}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ArrowRight size={10} />
                      <strong>Where:</strong> {feature.location}
                    </p>
                    <p className="text-xs leading-relaxed">{feature.description}</p>
                    <details className="group">
                      <summary className="text-xs text-primary cursor-pointer font-medium hover:underline">
                        How does it work technically?
                      </summary>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 pl-2 border-l-2 border-primary/20">
                        {feature.howItWorks}
                      </p>
                    </details>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Re-show onboarding */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">AI Feature Tour</p>
              <p className="text-xs text-muted-foreground">Re-run the onboarding walkthrough that explains all AI features</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => resetOnboarding()}
              disabled={!onboardingDismissed}
            >
              {onboardingDismissed ? 'Replay Tour' : 'Tour Active'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
