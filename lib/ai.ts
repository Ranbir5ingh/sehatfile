export interface ExtractedReport {
  reportDate: string | null;      // YYYY-MM-DD when visible
  lab: string | null;
  testName: string | null;
  summary: string;                // 2-3 plain sentences
  keyValues: { name: string; value: string; flag?: string }[];
  medicines: { name: string; dosage?: string; frequency?: string }[];
  conditions: string[];
}

export interface BriefInput {
  name: string;
  relation: string;
  conditions: string[];
  medicines: { name: string; dosage: string | null; frequency: string | null }[];
  reports: {
    reportDate: string | null;
    testName: string | null;
    summary: string;
    keyValues: { name: string; value: string; flag?: string }[];
  }[];
}

export interface HealthAI {
  extractReport(imageDataUrl: string): Promise<ExtractedReport>;
  generateBrief(record: BriefInput): Promise<string>;
}

// Realistic sample pool for MockHealthAI
const SAMPLE_MOCK_REPORTS: ExtractedReport[] = [
  {
    reportDate: "2026-08-14",
    lab: "Dr. Lal PathLabs, New Delhi",
    testName: "Comprehensive Diabetes Profile (HbA1c & Fasting Blood Sugar)",
    summary: "Glycated Hemoglobin (HbA1c) is 7.6%, reflecting suboptimal glycemic control over the preceding 90 days. Fasting blood sugar is elevated at 148 mg/dL. Renal baseline markers remain stable.",
    keyValues: [
      { name: "HbA1c", value: "7.6 %", flag: "High" },
      { name: "Fasting Plasma Glucose", value: "148 mg/dL", flag: "High" },
      { name: "Estimated Average Glucose (eAG)", value: "171 mg/dL", flag: "High" },
      { name: "Serum Creatinine", value: "0.95 mg/dL", flag: "Normal" }
    ],
    medicines: [
      { name: "Metformin", dosage: "500 mg", frequency: "Twice daily after meals" },
      { name: "Glimepiride", dosage: "1 mg", frequency: "Once daily before breakfast" }
    ],
    conditions: ["Type 2 Diabetes Mellitus"]
  },
  {
    reportDate: "2026-06-22",
    lab: "SRL Diagnostics, Mumbai",
    testName: "Lipid Profile & Hypertension Review",
    summary: "Lipid screening demonstrates moderately elevated LDL cholesterol (138 mg/dL) and borderline triglycerides (185 mg/dL). HDL is slightly low at 38 mg/dL. Sitting blood pressure recorded at consultation was 138/88 mmHg.",
    keyValues: [
      { name: "Total Cholesterol", value: "218 mg/dL", flag: "High" },
      { name: "LDL Cholesterol", value: "138 mg/dL", flag: "High" },
      { name: "HDL Cholesterol", value: "38 mg/dL", flag: "Low" },
      { name: "Triglycerides", value: "185 mg/dL", flag: "Borderline" }
    ],
    medicines: [
      { name: "Atorvastatin", dosage: "10 mg", frequency: "Once daily at bedtime" },
      { name: "Telmisartan", dosage: "40 mg", frequency: "Once daily in morning" }
    ],
    conditions: ["Dyslipidemia", "Hypertension"]
  },
  {
    reportDate: "2026-03-10",
    lab: "Max Healthcare Laboratories",
    testName: "Complete Blood Count (CBC) & Renal Screen",
    summary: "Complete blood count shows mild microcytic hypochromic anemia with Hemoglobin at 11.2 g/dL. Total leukocyte count and platelet count are within standard biological limits. Kidney function parameters are stable.",
    keyValues: [
      { name: "Hemoglobin", value: "11.2 g/dL", flag: "Low" },
      { name: "Total Leukocyte Count (TLC)", value: "6,800 /mcL", flag: "Normal" },
      { name: "Platelet Count", value: "245,000 /mcL", flag: "Normal" },
      { name: "Blood Urea", value: "26 mg/dL", flag: "Normal" },
      { name: "Serum Creatinine", value: "0.91 mg/dL", flag: "Normal" }
    ],
    medicines: [
      { name: "Ferrous Ascorbate & Folic Acid", dosage: "1 tablet", frequency: "Once daily after lunch" }
    ],
    conditions: ["Mild Anemia"]
  },
  {
    reportDate: "2026-01-18",
    lab: "Apollo Diagnostics",
    testName: "Thyroid Function Panel (T3, T4, TSH)",
    summary: "Thyroid screening reveals mildly elevated Thyroid Stimulating Hormone (TSH) at 5.82 uIU/mL with normal free T4 levels, consistent with mild subclinical hypothyroidism. Recommended follow-up in 3 months.",
    keyValues: [
      { name: "Total T3", value: "1.1 ng/mL", flag: "Normal" },
      { name: "Total T4", value: "7.8 ug/dL", flag: "Normal" },
      { name: "TSH", value: "5.82 uIU/mL", flag: "High" }
    ],
    medicines: [
      { name: "Thyroxine Sodium", dosage: "25 mcg", frequency: "Once daily empty stomach" }
    ],
    conditions: ["Subclinical Hypothyroidism"]
  }
];

