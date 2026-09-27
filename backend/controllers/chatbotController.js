const Groq = require('groq-sdk');
const knowledge = require('../../data/chatbot-knowledge.json');

// ===============================
// CACHE
// ===============================
const API_CALL_CACHE = new Map();
const API_CALL_TIMES = [];

const MAX_CALLS_PER_MINUTE = 100;
const CACHE_DURATION = 10 * 60 * 1000;

// ===============================
// GROQ CLIENT
// ===============================
let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;

    console.log(
      '🔑 Groq API Key:',
      apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND'
    );

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is not configured');
    }

    groqClient = new Groq({
      apiKey: apiKey
    });

    console.log('✅ Groq client initialized');
  }

  return groqClient;
}

// ===============================
// LANGUAGES
// ===============================
const LANGUAGE_MAPPINGS = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  bn: 'Bengali',
  or: 'Odia',
  ur: 'Urdu',
  bho: 'Bhojpuri',
  mag: 'Magahi',
  mai: 'Maithili',
  sa: 'Sanskrit',
  auto: 'Auto-detect'
};

// ===============================
// LANGUAGE DETECTION
// ===============================
function detectLanguage(text) {
  const teluguScriptPattern = /[\u0C00-\u0C7F]/;
  const hindiPattern = /[\u0900-\u097F]/;
  const bengaliPattern = /[\u0980-\u09FF]/;
  const odiaPattern = /[\u0B00-\u0B7F]/;

  if (teluguScriptPattern.test(text)) {
    return 'te';
  }

  if (hindiPattern.test(text)) {
    return 'hi';
  }

  if (bengaliPattern.test(text)) {
    return 'bn';
  }

  if (odiaPattern.test(text)) {
    return 'or';
  }

  const lower = text.toLowerCase();
  const teluguRomanMarkers = ['gurinchi', 'cheppu', 'ekkada', 'undi', 'undhi', 'koncham', 'detail ga', 'entha'];
  const hindiRomanMarkers = ['ke baare', 'kaha hai', 'batao', 'kitna', 'kaise', 'kab jana', 'mein hai', 'ke liye'];
  const teluguScore = teluguRomanMarkers.filter(marker => lower.includes(marker)).length;
  const hindiScore = hindiRomanMarkers.filter(marker => lower.includes(marker)).length;
  if (teluguScore > hindiScore && teluguScore > 0) return 'te';
  if (hindiScore > 0) return 'hi';

  return 'en';
}

// ===============================
// RATE LIMIT
// ===============================
function canMakeAPICall() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  while (
    API_CALL_TIMES.length > 0 &&
    API_CALL_TIMES[0] < oneMinuteAgo
  ) {
    API_CALL_TIMES.shift();
  }

  return API_CALL_TIMES.length < MAX_CALLS_PER_MINUTE;
}

// ===============================
// CACHE
// ===============================
function getCachedResponse(message, language, conversationHistory = []) {
  const key =
    `${message.toLowerCase().trim()}_${language}_${conversationHistory.slice(-4).map(turn => turn.content).join('|').toLowerCase()}`;

  const cached = API_CALL_CACHE.get(key);

  if (
    cached &&
    Date.now() - cached.timestamp < CACHE_DURATION
  ) {
    console.log('📦 Using cached response');
    return cached.response;
  }

  return null;
}

function cacheResponse(message, language, response, conversationHistory = []) {
  const key =
    `${message.toLowerCase().trim()}_${language}_${conversationHistory.slice(-4).map(turn => turn.content).join('|').toLowerCase()}`;

  API_CALL_CACHE.set(key, {
    response,
    timestamp: Date.now()
  });

  if (API_CALL_CACHE.size > 100) {
    const oldestKey =
      API_CALL_CACHE.keys().next().value;

    API_CALL_CACHE.delete(oldestKey);
  }
}

