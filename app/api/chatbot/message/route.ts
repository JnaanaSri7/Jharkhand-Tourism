import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import knowledge from '@/data/chatbot-knowledge.json'

const LANGUAGE_MAPPINGS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  bn: 'Bengali',
  or: 'Odia',
  ur: 'Urdu',
  auto: 'Auto-detect'
}

function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return 'hi'
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or'
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'
    const lower = text.toLowerCase()
    const teluguRomanMarkers = ['gurinchi', 'cheppu', 'ekkada', 'undi', 'undhi', 'koncham', 'detail ga', 'entha']
    const hindiRomanMarkers = ['ke baare', 'kaha hai', 'batao', 'kitna', 'kaise', 'kab jana', 'mein hai', 'ke liye']
    const teluguScore = teluguRomanMarkers.filter(marker => lower.includes(marker)).length
    const hindiScore = hindiRomanMarkers.filter(marker => lower.includes(marker)).length
    if (teluguScore > hindiScore && teluguScore > 0) return 'te'
    if (hindiScore > 0) return 'hi'
  return 'en'
}

function generateFallbackResponse(message: string, language: string, history: Array<{ role: string; content: string }> = [], hasImage?: boolean): string {
  const text = (message || '').toLowerCase()
  const previousUserMessage = [...history].reverse().find(turn => turn.role === 'user')?.content || ''
  const contextText = `${previousUserMessage} ${text}`.toLowerCase()

  if (hasImage && !message.trim()) {
    if (language === 'hi') {
      return 'आपकी तस्वीर प्राप्त हो गई है! यह झारखंड के एक खूबसूरत पर्यटन स्थल, मंदिर या जलप्रपात जैसा प्रतीत होता है। यदि आप स्थान का नाम जानना चाहते हैं तो विवरण पूछें।'
    }
    return 'Thank you for sharing this image! I can help you explore Jharkhand destinations, waterfalls, temples, and tribal handicrafts related to your photo.'
  }
  if (/^(hi|hello|hey|namaste)\b/.test(text)) {
    return 'Hello! I can help with Jharkhand destinations, waterfalls, temples, wildlife, culture, food and trip planning.'
  }

  if (contextText.includes('how far') || contextText.includes('distance') || text.includes('ekkada') || text.includes('kaha hai')) {
    if (language === 'te') return 'ఆ ప్రదేశం యొక్క ధృవీకరించిన దూరం ప్రాజెక్ట్ సమాచారంలో లేదు. దయచేసి మీ ప్రారంభ ప్రదేశాన్ని చెప్పండి; ప్రయాణానికి ముందు తాజా మ్యాప్ లేదా అధికారిక పర్యాటక సమాచారాన్ని చూడండి.'
    if (language === 'hi') return 'उस स्थान की सत्यापित दूरी प्रोजेक्ट जानकारी में उपलब्ध नहीं है। कृपया अपना शुरुआती स्थान बताएं और यात्रा से पहले नवीनतम मानचित्र या आधिकारिक पर्यटन जानकारी देखें।'
    return 'The project does not provide a verified distance for that destination. Please share your starting point and check current map or official tourism information before travelling.'
  }

  if (language === 'te') {
    if (text.includes('dassam')) return 'దశమ్ జలపాతం ఝార్ఖండ్‌లోని ముఖ్యమైన జలపాత గమ్యస్థానంగా ఈ ప్రాజెక్ట్‌లో ఉంది. ఇది జలపాతాలు మరియు ప్రకృతి పర్యాటకంపై ఆసక్తి ఉన్నవారికి ఉపయోగకరమైన ప్రదేశం. ప్రాజెక్ట్‌లో జిల్లా, ఎత్తు, ప్రవేశ రుసుము, సమయాలు లేదా ప్రస్తుత రాకపోక వివరాలు ధృవీకరించబడలేదు.'
    if (text.includes('hundru')) return 'హుండ్రూ జలపాతం ఝార్ఖండ్‌లోని రాంచీ జిల్లాలో సుబర్ణరేఖ నదిపై ఉంది. ప్రాజెక్ట్ సమాచారం ప్రకారం ఇది 98 మీటర్ల ఎత్తైన జలపాతం; రాళ్ల నిర్మాణాలు, సహజ కొలను మరియు అందమైన దృశ్యాలు ప్రత్యేకతలు. ఫోటోగ్రఫీ, పిక్నిక్, రాక్ క్లైంబింగ్ మరియు ఈతను ప్రాజెక్ట్ కార్యకలాపాలుగా పేర్కొంటుంది.'
    if (text.includes('waterfall') || text.includes('falls')) return 'ఝార్ఖండ్ పర్యాటక ప్రాజెక్ట్ హుండ్రూ, దశమ్, భాటిండా, ఉస్రీ, లోధ్, పంచ్‌ఘాఘ్, హిర్ని, తామసిన్ మరియు మోతీ ఝర్నా వంటి జలపాతాలను జాబితా చేస్తుంది. మీకు ఏ జలపాతం గురించి వివరాలు కావాలో చెప్పండి.'
    if (text.includes('food')) return 'ప్రాజెక్ట్‌లో ఝార్ఖండ్‌కు చెందిన ధుస్కా, ఘుగ్ని, లిట్టీ చోఖా, చిల్కా రోటీ, అర్సా రోటీ మరియు రుగ్రా వంటకాలు పేర్కొనబడ్డాయి.'
    return 'నేను ఝార్ఖండ్ పర్యాటక ప్రాంతాలు, జలపాతాలు, దేవాలయాలు, వన్యప్రాణులు, గిరిజన సంస్కృతి, స్థానిక ఆహారం మరియు ప్రయాణ ప్రణాళికల గురించి సహాయం చేయగలను.'
  }

  if (language === 'hi') {
    if (text.includes('dassam')) {
      return 'दशम फॉल्स को यह प्रोजेक्ट झारखंड के महत्वपूर्ण जलप्रपात गंतव्य के रूप में सूचीबद्ध करता है। यह प्रकृति और जलप्रपात देखने में रुचि रखने वाले यात्रियों के लिए उपयोगी स्थान है। प्रोजेक्ट में इसका जिला, ऊंचाई, प्रवेश शुल्क, समय और वर्तमान पहुंच की सत्यापित जानकारी उपलब्ध नहीं है।'
    }
    if (text.includes('hundru')) {
      return 'हुंडरू फॉल्स झारखंड के रांची जिले में सुवर्णरेखा नदी पर स्थित है। प्रोजेक्ट के अनुसार यह 98 मीटर ऊंचा जलप्रपात है और यहाँ चट्टानी संरचनाएँ, प्राकृतिक ताल और सुंदर दृश्य प्रमुख हैं। प्रोजेक्ट फोटोग्राफी, पिकनिक, रॉक क्लाइम्बिंग और तैराकी को गतिविधियों के रूप में सूचीबद्ध करता है।'
    }
    if (text.includes('waterfall') || text.includes('झरना')) {
      return 'झारखंड में हुंडरू फॉल्स, दशम फॉल्स और जोन्हा फॉल्स प्रसिद्ध जलप्रपात हैं। हुंडरू फॉल्स रांची के पास स्थित है।'
    }
    if (text.includes('ranchi')) {
      return 'रांची झारखंड की राजधानी है। यहाँ हुंडरू फॉल्स, दशम फॉल्स और रांची झील जैसे लोकप्रिय पर्यटन स्थल हैं।'
    }
    if (text.includes('temple') || text.includes('मंदिर') || text.includes('deoghar')) {
      return 'देवघर का बैद्यनाथ मंदिर और रजरप्पा का छिन्नमस्तिका मंदिर झारखंड के प्रसिद्ध धार्मिक स्थल हैं।'
    }
    return 'मैं झारखंड पर्यटन के बारे में आपकी मदद कर सकता हूँ। आप पर्यटन स्थल, झरने, मंदिर, वन्यजीव या यात्रा योजना के बारे में पूछ सकते हैं।'
  }

  if (language === 'bn') {
    if (text.includes('waterfall')) return 'ঝাড়খণ্ডের বিখ্যাত জলপ্রপাতগুলির মধ্যে হুন্ডরু ফলস, দশম ফলস এবং জোনা ফলস উল্লেখযোগ্য।'
    if (text.includes('ranchi')) return 'রাঁচি ঝাড়খণ্ডের রাজধানী এবং হুন্ডরু ফলস, দশম ফলস ও রাঁচি লেকের জন্য বিখ্যাত।'
    return 'আমি ঝাড়খণ্ড পর্যটন সম্পর্কে আপনাকে সাহায্য করতে পারি। পর্যটন স্থান, জলপ্রপাত, মন্দির বা ভ্রমণ পরিকল্পনা সম্পর্কে জিজ্ঞাসা করুন।'
  }

  if (language === 'or') {
    if (text.includes('waterfall')) return 'ଝାଡ଼ଖଣ୍ଡର ପ୍ରସିଦ୍ଧ ଜଳପ୍ରପାତ ମଧ୍ୟରେ ହୁଣ୍ଡ୍ରୁ ଫଲ୍ସ, ଦଶମ ଫଲ୍ସ ଏବଂ ଜୋନ୍ହା ଫଲ୍ସ ରହିଛି।'
    if (text.includes('ranchi')) return 'ରାଞ୍ଚି ଝାଡ଼ଖଣ୍ଡର ରାଜଧାନୀ ଏବଂ ହୁଣ୍ଡ୍ରୁ ଫଲ୍ସ, ଦଶମ ଫଲ୍ସ ଓ ରାଞ୍ଚି ଲେକ୍ ପାଇଁ ପ୍ରସିଦ୍ଧ।'
    return 'ମୁଁ ଝାଡ଼ଖଣ୍ଡ ପର୍ଯ୍ୟଟନ ବିଷୟରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ପର୍ଯ୍ୟଟନ ସ୍ଥାନ, ଜଳପ୍ରପାତ କିମ୍ବା ଭ୍ରମଣ ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ।'
  }

  // English fallback
  if (contextText.includes('how far') || contextText.includes('distance')) {
    return 'I do not have a verified distance in the project data for that destination. Please share the starting point, and check current map and road information before travelling.'
  }
  if (text.includes('dassam')) {
    return 'Dassam Falls is listed in this project as a notable Jharkhand waterfall. The project does not include verified distance, entry fee, opening hours or facility details, so I cannot safely invent them.'
  }
  if (text.includes('best places') || text.includes('places to visit') || text.includes('destinations')) {
    return 'The project highlights Netarhat, Hundru Falls, Baidyanath Temple, Trikut Hill, Parasnath Hill, Canary Hill, Betla National Park and Dalma Wildlife Sanctuary. The best choice depends on whether you prefer waterfalls, hills, pilgrimage, wildlife or culture. I can build a route around your available days and starting point.'
  }
  if (text.includes('3 day') || text.includes('three day') || text.includes('itinerary') || text.includes('trip plan')) {
    return 'Suggested 3-day plan: Day 1 explore the Ranchi-area waterfall circuit with Hundru Falls; Day 2 visit Baidyanath Temple and Trikut Hill near Deoghar; Day 3 choose Netarhat for hill scenery or a wildlife destination such as Betla National Park. This is a project-based suggestion, so confirm transport, opening hours and current access before travelling.'
  }
  if (text.includes('tribal') || text.includes('culture')) {
    return 'The project highlights Jharkhand tribal culture through Sohrai and Khovar art, Munda cultural homestays, traditional stories, local food and community-led experiences. Festivals mentioned in the project include Sarhul, Karma and Sohrai. Festival dates and event arrangements are not stored here, so check official local information.'
  }
  if (text.includes('best time') || text.includes('when to visit') || text.includes('season')) {
    return 'The project gives destination-specific periods rather than one verified statewide best time: Netarhat and Parasnath Hill are listed with Oct–Mar, while several waterfalls are listed with Jul–Feb. Choose based on the destinations you want, and check current weather and access before travelling.'
  }
  if (text.includes('waterfall') || text.includes('falls')) {
    return 'The project lists Hundru, Dassam, Bhatinda, Usri, Lodh, Panchghagh, Hirni, Tamasin and Moti Jharna among Jharkhand waterfalls. Hundru Falls is recorded as a 98-metre waterfall on the Subarnarekha River in Ranchi district.'
  }
  if (text.includes('ranchi')) {
    return 'Ranchi is the capital of Jharkhand, surrounded by picturesque hills, waterfalls, and scenic lakes like Ranchi Lake and Kanke Dam.'
  }
  if (text.includes('temple') || text.includes('deoghar')) {
    return 'Jharkhand is home to sacred temples including Baidyanath Jyotirlinga in Deoghar and Chhinnamasta Temple in Rajrappa.'
  }
  if (text.includes('food') || text.includes('cuisine')) {
    return 'Popular Jharkhand cuisines include Dhuska with Ghugni, Litti Chokha, Chilka Roti, and Arsa Roti.'
  }
  if (text.includes('wildlife') || text.includes('park') || text.includes('betla') || text.includes('dalma')) {
    return 'The project lists Betla National Park and Dalma Wildlife Sanctuary as Jharkhand wildlife destinations. It does not contain verified current safari timings, fees, rules or animal sightings, so please check official sources before planning.'
  }

  return 'Welcome to Jharkhand Tourism AI! You can ask me about tourist spots, waterfalls, temples, wildlife sanctuaries, local food, or travel itineraries in Jharkhand.'
}

