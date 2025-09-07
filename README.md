## eduproc – Blockchain-based Exam Platform

eduproc is a decentralized, voice-enabled online examination system built on Next.js, Thirdweb, and Pinata. Exams and results are stored on IPFS, while critical actions are recorded on-chain (Sepolia), ensuring transparency, immutability, and tamper resistance. Optional proctoring hooks provide basic integrity checks.

### Key Features

- **Student**
  - View and take exams from an IPFS `cid` route (`/exams/[cid]`).
  - Answer via UI or voice commands (e.g., "Option A", "Next", "Submit").
  - Local scoring with results uploaded to IPFS and anchored on-chain.
  - View detailed results via `/results/[cid]`.

- **Admin**
  - Create exams with title, start time, and duration.
  - Import questions from text or document (image/PDF) using Gemini extraction.
  - Upload exam JSON to IPFS and register the exam on-chain.

- **Centre Admin (intended)**
  - Toggle exam activation and monitor submissions (contract helpers provided).

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind (utility classes in JSX)
- **Blockchain**: Thirdweb (Sepolia testnet)
- **Storage**: Pinata (IPFS)
- **AI**: Google Generative AI (Gemini 1.5 Flash) for question extraction
- **Voice**: `react-speech-recognition`
- **Proctoring**: External endpoint via `PROCTOR_URL` (optional)

### Project Structure

```text
src/
  app/
    api/
      exams/              # Upload to IPFS and fetch by CID
        [cid]/
          route.ts        # GET: Read exam/results JSON from IPFS
        route.ts          # POST: Upload JSON to IPFS
      extract/
        route.ts          # POST: Extract MCQs from text or file using Gemini
    exams/[cid]/page.tsx  # Student exam runner (voice-enabled, timer, submit)
    results/[cid]/page.tsx# Results viewer for an IPFS CID
    upload/page.tsx       # Admin exam builder/uploader
  components/             # UI components
utils/
  blockchain.ts           # Thirdweb hooks (read/write helpers)
  contract.ts             # Thirdweb client + contract config
  config.ts               # Pinata client
```

### Environment Variables

Create a `.env` file and set the following:

```env
# Thirdweb
NEXT_PUBLIC_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_ADDRESS=your_contract_address

# Pinata
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_public_gateway_base_url

# Google Generative AI (Gemini)
GENAI_KEY=your_gemini_api_key

# Proctoring (optional)
PROCTOR_URL=https://your-proctor-service.example.com
```

### Scripts

```bash
npm run dev     # Start dev server with Turbopack
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Lint
```

### Setup & Run

1. Install dependencies
```bash
npm install
```
2. Configure environment variables (see above).
3. Start the app
```bash
npm run dev
```
4. Open `http://localhost:3000`.

### Core Flows

- **Create & Deploy Exam (Admin)**
  1) Go to `/upload`.
  2) Fill exam metadata (title, start time, duration).
  3) Import questions via document or paste text; review/edit.
  4) Click "Deploy Exam" → uploads JSON to IPFS via `/api/exams` → calls contract `createExamWithQuestions(title, start, duration, cid)`.

- **Take Exam (Student)**
  1) Navigate to `/exams/[cid]` (the exam’s IPFS CID).
  2) Read from IPFS via `/api/exams/[cid]` and begin.
  3) Answer questions by UI or voice commands.
  4) On submit: calculate score → upload results JSON to IPFS → call `submitAnswers(examId, resultsCid)`.

- **View Results**
  - Visit `/results/[cid]` to render the results JSON from IPFS.

### API Overview

- `POST /api/exams`
  - Body: arbitrary JSON (exam or results)
  - Action: Uploads to Pinata. Returns `{ cid, url }`.

- `GET /api/exams/:cid`
  - Action: Fetches and returns JSON content from IPFS via Pinata gateway.

- `POST /api/extract`
  - Accepts: `multipart/form-data` with `file`, or JSON `{ text }`.
  - Action: Calls Gemini and returns a strict array of `{ question, options, answer_index }`.

### Smart Contract Integration

- Network: Sepolia (chain id 11155111)
- Primary methods used:
  - `createExamWithQuestions(string title, uint256 startTime, uint256 duration, string questionsHash)`
  - `submitAnswers(uint256 examId, string answerHash)`
- Helpers available in `utils/blockchain.ts` for reads/writes (e.g., `getAllExams`, `getExamById`, `getAllSubmissions`, `verifyStudent`, `updateExamStatus`).

### Voice Commands

- "Option A/B/C/D" – select answer
- "Next" / "Previous" – navigate
- "Submit" – submit exam

### Proctoring

- If `PROCTOR_URL` is set, the exam page calls `${PROCTOR_URL}/check-screen` to display basic warnings on suspicious activity.

### Security & Notes

- Do not store secrets in client-visible env vars (`NEXT_PUBLIC_*`). Keep `PINATA_JWT` and `GENAI_KEY` server-side only.
- Results are uploaded to IPFS before being referenced on-chain. Consider encrypting payloads if required by policy.
- Validate and sanitize extracted questions before publishing.

### License

MIT

### Contact

For questions, open an issue or contact the maintainer.
