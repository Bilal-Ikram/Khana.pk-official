const { SpeechClient } = require("@google-cloud/speech");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class VoiceService {
  constructor() {
    this.speechClient = new SpeechClient();
    this.ttsClient = new TextToSpeechClient();
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    
    this.supportedLanguages = {
      "en-US": "English",
      "es-ES": "Spanish", 
      "hi-IN": "Hindi",
      "ur-PK": "Urdu"
    };

    // Language-specific responses
    this.intentResponses = {
      english: {
        order: "I'd be happy to help you with your order. What would you like to order?",
        question: "That's a great question. Let me help you with that.",
        greeting: "Hello! Welcome to our service. How can I assist you today?",
        menu: "Let me show you our menu. What type of food are you interested in?",
        complaint: "I'm sorry to hear about your concern. Let me help resolve this for you.",
        search_restaurant: "I'll help you find restaurants. What type of cuisine are you looking for?",
        check_status: "Let me check the status of your order for you.",
        default: "I understand your request. How can I help you further?"
      },
      urdu: {
        order: "G bilkul, main aap ka order kar sakta hun. Aap kya lena chahte hain?",
        question: "Bahut acha sawal hai. Main aap ki madad kar sakta hun.",
        greeting: "Assalam o Alaikum! Hamari service mein khush amdeed. Main aap ki kya madad kar sakta hun?",
        menu: "Main aap ko menu dikhata hun. Aap kya khaana pasand karenge?",
        complaint: "Maaf karna, main aap ki pareshani samajh gaya hun. Main iska hal kar deta hun.",
        search_restaurant: "Main aap ke liye restaurant dhundta hun. Aap kaun sa cuisine chahte hain?",
        check_status: "Main aap ke order ka status check kar deta hun.",
        default: "Main aap ki baat samajh gaya hun. Aur kya madad kar sakta hun?"
      }
    };
  }


  async processVoiceCommand(text, language = "en-US") {
    try {
      console.log("Processing voice command:", { text, language, timestamp: new Date().toISOString() });

      // Analyze intent using Gemini
      const intentData = await this.analyzeIntent(text, language);
      
      // Generate response based on intent and detected language
      const responseText = this.generateResponse(intentData, text);
      
      // Convert response to speech with correct language
      const audioContent = await this.textToSpeech(responseText, intentData.detected_language === 'urdu' ? 'ur-PK' : 'en-US');

      console.log("Voice command processed successfully:", {
        intent: intentData.intent,
        detectedLanguage: intentData.detected_language,
        responseLength: responseText.length,
        timestamp: new Date().toISOString()
      });

      return {
        originalText: text,
        intent: intentData,
        response: responseText,
        audio: audioContent.toString('base64'),
        detectedLanguage: intentData.detected_language
      };

    } catch (error) {
      console.error("Error processing voice command:", error);
      throw new Error("Failed to process voice command");
    }
  }

  // Enhanced language detection that handles both Roman Urdu and Urdu script
  detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return 'english';
    }
    
    const lowerText = text.toLowerCase();
    
    // Check for Urdu script (Arabic characters)
    const hasUrduScript = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    if (hasUrduScript) {
      console.log("Detected Urdu script characters");
      return 'urdu';
    }
    
    // Enhanced Urdu/Hindi detection patterns for Roman Urdu
    const urduPatterns = [
      // Common Urdu words
      'kya', 'hai', 'ka', 'ki', 'ke', 'main', 'mein', 'aap', 'hum', 'tum',
      'kar', 'sakta', 'sakte', 'ho', 'hain', 'lia', 'liye', 'meray', 'mere',
      'aur', 'bhi', 'se', 'par', 'pe', 'wala', 'wali', 'chahiye',
      'chahte', 'chahtay', 'karna', 'karte', 'karta', 'karti',
      'dena', 'dedo', 'lana', 'laiye', 'dijiye', 'karo', 'karna',
      // Greetings
      'assalam', 'alaikum', 'namaste', 'adab',
      // Food related Urdu
      'khana', 'khaana', 'peena', 'piyo', 'kha', 'pi',
      // Common expressions
      'achha', 'acha', 'theek', 'bilkul', 'haan', 'nahi', 'nahin'
    ];
    
    // English patterns - only pure English words
    const englishPatterns = [
      'can', 'you', 'please', 'help', 'want', 'need', 'get', 'buy',
      'hello', 'hi', 'hey', 'thank', 'thanks', 'yes', 'no',
      'order', 'food', 'burger', 'pizza', 'delivery', 'restaurant', 'menu',
      'what', 'where', 'when', 'how', 'why', 'who',
      'the', 'and', 'or', 'but', 'for', 'with', 'from', 'to', 'a', 'an'
    ];
    
    // Count matches
    const urduMatches = urduPatterns.filter(word => lowerText.includes(word)).length;
    const englishMatches = englishPatterns.filter(word => lowerText.includes(word)).length;
    
    console.log(`Language detection - Text: "${text.substring(0, 50)}...", Urdu matches: ${urduMatches}, English matches: ${englishMatches}`);
    
    // Determine language based on matches
    if (urduMatches > englishMatches && urduMatches > 0) {
      return 'urdu';
    } else if (englishMatches > urduMatches && englishMatches > 0) {
      return 'english';
    }
    
    // If no clear pattern, check character composition
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    const totalChars = text.replace(/\s/g, '').length;
    
    if (totalChars > 0 && englishChars.length / totalChars > 0.8) {
      return 'english';
    }
    
    // Default to English for ambiguous cases
    return 'english';
  }

  // Updated analyzeIntent method with better language handling
  async analyzeIntent(text, language) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Detect language from the text content
      const detectedLanguage = this.detectLanguage(text);
      console.log(`Detected language: ${detectedLanguage} for text: "${text}"`);
      
      const isUrdu = detectedLanguage === 'urdu';
      
      const prompt = `Analyze this ${isUrdu ? 'Urdu/Roman Urdu' : 'English'} food ordering command and return ONLY a valid JSON object:

{
  "intent": "one of: order, question, greeting, menu, complaint, search_restaurant, check_status, other",
  "entities": {
    "restaurant": "restaurant name if mentioned, otherwise null",
    "food_items": ["array of food items mentioned"],
    "quantities": ["array of quantities mentioned"],
    "special_instructions": "any special instructions or null"
  },
  "confidence": "high, medium, or low",
  "detected_language": "${isUrdu ? 'urdu' : 'english'}"
}

Command: "${text}"

Return ONLY the JSON object, no other text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text().trim();
      
      // Clean the response
      const cleanedResponse = this.cleanGeminiResponse(analysisText);
      
      try {
        const parsedAnalysis = JSON.parse(cleanedResponse);
        // Ensure detected_language is set correctly
        parsedAnalysis.detected_language = detectedLanguage;
        return parsedAnalysis;
      } catch (parseError) {
        console.warn("Failed to parse Gemini response as JSON:", cleanedResponse);
        return this.fallbackIntentAnalysis(text, isUrdu);
      }

    } catch (error) {
      console.error("Error analyzing intent:", error);
      const detectedLanguage = this.detectLanguage(text);
      return this.fallbackIntentAnalysis(text, detectedLanguage === 'urdu');
    }
  }

  // Add this method to detect Urdu text (keeping your original for compatibility)
  detectUrduText(text) {
    return this.detectLanguage(text) === 'urdu';
  }

  cleanGeminiResponse(response) {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    // Find JSON object if there's extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    return cleaned;
  }

  fallbackIntentAnalysis(text, isUrdu = false) {
    const lowerText = text.toLowerCase();
    
    let intent = 'other';
    let confidence = 'low';
    
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('assalam') || lowerText.includes('namaste')) {
      intent = 'greeting';
      confidence = 'medium';
    } else if (lowerText.includes('order') || lowerText.includes('kar') || lowerText.includes('chahiye') || lowerText.includes('want')) {
      intent = 'order';
      confidence = 'medium';
    } else if (lowerText.includes('menu') || lowerText.includes('kya hai') || lowerText.includes('what')) {
      intent = 'menu';
      confidence = 'medium';
    }
    
    return { 
      intent, 
      entities: {
        restaurant: null,
        food_items: [],
        quantities: [],
        special_instructions: null
      }, 
      confidence,
      detected_language: isUrdu ? 'urdu' : 'english'
    };
  }

  generateResponse(intentData, originalText) {
    const language = intentData.detected_language || 'english';
    const intent = intentData.intent || 'default';
    
    // Select appropriate response set
    const responseSet = language === 'urdu' ? this.intentResponses.urdu : this.intentResponses.english;
    const baseResponse = responseSet[intent] || responseSet.default;
    
    console.log(`Generating ${language} response for intent: ${intent}`);
    
    // Add context-specific information if available
    if (intentData.entities?.restaurant) {
      if (language === 'urdu') {
        return baseResponse + ` Main dekh raha hun aap ne ${intentData.entities.restaurant} ka naam kaha hai.`;
      } else {
        return baseResponse + ` I see you mentioned ${intentData.entities.restaurant}.`;
      }
    }
    
    if (intentData.entities?.food_items?.length > 0) {
      if (language === 'urdu') {
        return baseResponse + ` Main dekh raha hun aap ${intentData.entities.food_items.join(', ')} chahte hain.`;
      } else {
        return baseResponse + ` I noticed you're interested in ${intentData.entities.food_items.join(', ')}.`;
      }
    }
    
    return baseResponse;
  }

  async textToSpeech(text, language = "en-US") {
    try {

      console.log("Converting text to speech:", { textLength: text.length, language });

      const request = {
        input: { text },
        voice: { languageCode: language, ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3", speakingRate: 1.0, pitch: 0 }
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      console.log("Text to speech conversion successful");
      
      return response.audioContent;
    } catch (error) {
      
      console.error("Error converting text to speech:", error);
      throw new Error("Failed to convert text to speech");
    }
  }

  // Enhanced speech-to-text with better language detection
  async speechToTextWithAutoDetection(audioBuffer, options = {}) {
    try {
      const {
        encoding = "WEBM_OPUS", // Changed to WEBM_OPUS for webm audio files
        sampleRateHertz = 48000
      } = options;

      console.log("Processing speech with automatic language detection:", { 
        size: audioBuffer.length, 
        timestamp: new Date().toISOString()
      });

      const audioBytes = audioBuffer.toString("base64");
      const audio = { content: audioBytes };

      // Try with alternativeLanguageCodes first
      const config = {
        encoding,
        sampleRateHertz,
        languageCode: "en-US", // Primary language
        alternativeLanguageCodes: ["en-US"], // Alternative languages
        enableAutomaticPunctuation: true,
        model: "latest_short",
        audioChannelCount: 1,
        enableWordTimeOffsets: false,
        enableWordConfidence: true,
        maxAlternatives: 1,
        enableAutomaticLanguageDetection: true, // Enable automatic language detection
        useEnhanced: true,
        speechContexts: [{
          phrases: [
            "Ibrahim Foods", "burger", "order", "restaurant", "food delivery"
          ],
          boost: 20, // Boost relevance of these phrases
        }]
      };

      const request = { audio, config };
      
      console.log("Sending request to Google Speech-to-Text with multi-language config");
      const [response] = await this.speechClient.recognize(request);

      if (!response?.results?.length) {
        console.log("No speech detected in primary attempt, trying individual languages...");
        return await this.tryIndividualLanguages(audioBuffer, options);
      }

      const bestResult = response.results[0];
      const transcription = bestResult.alternatives[0].transcript;
      const confidence = bestResult.alternatives[0].confidence || 0;
      
      // Use our improved language detection
      const detectedLanguage = this.detectLanguage(transcription);
      const languageCode = detectedLanguage === 'urdu' ? 'ur-PK' : 'en-US';

      console.log("Speech recognition result:", {
        transcription,
        detectedLanguage,
        languageCode,
        confidence
      });

      if (!transcription || transcription.trim().length < 2 || confidence < 0.3) {
        console.log("Low confidence or empty transcription, trying individual languages...");
        return await this.tryIndividualLanguages(audioBuffer, options);
      }

      // Analyze intent with detected language
      const intentData = await this.analyzeIntent(transcription, languageCode);

      return {
        text: transcription,
        language: languageCode,
        intent: intentData,
        confidence: confidence
      };

    } catch (error) {
      console.error("Error in speech-to-text with auto detection:", error);
      
      try {
        console.log("Attempting fallback to individual language detection...");
        return await this.tryIndividualLanguages(audioBuffer, options);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error("Failed to convert speech to text in any supported language");
      }
    }
  }

  async tryIndividualLanguages(audioBuffer, options = {}) {
    const languagesToTry = [
      { code: "en-US", name: "English" },
      { code: "ur-PK", name: "Urdu" },
      { code: "hi-IN", name: "Hindi" }
    ];
    
    const {
      encoding = "WEBM_OPUS", // Changed for webm compatibility
      sampleRateHertz = 48000
    } = options;

    let bestResult = null;
    let bestScore = 0;
    
    for (const language of languagesToTry) {
      try {
        console.log(`Trying speech recognition with language: ${language.code} (${language.name})`);
        
        const audioBytes = audioBuffer.toString("base64");
        const audio = { content: audioBytes };

        const config = {
          encoding,
          sampleRateHertz,
          languageCode: language.code,
          enableAutomaticPunctuation: true,
          model: "latest_short",
          audioChannelCount: 1,
          enableWordTimeOffsets: false,
          enableWordConfidence: true,
          maxAlternatives: 1
        };

        const request = { audio, config };
        const [response] = await this.speechClient.recognize(request);
        
        if (response?.results?.length > 0) {
          const result = response.results[0];
          const transcription = result.alternatives[0].transcript;
          const confidence = result.alternatives[0].confidence || 0;
          
          if (transcription && transcription.trim().length > 0) {
            console.log(`Success with language ${language.code}:`, {
              transcription: transcription.substring(0, 100),
              confidence
            });
            
            const languageScore = this.calculateLanguageScore(transcription, language.code);
            const combinedScore = (confidence + languageScore) / 2;
            
            console.log(`Language: ${language.code}, API Confidence: ${confidence}, Language Score: ${languageScore}, Combined: ${combinedScore}`);
            
            if (combinedScore > bestScore) {
              bestResult = {
                text: transcription,
                language: language.code,
                confidence: combinedScore
              };
              bestScore = combinedScore;
            }
            
            if (combinedScore > 0.6) {
              console.log(`High confidence (${combinedScore}) detected for ${language.name}`);
              const intentData = await this.analyzeIntent(transcription, language.code);
              return {
                text: transcription,
                language: language.code,
                intent: intentData,
                confidence: combinedScore
              };
            }
          }
        }
        
      } catch (error) {
        console.log(`Failed with language ${language.code}:`, {
          error: error.message,
          code: error.code || 'unknown'
        });
      }
    }
    
    if (bestResult) {
      console.log(`Using best result: ${bestResult.language} with score ${bestResult.confidence}`);
      const intentData = await this.analyzeIntent(bestResult.text, bestResult.language);
      return {
        text: bestResult.text,
        language: bestResult.language,
        intent: intentData,
        confidence: bestResult.confidence
      };
    }
    
    throw new Error("Could not recognize speech in any supported language. Please ensure audio quality is good and speak clearly.");
  }

  calculateLanguageScore(text, languageCode) {
    const detectedLanguage = this.detectLanguage(text);
    
    if (languageCode === 'en-US') {
      return detectedLanguage === 'english' ? 0.8 : 0.2;
    } else if (languageCode === 'ur-PK' || languageCode === 'hi-IN') {
      return detectedLanguage === 'urdu' ? 0.8 : 0.2;
    }
    
    return 0.5;
  }

  // Keep the old method for backward compatibility
  async speechToText(audioBuffer, options = {}) {
    return await this.speechToTextWithAutoDetection(audioBuffer, options);
  }

  async announceAction(message, language = 'en-US') {
    try {
      const audio = await this.textToSpeech(message, language);
      console.log(`🔊 Voice Announcement (${language}): ${message}`);
      return audio;
    } catch (error) {
      console.error('Voice announcement error:', error);
    }
  }
  
  async announceError(errorMessage, language = 'en-US') {
    const friendlyMessage = language === 'ur-PK' 
      ? `Maaf karna! ${errorMessage}. Main koi aur tarika try karta hun.`
      : `Oops! ${errorMessage}. Let me try a different approach.`;
    return await this.announceAction(friendlyMessage, language);
  }
}

module.exports =  VoiceService;