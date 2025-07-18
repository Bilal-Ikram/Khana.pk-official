const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiAi {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeIntent(text, language = "en-US") {
    try {
      const prompt = `Analyze this food ordering command and extract the following information in JSON format:
        {
          "intent": "search_restaurant|place_order|check_status|browse_menu",
          "restaurant": "restaurant name if mentioned",
          "items": [
            {
              "name": "item name",
              "quantity": "quantity if mentioned",
              "special_instructions": "any special instructions"
            }
          ],
          "language": "${language}",
          "confidence": "high|medium|low"
        }
        
        Command: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      return {
        ...analysis,
        originalText: text,
      };
    } catch (error) {
      console.error("Error in Gemini AI analysis:", error);
      throw new Error("Failed to analyze command intent");
    }
  }

  async generateResponse(analysis, language = "en-US") {
    try {
      const prompt = `Generate a natural, conversational response for a food ordering assistant based on this analysis:
        ${JSON.stringify(analysis, null, 2)}
        
        Requirements:
        - Keep it concise and friendly
        - Include relevant details from the analysis
        - Match the language of the original command
        - If confidence is low, ask for clarification
        - If items are missing, ask for more details`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }
}

module.exports = new GeminiAi();
