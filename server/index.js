const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 12001;

// Cache for API responses (TTL: 1 hour)
const apiCache = new NodeCache({ stdTTL: 3600 });

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
const generateEmailsWithAI = async (data) => {
  try {
    const { 
      targetType, 
      businessType, 
      service, 
      tone, 
      linkedinProfile, 
      companyNews 
    } = data;
    
    console.log(`Generating emails for ${targetType} - ${businessType || (linkedinProfile ? linkedinProfile.name : 'Unknown')}, ${service}, ${tone}`);
    
    let prompt;
    
    if (targetType === 'individual' && linkedinProfile) {
      // Generate prompt for individual targeting with LinkedIn data
      const newsContext = companyNews && companyNews.length > 0 
        ? `\nRecent company news:\n${companyNews.map(news => `- ${news.title}: ${news.description}`).join('\n')}`
        : '';
        
      prompt = `Generate 3 different highly personalized cold email variations for a freelancer offering ${service} to an individual person.

      Person's Information:
      - Name: ${linkedinProfile.name}
      - Job Title: ${linkedinProfile.headline}
      - Company: ${linkedinProfile.company}
      - About: ${linkedinProfile.about}
      - Recent LinkedIn Activity: ${linkedinProfile.recent_posts.join(' | ')}${newsContext}
      
      Requirements:
      - Tone: ${tone}
      - Each email should have a compelling subject line
      - Body should be 100-120 words
      - Reference specific details from their profile or company news to show you've done your research
      - Focus on value proposition and results relevant to their role and company
      - Include a clear call-to-action
      - Make them feel genuinely personalized, not generic
      - Avoid being too salesy
      
      Format the response as a JSON array with objects containing 'subject' and 'body' fields.
      
      Example format:
      [
        {
          "subject": "Subject line here",
          "body": "Email body here..."
        }
      ]`;
    } else {
      // Generate prompt for business targeting
      const newsContext = companyNews && companyNews.length > 0 
        ? `\nIncorporate these recent news items about this type of business:\n${companyNews.map(news => `- ${news.title}: ${news.description}`).join('\n')}`
        : '';
        
      prompt = `Generate 3 different cold email variations for a freelancer offering ${service} to a ${businessType}.
      
      Requirements:
      - Tone: ${tone}
      - Each email should have a compelling subject line
      - Body should be 100-120 words
      - Focus on value proposition and results
      - Include a clear call-to-action
      - Make them feel personalized and not generic
      - Avoid being too salesy${newsContext}
      
      Format the response as a JSON array with objects containing 'subject' and 'body' fields.
      
      Example format:
      [
        {
          "subject": "Subject line here",
          "body": "Email body here..."
        }
      ]`;
    }

    const result = await genAI.models.generateContent({
      contents: prompt,
      model: 'gemini-2.5-flash-lite'
    });
    const text = result.text;
    console.log('Emails generation Success!!');

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
    if (targetType === 'individual' && linkedinProfile) {
      return generateMockIndividualEmails(linkedinProfile, service, tone);
    } else {
      return generateMockEmails(businessType, service, tone);
    }

  } catch (error) {
    console.error('Error generating emails with AI:', error);
    
    if (data.targetType === 'individual' && data.linkedinProfile) {
      return generateMockIndividualEmails(data.linkedinProfile, data.service, data.tone);
    } else {
      return generateMockEmails(data.businessType, data.service, data.tone);
    }
  }
};

