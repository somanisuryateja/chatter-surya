# Chatter Frontend

A WhatsApp-like real-time chat application built with React, featuring voice and video calls.

## Features

- 💬 Real-time messaging
- 📞 Voice calls with WebRTC
- 📹 Video calls with WebRTC
- 🔔 Call ringtones
- 📊 Unread message counts
- 💌 Last message preview
- 🟢 Online status indicators
- 🎨 Beautiful dark theme UI
- 📱 Mobile responsive

## Tech Stack

- **Framework:** React 19
- **State Management:** Zustand
- **Styling:** Tailwind CSS + DaisyUI
- **Real-time:** Socket.io-client
- **WebRTC:** simple-peer
- **Build Tool:** Vite
- **Routing:** React Router

## Setup

1. Clone the repository
```bash
git clone https://github.com/somanisuryateja/chatter-surya.git
cd chatter-surya
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file for production (optional for development)
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

5. Run the development server
```bash
npm run dev
```

6. Build for production
```bash
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | For production |
| `VITE_SOCKET_URL` | Socket.io server URL | For production |

**Note:** In development, the app uses Vite proxy to connect to `localhost:5001`.

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatContainer.jsx
│   ├── ChatHeader.jsx
│   ├── MessageInput.jsx
│   ├── Sidebar.jsx
│   ├── IncomingCallModal.jsx
│   ├── ActiveCallInterface.jsx
│   └── ...
├── pages/              # Page components
├── store/              # Zustand stores
│   ├── useAuthStore.js
│   ├── useChatStore.js
│   └── useCallStore.js
├── lib/                # Utilities
│   ├── axios.js
│   └── utils.js
└── App.jsx
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `VITE_API_URL` = your backend URL
   - `VITE_SOCKET_URL` = your backend URL
4. Deploy

### Netlify
1. Push code to GitHub
2. Create new site in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Manual Deployment
```bash
npm run build
# Upload contents of `dist` folder to your hosting
```

## Backend

This frontend requires the Chatter Backend to function.
Get it here: https://github.com/somanisuryateja/chattter-backend

## Screenshots

Coming soon...

## License

MIT
