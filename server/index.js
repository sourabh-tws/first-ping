const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 12001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI (with fallback for demo)
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Business types data
const businessTypes = [
  'eCommerce Store',
  'SaaS Company',
  'Coaching Business',
  'Local Business',
  'Real Estate Agency',
  'Healthcare Practice',
  'Restaurant/Food Service',
  'Fitness/Gym',
  'Beauty/Salon',
  'Consulting Firm',
  'Law Firm',
  'Accounting Firm',
  'Digital Marketing Agency',
  'Construction Company',
  'Manufacturing Business',
  'Retail Store',
  'Online Course Creator',
  'Freelance Service Provider',
  'Tech Startup',
  'Financial Services'
];

// Services data
const services = [
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'SEO Services',
  'Content Writing',
  'Copywriting',
  'Email Marketing',
  'Social Media Management',
  'PPC Advertising',
  'Video Production',
  'Photography',
  'Branding & Logo Design',
  'WordPress Development',
  'E-commerce Development',
  'Data Analytics',
  'Virtual Assistant Services',
  'Lead Generation',
  'Sales Funnel Creation',
  'Conversion Rate Optimization',
  'Marketing Automation',
  'Business Consulting',
  'Project Management'
];

// Tone options
const tones = [
  'Professional',
  'Friendly',
  'Casual',
  'Formal',
  'Conversational',
  'Confident',
  'Helpful',
  'Direct'
];

// Mock email generation function (fallback when no API key)
const generateMockEmails = (businessType, service, tone) => {
  const mockEmails = [
    {
      subject: `Boost Your ${businessType} Revenue with Expert ${service}`,
      body: `Hi there,\n\nI noticed your ${businessType.toLowerCase()} and was impressed by your approach. I specialize in ${service.toLowerCase()} and have helped similar businesses increase their revenue by 30-50%.\n\nI'd love to share a quick case study of how I helped a client in your industry. Would you be open to a brief 15-minute call this week?\n\nBest regards,\n[Your Name]`
    },
    {
      subject: `Quick Question About Your ${businessType} Growth`,
      body: `Hello,\n\nI've been following your ${businessType.toLowerCase()} and love what you're doing. I'm curious - are you currently satisfied with your ${service.toLowerCase()} results?\n\nI've been helping businesses like yours achieve better outcomes, and I have some ideas that might interest you. Would you be open to a quick chat?\n\nLooking forward to hearing from you,\n[Your Name]`
    },
    {
      subject: `Free ${service} Audit for Your ${businessType}`,
      body: `Hi,\n\nI hope this email finds you well. I'm reaching out because I believe your ${businessType.toLowerCase()} has great potential for growth.\n\nI'm offering a complimentary ${service.toLowerCase()} audit to a select few businesses this month. This usually costs $500, but I'd like to offer it free to see if we'd be a good fit to work together.\n\nInterested?\n\nBest,\n[Your Name]`
    }
  ];

  return mockEmails;
};

// Generate emails using Gemini AI
const generateEmailsWithAI = async (businessType, service, tone) => {
  try {
    console.log(`Generating emails for - ${businessType}, ${service}, ${tone}`)
    const prompt = `Generate 3 different cold email variations for a freelancer offering ${service} to a ${businessType}. 
    
    Requirements:
    - Tone: ${tone}
    - Each email should have a compelling subject line
    - Body should be 100-120 words
    - Focus on value proposition and results
    - Include a clear call-to-action
    - Make them feel personalized and not generic
    - Avoid being too salesy
    
    Format the response as a JSON array with objects containing 'subject' and 'body' fields.
    
    Example format:
    [
      {
        "subject": "Subject line here",
        "body": "Email body here..."
      }
    ]`;

    const result = await genAI.models.generateContent({
      contents: prompt,
      model: 'gemini-2.5-flash-lite'
    });
    const text = result.text;
    console.log('Emails generation Success!!')

    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('Failed to parse AI response as JSON, using mock data');
    }

    // Fallback to mock if parsing fails
    return generateMockEmails(businessType, service, tone);

  } catch (error) {
    console.error('Error generating emails with AI:', error);
    return generateMockEmails(businessType, service, tone);
  }
};

// Routes
app.get('/api/business-types', (req, res) => {
  res.json(businessTypes);
});

app.get('/api/services', (req, res) => {
  res.json(services);
});

app.get('/api/tones', (req, res) => {
  res.json(tones);
});

app.post('/api/generate', async (req, res) => {
  try {
    const { businessType, service, tone } = req.body;

    // Validation
    if (!businessType || !service || !tone) {
      return res.status(400).json({
        error: 'Missing required fields: businessType, service, and tone are required'
      });
    }

    let emails;

    if (genAI && process.env.GEMINI_API_KEY) {
      emails = await generateEmailsWithAI(businessType, service, tone);
    } else {
      // Use mock data when no API key is available
      emails = generateMockEmails(businessType, service, tone);
    }

    res.json({ emails });

  } catch (error) {
    console.error('Error generating emails:', error);
    res.status(500).json({
      error: 'Failed to generate emails. Please try again.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cold Email Generator API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  No GEMINI_API_KEY found. Using mock data for email generation.');
    console.log('   Add GEMINI_API_KEY to .env file for AI-powered email generation.');
  }
});