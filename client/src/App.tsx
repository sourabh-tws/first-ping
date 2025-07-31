import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Copy, Loader2, Sparkles, Link, Newspaper } from 'lucide-react';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import './App.css';

interface Email {
  subject: string;
  body: string;
}

interface FormData {
  targetType: 'business' | 'individual';
  businessType: string;
  service: string;
  tone: string;
  linkedinUrl: string;
}

interface LinkedInProfile {
  name: string;
  headline: string;
  company: string;
  about: string;
  recent_posts: string[];
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12001';

function App() {
  const [formData, setFormData] = useState<FormData>({
    targetType: 'business',
    businessType: '',
    service: '',
    tone: '',
    linkedinUrl: ''
  });
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [tones, setTones] = useState<string[]>([]);
  const [linkedinProfile, setLinkedinProfile] = useState<LinkedInProfile | null>(null);
  const [companyNews, setCompanyNews] = useState<NewsItem[]>([]);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // Load dropdown options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [businessTypesRes, servicesRes, tonesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/business-types`),
          axios.get(`${API_BASE_URL}/api/services`),
          axios.get(`${API_BASE_URL}/api/tones`)
        ]);
        
        setBusinessTypes(businessTypesRes.data);
        setServices(servicesRes.data);
        setTones(tonesRes.data);
      } catch (error) {
        console.error('Error loading options:', error);
        toast.error('Failed to load form options');
      }
    };

    loadOptions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset LinkedIn profile data when changing target type
    if (name === 'targetType') {
      setLinkedinProfile(null);
      setCompanyNews([]);
    }
  };
  
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetType = e.target.checked ? 'individual' : 'business';
    setFormData(prev => ({
      ...prev,
      targetType
    }));
    
    // Reset LinkedIn profile data when changing target type
    setLinkedinProfile(null);
    setCompanyNews([]);
  };
  
  const fetchLinkedInProfile = async () => {
    if (!formData.linkedinUrl) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }
    
    setFetchingProfile(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/linkedin-profile`, {
        linkedinUrl: formData.linkedinUrl
      });
      
      const profile = response.data.profile;
      setLinkedinProfile(profile);
      
      // If we have a company name, fetch company news
      if (profile.company) {
        try {
          const newsResponse = await axios.get(`${API_BASE_URL}/api/company-news/${encodeURIComponent(profile.company)}`);
          setCompanyNews(newsResponse.data.news);
        } catch (error) {
          console.error('Error fetching company news:', error);
        }
      }
      
      toast.success('LinkedIn profile data retrieved successfully!');
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      toast.error('Failed to retrieve LinkedIn profile data');
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.service || !formData.tone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.targetType === 'business' && !formData.businessType) {
      toast.error('Please select a business type');
      return;
    }
    
    if (formData.targetType === 'individual' && !formData.linkedinUrl) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }
    
    // If targeting an individual but haven't fetched profile data yet, fetch it first
    if (formData.targetType === 'individual' && !linkedinProfile) {
      toast.error('Please fetch LinkedIn profile data first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        ...formData,
        targetType: formData.targetType
      });
      setEmails(response.data.emails);
      toast.success('Emails generated successfully!');
    } catch (error) {
      console.error('Error generating emails:', error);
      toast.error('Failed to generate emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FirstPing</h1>
              <p className="text-gray-600">Generate personalized cold emails for your freelance business</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Type Toggle */}
            <div className="flex justify-center items-center space-x-4 mb-4">
              <span className={`text-sm font-medium ${formData.targetType === 'business' ? 'text-primary-600' : 'text-gray-500'}`}>
                Business
              </span>
              <Toggle
                id="targetType"
                checked={formData.targetType === 'individual'}
                onChange={handleToggleChange}
                icons={false}
                className="custom-toggle"
              />
              <span className={`text-sm font-medium ${formData.targetType === 'individual' ? 'text-primary-600' : 'text-gray-500'}`}>
                Individual (LinkedIn)
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Conditional Fields Based on Target Type */}
              {formData.targetType === 'business' ? (
                /* Business Type */
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <input
                    type="text"
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    placeholder="e.g., eCommerce Store, SaaS Company"
                    list="businessTypes"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    required={formData.targetType === 'business'}
                  />
                  <datalist id="businessTypes">
                    {businessTypes.map((type, index) => (
                      <option key={index} value={type} />
                    ))}
                  </datalist>
                </div>
              ) : (
                /* LinkedIn URL */
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile URL
                  </label>
                  <div className="flex">
                    <input
                      type="url"
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="e.g., https://www.linkedin.com/in/username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      required={formData.targetType === 'individual'}
                    />
                    <button
                      type="button"
                      onClick={fetchLinkedInProfile}
                      disabled={fetchingProfile || !formData.linkedinUrl}
                      className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-3 rounded-r-lg font-medium flex items-center transition-colors"
                    >
                      {fetchingProfile ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Link className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {linkedinProfile && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-gray-900">{linkedinProfile.name}</p>
                      <p className="text-gray-600">{linkedinProfile.headline}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Service - Common for both types */}
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Service
                </label>
                <input
                  type="text"
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  placeholder="e.g., Web Development, SEO"
                  list="services"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  required
                />
                <datalist id="services">
                  {services.map((service, index) => (
                    <option key={index} value={service} />
                  ))}
                </datalist>
              </div>

              {/* Tone - Common for both types */}
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone of Voice
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select tone...</option>
                  {tones.map((tone, index) => (
                    <option key={index} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Display Company News if available */}
            {companyNews.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Newspaper className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Recent News</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {companyNews.slice(0, 2).map((news, index) => (
                    <li key={index} className="truncate">• {news.title}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || (formData.targetType === 'individual' && !linkedinProfile)}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Cold Emails</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Emails */}
        {emails.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Your Generated Cold Emails</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {emails.map((email, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email {index + 1}</h3>
                    <button
                      onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`)}
                      className="text-gray-500 hover:text-primary-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Subject Line:</h4>
                      <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                        {email.subject}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Email Body:</h4>
                      <div className="text-gray-800 bg-gray-50 p-4 rounded-lg whitespace-pre-line leading-relaxed">
                        {email.body}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {emails.length === 0 && !loading && (
          <div className="text-center py-12">
            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Cold Emails?</h3>
            <p className="text-gray-600">Fill out the form above to get 3 personalized cold email variations</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            Built for freelancers and agencies to create high-converting cold emails
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