let mockRotationIndex = 0;

export class MockHealthAI implements HealthAI {
  async extractReport(_imageDataUrl: string): Promise<ExtractedReport> {
    // Simulate brief processing time
    await new Promise((resolve) => setTimeout(resolve, 600));

    const sample = SAMPLE_MOCK_REPORTS[mockRotationIndex % SAMPLE_MOCK_REPORTS.length];
    mockRotationIndex++;

    return JSON.parse(JSON.stringify(sample));
  }

  async generateBrief(record: BriefInput): Promise<string> {
    // Simulate brief processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const activeMeds = record.medicines.length > 0
      ? record.medicines.map((m) => `• ${m.name} ${m.dosage || ''} — ${m.frequency || 'As directed'}`).join('\n')
      : '• No active prescription medications documented.';

    const conditionsStr = record.conditions.length > 0
      ? record.conditions.join(', ')
      : 'None explicitly recorded';

    // Build key values over time
    const keyValuesList: string[] = [];
    if (record.reports.length > 0) {
      for (const r of record.reports) {
        const dateStr = r.reportDate || 'Undated';
        for (const kv of r.keyValues) {
          const flagStr = kv.flag ? ` [${kv.flag}]` : '';
          keyValuesList.push(`• ${dateStr}: ${kv.name} = ${kv.value}${flagStr} (${r.testName || 'Lab Panel'})`);
        }
      }
    }
    const keyValuesSection = keyValuesList.length > 0
      ? keyValuesList.slice(0, 10).join('\n')
      : '• No historical lab test values logged yet.';

    const recentReportsStr = record.reports.length > 0
      ? record.reports.slice(0, 3).map((r) => `• ${r.reportDate || 'Recent'}: ${r.testName || 'Lab Report'} — ${r.summary}`).join('\n')
      : '• No recent lab reports uploaded.';

    return `PATIENT SNAPSHOT
Patient Name: ${record.name}
Relation / Role: ${record.relation || 'Family Member'}
Documented Conditions: ${conditionsStr}
Summary: Health file maintained by family health manager. Chronological history aggregated from physical diagnostic reports.

CURRENT MEDICATIONS
${activeMeds}

KEY VALUES OVER TIME
${keyValuesSection}

RECENT CHANGES
${recentReportsStr}

QUESTIONS FOR THE DOCTOR
1. Based on recent lab trends, are any medication dosage adjustments warranted at this visit?
2. Are current glycemic and lipid readings sufficiently optimized, or should complementary targets be set?
3. Which specific follow-up screening panels should be scheduled for the next 3 to 6 months?
4. Are there any known drug-supplement interactions between the current prescriptions to monitor?`;
  }
}

export class GemmaHealthAI implements HealthAI {
  private getOllamaConfig() {
    return {
      url: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'gemma3:4b'
    };
  }

