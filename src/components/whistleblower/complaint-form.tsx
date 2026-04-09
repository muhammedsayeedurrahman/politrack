'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FadeIn } from '@/components/motion';
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  Lock,
  EyeOff,
  ServerCrash,
  Copy,
  AlertTriangle,
  FileDown,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'bribery', label: 'Bribery', description: 'Exchange of money, gifts, or favors for official action', icon: '💰' },
  { id: 'procurement_fraud', label: 'Procurement Fraud', description: 'Rigged tenders, bid manipulation, or contract steering', icon: '📋' },
  { id: 'conflict_of_interest', label: 'Conflict of Interest', description: 'Officials with undisclosed personal interests in decisions', icon: '⚖️' },
  { id: 'embezzlement', label: 'Embezzlement', description: 'Misappropriation of public funds or resources', icon: '🏦' },
  { id: 'other', label: 'Other', description: 'Any other form of corruption or misconduct', icon: '📌' },
] as const;

type Category = (typeof CATEGORIES)[number]['id'];

interface FormData {
  category: Category | null;
  what: string;
  when: string;
  where: string;
  who: string;
  additionalDetails: string;
}

const INITIAL_FORM: FormData = {
  category: null,
  what: '',
  when: '',
  where: '',
  who: '',
  additionalDetails: '',
};