// ===============================
// GROQ API
// ===============================
const callGroqAPI = async (message, language, conversationHistory = []) => {

  const client = getGroqClient();

  // Check cache
  const cachedResponse =
    getCachedResponse(message, language, conversationHistory);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Rate limit
  if (!canMakeAPICall()) {
    throw new Error('Groq rate limit exceeded');
  }

  API_CALL_TIMES.push(Date.now());

  const languageName =
    LANGUAGE_MAPPINGS[language] || 'English';

  const systemPrompt = `You are the Jharkhand Tourism assistant. Answer in ${languageName}, preserving the user's language even when it is Roman Telugu, Telugu-English, Roman Hindi or Hindi-English. Use the verified project knowledge below and the conversation. Give useful verified facts first: explain what the destination is, its verified location or setting, notable features, tourism significance, and verified activities when available. If one specific fact is absent, omit that fact; do not turn the whole answer into a refusal. Never invent a destination, distance, price, timing, facility, route, safety claim, event date or wildlife sighting. For an unavailable detail, use one short sentence such as "I do not have a verified figure for that detail." Resolve follow-up words such as "it", "there" and "that place" from conversation history. For trip plans, use only listed destinations and label suggestions as suggestions. Keep answers natural, practical and concise (3-6 sentences). If unrelated to Jharkhand tourism, politely explain that your focus is Jharkhand tourism.\n\nVERIFIED PROJECT KNOWLEDGE:\n${JSON.stringify(knowledge)}`;

  try {

    console.log('🤖 Calling Groq...');

    const completion =
      await client.chat.completions.create({

        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversationHistory.slice(-8),
          {
            role: 'user',
            content: message
          }
        ],

        model: 'openai/gpt-oss-20b',

        temperature: 0.2,

        max_tokens: 700,

        stream: false
      });

    const response =
      completion?.choices?.[0]?.message?.content;

    if (!response) {
      throw new Error(
        'Empty response from Groq'
      );
    }

    const finalResponse =
      response.trim();

    cacheResponse(
      message,
      language,
      finalResponse,
      conversationHistory
    );

    console.log('✅ Groq response received');

    return finalResponse;

  } catch (error) {

    console.error(
      '❌ Groq API error:',
      error.message
    );

    throw error;
  }
};

