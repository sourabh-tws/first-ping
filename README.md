# Cold Email Generator for Freelancers

A web application that generates 3 ready-to-send cold emails based on user input: business type, offered service, and tone of voice.

## 🎯 Problem Statement

Freelancers and agencies often struggle to write high-converting cold emails. Most templates are generic or time-consuming to customize. This app helps them generate personalized email variations instantly using AI.

## 🧑 Target Users

- Freelancers (copywriters, designers, developers)
- Agencies (marketing, design, development)
- Virtual Assistants doing outreach
- Cold email beginners

## 🛠 Features

### MVP Scope
- **Business Type Input**: Choose from 20+ high-earning business types
- **Service Input**: Select from 24+ top-earning services in the industry
- **Tone Selection**: Pick from 8 different email tones
- **AI-Generated Emails**: Get 3 unique email variations with subject lines and bodies (100-120 words)
- **Copy to Clipboard**: Easy one-click copying of generated emails
- **Responsive Design**: Works perfectly on mobile and desktop
- **Form Validation**: Ensures all fields are filled before submission
- **Loading States**: Shows spinner while generating emails

## 🔧 Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **AI Model**: Google Gemini Pro API
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cold-email-generator
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Get your API key from: https://makersuite.google.com/app/apikey

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   Server will run on http://localhost:12001

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```
   Client will run on http://localhost:12000

3. **Open your browser**
   Navigate to http://localhost:12000

## 📁 Project Structure

```
cold-email-generator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── index.tsx      # Entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Express backend
│   ├── index.js          # Main server file
│   ├── .env.example      # Environment variables template
│   └── package.json      # Backend dependencies
└── README.md             # This file
```

## 🔐 API Endpoints

### GET `/api/business-types`
Returns array of available business types

### GET `/api/services`
Returns array of available services

### GET `/api/tones`
Returns array of available tones

### POST `/api/generate`
Generates cold emails based on input
- **Body**: `{ businessType, service, tone }`
- **Response**: `{ emails: [{ subject, body }, ...] }`

### GET `/api/health`
Health check endpoint

## 🎨 UI Features

- **Clean, minimal design** with gradient background
- **Responsive layout** that works on all devices
- **Form with autocomplete** for business types and services
- **Loading spinner** during email generation
- **Toast notifications** for user feedback
- **Copy to clipboard** functionality
- **Email cards** with clear subject/body separation

## 🧪 Demo Mode

The application works without a Gemini API key by using mock data. This allows you to test the functionality before setting up the AI integration.

## 💰 Future Monetization Ideas (V2)

- Offer basic tool free, upsell full email sequences
- Premium email packs behind paywall
- Email export/download feature behind email capture
- Outreach dashboard with stats
- Integration with email platforms

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set start command: `npm start`
3. Add environment variables (GEMINI_API_KEY)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.