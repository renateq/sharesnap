# Sharesnap

![Sharesnap](./docs/assets/banner.svg)

Sharesnap provides a simple and fast way to send images from your phone to your desktop through a web application, powered by [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and [WebRTC](https://webrtc.org/).

## Overview

This project is organized as a monorepo with two packages:

- **`app`** – a [Next.js](https://nextjs.org/) application (frontend)
- **`server`** – a [Go](https://go.dev/) WebSocket server, used as a signaling server for establishing WebRTC connection

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Go](https://go.dev/) >= 1.20
- npm >= 9

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/renateq/sharesnap.git
cd sharesnap
```

### 2. Install dependencies

The following command runs a custom script (`scripts/install-all.js`) which installs root, app, and server dependencies.

```sh
npm run install:all
```

### 3. Run the development servers

From the root directory, start both `app` and `server`:

```sh
npm run dev
```

You can also start individual servers:

```sh
# to start Next.js server
npm run dev:app

# to start the Go server
npm run dev:server
```