// ===============================
// LOCAL FALLBACK
// ===============================
const generateIntelligentFallback =
  async (message, language, conversationHistory = []) => {

    const text =
      message.toLowerCase();
    const previousUserMessage = [...conversationHistory].reverse().find(turn => turn.role === 'user')?.content || '';
    const contextText = `${previousUserMessage} ${text}`.toLowerCase();

    if (contextText.includes('how far') || contextText.includes('distance')) {
      return language === 'hi'
        ? 'इस स्थान की सत्यापित दूरी प्रोजेक्ट डेटा में उपलब्ध नहीं है। कृपया अपना शुरुआती स्थान बताएं और यात्रा से पहले आधिकारिक मानचित्र या पर्यटन स्रोत से वर्तमान सड़क दूरी जांचें।'
        : 'The project does not contain a verified distance for that destination. Please share your starting point and check current map or official tourism information before travelling.';
    }

    if (language === 'te') {
      if (text.includes('dassam')) return 'దశమ్ జలపాతం ఝార్ఖండ్‌లోని ముఖ్యమైన జలపాత గమ్యస్థానంగా ఈ ప్రాజెక్ట్‌లో ఉంది. ఇది జలపాతాలు మరియు ప్రకృతి పర్యాటకంపై ఆసక్తి ఉన్నవారికి ఉపయోగకరమైన ప్రదేశం. ప్రాజెక్ట్‌లో జిల్లా, ఎత్తు, ప్రవేశ రుసుము, సమయాలు లేదా ప్రస్తుత రాకపోక వివరాలు ధృవీకరించబడలేదు.';
      if (text.includes('hundru')) return 'హుండ్రూ జలపాతం ఝార్ఖండ్‌లోని రాంచీ జిల్లాలో సుబర్ణరేఖ నదిపై ఉంది. ప్రాజెక్ట్ సమాచారం ప్రకారం ఇది 98 మీటర్ల ఎత్తైన జలపాతం; రాళ్ల నిర్మాణాలు, సహజ కొలను మరియు అందమైన దృశ్యాలు ప్రత్యేకతలు. ఫోటోగ్రఫీ, పిక్నిక్, రాక్ క్లైంబింగ్ మరియు ఈతను ప్రాజెక్ట్ కార్యకలాపాలుగా పేర్కొంటుంది.';
      if (text.includes('waterfall') || text.includes('falls')) return 'ఝార్ఖండ్ పర్యాటక ప్రాజెక్ట్ హుండ్రూ, దశమ్, భాటిండా, ఉస్రీ, లోధ్, పంచ్‌ఘాఘ్, హిర్ని, తామసిన్ మరియు మోతీ ఝర్నా వంటి జలపాతాలను జాబితా చేస్తుంది. మీకు ఏ జలపాతం గురించి వివరాలు కావాలో చెప్పండి.';
      if (text.includes('food')) return 'ప్రాజెక్ట్‌లో ఝార్ఖండ్‌కు చెందిన ధుస్కా, ఘుగ్ని, లిట్టీ చోఖా, చిల్కా రోటీ, అర్సా రోటీ మరియు రుగ్రా వంటకాలు పేర్కొనబడ్డాయి.';
      return 'నేను ఝార్ఖండ్ పర్యాటక ప్రాంతాలు, జలపాతాలు, దేవాలయాలు, వన్యప్రాణులు, గిరిజన సంస్కృతి, స్థానిక ఆహారం మరియు ప్రయాణ ప్రణాళికల గురించి సహాయం చేయగలను.';
    }

    if (text.includes('dassam')) {
      return 'Dassam Falls is listed in this project as a notable Jharkhand waterfall. The project does not contain verified distance, entry fee, opening hours or facility details, so I cannot safely invent them.';
    }

    if (/^(hi|hello|hey|namaste)\b/.test(text)) {
      return 'Hello! I can help with Jharkhand destinations, waterfalls, temples, wildlife, culture, food and trip planning.';
    }

    if (text.includes('best places') || text.includes('places to visit') || text.includes('destinations')) {
      return 'The project highlights Netarhat, Hundru Falls, Baidyanath Temple, Trikut Hill, Parasnath Hill, Canary Hill, Betla National Park and Dalma Wildlife Sanctuary. The best choice depends on whether you prefer waterfalls, hills, pilgrimage, wildlife or culture. I can build a route around your available days and starting point.';
    }

    if (text.includes('3 day') || text.includes('three day') || text.includes('itinerary') || text.includes('trip plan')) {
      return 'Suggested 3-day plan: Day 1 explore the Ranchi-area waterfall circuit with Hundru Falls; Day 2 visit Baidyanath Temple and Trikut Hill near Deoghar; Day 3 choose Netarhat for hill scenery or a wildlife destination such as Betla National Park. This is a project-based suggestion, so confirm transport, opening hours and current access before travelling.';
    }

    if (text.includes('tribal') || text.includes('culture')) {
      return 'The project highlights Jharkhand tribal culture through Sohrai and Khovar art, Munda cultural homestays, traditional stories, local food and community-led experiences. Festivals mentioned in the project include Sarhul, Karma and Sohrai. Festival dates and event arrangements are not stored here, so check official local information.';
    }

    if (text.includes('best time') || text.includes('when to visit') || text.includes('season')) {
      return 'The project gives destination-specific periods rather than one verified statewide best time: Netarhat and Parasnath Hill are listed with Oct–Mar, while several waterfalls are listed with Jul–Feb. Choose based on the destinations you want, and check current weather and access before travelling.';
    }

    if (text.includes('betla') || text.includes('dalma')) {
      return 'The project lists Betla National Park and Dalma Wildlife Sanctuary as Jharkhand wildlife destinations. It does not contain verified current safari timings, fees, rules or animal sightings, so please check official sources before planning.';
    }

    // =========================
    // HINDI
    // =========================
    if (language === 'hi') {

      if (text.includes('dassam')) {
        return 'दशम फॉल्स को यह प्रोजेक्ट झारखंड के महत्वपूर्ण जलप्रपात गंतव्य के रूप में सूचीबद्ध करता है। यह प्रकृति और जलप्रपात देखने में रुचि रखने वाले यात्रियों के लिए उपयोगी स्थान है। प्रोजेक्ट में इसका जिला, ऊंचाई, प्रवेश शुल्क, समय और वर्तमान पहुंच की सत्यापित जानकारी उपलब्ध नहीं है।';
      }

      if (text.includes('hundru')) {
        return 'हुंडरू फॉल्स झारखंड के रांची जिले में सुवर्णरेखा नदी पर स्थित है। प्रोजेक्ट के अनुसार यह 98 मीटर ऊंचा जलप्रपात है और यहाँ चट्टानी संरचनाएँ, प्राकृतिक ताल और सुंदर दृश्य प्रमुख हैं। प्रोजेक्ट फोटोग्राफी, पिकनिक, रॉक क्लाइम्बिंग और तैराकी को गतिविधियों के रूप में सूचीबद्ध करता है।';
      }

      if (
        text.includes('waterfall') ||
        text.includes('झरना')
      ) {
        return 'झारखंड में हुंडरू फॉल्स, दशम फॉल्स और जोन्हा फॉल्स प्रसिद्ध जलप्रपात हैं। हुंडरू फॉल्स रांची के पास स्थित है और पर्यटकों के बीच बहुत लोकप्रिय है।';
      }

      if (text.includes('ranchi')) {
        return 'रांची झारखंड की राजधानी है। यहाँ हुंडरू फॉल्स, दशम फॉल्स और रांची झील जैसे लोकप्रिय पर्यटन स्थल हैं।';
      }

      if (
        text.includes('temple') ||
        text.includes('मंदिर') ||
        text.includes('deoghar')
      ) {
        return 'देवघर का बैद्यनाथ मंदिर और रजरप्पा का छिन्नमस्तिका मंदिर झारखंड के प्रसिद्ध धार्मिक स्थल हैं।';
      }

      return 'मैं झारखंड पर्यटन के बारे में आपकी मदद कर सकता हूँ। आप पर्यटन स्थल, झरने, मंदिर, वन्यजीव, जनजातीय संस्कृति, भोजन या यात्रा योजना के बारे में पूछ सकते हैं।';
    }

    // =========================
    // BENGALI
    // =========================
    if (language === 'bn') {

      if (text.includes('waterfall')) {
        return 'ঝাড়খণ্ডের বিখ্যাত জলপ্রপাতগুলির মধ্যে হুন্ডরু ফলস, দশম ফলস এবং জোনা ফলস উল্লেখযোগ্য।';
      }

      if (text.includes('ranchi')) {
        return 'রাঁচি ঝাড়খণ্ডের রাজধানী এবং হুন্ডরু ফলস, দশম ফলস ও রাঁচি লেকের জন্য বিখ্যাত।';
      }

      return 'আমি ঝাড়খণ্ড পর্যটন সম্পর্কে আপনাকে সাহায্য করতে পারি। পর্যটন স্থান, জলপ্রপাত, মন্দির, সংস্কৃতি বা ভ্রমণ পরিকল্পনা সম্পর্কে জিজ্ঞাসা করুন।';
    }

    // =========================
    // ODIA
    // =========================
    if (language === 'or') {

      if (text.includes('waterfall')) {
        return 'ଝାଡ଼ଖଣ୍ଡର ପ୍ରସିଦ୍ଧ ଜଳପ୍ରପାତ ମଧ୍ୟରେ ହୁଣ୍ଡ୍ରୁ ଫଲ୍ସ, ଦଶମ ଫଲ୍ସ ଏବଂ ଜୋନ୍ହା ଫଲ୍ସ ରହିଛି।';
      }

      if (text.includes('ranchi')) {
        return 'ରାଞ୍ଚି ଝାଡ଼ଖଣ୍ଡର ରାଜଧାନୀ ଏବଂ ହୁଣ୍ଡ୍ରୁ ଫଲ୍ସ, ଦଶମ ଫଲ୍ସ ଓ ରାଞ୍ଚି ଲେକ୍ ପାଇଁ ପ୍ରସିଦ୍ଧ।';
      }

      return 'ମୁଁ ଝାଡ଼ଖଣ୍ଡ ପର୍ଯ୍ୟଟନ ବିଷୟରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ପର୍ଯ୍ୟଟନ ସ୍ଥାନ, ଜଳପ୍ରପାତ, ମନ୍ଦିର, ସଂସ୍କୃତି କିମ୍ବା ଭ୍ରମଣ ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ।';
    }

    // =========================
    // ENGLISH
    // =========================

    if (
      text.includes('waterfall') ||
      text.includes('falls')
    ) {
      return 'Jharkhand has several beautiful waterfalls, including Hundru Falls, Dassam Falls and Jonha Falls. Hundru Falls is one of the most popular attractions near Ranchi.';
    }

    if (text.includes('ranchi')) {
      return 'Ranchi is the capital of Jharkhand. Popular attractions include Hundru Falls, Dassam Falls and Ranchi Lake.';
    }

    if (
      text.includes('temple') ||
      text.includes('deoghar')
    ) {
      return 'Jharkhand has important religious destinations such as Baidyanath Temple in Deoghar and Chhinnamasta Temple at Rajrappa.';
    }

    if (
      text.includes('food') ||
      text.includes('cuisine') ||
      text.includes('eat')
    ) {
      return 'Jharkhand is known for traditional foods such as Dhuska, Litti Chokha, Rugra and Chilka Roti.';
    }

    if (
      text.includes('culture') ||
      text.includes('tribal') ||
      text.includes('festival')
    ) {
      return 'Jharkhand is rich in tribal culture and traditions. Popular festivals include Sarhul, Karma and Sohrai.';
    }

    if (
      text.includes('wildlife') ||
      text.includes('forest') ||
      text.includes('national park')
    ) {
      return 'Betla National Park and Dalma Wildlife Sanctuary are popular wildlife destinations in Jharkhand.';
    }

    return 'I can help you explore Jharkhand! Ask me about tourist destinations, waterfalls, temples, wildlife, tribal culture, local food, festivals or travel plans.';
};

