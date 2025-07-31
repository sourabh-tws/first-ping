# FirstPing: Advanced Cold Email Generator for Freelancers

A web application that generates highly personalized cold emails based on:
1. Target type (business or individual via LinkedIn)
2. Offered service
3. Tone of voice
4. Recent company news and events

## 🎯 Problem Statement

Freelancers and agencies often struggle to write high-converting cold emails. Most templates are generic or time-consuming to customize. This app helps them generate personalized email variations instantly using AI.

## 🧑 Target Users

- Freelancers (copywriters, designers, developers)
- Agencies (marketing, design, development)
- Virtual Assistants doing outreach
- Cold email beginners

## 🛠 Features

### Core Features
- **Dual Targeting Modes**: 
  - **Business targeting**: Choose from 20+ high-earning business types
  - **Individual targeting**: Generate hyper-personalized emails using LinkedIn profile data
- **Service Input**: Select from 24+ top-earning services in the industry
- **Tone Selection**: Pick from 8 different email tones
- **AI-Generated Emails**: Get 3 unique email variations with subject lines and bodies (100-120 words)
- **Copy to Clipboard**: Easy one-click copying of generated emails
- **Responsive Design**: Works perfectly on mobile and desktop
- **Form Validation**: Ensures all fields are filled before submission
- **Loading States**: Shows spinner while generating emails

### Advanced Personalization
- **LinkedIn Profile Integration**: Extract professional details to create highly personalized emails
- **News & Events Integration**: Incorporate recent company news for timely, relevant outreach
- **Personalized Subject Lines**: Generate attention-grabbing subject lines based on target data
- **Role-Specific Value Props**: Tailor value propositions to the recipient's specific role and industry

## 🔧 Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **AI Model**: Google Gemini Pro API
- **Data Sources**:
  - ScrapingDog API (LinkedIn profiles)
  - News API (company news)
- **Styling**: TailwindCSS
- **Components**:
  - React Toggle (targeting mode switch)
  - Lucide React (icons)
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **Caching**: Node-Cache (API response caching)

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
   
   Edit `.env` and add your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   SCRAPING_DOG_API_KEY=your_scrapingdog_api_key_here
   NEWS_API_KEY=your_news_api_key_here
   ```

   Get your API keys from:
   - Google Gemini API: https://makersuite.google.com/app/apikey
   - ScrapingDog API: https://www.scrapingdog.com/
   - News API: https://newsapi.org/

   Note: The application will work with mock data if API keys are not provided.

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
- **Body**: `{ targetType, businessType, service, tone, linkedinUrl }`
- **Response**: `{ emails: [{ subject, body }, ...] }`

### POST `/api/linkedin-profile`
Fetches LinkedIn profile data
- **Body**: `{ linkedinUrl }`
- **Response**: `{ profile: { name, headline, company, about, recent_posts } }`

### GET `/api/company-news/:companyName`
Fetches recent news about a company
- **Response**: `{ news: [{ title, description, url, publishedAt }, ...] }`

### GET `/api/health`
Health check endpoint

## 🎨 UI Features

- **Clean, minimal design** with gradient background
- **Responsive layout** that works on all devices
- **Target type toggle** to switch between business and individual targeting
- **LinkedIn profile preview** showing extracted data
- **Company news display** showing recent news items
- **Form with autocomplete** for business types and services
- **Loading spinners** during profile fetching and email generation
- **Toast notifications** for user feedback
- **Copy to clipboard** functionality
- **Email cards** with clear subject/body separation

## 🧪 Demo Mode

The application works without API keys by using mock data:
- Without a Gemini API key: Uses pre-defined email templates
- Without a ScrapingDog API key: Uses mock LinkedIn profile data
- Without a News API key: Uses mock company news

This allows you to test all functionality before setting up the API integrations.

## 💰 Monetization Strategy

### Free Tier
- Business targeting with limited personalization
- Up to 10 emails per day
- Basic templates only

### Premium Tier ($19/month)
- LinkedIn profile targeting with deep personalization
- Company news integration
- Unlimited emails
- Advanced templates and tones
- Email sequence generation (initial + follow-ups)
- Export to CSV/PDF

### Enterprise Tier ($49/month)
- Team collaboration features
- Custom templates library
- API access for integration
- Outreach dashboard with analytics
- Integration with email platforms
- Priority support

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