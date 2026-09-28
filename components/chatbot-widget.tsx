"use client"

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Globe, Mountain, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  language?: string
  imageUrl?: string
}

interface ChatbotResponse {
  success: boolean
  response: string
  detectedLanguage: string
  supportedLanguages?: string[]
  error?: string
}

const LANGUAGE_OPTIONS = {
  'auto': '🌐 Auto-detect',
  'en': '🇬🇧 English',
  'hi': '🇮🇳 हिंदी',
  'te': '🇮🇳 తెలుగు',
  'bn': '🇧🇩 বাংলা',
  'or': '🇮🇳 ଓଡ଼ିଆ',
  'ur': '🇵🇰 اردو'
};

const WELCOME_MESSAGES = {
  'en': 'नमस्ते! Welcome to Jharkhand Tourism! How can I help you explore the beauty of Jharkhand today? 🏔️',
  'hi': 'नमस्ते! झारखंड पर्यटन में आपका स्वागत है! मैं आज झारखंड की सुंदरता का पता लगाने में आपकी कैसे मदद कर सकता हूं? 🏔️',
  'te': 'నమస్తే! ఝార్ఖండ్ పర్యాటకానికి స్వాగతం! ఝార్ఖండ్‌ను అన్వేషించడంలో నేను మీకు ఎలా సహాయం చేయగలను? 🏔️',
  'bn': 'নমস্কার! ঝাড়খণ্ড পর্যটনে স্বাগতম! আজ ঝাড়খণ্ডের সৌন্দর্য অন্বেষণে আমি কীভাবে আপনাকে সাহায্য করতে পারি? 🏔️',
  'or': 'ନମସ୍କାର! ଝାଡଖଣ୍ଡ ପର୍ଯ୍ୟଟନରେ ସ୍ୱାଗତ! ଆଜି ଝାଡଖଣ୍ଡର ସୌନ୍ଦର୍ଯ୍ୟ ଅନ୍ବେଷଣରେ ମୁଁ କିପରି ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି? 🏔️'
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: WELCOME_MESSAGES['en'],
      isUser: false,
      timestamp: new Date(),
      language: 'en'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Change welcome message when language changes
  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode)
    setShowLanguageMenu(false)
    
    // Update welcome message if it's the first message
    if (messages.length === 1 && !messages[0].isUser) {
      const welcomeText = WELCOME_MESSAGES[langCode as keyof typeof WELCOME_MESSAGES] || WELCOME_MESSAGES['en']
      setMessages([{
        id: '1',
        text: welcomeText,
        isUser: false,
        timestamp: new Date(),
        language: langCode
      }])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInstantResponse = (query: string, lang: string, hasImage?: boolean): string => {
    const text = (query || '').toLowerCase().trim()

    if (hasImage && (!text || text.includes('shared an image'))) {
      return lang === 'hi'
        ? 'आपकी फोटो प्राप्त हुई है। वर्तमान कॉन्फ़िगरेशन में इमेज समझने की क्षमता उपलब्ध नहीं है, इसलिए मैं टेक्स्ट-आधारित Jharkhand पर्यटन सहायता दे सकता हूँ।'
        : 'I received the image, but the current model configuration does not support image understanding. I can still help with text-based Jharkhand tourism questions.'
    }

    if (lang === 'hi' || /[\u0900-\u097F]/.test(text)) {
      return 'मैं झारखंड पर्यटन पर मदद करने के लिए तैयार हूँ। कृपया जलप्रपात, मंदिर, वन्यजीव, संस्कृति, खानपान, या यात्रा योजना के बारे में पूछें।'
    }

    if (text.includes('waterfall') || text.includes('falls') || text.includes('hundru') || text.includes('dassam')) {
      return 'I can help with Jharkhand waterfalls and destinations. Please share the specific place or your travel plan, and I will answer with the project-based context.'
    }

    if (text.includes('food') || text.includes('cuisine') || text.includes('eat') || text.includes('dhuska')) {
      return 'I can suggest Jharkhand foods to try, such as Dhuska, Litti Chokha, and Chilkha Roti, based on the project knowledge.'
    }

    if (text.includes('itinerary') || text.includes('trip plan') || text.includes('one day') || text.includes('three day')) {
      return 'I can help build a practical Jharkhand itinerary using the destinations in the project, such as Ranchi, Deoghar, Netarhat, and Betla.'
    }

    return 'I can help with Jharkhand tourism, travel planning, waterfalls, temples, wildlife, food, and culture.'
  }

  const sendMessage = async (overrideText?: string) => {
    const currentImage = selectedImage
    const rawText = typeof overrideText === 'string' ? overrideText : inputMessage
    const userMessage = rawText.trim() || (currentImage ? 'Shared an image of Jharkhand tourism destination' : '')
    if (!userMessage && !currentImage) return

    setInputMessage('')
    setSelectedImage(null)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
      imageUrl: currentImage || undefined
    }])
    setIsLoading(true)
    setIsTyping(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const conversationHistory = messages
        .filter(message => message.text)
        .slice(-8)
        .map(message => ({
          role: message.isUser ? 'user' : 'assistant',
          content: message.text
        }))

      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userMessage,
          language: selectedLanguage,
          image: currentImage || null,
          conversationHistory
        })
      })

      clearTimeout(timeoutId)
      const data = await response.json()
      setIsTyping(false)

      if (response.ok && data?.success && typeof data.response === 'string') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
          language: data?.detectedLanguage || selectedLanguage
        }])
        return
      }

      const fallbackText = data?.response || data?.error || getInstantResponse(userMessage, selectedLanguage, !!currentImage)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: fallbackText,
        isUser: false,
        timestamp: new Date(),
        language: data?.detectedLanguage || selectedLanguage
      }])
    } catch (error) {
      console.warn('Chatbot API network timeout or error, using instant response:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: getInstantResponse(userMessage, selectedLanguage, !!currentImage),
        isUser: false,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="chatbot-widget-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-20 w-20 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B3D2E 0%, #145A3A 100%)',
            border: '3px solid #F28C28'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <MessageCircle className="h-10 w-10 text-yellow-300 relative z-10" style={{ color: '#F28C28' }} />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm"
          style={{ 
            position: 'fixed', 
            top: '60px', 
            right: '24px', 
            zIndex: 9999,
            width: '380px',
            maxWidth: '380px',
            height: '600px',
            minHeight: '600px',
            maxHeight: '600px',
            background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.08) 0%, rgba(20, 90, 58, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '25px',
            border: '3px solid #F28C28'
          }}
        >
          {/* Header - Fixed */}
          <div 
            className="px-4 py-4 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #0B3D2E 0%, #145A3A 100%)',
              borderBottom: '2px solid #F28C28'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <Mountain className="h-5 w-5" style={{ color: '#F28C28' }} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
              </div>
              <div>
                <span className="font-bold text-sm" style={{ color: '#F28C28' }}>Jharkhand Tourism</span>
                <div className="text-xs flex items-center gap-1" style={{ color: '#F28C28' }}>
                  <Sparkles className="h-3 w-3" style={{ color: '#F28C28' }} />
                  AI Assistant
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 h-10 w-10 p-0 flex-shrink-0 rounded-full"
                style={{ backgroundColor: 'rgba(242, 140, 40, 0.2)' }}
              >
                <X className="h-6 w-6" style={{ color: '#ff69b4' }} />
              </Button>
            </div>
          </div>

          {/* Messages - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 chatbot-scrollbar" 
            style={{
              background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.12) 0%, rgba(20, 90, 58, 0.12) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              height: '420px',
              maxHeight: '420px',
              overflowY: 'scroll'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse justify-start' : 'justify-start'}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.2) 0%, rgba(20, 90, 58, 0.2) 100%)', border: '1px solid #F28C28' }}>
                  {message.isUser ? '👤' : '🤖'}
                </div>
                <div className="max-w-[75%]">
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Chat image" 
                      className="max-w-full h-auto rounded-lg mb-2 shadow-lg border-2 border-yellow-400 max-h-48"
                    />
                  )}
                  {message.text && (
                    <div
                      className={`px-4 py-3 text-sm break-words shadow-sm text-white`}
                      style={{ 
                        background: message.isUser 
                          ? 'linear-gradient(135deg, rgba(11, 61, 46, 0.15) 0%, rgba(20, 90, 58, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(11, 61, 46, 0.12) 0%, rgba(20, 90, 58, 0.12) 100%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '2px solid #F28C28',
                        borderRadius: '20px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        color: 'white'
                      }}
                    >
                      {message.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(isLoading || isTyping) && (
              <div className="flex justify-start items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.2) 0%, rgba(20, 90, 58, 0.2) 100%)', border: '1px solid #F28C28' }}>
                  🤖
                </div>
                <div 
                  className="px-4 py-3 shadow-md" 
                  style={{
                    background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.12) 0%, rgba(20, 90, 58, 0.12) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '2px solid #F28C28',
                    borderRadius: '20px'
                  }}
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Fixed */}
          <div 
            className="p-4 border-t-2 border-yellow-200 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.1) 0%, rgba(20, 90, 58, 0.1) 100%)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)'
            }}
          >
            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none text-xs">
              <button 
                onClick={() => sendMessage('Tell me about famous waterfalls in Jharkhand')}
                className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-yellow-300 border border-yellow-400/60 hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                🌊 Waterfalls
              </button>
              <button 
                onClick={() => sendMessage('Which are top temples to visit in Jharkhand?')}
                className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-yellow-300 border border-yellow-400/60 hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                🏛️ Temples
              </button>
              <button 
                onClick={() => sendMessage('What to see in Ranchi and Patratu Valley?')}
                className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-yellow-300 border border-yellow-400/60 hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                🏞️ Ranchi
              </button>
              <button 
                onClick={() => sendMessage('What is famous local food in Jharkhand?')}
                className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-yellow-300 border border-yellow-400/60 hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                🍱 Cuisine
              </button>
            </div>

            <div className="flex items-end gap-2 rounded-2xl border border-yellow-300/70 bg-white/90 p-2 shadow-[0_0_0_1px_rgba(242,140,40,0.2)]">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                aria-label="Type your message"
                rows={1}
                placeholder="Type your message..."
                className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                style={{
                  minHeight: '42px',
                  maxHeight: '120px',
                  lineHeight: '1.5'
                }}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                size="sm"
                className="h-10 w-10 p-0 rounded-full flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(135deg, #0B3D2E 0%, #145A3A 100%)',
                  border: '2px solid #F28C28',
                  opacity: ((!inputMessage.trim() && !selectedImage) || isLoading) ? 0.5 : 1
                }}
              >
                <Send className="h-4 w-4" style={{ color: '#F28C28' }} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