// Mock email generation for individual targeting
const generateMockIndividualEmails = (profile, service, tone) => {
  const { name, headline, company } = profile;
  const firstName = name.split(' ')[0];
  
  const mockEmails = [
    {
      subject: `${firstName}, could ${service} help ${company} with its growth?`,
      body: `Hi ${firstName},\n\nI noticed your role as ${headline} and was impressed by your background. Given your position at ${company}, I thought you might be interested in how my ${service.toLowerCase()} services have helped similar professionals achieve their goals.\n\nI recently worked with another ${headline.split(' at ')[0]} who saw a 30% improvement in their key metrics after implementing our solutions.\n\nWould you be open to a quick 15-minute call this week to discuss how we might be able to help ${company}?\n\nBest regards,\n[Your Name]`
    },
    {
      subject: `A thought about ${company}'s approach to ${service}`,
      body: `Hello ${firstName},\n\nAs ${headline}, I imagine you're focused on optimizing ${company}'s performance. I've been following your company's progress and believe my expertise in ${service.toLowerCase()} could be valuable.\n\nI've helped professionals in similar positions implement strategies that resulted in significant improvements to their bottom line.\n\nI have a few specific ideas for ${company} that I'd love to share. Would you be available for a brief conversation next week?\n\nLooking forward to connecting,\n[Your Name]`
    },
    {
      subject: `${service} opportunity for ${company}`,
      body: `Hi ${firstName},\n\nCongratulations on your role as ${headline}. Your experience is impressive.\n\nI'm reaching out because I specialize in providing ${service.toLowerCase()} for companies like ${company}, helping them overcome common industry challenges and achieve better results.\n\nI'd love to share a case study of how I helped a similar organization improve their metrics by 40% in just three months.\n\nDo you have 15 minutes for a quick call this Thursday or Friday?\n\nBest,\n[Your Name]`
    }
  ];

  return mockEmails;
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
    const { 
      targetType, 
      businessType, 
      service, 
      tone, 
      linkedinUrl 
    } = req.body;

    // Validation
    if (!service || !tone) {
      return res.status(400).json({
        error: 'Missing required fields: service and tone are required'
      });
    }

    if (targetType === 'business' && !businessType) {
      return res.status(400).json({
        error: 'Business type is required when targeting a business'
      });
    }

    if (targetType === 'individual' && !linkedinUrl) {
      return res.status(400).json({
        error: 'LinkedIn URL is required when targeting an individual'
      });
    }

    let linkedinProfile = null;
    let companyNews = [];

    // If targeting an individual, fetch LinkedIn profile data
    if (targetType === 'individual' && linkedinUrl) {
      try {
        linkedinProfile = await scrapeLinkedInProfile(linkedinUrl);
        
        // If we have a company name from the profile, fetch company news
        if (linkedinProfile.company) {
          companyNews = await fetchCompanyNews(linkedinProfile.company);
        }
      } catch (error) {
        console.error('Error fetching LinkedIn profile:', error);
        // Continue with generation even if LinkedIn scraping fails
      }
    } else if (targetType === 'business' && businessType) {
      // If targeting a business, fetch news about that business type
      companyNews = await fetchCompanyNews(businessType);
    }

    let emails;

    if (genAI && process.env.GEMINI_API_KEY) {
      emails = await generateEmailsWithAI({
        targetType,
        businessType,
        service,
        tone,
        linkedinProfile,
        companyNews
      });
    } else {
      // Use mock data when no API key is available
      if (targetType === 'individual' && linkedinProfile) {
        emails = generateMockIndividualEmails(linkedinProfile, service, tone);
      } else {
        emails = generateMockEmails(businessType, service, tone);
      }
    }

    res.json({ emails });

  } catch (error) {
    console.error('Error generating emails:', error);
    res.status(500).json({
      error: 'Failed to generate emails. Please try again.'
    });
  }
});

// LinkedIn Profile Scraping
async function scrapeLinkedInProfile(linkedinUrl) {
  const cacheKey = `linkedin_${linkedinUrl}`;
  
  // Check if we have cached data
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log('Using cached LinkedIn data');
    return cachedData;
  }
  
  try {
    // Replace with your actual ScrapingDog API key
    const SCRAPING_DOG_API_KEY = process.env.SCRAPING_DOG_API_KEY || 'demo_key';
    
    // For demo purposes, return mock data if no API key is provided
    if (SCRAPING_DOG_API_KEY === 'demo_key') {
      console.log('Using mock LinkedIn data (no ScrapingDog API key)');
      const mockData = {
        name: "Jane Smith",
        headline: "Marketing Director at Acme Corporation",
        company: "Acme Corporation",
        about: "Growth-focused digital marketer with 10+ years of experience in SaaS and eCommerce. Passionate about data-driven strategies and customer-centric approaches.",
        recent_posts: [
          "Just published our case study on how we increased conversion rates by 45% using personalized email sequences.",
          "Excited to announce our new product launch next month. Stay tuned for more details!"
        ]
      };
      
      // Cache the mock data
      apiCache.set(cacheKey, mockData);
      return mockData;
    }
    
    // Make the actual API call to ScrapingDog
    const response = await axios.get('https://api.scrapingdog.com/linkedin', {
      params: {
        api_key: SCRAPING_DOG_API_KEY,
        url: linkedinUrl
      }
    });
    
    // Process and format the response
    const profileData = {
      name: response.data.name || '',
      headline: response.data.headline || '',
      company: response.data.company || '',
      about: response.data.about || '',
      recent_posts: response.data.recent_posts || []
    };
    
    // Cache the data
    apiCache.set(cacheKey, profileData);
    return profileData;
    
  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
    throw new Error('Failed to scrape LinkedIn profile');
  }
}

