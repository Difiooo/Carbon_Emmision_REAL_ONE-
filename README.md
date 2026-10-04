# Carbon Emission Dashboard (v2)

The server uses Node.js built-in HTTP and stores activities in `server/data/activities.json`; it has no native database dependency.

## Run locally

From this folder (the one containing this `package.json`):

1. Run `npm install` once.
2. In one terminal run `npm start` to start the API at `http://localhost:5000`.
3. In a second terminal run `npm run dev` to start the dashboard. Open the Vite URL it prints, usually `http://localhost:5173`.

Check the API at `http://localhost:5000/api/health`.

## Publish a public demo with Render

Push this project folder (the one containing the root `package.json`) to a GitHub repository. Do not push `node_modules`.

### 1. Deploy the API

In Render, create a **Web Service** connected to the repository and set:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

After deployment, copy the service URL, such as `https://your-api.onrender.com`.

### 2. Deploy the dashboard

Create a **Static Site** connected to the same repository and set:

- Root Directory: `ecotrack`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL` = the API service URL copied above (include `https://`, do not add `/api/activities`)

Deploy the site and use its public URL to share the dashboard. The frontend reads `VITE_API_URL` at build time.

### Demo data note

The API stores activities in a JSON file. On hosting with an ephemeral filesystem, saved activities can reset when the service restarts or redeploys. Use persistent storage or a hosted database if you need records to survive those events.
