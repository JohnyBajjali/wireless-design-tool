# AI-Powered Wireless Network Design Tool

A full-stack educational application for exploring wireless communication calculations with AI-generated explanations. Built with **React** and **Flask**, the application provides four calculation scenarios and integrates the **Google Gemini API** to explain results.

Developed by **Johny Bajjali** for **ENCS5323 — Wireless & Mobile Networks**.

> Calculation results are produced by Python formulas. Gemini is used to explain the results, not to calculate them. AI availability depends on the configured model, API key, and project quota; a predefined explanation is returned when the Gemini request fails.

## Features

| Scenario | Inputs | Outputs |
|---|---|---|
| Wireless Communication System | Sampling rate, quantization bits, source coding rate, channel coding rate, interleaving rate, burst formatting rate | Output at each processing stage |
| OFDM System | Number of subcarriers, bits per symbol, symbol duration in microseconds, parallel resource blocks | Resource-element rate, aggregate data rate, resource-block rate, maximum capacity, spectral efficiency |
| Link Budget Calculation | Transmit power, transmit/receive antenna gains, frequency, distance | Free-space path loss, received power, transmit power |
| Cellular System Design | Coverage area, user density, channels per cell, cluster size | Estimated cells needed, frequency-reuse factor, system capacity |

The interface includes scenario selection, loading indicators, error messages, JSON-formatted results, and an explanation section.

## Technology Stack

- **Frontend:** React 19.1, JavaScript, CSS, Create React App (`react-scripts` 5.0.1)
- **Backend:** Python, Flask, Flask-CORS
- **AI:** `google-generativeai`, configured with `gemini-1.5-flash` in the supplied source
- **Configuration:** `python-dotenv` and the `GEMINI_API_KEY` environment variable
- **Communication:** JSON over HTTP using the browser Fetch API

## How It Works

1. Select a scenario and enter its inputs.
2. React sends a POST request to the corresponding Flask endpoint.
3. Flask converts the inputs and calculates the results.
4. The backend sends the scenario, inputs, and results to Gemini, requesting formulas, practical implications, and one optimization suggestion.
5. The response contains the calculation results and either the AI explanation or a predefined fallback explanation.

The Gemini request is synchronous: an unavailable or slow AI service can delay the calculation response even though the numerical results are calculated locally.

## Project Structure

```text
wireless-design-tool/
├── .gitignore
├── requirements.txt           # Separate root dependency snapshot
├── backend/
│   ├── app.py                 # Flask endpoints, calculations, Gemini integration
│   ├── requirements.txt       # Dependencies used by the backend setup below
│   └── Procfile               # Gunicorn launch command
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── README.md              # Create React App documentation
    ├── public/                # HTML template and static assets
    └── src/
        ├── App.js             # Main interface and scenario selection
        ├── App.css
        ├── index.js
        └── components/
            ├── ScenarioSelector.js
            ├── WirelessForm.js
            ├── OFDMForm.js
            ├── LinkBudgetForm.js
            └── CellularForm.js
```

Create `backend/.env` locally for configuration; do not commit it or share API keys.

## Local Setup

### Prerequisites

- Python with `pip` and `venv`
- Node.js and npm
- A browser
- A `GEMINI_API_KEY` value supplied through the environment or `backend/.env`

The repository does not pin a Python or Node.js runtime version. The commands below target Windows PowerShell. They use `npm.cmd` to avoid PowerShell's `npm.ps1` script-execution restriction.

### 1. Download the project

Clone the repository:

```powershell
git clone https://github.com/JohnyBajjali/wireless-design-tool.git
cd wireless-design-tool
```

Alternatively, download and extract the ZIP, then open a terminal in the extracted folder containing `backend` and `frontend`.

### 2. Install backend dependencies

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Run this installation from **inside `backend`**. Its requirements file lists `flask`, `flask-cors`, `google-generativeai`, and `python-dotenv`; the separate root requirements file is not a complete substitute for this backend setup.

### 3. Configure Gemini

Create a local file named `.env` inside `backend`:

```dotenv
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace the placeholder with your own key. The backend calls `load_dotenv()` and reads `GEMINI_API_KEY` using `os.getenv()`.

**Current source behavior:** a missing or empty key prevents the backend from starting. A configured key is required at startup even when you intend to use the fallback explanation. An existing environment variable takes precedence over `.env` under this code's default `load_dotenv()` behavior.

This version imports `google.generativeai` and specifies `gemini-1.5-flash` in `generate_ai_explanation()`. Installing `google-genai` alone does not change that implementation. Successful AI responses require a model and quota available to your Google project; the included model setting is not a guarantee of current service availability.

### 4. Start the backend

From `backend`:

```powershell
.\.venv\Scripts\python.exe app.py
```

The development server runs at:

```text
http://127.0.0.1:5000
```

Keep this terminal open.

### 5. Start the frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

Open:

```text
http://localhost:3000
```

Keep both terminals running. The four frontend forms explicitly call `http://localhost:5000`; no configurable backend URL is implemented in this version.

## API Reference

All four endpoints accept a JSON body using `Content-Type: application/json`.

| Method | Endpoint | Required JSON fields |
|---|---|---|
| POST | `/api/wireless` | `samplingRate`, `quantizationBits`, `sourceCodingRate`, `channelCodingRate`, `interleavingRate`, `burstFormattingRate` |
| POST | `/api/ofdm` | `subcarriers`, `bitsPerSymbol`, `symbolDuration`, `parallelBlocks` |
| POST | `/api/linkbudget` | `txPower`, `txAntennaGain`, `rxAntennaGain`, `frequency`, `distance` |
| POST | `/api/cellular` | `area`, `userDensity`, `channelsPerCell`, `clusterSize` |

Successful calculation responses use this structure:

```json
{
  "success": true,
  "results": {},
  "explanation": "AI-generated explanation or predefined fallback text"
}
```

Exceptions caught inside the calculation handler return HTTP 400:

```json
{
  "success": false,
  "error": "Error details"
}
```

A Gemini exception is handled separately: the endpoint can still return `success: true` with numerical results and fallback text. Malformed JSON and other framework-level request errors may use Flask's own error response rather than the JSON structure above.

## Calculation Examples

These examples describe the formulas implemented in this repository. They are not a claim that every model is suitable for practical network planning.

### Wireless Communication System

Use `samplingRate = 8000`, `quantizationBits = 8`, and set the remaining four rate inputs to `1`.

The implementation multiplies each stage's output by the next input factor:

```text
samplerOutput        = samplingRate
quantizerOutput      = samplerOutput × quantizationBits
sourceEncoderOutput  = quantizerOutput × sourceCodingRate
channelEncoderOutput = sourceEncoderOutput × channelCodingRate
interleaverOutput    = channelEncoderOutput × interleavingRate
burstFormatterOutput = interleaverOutput × burstFormattingRate
```

Expected sampler output: **8,000 samples/s**. All subsequent outputs: **64,000 bits/s**. The rate inputs are implemented as multiplicative factors; the application does not model actual encoding or interleaving algorithms.

### OFDM System

Use `subcarriers = 64`, `bitsPerSymbol = 2`, `symbolDuration = 4`, and `parallelBlocks = 1`.

| JSON result | Expected value | Interpretation in the implementation |
|---|---:|---|
| `resourceElementRate` | 500000 | Bits/s per subcarrier |
| `symbolRate` | 32 | Aggregate data rate in Mbit/s, despite the field name |
| `resourceBlockRate` | 6000 | Rate for 12 subcarriers in kbit/s |
| `maxCapacity` | 0.032 | Aggregate capacity in Gbit/s including the parallel-block multiplier |
| `spectralEfficiency` | Approximately 33.3333 | Bits/s/Hz using the code's assumed bandwidth |

The implementation converts symbol duration from microseconds to seconds, assumes **12 subcarriers per resource block**, and calculates bandwidth as `subcarriers × 0.015 MHz` (15 kHz per subcarrier). These are fixed assumptions; cyclic-prefix, pilot, guard-band, and coding overheads are not included. Symbol duration and subcarrier spacing are not checked for physical consistency.