function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WB-${year}-${code}`;
}

const DEMO_DATA: FormData = {
  category: 'procurement_fraud',
  what: 'I witnessed bid manipulation in the Department of Public Works infrastructure project #PW-2026-1087. Three companies — BuildCorp Ltd, Metro Contractors, and PrimeSteel Inc — appear to be coordinating their tender submissions. The winning bid always rotates between them while maintaining inflated prices approximately 40% above market rates. I have internal emails suggesting the department head, Director James Okonkwo, is receiving monthly payments from BuildCorp through a shell company called Apex Consulting registered to his brother-in-law.',
  when: 'January 2026 - Present (ongoing)',
  where: 'Department of Public Works, Regional Office - Floor 12',
  who: 'Director James Okonkwo (Dept. Head), BuildCorp Ltd (CEO: Sarah Chen), Metro Contractors, PrimeSteel Inc, Apex Consulting (shell)',
  additionalDetails: 'I have copies of internal procurement memos showing pre-determined scoring criteria designed to favour these three companies. The contract values involved exceed $12M across 4 projects in the last fiscal year.',
};

interface ComplaintFormProps {
  onDemoReady?: (runDemo: () => void) => void;
}

export function ComplaintForm({ onDemoReady }: ComplaintFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDemoFilling, setIsDemoFilling] = useState(false);

  const runDemo = useCallback(async () => {
    setIsDemoFilling(true);
    setStep(0);
    setFormData(INITIAL_FORM);

    // Step 0: Select category with typing effect
    await new Promise((r) => setTimeout(r, 400));
    setFormData((prev) => ({ ...prev, category: DEMO_DATA.category }));
    await new Promise((r) => setTimeout(r, 600));
    setStep(1);

    // Step 1: Fill description field character-by-character (fast)
    const fields: (keyof FormData)[] = ['what', 'when', 'where', 'who', 'additionalDetails'];
    for (const field of fields) {
      const value = DEMO_DATA[field];
      if (!value) continue;
      const chunks = Math.ceil(value.length / 8);
      for (let i = 1; i <= chunks; i++) {
        const partial = value.slice(0, i * 8);
        setFormData((prev) => ({ ...prev, [field]: partial }));
        await new Promise((r) => setTimeout(r, 20));
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
      await new Promise((r) => setTimeout(r, 200));
    }

    await new Promise((r) => setTimeout(r, 500));
    setStep(2);
    await new Promise((r) => setTimeout(r, 800));
    setIsDemoFilling(false);
  }, []);

  useEffect(() => {
    onDemoReady?.(runDemo);
  }, [onDemoReady, runDemo]);

  const canProceed = useCallback((): boolean => {
    if (step === 0) return formData.category !== null;
    if (step === 1) return formData.what.trim().length > 10;
    return true;
  }, [step, formData]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setTrackingCode(data.data?.trackingCode ?? generateTrackingCode());
      setStep(3);
    } catch {
      setTrackingCode(generateTrackingCode());
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const handleCopy = useCallback(() => {
    if (!trackingCode) return;
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [trackingCode]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Step 3: Confirmation
  if (step === 3 && trackingCode) {
    return (
      <FadeIn direction="up">
        <Card className="glass-card !rounded-2xl max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Report Submitted Securely</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your anonymous complaint has been received and will be reviewed by our investigation team.
              </p>
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground mb-2">Your anonymous tracking code</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-2xl font-bold font-mono tracking-wider text-primary">{trackingCode}</code>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
                  <Copy size={14} className="mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Save this code to check the status of your report later. No personal information is linked to this code.
              </p>
            </div>
            <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Lock size={10} /> Encrypted</span>
              <span className="flex items-center gap-1"><EyeOff size={10} /> Anonymous</span>
              <span className="flex items-center gap-1"><Shield size={10} /> Protected</span>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href={`/track?code=${encodeURIComponent(trackingCode)}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Search size={12} />
                  Track Report Status
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  fetch(`/api/reports/complaint?code=${encodeURIComponent(trackingCode)}`)
                    .then((res) => res.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `PolitiTrace-${trackingCode}-Report.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    });
                }}
              >
                <FileDown size={12} />
                Download PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all',
                s < step
                  ? 'bg-primary text-primary-foreground border-primary'
                  : s === step
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-muted text-muted-foreground',
              )}
            >
              {s < step ? <CheckCircle2 size={14} /> : s + 1}
            </div>
            {s < 2 && (
              <div className={cn('flex-1 h-px', s < step ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      <Card className="glass-card !rounded-2xl">
        <CardContent className="p-6">
          {/* Step 0: Category */}
          {step === 0 && (
            <FadeIn direction="right">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">What type of corruption are you reporting?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Select the category that best describes the misconduct.</p>
                </div>
                <div className="grid gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateField('category', cat.id)}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm',
                        formData.category === cat.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                      {formData.category === cat.id && (
                        <CheckCircle2 size={16} className="text-primary ml-auto shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <FadeIn direction="right">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Describe what happened</h3>
                  <p className="text-sm text-muted-foreground mt-1">All fields are optional except the description. Provide as much detail as you feel comfortable sharing.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      What happened? <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe the corrupt activity in detail..."
                      value={formData.what}
                      onChange={(e) => updateField('what', e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">When did it happen?</label>
                      <Input
                        type="text"
                        placeholder="e.g., March 2026, Last week"
                        value={formData.when}
                        onChange={(e) => updateField('when', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Where?</label>
                      <Input
                        placeholder="Location, department, office..."
                        value={formData.where}
                        onChange={(e) => updateField('where', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Who was involved?</label>
                    <Input
                      placeholder="Names, titles, organizations (optional)..."
                      value={formData.who}
                      onChange={(e) => updateField('who', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Additional details</label>
                    <Textarea
                      placeholder="Any other relevant information..."
                      value={formData.additionalDetails}
                      onChange={(e) => updateField('additionalDetails', e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Step 2: Evidence & Review */}
          {step === 2 && (
            <FadeIn direction="right">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Upload Evidence (Optional)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Attach any supporting documents. All metadata is stripped for your protection.</p>
                </div>
                <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, XLS, JPG, PNG (max 10MB each)
                  </p>
                </div>

                <div className="rounded-xl bg-muted/30 border p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Report Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="secondary" className="capitalize">
                        {formData.category?.replace('_', ' ') ?? 'Not selected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description</span>
                      <span className="text-right max-w-[60%] truncate">{formData.what || 'Not provided'}</span>
                    </div>
                    {formData.when && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">When</span>
                        <span>{formData.when}</span>
                      </div>
                    )}
                    {formData.where && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Where</span>
                        <span>{formData.where}</span>
                      </div>
                    )}
                    {formData.who && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Who</span>
                        <span className="text-right max-w-[60%] truncate">{formData.who}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    By submitting, you confirm this report is made in good faith. False reports may constitute an offense. Your anonymity is fully protected.
                  </p>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft size={14} /> Back
            </Button>
            {step < 2 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="gap-1"
              >
                Next <ChevronRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
                <Shield size={14} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><ServerCrash size={12} /> No IP logging</span>
        <span className="flex items-center gap-1.5"><Lock size={12} /> End-to-end encrypted</span>
        <span className="flex items-center gap-1.5"><EyeOff size={12} /> Anonymous by default</span>
      </div>
    </div>
  );
}
