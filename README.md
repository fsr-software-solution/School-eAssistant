# School-eAssistant

School-eAssistant is a full-stack educational assistant platform with a Node.js/Express backend, a React/Vite web frontend, and an Expo mobile application. It is built to support AI-powered study assistance, content management, learning progress tracking, premium subscriptions, and resource administration.

## Key Features

- AI-assisted learning and chat interactions
- PDF parsing and OCR support (Tesseract + pdf-parse)
- Multi-source knowledge base: books, sections, units, quizzes, references, resources
- User authentication and admin controls with JWT
- Payment account handling and premium plan support
- Student progress tracking and quiz management
- Soft delete / hard delete restore workflow for data recovery
- Cloud media uploads via Cloudinary
- Vercel-compatible backend deployment

## Repository Structure

- `backend/` - Express API server, MongoDB models, AI services, authentication, payment and admin controllers
- `front-web/` - React web interface built with Vite
- `mobile-app/` - Expo React Native mobile app for Android/iOS/web

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, LangChain, Google GenAI, Tesseract, Cloudinary
- Web frontend: React, Vite, React Router DOM, Axios
- Mobile frontend: Expo, React Native, React Navigation, React Query

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance or Atlas cluster
- Cloudinary account for uploads
- Google API credentials for AI and translation features
- Expo CLI for mobile development (`npm install -g expo-cli`)

### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file using `example.env` as a template.

```bash
cp example.env .env
```

4. Update the `.env` values with your own API keys, MongoDB URI, Cloudinary credentials, and JWT secrets.

5. Run the backend in development mode:

```bash
npm run dev
```

### Web Frontend Setup

1. Navigate to the web frontend folder:

```bash
cd ../front-web
```

2. Install dependencies:

```bash
npm install
```

3. Start the web app:

```bash
npm run dev
```

### Mobile App Setup

1. Navigate to the mobile app folder:

```bash
cd ../mobile-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the Expo app:

```bash
npm start
```

## Environment Configuration

The backend uses environment variables to configure database and external services. Important variables include:

- `GOOGLE_API_KEY`
- `GROQ_API_KEY`
- `MONGO_URI`
- `MISTRAL_API_KEY`
- `MONGODB_ATLAS_URI`
- `MONGODB_ATLAS_DB_NAME`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `INITIAL_ADMIN_USERNAME`
- `INITIAL_ADMIN_PASSWORD`

> Do not commit real API keys or credentials to source control.

## Deployment

The backend includes `vercel.json` for deployment on Vercel. It is configured to use `api/index.js` as the serverless entrypoint and support CORS for frontend communication.

## Useful Scripts

- Backend
  - `npm run start` - run backend server
  - `npm run dev` - run backend server with nodemon
- Web frontend
  - `npm run dev` - start Vite development server
  - `npm run build` - build production assets
  - `npm run preview` - preview production build
- Mobile app
  - `npm start` - start Expo
  - `npm run android` - open Android emulator/device
  - `npm run ios` - open iOS simulator/device
  - `npm run web` - open web version

## Notes

- This project uses a modular backend architecture with separate controllers, middleware, and utilities for authentication, AI services, file uploads, and payment flows.
- The web and mobile apps share the same API surface and can be extended independently.
- The `backend/example.env` file contains placeholder names and should be customized before running locally.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Open a pull request with a clear description

## License

This project does not specify a license in the root repository. Add a `LICENSE` file if you want to make the project open source.
