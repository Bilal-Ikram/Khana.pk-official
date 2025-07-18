const { GoogleGenerativeAI } = require("@google/generative-ai");

class LanguageDetector {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.supportedLanguages = {
      "en-US": "English",
      "es-ES": "Spanish",
      "hi-IN": "Hindi",
      "ur-PK": "Urdu",
    };
  }

  async detectLanguage(text) {
    try {
      const prompt = `Detect the language of this text and return the language code from these options: ${Object.keys(
        this.supportedLanguages
      ).join(", ")}.
        If the language is not supported, return 'en-US'.
        Text: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const detectedLanguage = response.text().trim();

      return this.supportedLanguages[detectedLanguage]
        ? detectedLanguage
        : "en-US";
    } catch (error) {
      console.error("Error detecting language:", error);
      return "en-US"; // Default to English on error
    }
  }

  isLanguageSupported(languageCode) {
    return languageCode in this.supportedLanguages;
  }

  getLanguageName(languageCode) {
    return this.supportedLanguages[languageCode] || "English";
  }
}

module.exports = new LanguageDetector();
