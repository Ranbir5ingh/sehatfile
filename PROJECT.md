# SehatFile — Hacktoberfest 2026 Submission

**Event**: Hacktoberfest 2026 Weekend Challenge ("Build for a Friend")  
**Deadline**: Monday, October 5, 2026 at 12:29 PM IST  
**Prize Categories Entered**:
1. **Overall Hacktoberfest 2026 Winner**
2. **Best Use of Gemma** (Local Multimodal Clinical Document Understanding)

---

## 📌 One-Paragraph Problem Statement

In nearly every Indian household, an aging parent or grandparent accumulates years of disorganized paper lab reports, handwritten prescriptions, and diagnostic scans in an overflowing plastic folder ("the sehat file"). Before hospital visits, an adult son, daughter, or spouse acts as the family's informal "health manager," desperately sorting through papers in waiting rooms — yet in the rushed 90-second consultation, no one can accurately recall the patient's full medication list, drug changes, or multi-year blood sugar and kidney function trends. Doctors are forced to re-order expensive redundant tests or make conservative guesses. **SehatFile** solves this by letting the health manager snap a photo of any medical report once: an open AI layer extracts key clinical values into a per-person chronological timeline, maintains a living active medicine cabinet, and automatically compiles a high-density, printable **one-page Doctor's Brief** designed specifically to hand to the physician at the start of the 90-second consultation.

---

## 🌟 Complete Feature List

1. **Modern Multipage Navigation & Family Member Profile Hub**
   - Clean, minimal multipage routes with sticky frosted header:
     - `/` — **Overview Dashboard**: Family summary, health readiness metrics, recent activity stream.
     - `/reports` — **Reports & Timeline**: Document scanner dropzone, downscaling, full chronological test feed.
     - `/medicines` — **Living Medicine Cabinet**: Active vs. discontinued prescriptions, dosages, manual add.
     - `/brief` — **Doctor's Consultation Brief**: 1-page printable clinical document and print preview.
     - `/members` — **Household Profiles**: Multi-person health folders, relation management, chronic condition tags.
   - Persistent family member switcher dropdown in the navbar across all pages.
   - Dynamic chronic condition tags tracked automatically from diagnostic findings.

2. **Mobile-First Report Camera & Upload**
   - Direct phone camera capture using `capture="environment"` or file picker.
   - Client-side downscaling (max 1400px, JPEG 0.85) via HTML5 Canvas before network transmission to conserve bandwidth and memory.
   - **1-Click Synthetic Lab Report Simulator**: Instant test report generator rendering realistic Indian diagnostic pathology sheets to demo the complete AI extraction pipeline with zero setup.

3. **Intelligent Report Extraction Pipeline**
   - Structured parsing of collection date (`YYYY-MM-DD`), diagnostic laboratory name, investigation title, and a 2-3 sentence plain-language summary for family comprehension.
   - Clinical key values extraction with biological reference flag tagging (`HIGH`, `LOW`, `NORMAL`, `BORDERLINE`).
   - Automatic folding of detected medicines into the patient's living medicine cabinet (reactivating previously stopped medicines if newly re-prescribed).

4. **Medical Timeline View**
   - Newest-first reverse chronological feed of all historical laboratory investigations.
   - Color-coded value chips for fast scanning of abnormal markers.

5. **Living Medicine Cabinet**
   - Complete active prescription list displaying drug names, dosages, and administration frequencies.
   - One-tap "Mark Stopped" / "Reactivate" status toggle.
   - Manual medication addition form for over-the-counter or unlisted prescriptions.

6. **1-Page Printable Doctor's Brief**
   - On-demand clinical synthesis structured into five standardized sections:
     - **PATIENT SNAPSHOT**
     - **CURRENT MEDICATIONS**
     - **KEY VALUES OVER TIME**
     - **RECENT CHANGES**
     - **QUESTIONS FOR THE DOCTOR** (3-5 specific, data-grounded questions)
   - Specialized print stylesheet (`@media print`) that suppresses UI controls and renders a clean, high-contrast, compact one-page document with doctor sign-off lines.
   - Clipboard export for sending via WhatsApp to consulting doctors or distant siblings.