const needsGroundedFallback = (question, response, language) => {
  const text = question.toLowerCase();
  const answer = response.toLowerCase();
  const hasTeluguScript = Array.from(response).some(char => {
    const code = char.codePointAt(0) || 0;
    return code >= 0x0C00 && code <= 0x0C7F;
  });
  const hasHindiScript = Array.from(response).some(char => {
    const code = char.codePointAt(0) || 0;
    return code >= 0x0900 && code <= 0x097F;
  });
  if (language === 'te' && !hasTeluguScript) return true;
  if (language === 'hi' && !hasHindiScript) return true;

  if (text.includes('best time') || text.includes('when to visit') || text.includes('season')) {
    return !/(netarhat|parasnath|oct|jul|waterfall)/i.test(answer) || /distance to dassam|distance to hundru/i.test(answer);
  }

  if (text.includes('3 day') || text.includes('three day') || text.includes('itinerary') || text.includes('trip plan')) {
    return /\b(drive|driving|trek|trekking|picnic|restaurant|hotel|budget|cost|ticket)\b/i.test(answer);
  }

  if (text.includes('tribal') || text.includes('culture')) {
    return /\b(oraon|ho people|weaving|tour operators|tribal villages|daily rituals|craft workshops)\b/i.test(answer);
  }

  if (text.includes('food') || text.includes('cuisine') || text.includes('eat')) {
    return true;
  }

  return false;
};

