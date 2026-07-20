const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Try these models in order until one works
const MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

// @desc    Send a message to the AI and get a response
// @route   POST /api/ai/chat
// @access  Public
exports.chatWithAI = async (req, res) => {
  try {
    const { message, username } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const ai = getAI();

    if (!ai) {
      const fallbacks = [
        "🤖 I'm ChatSpace AI! Set GEMINI_API_KEY in .env to unlock my full potential.",
        "🧠 My brain needs a Gemini API key to function! Check your .env file.",
        "💡 I'm offline right now. Configure GEMINI_API_KEY to activate me!",
      ];
      const response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.status(200).json({ success: true, response });
    }

    const systemPrompt = `You are ChatSpace AI, a helpful and friendly assistant embedded in a real-time chat application. 
The user "${username}" is asking you something. Keep responses concise (under 200 words), friendly, and useful.
User message: ${message}`;

    let lastError = null;

    for (const modelName of MODEL_FALLBACKS) {
      try {
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        const response = result.response.text();
        console.log(`[AI] Responded using model: ${modelName}`);
        return res.status(200).json({ success: true, response });
      } catch (err) {
        lastError = err;
        // If quota exceeded (429) or model not found (404), try next model
        if (err.message.includes('429') || err.message.includes('404')) {
          console.warn(`[AI] Model ${modelName} failed (${err.message.substring(0, 60)}), trying next...`);
          continue;
        }
        // For other errors, break immediately
        break;
      }
    }

    // All models failed
    console.error('AI Error (all models failed):', lastError?.message);
    res.status(200).json({
      success: true,
      response: `🤖 AI is temporarily at capacity. Please try again in a minute! (Error: quota exceeded)`
    });

  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(200).json({
      success: true,
      response: '🤖 Oops! I encountered an error. Please try again in a moment.'
    });
  }
};
