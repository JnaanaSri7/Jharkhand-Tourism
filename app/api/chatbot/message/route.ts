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
  const value = (text || '').trim()
  if (!value) return 'en'

  const scriptCounts = {
    hi: (value.match(/[\u0900-\u097F]/g) || []).length,
    bn: (value.match(/[\u0980-\u09FF]/g) || []).length,
    or: (value.match(/[\u0B00-\u0B7F]/g) || []).length,
    te: (value.match(/[\u0C00-\u0C7F]/g) || []).length
  }
  const detectedScript = Object.entries(scriptCounts).sort((first, second) => second[1] - first[1])[0]
  if (detectedScript[1] > 0) return detectedScript[0]

  const lower = value.toLowerCase()
  const teluguRomanMarkers = ['gurinchi', 'cheppu', 'ekkada', 'undi', 'undhi', 'koncham', 'detail ga', 'entha', 'vuntundi', 'manchi', 'ela', 'emiti', 'chudali', 'vellali', 'telugu']
  const hindiRomanMarkers = ['ke baare', 'kaha hai', 'batao', 'kitna', 'kaise', 'kab jana', 'mein hai', 'ke liye', 'ghoomne', 'ghumne', 'achhi jagah', 'kaun si', 'kaunsi', 'mujhe', 'chahiye', 'hindi']
  const teluguScore = teluguRomanMarkers.filter(marker => lower.includes(marker)).length
  const hindiScore = hindiRomanMarkers.filter(marker => lower.includes(marker)).length

  if (teluguScore > 0 && teluguScore >= hindiScore) return 'te'
  if (hindiScore > 0) return 'hi'

  return 'en'
}

function buildSystemPrompt(languageName: string, latestMessage: string): string {
  const usesDevanagari = /[\u0900-\u097F]/.test(latestMessage)
  const usesTeluguScript = /[\u0C00-\u0C7F]/.test(latestMessage)
  const languageStyleInstruction = languageName === 'Hindi' && usesDevanagari
    ? 'The latest user message is in Devanagari Hindi. Write the entire answer in Hindi using Devanagari; do not answer in English.'
    : languageName === 'Telugu' && usesTeluguScript
      ? 'The latest user message is in Telugu script. Write the entire answer in Telugu using Telugu script.'
      : languageName === 'Telugu'
        ? 'The latest user message may use Roman Telugu. When it does, answer naturally in Roman Telugu/Telugu-English rather than switching to English.'
        : languageName === 'Hindi'
          ? 'When the latest user message uses Roman Hindi or Hinglish, answer naturally in the same Roman Hindi/Hinglish style.'
          : ''

  return `You are the Jharkhand Tourism assistant for a tourism website. The required response language is ${languageName}. This language instruction has priority over the language of conversation history and the language used in project knowledge. ${languageStyleInstruction} Preserve the user's language style where applicable, including English, Hindi, Hinglish, Roman Telugu, Telugu-English, Bengali, Odia, and Urdu. Use verified project knowledge and conversation history as context, but treat the latest user message as the authoritative request and determine the response language from it or the explicitly selected language. Use prior turns to resolve a reference only when the latest message depends on earlier context; when it states a new, self-contained request or topic, answer that request and do not carry over a prior subject.

Core rules:
- Be factual and useful. Use only verified information from the project knowledge.
- If a detail is not present in the project knowledge, identify which requested detail is unverified and answer the rest of the question without guessing.
- Resolve pronouns or omitted context from conversation history only when the latest question actually depends on prior turns. Do not use earlier topics to reinterpret a self-contained latest question.
- Never invent prices, distances, opening hours, ticket fees, transport timing, hotel availability, safety conditions, wildlife sightings, event dates, or current conditions.
- For trip plans, use listed destinations only and label them as suggestions.
- If the question is unrelated to Jharkhand tourism, politely say the chatbot is focused on Jharkhand tourism.
- Keep the answer natural and practical. It can be short for simple questions or more detailed for itinerary/comparison questions.
- Support multilingual replies. Roman Telugu and Hinglish should be answered naturally in the same style.

VERIFIED PROJECT KNOWLEDGE:
${JSON.stringify(knowledge)}

For a context-dependent follow-up, resolve its subject from conversation history before deciding what information is missing. Otherwise, answer the latest user message on its own. When information is absent from verified knowledge, make the uncertainty specific to the subject and requested detail.`
}

function formatConfigurationError(language: string): string {
  const baseText = 'The chatbot is not configured in this environment because GROQ_API_KEY is missing or invalid. Add the existing GROQ_API_KEY as a Vercel Environment Variable. Do not put it in source code.'

  if (language === 'hi') {
    return 'चैटबॉट इस वातावरण में कॉन्फ़िगर नहीं है क्योंकि GROQ_API_KEY गायब है या अमान्य है। मौजूदा GROQ_API_KEY को Vercel Environment Variable के रूप में जोड़ें। इसे स्रोत कोड में नहीं डालें।'
  }

  if (language === 'te') {
    return 'ఈ వాతావరణంలో చాట్‌బాట్ కాన్ఫిగర్ చేయబడలేదు, ఎందుకంటే GROQ_API_KEY లేదు లేదా చెల్లదు. ఇప్పటికే ఉన్న GROQ_API_KEYను Vercel Environment Variableగా జోడించండి. దీన్ని సోర్స్ కోడ్లో ఉంచవద్దు.'
  }

  return baseText
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

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return NextResponse.json(
        {
          success: false,
          response: formatConfigurationError(detectedLanguage),
          error: 'GROQ_API_KEY is not configured in this environment.',
          detectedLanguage,
          supportedLanguages: Object.keys(LANGUAGE_MAPPINGS)
        },
        { status: 503 }
      )
    }

    try {
      const groq = new Groq({ apiKey })
      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(LANGUAGE_MAPPINGS[detectedLanguage] || 'English', userText)
          },
          ...history,
          {
            role: 'user',
            content: hasImage ? `[User attached an image] ${userText}` : userText
          }
        ]
      })

      const aiResponse = completion?.choices?.[0]?.message?.content?.trim()

      if (!aiResponse) {
        return NextResponse.json(
          {
            success: false,
            response: 'The AI service returned an empty response. Please try again in a moment.',
            error: 'Empty Groq response',
            detectedLanguage,
            supportedLanguages: Object.keys(LANGUAGE_MAPPINGS)
          },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        response: aiResponse,
        detectedLanguage,
        supportedLanguages: Object.keys(LANGUAGE_MAPPINGS)
      })
    } catch (groqError: any) {
      console.error('Groq API call failed in chatbot route:', groqError)

      return NextResponse.json(
        {
          success: false,
          response: 'The AI service is temporarily unavailable. Please try again shortly.',
          error: groqError?.message || 'Groq API request failed',
          detectedLanguage,
          supportedLanguages: Object.keys(LANGUAGE_MAPPINGS)
        },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('Chatbot API route error:', error)
    return NextResponse.json(
      {
        success: false,
        response: 'I could not process that request. Please try again.',
        error: error?.message || 'Unexpected chatbot route error',
        detectedLanguage: 'en',
        supportedLanguages: Object.keys(LANGUAGE_MAPPINGS)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    chatbotService: 'available',
    status: 'online'
  })
}
