const { GoogleGenerativeAI } = require("@google/generative-ai");

// Robust cleaning function to handle Gemini's markdown responses
function cleanGeminiResponse(response) {
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  
  // Find JSON object if there's extra text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  return cleaned;
}

class GeminiService {
  constructor() {
    // Try multiple API key sources
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("No API key found. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY in your environment variables.");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using gemini-pro for better quota
  }

  async analyzeIntent(text, language = "en") {
    try {
      // Add retry logic for rate limiting
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const prompt = `
            Analyze the following text and extract the user's intent for food ordering.
            
            Text: "${text}"
            Language: ${language}
            
            Please provide a JSON response with the following structure (return ONLY valid JSON, no markdown formatting):
            {
              "intent": "order_food" | "search_restaurant" | "check_status" | "unknown",
              "entities": {
                "restaurant": string | null,
                "items": [{ "name": string, "quantity": number }] | null,
                "location": string | null
              },
              "confidence": number (0-1),
              "language": string,
              "response": string (suggested response in the same language as input)
            }
          `;

          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const responseText = response.text();

          // Clean the response to remove markdown formatting
          const cleanedResponse = cleanGeminiResponse(responseText);

          // Parse the JSON response
          const intentData = JSON.parse(cleanedResponse);
          return intentData;
          
        } catch (error) {
          lastError = error;
          
          // If it's a rate limit error, wait and retry
          if (error.message?.includes('429') && attempt < maxRetries) {
            console.log(`Rate limited, waiting ${attempt * 2} seconds before retry ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
          
          // If it's not a rate limit error, or we've exhausted retries, throw
          throw error;
        }
      }
      
      throw lastError;
      
    } catch (error) {
      console.error("Error analyzing intent with Gemini:", error);
      
      // Handle specific error types
      if (error.message?.includes('429')) {
        throw new Error("API quota exceeded. Please try again later or upgrade your plan.");
      }
      
      if (error.message?.includes('401') || error.message?.includes('API key')) {
        throw new Error("Invalid API key. Please check your GOOGLE_AI_API_KEY.");
      }
      
      throw new Error("Failed to analyze user intent");
    }
  }

  async translateText(text, targetLanguage) {
    try {
      const prompt = `
        Translate the following text to ${targetLanguage}:
        "${text}"
        
        Provide only the translation without any additional text or explanation.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Clean the response in case it contains markdown
      const cleanedResponse = cleanGeminiResponse(responseText);
      return cleanedResponse.trim();
    } catch (error) {
      console.error("Error translating text with Gemini:", error);
      throw new Error("Failed to translate text");
    }
  }
}

module.exports = new GeminiService();