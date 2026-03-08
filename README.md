# Event of Cyber Workshop Lab  
```
This site is an interactive cyber-themed challenge created for the Event of Cyber Workshop. It features a terminal-style landing page, a hidden discovery path, an authentication challenge, and a final access screen with celebratory visual effects. The interface showcases a futuristic dashboard design, animated system panels, and guided mission-style prompts to provide a hands-on, immersive cybersecurity learning experience.
```
## Structure

- `frontend/` : UI pages and static assets
- `backend/` : Node.js auth API
- `wordlist.txt` : challenge wordlist

## Environment Files

- `frontend/.env`
  - `BACKEND_URL`
- `backend/.env`
  - `FRONTEND_URL`
  - `USERNAME`
  - `USER_PASSWORD`

## Local Run

Run frontend:

```powershell
cp frontend/.env.example frontend/.env
node frontend/server.js
```

Run backend:

```powershell
cp backend/.env.example backend/.env
node backend/server.js
```
