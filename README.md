# Veylora — AI Escape Room 🗝️

**Explore the room. Discover hidden clues. Solve the puzzles. Escape before time runs out.**

Veylora is an AI-powered escape room game that combines an interactive 3D environment, puzzle-solving mechanics, a countdown timer, and a Retrieval-Augmented Generation (RAG) based AI Game Master. Players investigate objects, connect clues, unlock hidden compartments, and work toward escaping a mysterious abandoned study.

The AI Game Master provides contextual hints to help players progress without immediately revealing puzzle solutions.
## Screenshots

<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/d99771db-7379-4dab-ae9b-442cdc0907db" />

<img width="959" height="412" alt="2" src="https://github.com/user-attachments/assets/68a40b3d-276e-4b18-9970-a2bb3d75cc05" />

<img width="959" height="410" alt="3" src="https://github.com/user-attachments/assets/f032c14b-ef73-43ab-8313-a4a3d14d63ca" />

## ✨ Features

- **Interactive 3D Escape Room** — Explore an immersive, animated room and interact with objects.
- **Puzzle-Solving Gameplay** — Discover clues, connect information, and unlock objects to progress.
- **Countdown Timer** — Race against a 30-minute time limit.
- **AI Game Master** — Ask for contextual hints when you get stuck.
- **Retrieval-Augmented Generation (RAG)** — Retrieve relevant information from the game's knowledge base to ground AI-generated hints in the room's lore.
- **Progressive Hints** — Request hints at different levels to control how much assistance you receive.
- **Game Session Management** — Track game state, puzzle progress, and session events through the backend.
- **Authentication** — Support for account-based authentication and Google sign-in configuration.
- **Persistent Storage** — Store game session data and events in MongoDB Atlas.
- **Full-Stack Architecture** — A Next.js frontend communicates with a FastAPI backend through REST APIs.
- **Cloud Deployment** — Frontend and backend are deployed separately, with MongoDB Atlas providing cloud database storage.

## 🎮 Gameplay

The current game scenario is an abandoned study filled with hidden clues and locked objects.

1. **Investigate the grandfather clock** to discover a time-related clue.
2. **Read the diary** to find additional information.
3. **Unlock the drawer** by connecting the clues and entering the correct code.
4. **Collect the small key** hidden inside the drawer.
5. **Investigate the bookshelf** to discover a numerical sequence.
6. **Unlock the safe** using the sequence and the key.
7. **Collect the exit key** and unlock the exit door.
8. **Escape before the countdown reaches zero.**

The AI Game Master can provide contextual hints when a puzzle becomes difficult. Hints are intended to guide discovery rather than replace the puzzle-solving experience.

## 🧠 AI Game Master and RAG

Veylora integrates a Retrieval-Augmented Generation pipeline to provide game-related assistance.

Instead of relying only on a language model's general knowledge, the system retrieves relevant information from the game's knowledge base before generating a hint.

### RAG workflow

```text
Player asks for a hint
          |
          v
   FastAPI RAG endpoint
          |
          v
 Retrieve relevant game lore
          |
          v
 Build contextual prompt
          |
          v
 Generate hint using Gemini
          |
          v
 Return hint to the frontend
          |
          v
 Display hint in the game UI
```

### RAG components

- **Knowledge Base:** Game lore, room information, object descriptions, and puzzle-related knowledge.
- **Retrieval:** Lightweight keyword-based retrieval identifies relevant information from the knowledge base.
- **Generation:** Google's Gemini API generates a response using the retrieved context.
- **Hint Levels:** Players can request varying degrees of assistance.
- **Frontend Integration:** A floating Game Master interface allows players to request hints without leaving the 3D room.

The RAG functionality is designed to keep hints relevant to Veylora's game world. Its effectiveness depends on the quality of the retrieved context and the generated response.

## 🏗️ System Architecture

```text
                 PLAYER
                    |
                    v
        Next.js Frontend Application
                    |
          +---------+----------+
          |                    |
          v                    v
    3D Room Interface     Game Master UI
          |                    |
          +---------+----------+
                    |
                    v
             FastAPI Backend
                    |
          +---------+----------+
          |         |          |
          v         v          v
       Game API  Puzzle API  RAG / AI API
          |         |          |
          v         v          v
          MongoDB Atlas      Gemini API
```

### Frontend

The frontend is responsible for rendering the room, displaying the timer, collecting player interactions, presenting puzzle interfaces, and displaying AI-generated hints.

### Backend

The FastAPI backend manages game sessions, room interactions, puzzle-related operations, game events, and AI hint requests.

### Database

MongoDB Atlas stores persistent game-related information, including session data and events.

### AI service

The RAG component retrieves relevant game knowledge and uses the Gemini API to generate contextual hints.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling and UI | Tailwind CSS, Framer Motion, Lucide React |
| 3D Environment | React Three Fiber, Three.js, Drei |
| Backend | Python, FastAPI, Uvicorn |
| API Validation | Pydantic |
| Database | MongoDB Atlas, PyMongo |
| AI Integration | Google Gemini API |
| Retrieval | Custom keyword-based knowledge retrieval |
| Authentication | Backend authentication and Google OAuth integration |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## ⚙️ Getting Started

Follow these instructions to run Veylora locally.

### Prerequisites

Install the following:

- Node.js and npm
- Python 3.11 or another Python version supported by your backend dependencies
- Git
- A MongoDB Atlas account and database
- A Google Gemini API key
- Google OAuth credentials if using Google sign-in

### 1. Clone the repository

```bash
git clone https://github.com/Samruddhi192105/Veylora.git
cd Veylora
```

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` and configure the required environment variables.

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
MONGODB_DATABASE=veylora

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Replace the placeholders with your actual configuration. Use the Gemini model supported by your API key and project.

**Important:** The variable names above should match the configuration read by your current backend code. Never commit `.env` files, database credentials, OAuth secrets, or API keys.

### 3. Configure MongoDB Atlas

1. Create or select a MongoDB Atlas cluster.
2. Create a database user with a strong password.
3. Configure Network Access to allow connections from your development machine and deployed backend.
4. Copy the cluster's connection string into `MONGODB_URI`.
5. Set `MONGODB_DATABASE` to `veylora`, or to the database name configured in your application.

Keep database authentication enabled. For production, prefer restricting network access to trusted sources where practical.

### 4. Start the backend

From the `backend/` directory, run:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

- API base: `http://127.0.0.1:8000`
- Interactive Swagger documentation: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

Keep this terminal running.

### 5. Configure the frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Use the exact environment variable names referenced in your frontend source code. If Google sign-in is not configured, provide the appropriate OAuth client ID before testing that feature.

### 6. Start the frontend

From the `frontend/` directory, run:

```bash
npm run dev
```

Open the application at:

**http://localhost:3000**

The frontend requires the backend to be running and correctly configured to use the game's APIs, database, and AI hint service.