7. **Zero-Friction Local AI Architecture**
   - Pluggable `HealthAI` interface with zero code coupling in API routes.
   - Seamless toggling between `MockHealthAI` (works out of the box with zero dependencies) and `GemmaHealthAI` (calling local Ollama with `gemma3:4b`).

---

## 💻 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 16.3.8 (App Router, Turbopack) | Latest React 19 server features with single-server architecture. |
| **Language** | TypeScript (Strict) | End-to-end type safety for clinical JSON contracts and database models. |
| **Styling** | Tailwind CSS 4 | Mobile-first dark theme and dedicated `@media print` layout. |
| **Database** | Node.js native `node:sqlite` | Zero npm database dependencies; self-contained `.data/sehatfile.db`. |
| **AI Interface** | Pluggable `HealthAI` (`lib/ai.ts`) | Strict abstraction isolating API routes from model providers. |
| **Local Model** | Google Gemma 3 (`gemma3:4b` via Ollama) | Local, private, multilingual vision-language clinical reader. |

---

## 🏆 Prize Categories & Evaluation Alignment

### 1. Overall Hacktoberfest 2026 Winner ("Build for a Friend")
- **Human Impact**: Solves an authentic, universal problem experienced by hundreds of millions of families across South Asia and worldwide.
- **Dignity of Care**: The elderly or chronically ill patient never struggles with confusing apps or complex interfaces; their family caregiver does the single photographic scan, and the clinical brief empowers the physician.
- **Architectural Elegance**: Built as a zero-dependency, self-contained single application without heavy microservices, external backend servers, or cloud DB subscription fees.

### 2. Best Use of Gemma
- **Edge Multimodal Vision**: Utilizes Gemma 3's state-of-the-art vision capabilities to decipher complex pathology test layouts, tabular metrics, and handwritten doctor prescription notes.
- **Privacy by Design**: Medical lab reports and personal health metrics never leave the home device.
- **Instruction Fidelity**: Employs Gemma's structured JSON output mode to extract exact laboratory metrics without hallucinations or invented doses.

---

## ✅ Submission Checklist (Hacktoberfest Weekend Challenge)

- [x] **Project Name**: SehatFile (सेहत फ़ाइल)
- [x] **Next.js 16 + TypeScript (Strict) + Tailwind CSS**: Complete and verified with zero compilation errors.
- [x] **Zero Second Server**: Single Next.js App Router server hosting all UI, Server Components, and Route Handlers under `app/api/`.
- [x] **SQLite via `node:sqlite`**: Fully operational with tables `people`, `reports`, `medicines`, and `briefs`.
- [x] **Pluggable AI Layer**: `lib/ai.ts` exporting `HealthAI`, `MockHealthAI`, `GemmaHealthAI`, and `getHealthAI()`.
- [x] **Strict API Isolation**: `grep -r "ollama" app/api` verified to return 0 occurrences. API routes call only `getHealthAI()`.
- [x] **Default Mock Provider**: Full end-to-end flow operational out of the box with zero models installed (`AI_PROVIDER=mock`).
- [x] **Client-Side Image Downscaling**: Canvas-based downscaling (max 1400px, JPEG 0.85) implemented.
- [x] **Mobile Camera Capture**: Enabled via `capture="environment"` and 1-Click test simulator.
- [x] **Living Medicine Cabinet**: Active vs. stopped toggles and manual addition forms functioning.
- [x] **1-Page Printable Doctor Brief**: Formatted and tested with dedicated print media queries.
- [x] **Environment Configuration**: `.env.example` and `.env.local` created.
- [x] **Production Build Verified**: `npm run build` completed successfully.
- [x] **Documentation**: `README.md` and `PROJECT.md` complete and submission-ready before the deadline (Mon Oct 5, 2026 12:29 PM IST).