### Link Budget

| Input | Value |
|---|---:|
| `txPower` | 20 dBm |
| `txAntennaGain` | 2 dBi |
| `rxAntennaGain` | 2 dBi |
| `frequency` | 2400 MHz |
| `distance` | 1 km |

The backend converts frequency to GHz and applies:

```text
pathLoss = 20 × log10(distance_km) + 20 × log10(frequency_GHz) + 92.45
receivedPower = txPower + txAntennaGain + rxAntennaGain − pathLoss
```

Expected results:

```json
{
  "pathLoss": 100.05,
  "receivedPower": -76.05,
  "transmittedPower": 20
}
```

Path loss is in dB; transmit and received powers are in dBm. The model includes free-space path loss only, without cable losses, obstacles, fading, or receiver sensitivity. Frequency and distance must be positive for the logarithms.

### Cellular System Design

Use `area = 100`, `userDensity = 100`, `channelsPerCell = 20`, and `clusterSize = 7`.

```text
cellsNeeded = ceil(area × userDensity / (channelsPerCell × 50))
frequencyReuseFactor = 1 / clusterSize
systemCapacity = channelsPerCell × cellsNeeded / clusterSize
```

Expected results:

```json
{
  "cellsNeeded": 10,
  "frequencyReuseFactor": 0.14285714285714285,
  "systemCapacity": 28.571428571428573
}
```

The cell-count formula uses a fixed factor of **50 users per channel**. The capacity formula additionally divides by cluster size despite the input label `Channels per Cell`. Treat these outputs as simplified educational estimates, not a validated traffic-capacity or radio-coverage design.

## Troubleshooting

| Symptom | What to check |
|---|---|
| `Failed to fetch` | Start Flask, keep its terminal open, and confirm that port 5000 is reachable from the browser. |
| `Missing GEMINI_API_KEY in environment or .env file` | Configure the key before starting the backend. |
| `Default Explanation (AI offline)` | Calculations completed, but the Gemini request failed; inspect the included error for the cause. This text is predefined, not AI-generated. |
| Gemini quota error / HTTP 429 from Google | Check the API project's quota and availability. Reinstalling Python dependencies does not change the project's quota. |
| `npm.ps1 cannot be loaded` | Use `npm.cmd` in PowerShell, as shown above. |
| Calculation error | Fill every field with suitable numeric values; use integer values for quantization bits, subcarriers, bits per symbol, parallel blocks, channels per cell, and cluster size. Avoid zero divisors. |

## Frontend Commands

Run from `frontend`:

```powershell
npm.cmd start
npm.cmd run build
npm.cmd test
```

`build` creates the frontend's production bundle in `frontend/build`; it does not deploy Flask or replace the hardcoded localhost API URLs.

The included `App.test.js` is an unchanged Create React App test looking for a “learn react” link that is absent from the current interface. It is not a valid verification of this application's current behavior. No backend test suite is included in the supplied archive.

## Current Scope

- An educational project demonstrating React forms, Flask APIs, engineering calculations, and Gemini integration.
- Results are displayed as JSON; the current interface does not annotate each output with its unit.
- Input validation is limited and does not enforce all engineering constraints.
- Gemini explanations require separate service availability. Recent local testing returned a quota error, so live AI generation is not currently verified.
- The backend runs with Flask debug mode enabled and unrestricted Flask-CORS defaults.
- No authentication, saved calculation history, or database integration is implemented.
- The included `Procfile` specifies `gunicorn app:app`, but Gunicorn is not listed in either supplied requirements file. This alone is not a complete deployment configuration.
- Production deployment requires configuration changes, dependency review, and validation of the calculation assumptions.

## Credentials

Keep API keys in a local environment or `.env` file, never in public source control. The root `.gitignore` contains `.env`, but an ignore rule does not remove an already tracked file. If a real key was committed or shared, revoke or rotate it and remove the tracked credential file before publishing.

## Author

**Johny Bajjali**  
[GitHub](https://github.com/JohnyBajjali)
