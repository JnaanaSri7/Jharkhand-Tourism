const axios = require('axios');

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const BUDGET_ESTIMATES = {
  Budget: '₹2,000-5,000',
  Medium: '₹5,000-15,000',
  Luxury: '₹15,000+'
};

const parseDurationDays = (duration) => {
  if (Number.isInteger(duration) && duration > 0) return duration;

  const match = String(duration || '').trim().match(/^(\d+)\s*(days?|weeks?)?$/i);
  if (!match) return 0;

  const value = Number(match[1]);
  return value > 0 ? value * (/^weeks?$/i.test(match[2] || '') ? 7 : 1) : 0;
};

/**
 * Generate AI-powered travel itinerary using Groq API
 */
const generateItinerary = async (req, res) => {
  try {
    const { destination, duration, interests, budget, groupSize, accommodation } = req.body;
    const durationDays = parseDurationDays(duration);

    // Validate required fields
    if (!destination || !durationDays || !interests || !budget) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: destination, duration, interests, and budget are required',
        received: { destination, duration, interests, budget },
        fallback: generateFallbackItinerary({ destination, duration, interests, budget })
      });
    }

    // Validate interests is an array and not empty
    if (!Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Interests must be a non-empty array',
        received: { interests },
        fallback: generateFallbackItinerary({ destination, duration, interests, budget })
      });
    }

    // Check if Groq API key is available
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(200).json({
        success: false,
        error: 'Groq API key not configured - using fallback',
        fallback: generateFallbackItinerary({ destination, duration, interests, budget })
      });
    }

    const budgetEstimate = BUDGET_ESTIMATES[budget] || 'based on your selected budget';

    // Keep the generated itinerary concise and easy to scan.
    const prompt = `
  Create a concise, practical Jharkhand travel itinerary using these preferences:
  Destination: ${destination}, Jharkhand
  Duration: exactly ${durationDays} days
  Interests: ${interests.join(', ')}
  Budget: ${budget} (estimated total range: ${budgetEstimate} per person)
  Group size: ${groupSize || 'Not specified'}
  Accommodation: ${accommodation || 'Hotels'}

  Output plain text with bullets, not a Markdown table. Start with:
  ${durationDays} Day Jharkhand Itinerary - ${destination}

  Include exactly ${durationDays} sequential day sections, from Day 1 to Day ${durationDays}. Format each heading as "### Day N: Explore ${destination}". Give each day around five short, time-based activity bullets beginning with "• ", including meals and a return to accommodation. Choose practical attractions near ${destination}, prioritize the selected interests, and do not repeat an attraction within the same day.

  Include costs only as approximate estimates, never as live or verified prices. End with these concise lines:
  Estimated Total Budget: ${budgetEstimate} per person (approximate estimate; not live-verified)
  Best Time to Visit: October to March
  Travel Tips:
  • Carry comfortable shoes.
  • Keep drinking water with you.
  • Check local weather before visiting waterfalls.
  • Plan local transportation in advance.
`;

    // Call Groq API
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: "You are an expert travel planner for Jharkhand, India. Provide detailed, practical, and culturally rich travel itineraries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_completion_tokens: Math.max(2000, durationDays * 600)
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const itinerary = response.data.choices[0].message.content;
    const dayNumbers = [...itinerary.matchAll(/^\s*(?:#{1,6}\s*)?(?:\*\*)?Day\s+(\d+)\b/gim)]
      .map((match) => Number(match[1]));
    const hasExactDayCount = dayNumbers.length === durationDays
      && dayNumbers.every((dayNumber, index) => dayNumber === index + 1);
    const itineraryLines = itinerary.split(/\r?\n/);
    const hasMarkdownTable = itineraryLines.some((line, index) => {
      const nextLine = itineraryLines[index + 1] || '';
      return /^\s*\|.*\|\s*$/.test(line)
        || /\|\s*:?-{3,}:?\s*\|/.test(line)
        || /\|\s*(?:time|activity)\s*\|/i.test(line)
        || (line.includes('|') && nextLine.includes('|'));
    });
    const finalItinerary = hasExactDayCount && !hasMarkdownTable
      ? itinerary
      : generateFallbackItinerary(req.body);

    // Return successful response
    res.json({
      success: true,
      data: {
        itinerary: finalItinerary,
        requestDetails: {
          destination,
          duration,
          interests,
          budget,
          groupSize,
          accommodation
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Travel Planner Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle fallback gracefully on API error
    const fallbackItinerary = generateFallbackItinerary(req.body);
    return res.status(200).json({
      success: true,
      data: {
        itinerary: fallbackItinerary,
        requestDetails: req.body,
        generatedAt: new Date().toISOString()
      }
    });
  }
};

/**
 * Generate fallback itinerary when AI is unavailable
 */
const generateFallbackItinerary = ({ destination, duration, interests, budget, groupSize, accommodation }) => {
  const durationDays = parseDurationDays(duration) || 1;
  // Destination-specific attractions
  const destinationAttractions = {
    'Ranchi': {
      day1: 'Ranchi City Tour',
      attractions: ['Jagannath Temple', 'Rock Garden', 'Hundru Falls', 'Kanke Dam'],
      morning: 'Jagannath Temple',
      afternoon: 'Rock Garden & Kanke Dam',
      evening: 'Hundru Falls'
    },
    'Deoghar': {
      day1: 'Deoghar Spiritual Journey',
      attractions: ['Baidyanath Temple', 'Nandan Pahar', 'Tapovan Caves', 'Satsang Ashram'],
      morning: 'Baidyanath Temple',
      afternoon: 'Nandan Pahar',
      evening: 'Tapovan Caves'
    },
    'Jamshedpur': {
      day1: 'Jamshedpur Exploration',
      attractions: ['Jubilee Park', 'Tata Steel Zoological Park', 'Dalma Wildlife Sanctuary', 'Dimna Lake'],
      morning: 'Jubilee Park',
      afternoon: 'Tata Steel Zoological Park',
      evening: 'Dalma Wildlife Sanctuary'
    },
    'Hazaribagh': {
      day1: 'Hazaribagh Nature Tour',
      attractions: ['Hazaribagh Wildlife Sanctuary', 'Canary Hill', 'Konar Dam', 'Rajrappa Temple'],
      morning: 'Hazaribagh Wildlife Sanctuary',
      afternoon: 'Canary Hill',
      evening: 'Konar Dam'
    },
    'Bokaro': {
      day1: 'Bokaro Steel City Tour',
      attractions: ['Bokaro Steel Plant', 'City Park', 'Garga Dam', 'Parasnath Hills'],
      morning: 'Bokaro Steel Plant',
      afternoon: 'City Park',
      evening: 'Garga Dam'
    },
    'Dhanbad': {
      day1: 'Dhanbad Coal City Exploration',
      attractions: ['Maithon Dam', 'Kalyaneshwari Temple', 'Topchanchi Lake', 'Panchet Dam'],
      morning: 'Maithon Dam',
      afternoon: 'Kalyaneshwari Temple',
      evening: 'Topchanchi Lake'
    }
  };

  const destInfo = destinationAttractions[destination] || {
    attractions: [
      `a local landmark in ${destination}`,
      `a nearby nature spot in ${destination}`,
      `a local cultural site in ${destination}`,
      `local surroundings in ${destination}`
    ]
  };
  const interestsText = Array.isArray(interests) && interests.length
    ? interests.join(', ')
    : 'local highlights';
  const budgetEstimate = BUDGET_ESTIMATES[budget] || 'based on your selected budget';
  const accommodationName = accommodation || 'accommodation';
  const itineraryDays = Array.from({ length: durationDays }, (_, index) => {
    const dayNumber = index + 1;
    const attractionCount = destInfo.attractions.length;
    const firstAttractionIndex = ((dayNumber - 1) * 3) % attractionCount;
    const morningAttraction = destInfo.attractions[firstAttractionIndex];
    const afternoonAttraction = destInfo.attractions[(firstAttractionIndex + 1) % attractionCount];
    const eveningAttraction = destInfo.attractions[(firstAttractionIndex + 2) % attractionCount];
    return `### Day ${dayNumber}: Explore ${destination}\n\n• 9:00 AM: Visit ${morningAttraction} (estimated cost: ₹50)\n\n• 12:30 PM: Local lunch in ${destination} (estimated cost: ₹300)\n\n• 2:30 PM: Explore ${afternoonAttraction} (estimated cost: ₹100)\n\n• 5:30 PM: Explore ${eveningAttraction} and local surroundings (estimated cost: ₹200)\n\n• 7:00 PM: Return to accommodation`;
  });

  return `${durationDays} Day Jharkhand Itinerary - ${destination}
Travelers: ${groupSize || 'Not specified'} | Interests: ${interestsText}

${itineraryDays.join('\n\n')}

Estimated Total Budget: ${budgetEstimate} per person (approximate estimate; not live-verified)

Best Time to Visit: October to March

Travel Tips:
• Carry comfortable shoes.
• Keep drinking water with you.
• Check local weather before visiting waterfalls.
• Plan local transportation in advance.

AI service unavailable; this is a basic itinerary.`;
};

/**
 * Get popular Jharkhand destinations
 */
const getPopularDestinations = async (req, res) => {
  try {
    const destinations = [
      {
        name: 'Ranchi',
        description: 'Capital city with waterfalls and temples',
        attractions: ['Hundru Falls', 'Rock Garden', 'Jagannath Temple'],
        bestFor: ['Culture', 'Nature', 'Temples']
      },
      {
        name: 'Deoghar',
        description: 'Spiritual center with Baidyanath Temple',
        attractions: ['Baidyanath Temple', 'Nandan Pahar', 'Tapovan'],
        bestFor: ['Temples', 'Culture', 'Spirituality']
      },
      {
        name: 'Jamshedpur',
        description: 'Industrial city with parks and lakes',
        attractions: ['Jubilee Park', 'Tata Steel Zoological Park', 'Dalma Wildlife Sanctuary'],
        bestFor: ['Wildlife', 'Parks', 'Adventure']
      },
      {
        name: 'Hazaribagh',
        description: 'Wildlife and natural beauty',
        attractions: ['Hazaribagh Wildlife Sanctuary', 'Canary Hill', 'Konar Dam'],
        bestFor: ['Wildlife', 'Nature', 'Adventure']
      }
    ];

    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations'
    });
  }
};

module.exports = {
  generateItinerary,
  getPopularDestinations
};
