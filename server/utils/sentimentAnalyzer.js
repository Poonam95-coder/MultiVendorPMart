/**
 * AI & NLP Sentiment Analyzer Module
 * Analyzes customer review text and returns:
 * - sentiment: 'positive' | 'neutral' | 'negative'
 * - sentimentScore: 0 to 100
 */

const POSITIVE_WORDS = new Set([
  'great', 'good', 'excellent', 'amazing', 'fresh', 'best', 'love', 'loved',
  'fast', 'tasty', 'delicious', 'clean', 'perfect', 'crisp', 'healthy', 'quality',
  'top', 'awesome', 'recommend', 'recommended', 'satisfying', 'satisfied', 'helpful',
  'authentic', 'organic', 'wonderful', 'safe', 'nice', 'smooth', 'sweet', 'ripe',
  'reliable', 'trusted', 'flawless', 'prompt', 'super', 'happy', 'valuable', 'cheap', 'affordable'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'terrible', 'horrible', 'worst', 'stale', 'rotten', 'spoiled',
  'broken', 'damaged', 'late', 'slow', 'dirty', 'unhealthy', 'fake', 'waste',
  'expensive', 'overpriced', 'disappointed', 'disappointing', 'rude', 'unhappy',
  'smelly', 'sour', 'refund', 'complaint', 'useless', 'defective', 'missing',
  'wrong', 'never', 'avoid', 'hate', 'hated', 'pathetic', 'awful', 'inferior'
]);

const INTENSIFIERS = new Set([
  'very', 'extremely', 'really', 'highly', 'super', 'absolutely', 'truly', 'incredibly'
]);

const NEGATIONS = new Set([
  'not', "don't", 'dont', "didn't", 'didnt', "never", "no", "won't", 'wont', "isn't", 'isnt', "cannot", "cant"
]);

/**
 * Rule-based NLP Sentiment Analyzer (Always Available, Zero-Failure)
 */
function analyzeRuleBased(text, rating) {
  if (!text || typeof text !== 'string') {
    const ratingScore = rating ? Math.min(100, Math.max(0, (rating / 5) * 100)) : 50;
    return {
      sentiment: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral',
      sentimentScore: Math.round(ratingScore),
    };
  }

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  let wordCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    let multiplier = 1;

    // Check preceding word for intensifier or negation
    if (i > 0) {
      const prev = tokens[i - 1];
      if (INTENSIFIERS.has(prev)) multiplier = 1.5;
      if (NEGATIONS.has(prev)) multiplier = -1.2;
    }

    if (POSITIVE_WORDS.has(word)) {
      score += 1 * multiplier;
      wordCount++;
    } else if (NEGATIVE_WORDS.has(word)) {
      score -= 1 * multiplier;
      wordCount++;
    }
  }

  // Normalized text sentiment from -1 to +1 -> converted to 0-100 scale
  let textScore = 50;
  if (wordCount > 0) {
    const normalized = Math.max(-1, Math.min(1, score / (wordCount * 0.8)));
    textScore = 50 + (normalized * 50); // Maps -1..+1 to 0..100
  }

  // Blend with numerical star rating (60% text sentiment, 40% star rating)
  const starScore = rating ? (rating / 5) * 100 : 50;
  const finalScore = Math.round(wordCount > 0 ? (textScore * 0.6 + starScore * 0.4) : starScore);

  let sentiment = 'neutral';
  if (finalScore >= 65) {
    sentiment = 'positive';
  } else if (finalScore <= 40) {
    sentiment = 'negative';
  }

  return {
    sentiment,
    sentimentScore: Math.max(0, Math.min(100, finalScore)),
  };
}

/**
 * Optional Gemini AI Sentiment Analysis (invoked if GEMINI_API_KEY is defined)
 */
async function analyzeWithGemini(text, rating) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a sentiment analysis engine for TrustCart e-commerce.
Analyze the following customer review and rating.
Review: "${text}"
Star Rating: ${rating || 'N/A'}/5

Respond ONLY with a valid JSON object in this exact format:
{"sentiment": "positive" | "neutral" | "negative", "sentimentScore": <number between 0 and 100>}
Do not include code markdown or any other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (
      parsed &&
      ['positive', 'neutral', 'negative'].includes(parsed.sentiment) &&
      typeof parsed.sentimentScore === 'number'
    ) {
      return {
        sentiment: parsed.sentiment,
        sentimentScore: Math.max(0, Math.min(100, Math.round(parsed.sentimentScore))),
      };
    }
  } catch (e) {
    console.warn('Gemini sentiment analysis failed, using robust fallback:', e.message);
  }
  return null;
}

/**
 * Main Sentiment Analyzer Export
 */
async function analyzeSentiment(text, rating) {
  try {
    const aiResult = await analyzeWithGemini(text, rating);
    if (aiResult) return aiResult;
  } catch (e) {
    // Graceful fallback to rule-based
  }
  return analyzeRuleBased(text, rating);
}

module.exports = {
  analyzeSentiment,
  analyzeRuleBased,
};