// ===============================
// SEND MESSAGE
// ===============================
const sendMessage = async (req, res) => {

  try {

    const {
      message,
      language,
      conversationHistory
    } = req.body;

    const safeConversationHistory = Array.isArray(conversationHistory)
      ? conversationHistory
        .filter(turn => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
        .slice(-8)
      : [];

    // Validate
    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {

      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });

    }

    // Detect language
    const detectedLanguage =
      language === 'auto'
        ? detectLanguage(message)
        : (language || 'en');

    let response;

    // =========================
    // TRY GROQ
    // =========================

    console.log(
      '🤖 Using Groq AI for:',
      message
    );

    try {

      response =
        await callGroqAPI(
          message,
          detectedLanguage,
          safeConversationHistory
        );

      console.log(
        '✅ Groq API success'
      );

    } catch (groqError) {

      console.error(
        '❌ Groq failed:',
        groqError.message
      );

      // =========================
      // LOCAL FALLBACK
      // =========================

      console.log(
        '🔄 Using local fallback...'
      );

      response =
        await generateIntelligentFallback(
          message,
          detectedLanguage,
          safeConversationHistory
        );

      console.log(
        '✅ Local fallback success'
      );
    }

    if (needsGroundedFallback(message, response, detectedLanguage)) {
      response = await generateIntelligentFallback(message, detectedLanguage, safeConversationHistory);
    }

    // =========================
    // SEND RESPONSE
    // =========================

    return res.json({

      success: true,

      response: response,

      detectedLanguage:
        detectedLanguage,

      supportedLanguages:
        Object.keys(LANGUAGE_MAPPINGS)

    });

  } catch (error) {

    console.error(
      '❌ Chatbot error:',
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        'Sorry, I encountered an error. Please try again.',

      detectedLanguage:
        detectLanguage(
          req.body?.message || ''
        )

    });
  }
};

// ===============================
// HEALTH CHECK
// ===============================
const healthCheck = async (req, res) => {

  try {

    getGroqClient();

    return res.json({

      success: true,

      chatbotService:
        'available',

      features: {

        groqAPI:
          'configured',

        model:
          'openai/gpt-oss-20b',

        multilingualSupport:
          true,

        supportedLanguages:
          Object.keys(
            LANGUAGE_MAPPINGS
          ),

        tourismContext:
          'Jharkhand focused',

        rateLimit:
          `${MAX_CALLS_PER_MINUTE} calls per minute`

      }

    });

  } catch (error) {

    return res.status(503).json({

      success: false,

      chatbotService:
        'unavailable',

      error:
        error.message

    });

  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  sendMessage,
  healthCheck
};