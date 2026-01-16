# WhatsApp Clone - Frontend

React-based frontend for the WhatsApp Clone messaging application.

## Features

- 🔐 User Authentication (Login/Register)
- 💬 Real-time messaging interface
- 📋 Chat list with last messages
- ✏️ Message editing (within 5 minutes)
- 🗑️ Message deletion (within 5 minutes)
- ✅ Read receipts
- 👥 Contact management
- 📄 Pagination for message history
- 🎨 Beautiful WhatsApp-like UI

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ChatList.jsx     # Chat list sidebar
│   │   ├── ContactModal.jsx # Add new contact modal
│   │   ├── MessageArea.jsx  # Message display area
│   │   └── MessageInput.jsx # Message input component
│   ├── pages/               # Page components
│   │   ├── Chat.jsx         # Main chat page
│   │   ├── Login.jsx        # Login page
│   │   └── Register.jsx     # Registration page
│   ├── services/            # API services
│   │   └── api.js           # Axios configuration and API functions
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## API Configuration

The frontend is configured to communicate with the backend API at `http://localhost:3000/api/v1`.

All API calls use cookies for authentication (withCredentials: true).

## Key Components

### Chat.jsx
Main chat page that manages:
- Chat list state
- Selected chat
- Messages
- Contact modal

### ChatList.jsx
Displays the list of conversations with:
- Last message preview
- Timestamp
- Unread indicators

### MessageArea.jsx
Message display area with:
- Message bubbles (sent/received)
- Date dividers
- Read receipts
- Edit functionality

### MessageInput.jsx
Input component for sending/editing messages with:
- Auto-resizing textarea
- Enter to send
- Edit mode support

### ContactModal.jsx
Modal for adding new contacts with:
- Email or name search
- Custom display name

## Styling

The application uses CSS modules and follows WhatsApp's design patterns:
- Green accent color (#25d366)
- Light gray backgrounds
- Rounded message bubbles
- Clean, modern interface

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