  async extractReport(imageDataUrl: string): Promise<ExtractedReport> {
    const { url, model } = this.getOllamaConfig();

    // Extract raw base64 data
    const base64Data = imageDataUrl.includes(',')
      ? imageDataUrl.split(',')[1]
      : imageDataUrl;

    const prompt = "You are a careful medical document reader helping a family organize their health records. You are shown a photo of a medical lab report or prescription. It may be printed, handwritten, in English or Hindi, or a mix. Read ONLY what is actually visible. If handwriting is illegible, say 'illegible' rather than guessing. NEVER invent test values, dates, or medicine names. Return ONLY valid JSON (no markdown fences, no commentary) with keys: reportDate (YYYY-MM-DD or null), lab (or null), testName (or null), summary (2-3 plain sentences), keyValues (3-6 most important readings as {name, value, flag}), medicines (explicitly named only, as {name, dosage, frequency}), conditions (only stated or clearly implied).";

    try {
      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          images: [base64Data],
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1
          }
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        throw new Error(`Ollama API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.response;
      
      // Parse JSON from Ollama response
      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        // Strip markdown fences if any slipped through
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        parsed = JSON.parse(cleaned);
      }

      return {
        reportDate: typeof parsed.reportDate === 'string' ? parsed.reportDate : null,
        lab: typeof parsed.lab === 'string' ? parsed.lab : null,
        testName: typeof parsed.testName === 'string' ? parsed.testName : null,
        summary: typeof parsed.summary === 'string' ? parsed.summary : 'No summary generated.',
        keyValues: Array.isArray(parsed.keyValues)
          ? parsed.keyValues.map((kv: any) => ({
              name: String(kv.name || 'Test'),
              value: String(kv.value || 'N/A'),
              flag: kv.flag ? String(kv.flag) : undefined
            }))
          : [],
        medicines: Array.isArray(parsed.medicines)
          ? parsed.medicines.map((m: any) => ({
              name: String(m.name || ''),
              dosage: m.dosage ? String(m.dosage) : undefined,
              frequency: m.frequency ? String(m.frequency) : undefined
            })).filter((m: any) => m.name.length > 0)
          : [],
        conditions: Array.isArray(parsed.conditions)
          ? parsed.conditions.map((c: any) => String(c)).filter((c: string) => c.length > 0)
          : []
      };
    } catch (err: any) {
      throw new Error(
        `Failed to connect to Ollama at ${url} or process document with model ${model}. Is Ollama running? Try: ollama serve && ollama pull ${model}. (${err.message || err})`
      );
    }
  }

  async generateBrief(record: BriefInput): Promise<string> {
    const { url, model } = this.getOllamaConfig();

    const briefPromptBase = "You are helping a family prepare for a doctor's appointment. Below is the organized health record of one family member. Write a ONE-PAGE doctor's brief in clear plain English the family can print and hand to the doctor, structured exactly as: PATIENT SNAPSHOT / CURRENT MEDICATIONS / KEY VALUES OVER TIME (date: value lines, newest first, trend in plain words) / RECENT CHANGES / QUESTIONS FOR THE DOCTOR (3-5 specific, data-grounded). Be factual and conservative. Never diagnose, never suggest doses. If data is missing, say so.";
    const fullPrompt = `${briefPromptBase}\n\nHealth Record JSON:\n${JSON.stringify(record, null, 2)}`;

    try {
      const response = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.1
          }
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        throw new Error(`Ollama API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (err: any) {
      throw new Error(
        `Failed to connect to Ollama at ${url} or generate brief with model ${model}. Is Ollama running? Try: ollama serve && ollama pull ${model}. (${err.message || err})`
      );
    }
  }
}

export function getHealthAI(): HealthAI {
  const provider = process.env.AI_PROVIDER?.toLowerCase().trim();
  if (provider === 'gemma') {
    return new GemmaHealthAI();
  }
  return new MockHealthAI();
}
