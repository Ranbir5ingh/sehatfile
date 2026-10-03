# SehatFile

> **The Smart Digital Health Folder for Indian Families.**  
> Built for the **Hacktoberfest 2026 Weekend Challenge ("Build for a Friend")**.

Every Indian household has a worn accordion file or plastic folder stuffed with years of unsorted medical lab reports, prescriptions, and discharge summaries. Before each doctor visit, the family's "health manager" (often an adult son, daughter, or spouse) frantically digs through the pile. During the hectic 90-second consultation, when the doctor asks: *"What medicines is he currently taking, and since when has his sugar or creatinine been high?"*, nobody can answer with certainty — leading the doctor to re-order the exact same tests.

**SehatFile fixes this permanently.**  
The family health manager snaps a photo of each paper report once. AI extracts the clinical readings, test names, dates, and prescribed medicines into structured data. SehatFile maintains an automatic per-person medical timeline, a living active medicine list, and generates a **1-page printable Doctor's Brief** tailored for rapid clinical consultations. The patient never touches software — they simply benefit when the physician finally sees their complete health picture.

---

## ⚡ Quick Start (One-Command Setup)

SehatFile has **zero external database dependencies** — it runs on Node.js built-in `node:sqlite`.

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

By default, SehatFile runs in **`AI_PROVIDER=mock`** mode, allowing you to test the complete loop (adding family members, uploading/extracting reports, viewing timelines, managing medicines, and generating 1-page printable briefs) immediately with **zero models installed**.

---

## 🤖 Connecting the Real Model (Gemma 3 via Ollama)

SehatFile is architected with a **pluggable AI abstraction** (`HealthAI` in `lib/ai.ts`). Switching between the mock generator and a local **Gemma 3** vision model requires **zero code changes** — only setting an environment variable.

### Step 1: Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com) (available for macOS, Linux, and Windows).

### Step 2: Pull the Gemma 3 Vision Model
Open your terminal and run:
```bash
# Start Ollama service (if not running in background)
ollama serve

# Pull the lightweight, multimodal Gemma 3 model
ollama pull gemma3:4b
```

### Step 3: Switch AI_PROVIDER in `.env.local`
In your `.env.local` file (or copy from `.env.example`):
```env
AI_PROVIDER=gemma
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
```

Restart your Next.js server (`npm run dev`). SehatFile will now use local Gemma 3 for multi-modal document extraction and clinical brief generation.

---

## 🔒 Why Open, Local AI for Family Health?

1. **Health Data Never Leaves Your Home Machine**  
   Medical reports contain sensitive personal and clinical information (names, diagnoses, lab readings, doctor notes). By using local Gemma 3 through Ollama, raw report images and patient records are processed entirely on your personal machine with zero telemetry or cloud uploads.
2. **Free Forever & No API Key Anxiety**  
   Commercial cloud vision APIs charge per page and require credit cards. Local models run indefinitely at zero marginal cost.
3. **Works Offline in Clinical Settings**  
   Clinic basements, hospital waiting rooms, and rural clinics frequently suffer from poor cell connectivity. A local model can run on a laptop without an internet connection.
4. **Multilingual & Mixed-Script Resilience**  
   Indian prescriptions frequently mix English medical terminology with Hindi or regional doctor notes. Gemma's multilingual pretraining understands code-mixed inputs and varied script styles.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Dark theme + dedicated `@media print` 1-page stylesheet)
- **Database**: SQLite via Node.js native `node:sqlite` (zero npm DB packages, stored at `.data/sehatfile.db`)
- **AI Engine**: Pluggable `HealthAI` (`MockHealthAI` by default, `GemmaHealthAI` via Ollama)
- **Image Processing**: Client-side canvas downscaling (max 1400px, JPEG 0.85) before upload

---

## 📋 Key Features

- **Multi-Person Profiles**: Organize records per family member (Papa, Mummy, Dadi, Self).
- **Camera & Photo Upload**: Mobile-first capture (`capture="environment"`) with client-side downscaling and instant 1-Click Sample Lab Report testing.
- **Structured Timeline**: Newest-first clinical reports showing lab name, collection date, 2-3 sentence plain language summaries, and color-coded key value chips (High / Low / Normal / Borderline).
- **Living Medicine Cabinet**: Active vs. stopped medications, dosage, frequency, and manual addition.
- **1-Page Printable Doctor's Brief**: Formats Patient Snapshot, Current Medications, Key Values Over Time, Recent Changes, and Data-Grounded Questions for the doctor into a clean, distraction-free printable page.

---

## 🧪 Verification & Building

```bash
# Verify TypeScript and create production bundle
npm run build

# Start production server
npm start
```
