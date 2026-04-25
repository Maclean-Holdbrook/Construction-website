# Construction Website Frontend

Frontend app prepared for Vercel deployment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set the frontend environment variable:
```env
VITE_API_BASE_URL=https://your-backend-project.vercel.app
```

3. Start development:
```bash
npm run dev
```

## Deploy

Deploy this repo to Vercel as a frontend project with:

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Do not add an `api/` proxy in this repo. The frontend should call the backend directly through `VITE_API_BASE_URL`.