function needsGroundedFallback(question: string, response: string, language: string): boolean {
  const text = question.toLowerCase()
  const answer = response.toLowerCase()

    const hasTeluguScript = Array.from(response).some(char => {
      const code = char.codePointAt(0) || 0
      return code >= 0x0C00 && code <= 0x0C7F
    })
    const hasHindiScript = Array.from(response).some(char => {
      const code = char.codePointAt(0) || 0
      return code >= 0x0900 && code <= 0x097F
    })
    if (language === 'te' && !hasTeluguScript) return true
    if (language === 'hi' && !hasHindiScript) return true

  if (text.includes('best time') || text.includes('when to visit') || text.includes('season')) {
    return !/(netarhat|parasnath|oct|jul|waterfall)/i.test(answer) || /distance to dassam|distance to hundru/i.test(answer)
  }

  if (text.includes('3 day') || text.includes('three day') || text.includes('itinerary') || text.includes('trip plan')) {
    return /\b(drive|driving|trek|trekking|picnic|restaurant|hotel|budget|cost|ticket)\b/i.test(answer)
  }

  if (text.includes('tribal') || text.includes('culture')) {
    return /\b(oraon|ho people|weaving|tour operators|tribal villages|daily rituals|craft workshops)\b/i.test(answer)
  }

  if (text.includes('food') || text.includes('cuisine') || text.includes('eat')) {
    return true
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
      const { message, language, image, conversationHistory } = body

    const userText = (message || '').trim()
    const hasImage = !!image

    if (!userText && !hasImage) {
      return NextResponse.json({ success: false, error: 'Message or image is required' }, { status: 400 })
    }

    const detectedLanguage = language === 'auto' || !language ? detectLanguage(userText || 'hello') : language
    const apiKey = process.env.GROQ_API_KEY

    const history = Array.isArray(conversationHistory)
      ? conversationHistory
        .filter((turn: any) => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
        .slice(-8)
      : []
    let aiResponse = ''

    if (apiKey && apiKey !== 'your_groq_api_key_here' && userText) {
      try {
        const groq = new Groq({ apiKey })
        const langName = LANGUAGE_MAPPINGS[detectedLanguage] || 'English'
        const promptText = hasImage 
          ? `[User attached an image] ${userText}`
          : userText

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are the Jharkhand Tourism assistant. Answer in ${langName}, preserving the user's language even when it is Roman Telugu, Telugu-English, Roman Hindi or Hindi-English. Use the verified project knowledge below and the user's conversation. Give useful verified facts first: explain what the destination is, its verified location or setting, notable features, tourism significance, and verified activities when available. If one specific fact is absent, omit that fact; do not turn the whole answer into a refusal. Never invent a destination, distance, price, timing, facility, route, safety claim, event date or wildlife sighting. For an unavailable detail, use one short sentence such as "I do not have a verified figure for that detail." Resolve follow-up words such as "it", "there" and "that place" from the conversation history. For trip plans, use only listed destinations and label suggestions as suggestions. Keep the answer natural, practical and concise (3-6 sentences). If unrelated to Jharkhand tourism, politely explain that your focus is Jharkhand tourism.\n\nVERIFIED PROJECT KNOWLEDGE:\n${JSON.stringify(knowledge)}`
            },
            ...history,
            { role: 'user', content: promptText }
          ],
          model: 'openai/gpt-oss-20b',
          temperature: 0.2,
          max_tokens: 700
        })

        aiResponse = completion.choices[0]?.message?.content?.trim() || ''
      } catch (groqErr) {
        console.warn('Groq API failed in Next.js route, using fallback:', groqErr)
      }
    }

    if (!aiResponse) {
      aiResponse = generateFallbackResponse(userText, detectedLanguage, history, hasImage)
    }

    if (needsGroundedFallback(userText, aiResponse, detectedLanguage)) {
      aiResponse = generateFallbackResponse(userText, detectedLanguage, history, hasImage)
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      detectedLanguage,
      supportedLanguages: Object.keys(LANGUAGE_MAPPINGS)
    })
  } catch (error: any) {
    console.error('Chatbot API route error:', error)
    return NextResponse.json({
      success: true,
      response: 'I am here to help you explore Jharkhand! Feel free to ask about waterfalls, temples, wildlife, and travel tips.',
      detectedLanguage: 'en'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    chatbotService: 'available',
    status: 'online'
  })
}