// News API Integration
async function fetchCompanyNews(companyName) {
  const cacheKey = `news_${companyName}`;
  
  // Check if we have cached data
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log('Using cached news data');
    return cachedData;
  }
  
  try {
    // Replace with your actual News API key
    const NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo_key';
    
    // For demo purposes, return mock data if no API key is provided
    if (NEWS_API_KEY === 'demo_key') {
      console.log('Using mock news data (no News API key)');
      const mockNews = [
        {
          title: "Acme Corporation Announces New Product Line",
          description: "The company is expanding its offerings with innovative solutions for the digital market.",
          url: "https://example.com/news/acme-new-products",
          publishedAt: "2025-07-25T14:30:00Z"
        },
        {
          title: "Acme Corporation Reports Record Q2 Growth",
          description: "The company exceeded market expectations with a 30% increase in revenue.",
          url: "https://example.com/news/acme-q2-results",
          publishedAt: "2025-07-15T09:45:00Z"
        }
      ];
      
      // Cache the mock data
      apiCache.set(cacheKey, mockNews);
      return mockNews;
    }
    
    // Make the actual API call to News API
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey: NEWS_API_KEY,
        q: companyName,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 5
      }
    });
    
    // Process and format the response
    const newsArticles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt
    }));
    
    // Cache the data
    apiCache.set(cacheKey, newsArticles);
    return newsArticles;
    
  } catch (error) {
    console.error('Error fetching company news:', error);
    return []; // Return empty array on error
  }
}

// LinkedIn Profile API Endpoint
app.post('/api/linkedin-profile', async (req, res) => {
  try {
    const { linkedinUrl } = req.body;
    
    if (!linkedinUrl) {
      return res.status(400).json({
        error: 'LinkedIn URL is required'
      });
    }
    
    const profileData = await scrapeLinkedInProfile(linkedinUrl);
    res.json({ profile: profileData });
    
  } catch (error) {
    console.error('Error in LinkedIn profile endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve LinkedIn profile data'
    });
  }
});

// Company News API Endpoint
app.get('/api/company-news/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    
    if (!companyName) {
      return res.status(400).json({
        error: 'Company name is required'
      });
    }
    
    const newsData = await fetchCompanyNews(companyName);
    res.json({ news: newsData });
    
  } catch (error) {
    console.error('Error in company news endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve company news'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cold Email Generator API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  
  // Check for API keys and show appropriate messages
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  No GEMINI_API_KEY found. Using mock data for email generation.');
    console.log('   Add GEMINI_API_KEY to .env file for AI-powered email generation.');
  }
  
  if (!process.env.SCRAPING_DOG_API_KEY) {
    console.log('⚠️  No SCRAPING_DOG_API_KEY found. Using mock data for LinkedIn profile scraping.');
    console.log('   Add SCRAPING_DOG_API_KEY to .env file for real LinkedIn profile data.');
  }
  
  if (!process.env.NEWS_API_KEY) {
    console.log('⚠️  No NEWS_API_KEY found. Using mock data for company news.');
    console.log('   Add NEWS_API_KEY to .env file for real company news data.');
  }
  
  console.log('\n🚀 FirstPing v2 is ready with:');
  console.log('   - LinkedIn profile targeting');
  console.log('   - Company news integration');
  console.log('   - Enhanced personalization');
});