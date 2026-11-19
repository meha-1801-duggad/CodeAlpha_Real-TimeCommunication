# NexusMeet 🚀
### Enterprise-Grade Real-Time Video Conferencing & Collaboration Platform

> 🌐 **Live Website Demo**: [https://meha-1801-duggad.github.io/CodeAlpha_Real-TimeCommunication/](https://meha-1801-duggad.github.io/CodeAlpha_Real-TimeCommunication/)  
> 📦 **GitHub Repository**: [https://github.com/meha-1801-duggad/CodeAlpha_Real-TimeCommunication](https://github.com/meha-1801-duggad/CodeAlpha_Real-TimeCommunication)

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-success?style=for-the-badge&logo=githubpages&logoColor=white)](https://meha-1801-duggad.github.io/CodeAlpha_Real-TimeCommunication/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-DTLS--SRTP-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**NexusMeet** is a modern, high-performance real-time video conferencing and interactive collaboration platform built from the ground up for Task 4. It combines multi-peer WebRTC mesh streaming, an interactive collaborative vector whiteboard, instant peer-to-peer (P2P) chunked file sharing, active speaker detection, and client-side meeting recording wrapped in a sleek, glassmorphic UI.

---

## 🌟 Feature Highlights

### 📹 1. Multi-User Video Calling & Dynamic Layouts
- **WebRTC Mesh Architecture**: Peer-to-peer media streaming using standard `RTCPeerConnection` with Google public STUN fallback servers (`stun:stun.l.google.com:19302`).
- **Dynamic Auto-Balanced Grid**: Seamlessly adapts from 1:1 calls to multi-user conferences with responsive tiling.
- **Spotlight Mode**: Pinned participants or active presenters automatically expand to center stage with a thumbnail filmstrip for other attendees.
- **Picture-in-Picture (PiP) & Fullscreen**: Multi-tasking support with native browser PiP mode and theater fullscreen mode.

### 🎙️ 2. Real-Time Audio Engine & Active Speaker Detection
- **AudioContext Waveform Analyzer**: Real-time RMS/Decibel microphone monitoring.
- **Glowing Active Speaker Borders**: Instant visual cues highlighting active speakers.
- **Synthesized UI Sound Engine**: Zero-asset audio synthesizer utilizing the Web Audio API for join chimes, departure tones, message notifications, and hand-raising alerts.

### 🖥️ 3. Seamless High-Definition Screen Sharing
- **Hardware-Accelerated Capture**: Instant display and window capture via HTML5 `getDisplayMedia`.
- **Dynamic Track Replacement**: Replaces video tracks on all active peer connections seamlessly (`sender.replaceTrack`) without interrupting the ongoing session.
- **Automatic Fallback**: Gracefully restores camera streams when screen sharing ends.

### 🎨 4. Collaborative Vector Whiteboard & Live Cursors
- **Multiplayer Vector Engine**: Freehand brush, semi-transparent highlighter, straight lines, directional arrows, rectangles, circles, and text annotations.
- **Real-Time Live Cursors**: Floating cursor indicators with participant names and avatars tracking user pointers in real time.
- **Full History & Export**: Multi-level Undo/Redo stack, canvas eraser, and one-click PNG export with dark theme backing.
- **Flexible Modes**: Toggle between split-view alongside video tiles or full-screen maximized canvas.

### 📁 5. Direct Peer-to-Peer File Sharing
- **WebRTC DataChannels**: Direct browser-to-browser chunked binary file transfer without intermediate server storage.
- **Rich Chat Cards**: File type detection (images, documents, archives), size formatting, image previews, and instant downloads.

### ⏺️ 6. Client-Side Meeting Recording
- **HTML5 MediaRecorder API**: One-click local composite session recording to `.webm` video with zero cloud storage overhead.
- **Live Recording HUD**: Blinking recording indicator and live session timer.

### 🛡️ 7. Security, Passcodes & End-to-End Encryption
- **Media Security**: Native WebRTC DTLS-SRTP encryption ensures that all video, audio, and DataChannel packets are end-to-end encrypted.
- **Room Protection**: Host-configured passcodes hashed with `bcryptjs` for confidential meetings.
- **Authentication**: JWT token verification with persistent sessions, password hashing, and instant guest join options.

### 🚪 8. Pre-Join Green Room (Lobby)
- Device testing lobby with live camera preview, microphone volume level meter, display name setup, and passcode verification before entering rooms.

---

## 🏛️ System Architecture

```
                    +---------------------------------------+
                    |             NexusMeet UI              |
                    |      (React 18 + TypeScript + Vite)   |
                    +---------------------------------------+
                        |               |               |
             WebSockets |        Media  |     Data      |  WebRTC
             (Signaling)|        Tracks |     Channels  |  (Direct P2P)
                        v               v               v
    +-----------------------+     +-------------------------------+
    |   Signaling Gateway   |     |    Remote Peer Connections    |
    | (Node.js + Socket.IO) |     |  - Video/Audio (DTLS-SRTP)    |
    |  - Room Management    |     |  - P2P File Sharing           |
    |  - Whiteboard Sync    |     |  - Real-time Cursor Tracking  |
    |  - Hand Raise Queue   |     +-------------------------------+
    |  - JWT Authentication |
    +-----------------------+
                |
                v
    +-----------------------+
    |  Persistent Database  |
    | (Users, Rooms, Audit) |
    +-----------------------+
```

---

## 📁 Project Directory Structure

```
Real-Time Communication App/
├── package.json                    # Root workspace orchestrator
├── README.md                       # Complete technical documentation
│
├── server/                         # Backend Service (Node.js + Express + Socket.IO)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── config/index.ts         # Server configuration & STUN servers
│   │   ├── controllers/            # Auth & Room controllers
│   │   ├── db/database.ts          # Persistent database engine
│   │   ├── middleware/auth.ts      # JWT authentication middleware
│   │   ├── sockets/webrtcHandler.ts# WebRTC signaling & real-time events
│   │   ├── types/index.ts          # Server TypeScript definitions
│   │   └── server.ts               # Server entry point & static SPA host
│   └── data/                       # Persistent JSON database storage
│
└── client/                         # Frontend Application (React + Vite + Tailwind)
    ├── index.html                  # HTML5 entry with Plus Jakarta Sans typography
    ├── package.json
    ├── vite.config.ts              # Vite proxy configuration
    ├── tailwind.config.js          # Custom theme, animations & glassmorphism
    ├── postcss.config.js
    └── src/
        ├── components/
        │   ├── auth/AuthModal.tsx          # Login, Register & Guest modal
        │   ├── chat/ChatPanel.tsx          # In-call chat & file sharing
        │   ├── lobby/LobbyView.tsx         # Pre-join Green Room
        │   ├── meeting/ControlsBar.tsx     # Meeting controls dock
        │   ├── meeting/ParticipantsPanel.tsx# Participant roster & invite link
        │   ├── meeting/VideoGrid.tsx       # Auto-balanced & spotlight layouts
        │   ├── meeting/VideoTile.tsx       # Video tile with active speaker glow
        │   ├── settings/SettingsModal.tsx  # Device selectors & hotkey guide
        │   └── whiteboard/WhiteboardPanel.tsx # Collaborative canvas & live cursors
        ├── context/
        │   ├── AuthContext.tsx             # Authentication context
        │   └── SocketContext.tsx           # WebSocket connection context
        ├── hooks/
        │   ├── useAudioAnalyzer.ts         # RMS volume meter & speaking detector
        │   ├── useMeetingRecorder.ts       # HTML5 MediaRecorder hook
        │   └── useWebRTC.ts                # WebRTC RTCPeerConnection manager
        ├── services/
        │   ├── api.ts                      # REST API client
        │   └── soundService.ts             # Web Audio API sound synthesizer
        ├── types/index.ts                  # Shared client TypeScript types
        ├── views/
        │   ├── HomeView.tsx                # SaaS dashboard & room creator
        │   └── MeetingRoom.tsx             # Meeting orchestrator
        ├── App.tsx                         # Router configuration
        ├── main.tsx                        # React application bootstrap
        └── index.css                       # Tailwind & custom keyframe animations
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

---

### Option 1: Development Mode (Live Hot Reloading)

Run both the backend signaling server and frontend Vite server concurrently with a single command:

```bash
# 1. Start both servers concurrently
npm run dev
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API & Signaling**: `http://localhost:5000`

---

### Option 2: Production Mode (Unified Single-Port Deployment)

Build both the client and server, then run everything from the unified Express server:

```bash
# 1. Build client and server
npm run build

# 2. Start production server
npm start
```

Open your browser to: **`http://localhost:5000`**

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>M</kbd> | Toggle Microphone (Mute / Unmute) |
| <kbd>V</kbd> | Toggle Camera (Start / Stop Video) |
| <kbd>D</kbd> | Toggle Screen Sharing |
| <kbd>H</kbd> | Toggle Hand Raise |

---

## 🧪 Testing Multi-User Video Calling Locally

1. Open your browser and navigate to `http://localhost:3000` (or `http://localhost:5000`).
2. Click **Start Instant Meeting** to create a room.
3. In the Green Room lobby, verify your camera preview and microphone volume meter, then click **Join Meeting Now**.
4. Copy the meeting invite link using the top header pill or the participants panel.
5. Open an **Incognito Window** (or a second browser like Edge, Chrome, or Firefox) and paste the link.
6. Enter a second guest name (e.g. "Jane Doe") and join.
7. Observe:
   - Real-time two-way WebRTC video & audio streaming.
   - Glowing speaker borders when talking.
   - Real-time collaborative whiteboard drawing and **live floating cursors**.
   - In-meeting chat messages and P2P file transfers.
   - Screen sharing and local meeting recording.

---

## 🔒 Security Specifications

- **WebRTC DTLS-SRTP**: Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP) are enforced by standard WebRTC protocol compliance, encrypting all audio, video, and DataChannel payloads.
- **Passcode Protection**: Room passcodes are encrypted using `bcryptjs` with salt rounds prior to verification.
- **JWT Authorization**: Authenticated API endpoints utilize cryptographically signed JSON Web Tokens (`HS256`).

---

## 📄 License
This project is licensed under the MIT License.
