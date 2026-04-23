# Hirewise 🎯

**AI-powered Resume + Job Description Matcher for Indian Job Seekers**

Built with React, FastAPI, MongoDB Atlas, and Google Gemini Flash.

---

## Features

- 📊 **ATS Match Score** (0–100%) with animated circular display
- 🔍 **Skill Gap Analysis** — matched vs. missing skills
- ✍️ **Bullet Point Rewrites** — AI improves weak bullets with metrics
- 📬 **Cover Letter Generator** — tailored to the specific JD
- 📂 **Session History** — all analyses saved per user
- 🔐 **JWT Auth** — httpOnly cookie-based with refresh token rotation
- 🌙 **Dark Theme** — clean, editorial design

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (free at https://aistudio.google.com)

---

## Setup

### 1. Clone the repository

```
git clone https://github.com/yourusername/hirewise.git
cd hirewise
```

### 2. Backend Setup

```
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit backend/.env:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hirewise?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GEMINI_API_KEY=your-gemini-api-key-from-aistudio
ALLOWED_ORIGINS=http://localhost:5173
```

Start the backend:

```
python main.py
# Or: uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000
API docs at http://localhost:8000/docs

### 3. Frontend Setup

```
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit frontend/.env:

```
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```
npm run dev
```

The app will be available at http://localhost:5173

---

## MongoDB Setup

1. Create a free MongoDB Atlas cluster at https://cloud.mongodb.com
2. Create a database user with read/write permissions
3. Whitelist your IP (or use 0.0.0.0/0 for development)
4. Get the connection string and add to `.env`

The app auto-creates these collections with indexes:

- `users` (unique index on `email`)
- `analyses` (index on `user_id`)
- `refresh_tokens` (TTL index, auto-expires)

---

## Project Structure

```
hirewise/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── db.py                # MongoDB connection
│   ├── auth_utils.py        # JWT helpers, password hashing
│   ├── routes/
│   │   ├── auth.py          # Register, login, refresh, logout
│   │   └── analyze.py       # PDF upload, analysis, history CRUD
│   ├── models/
│   │   ├── user.py          # Pydantic models for auth
│   │   └── analysis.py      # Pydantic models for analysis
│   ├── services/
│   │   ├── gemini.py        # Gemini API wrapper
│   │   └── pdf_parser.py    # PyMuPDF text extraction
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/           # Landing, Login, Register, Dashboard, Results, History
        ├── components/      # Navbar, ScoreRing, SkillBadge, BulletCard, etc.
        ├── hooks/           # useAuth, useToast
        ├── context/         # AuthContext
        └── api/             # Axios client with interceptors
```

---

## API Reference

### Auth

| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| POST   | /auth/register | Create account       |
| POST   | /auth/login    | Login                |
| POST   | /auth/refresh  | Rotate tokens        |
| POST   | /auth/logout   | Invalidate tokens    |
| GET    | /auth/me       | Get current user     |

### Analysis

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| POST   | /analyze         | Upload resume + JD, get analysis     |
| GET    | /history         | List user's analyses                 |
| GET    | /history/{id}    | Get single analysis                  |
| DELETE | /history/{id}    | Delete analysis                      |

---

## Deployment Notes

### Backend (e.g., Railway, Render, Fly.io)

- Set all `.env` variables as environment secrets
- Set `ALLOWED_ORIGINS` to your frontend domain
- Set `secure=True` on cookies (HTTPS)

### Frontend (e.g., Vercel, Netlify)

- Set `VITE_API_BASE_URL` to your backend URL
- Enable CORS headers on backend for your domain

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|--------------------------------------------------|
| Frontend     | React 18, Vite, TailwindCSS, React Router v6     |
| Forms        | React Hook Form + Zod                            |
| HTTP         | Axios with interceptors                          |
| Backend      | FastAPI, Python 3.10+                            |
| Database     | MongoDB Atlas via PyMongo                        |
| AI           | Google Gemini Flash                          |
| PDF Parsing  | PyMuPDF (fitz)                                   |
| Auth         | JWT (python-jose) + bcrypt                       |

---

## License

Apache-2.0

---