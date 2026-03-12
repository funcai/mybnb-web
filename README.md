# mybnb frontend

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

## Running locally

The frontend now talks to `mybnb-agent`, not RunPod directly.

Production builds are pinned to:

```sh
VITE_AGENT_BASE_URL=https://api.42eyes.com/api
```

If the agent is served from the same origin, no extra frontend environment is required.

If the agent is running on a different origin during local development, create a `.env` file in the project root and set:

```sh
VITE_AGENT_BASE_URL=http://localhost:8080/api
```

On startup the app calls `POST /api/boot`, and searches use:

- `POST /api/requests`
- `GET /api/requests/{requestId}` via SSE
