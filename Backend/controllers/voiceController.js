const voiceService = require("../services/voiceService");

class VoiceController {
  constructor() {
    console.log("=== CONTROLLER: Constructor called ===");

    // ✅ FIX: Instantiate the voiceService class
    this.voiceService = new voiceService();
    console.log(
      "=== DEBUG: voiceService methods ===",
      Object.getOwnPropertyNames(this.voiceService)
    );

    // Define supported languages with their speech recognition codes
    this.supportedLanguages = {
      "en-US": { name: "English", ttsCode: "en-US", sttCode: "en-US" },
      "ur-PK": { name: "Urdu", ttsCode: "ur-PK", sttCode: "ur-PK" },
      "hi-IN": { name: "Hindi", ttsCode: "hi-IN", sttCode: "hi-IN" },
      "es-ES": { name: "Spanish", ttsCode: "es-ES", sttCode: "es-ES" },
    };

    // Bind methods to preserve 'this' context
    this.processVoiceCommand = this.processVoiceCommand.bind(this);
    this.textToSpeech = this.textToSpeech.bind(this);
    this.speechToText = this.speechToText.bind(this);
    this.processAuthenticatedVoiceCommand =
      this.processAuthenticatedVoiceCommand.bind(this);
    this.getVoiceHistory = this.getVoiceHistory.bind(this);
    this.clearVoiceHistory = this.clearVoiceHistory.bind(this);
    this.getVoicePreferences = this.getVoicePreferences.bind(this);
    this.updateVoicePreferences = this.updateVoicePreferences.bind(this);

    // Move multer config inside the class
    this.upload = require("multer")({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("audio/")) {
          cb(null, true);
        } else {
          cb(new Error("Only audio files are allowed"), false);
        }
      },
    });

    // Add this binding too
    this.uploadAudio = this.uploadAudio.bind(this);
  }

  // Process voice command (simplified without automation)
  async processVoiceCommand(req, res) {
    try {
      const { text, language = "en-US" } = req.body;
      const userId = req.user?.id;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: "Voice command text is required",
        });
      }

      console.log("Voice command request:", {
        textLength: text.length,
        language,
        userId,
        timestamp: new Date().toISOString(),
      });

      // Process voice command
      console.log("🎯 About to call voiceService.processVoiceCommand...");
      const result = await this.voiceService.processVoiceCommand(
        text,
        language
      );

      console.log("🎯 Voice service returned:", {
        intent: result.intent,
        entities: result.entities,
        confidence: result.confidence,
        hasResponse: !!result.response,
      });

      const responseText = result.response || "Command processed successfully";

      // Generate voice response
      console.log("🔊 Generating voice response...");
      const audioContent = await this.voiceService.textToSpeech(responseText, language);

      console.log("=== VOICE COMMAND PROCESSING COMPLETE ===");

      res.json({
        success: true,
        data: {
          ...result,
          response: responseText,
          audio: audioContent.toString("base64"),
        },
      });
    } catch (error) {
      console.error("Error in processVoiceCommand:", {
        message: error.message,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });

      res.status(500).json({
        success: false,
        message: "Failed to process voice command",
        error: error.message,
      });
    }
  }

  // Text to speech conversion
  async textToSpeech(req, res) {
    try {
      const { text, language = "en-US" } = req.body;
      const userId = req.user?.id;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Text is required for speech synthesis",
        });
      }

      console.log("Text to speech request:", {
        textLength: text.length,
        language,
        userId,
        timestamp: new Date().toISOString(),
      });

      const audioContent = await this.voiceService.textToSpeech(text, language);

      res.json({
        success: true,
        data: {
          audio: audioContent.toString("base64"),
        },
      });
    } catch (error) {
      console.error("Error in textToSpeech:", {
        message: error.message,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });

      res.status(500).json({
        success: false,
        message: "Failed to convert text to speech",
        error: error.message,
      });
    }
  }

  // Speech to text conversion with automatic language detection
  async speechToText(req, res) {
    try {
      const userId = req.user?.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No audio file provided",
        });
      }

      console.log("Speech to text request:", {
        fileSize: req.file.size,
        mimetype: req.file.mimetype,
        userId,
        timestamp: new Date().toISOString(),
      });

      // Use the new automatic language detection method
      const options = {
        encoding: req.body.encoding || "WEBM_OPUS",
        sampleRateHertz: parseInt(req.body.sampleRateHertz) || 48000,
        language: req.body.language || "auto",
        enableAutoDetection: req.body.enableAutoDetection !== "false",
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
      };

      console.log(
        "Sending request to Google Speech-to-Text with auto-detection:",
        options
      );

      // The voiceService will now automatically detect the language
      const result = await this.voiceService.speechToTextWithAutoDetection(
        req.file.buffer,
        options
      );

      console.log("Speech recognition result:", {
        text: result.text,
        detectedLanguage: result.language,
        intent: result.intent?.intent,
        timestamp: new Date().toISOString(),
      });

      // Generate appropriate response based on detected language
      const localizedResponse = this.generateLocalizedResponse(
        result.intent,
        result.text,
        result.language
      );

      // Add the localized response to the result
      const finalResult = {
        ...result,
        localizedResponse,
        detectedLanguage: result.language,
      };

      res.json({
        success: true,
        data: finalResult,
      });
    } catch (error) {
      console.error("Error in speechToText:", {
        message: error.message,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });

      res.status(500).json({
        success: false,
        message: "Failed to convert speech to text",
        error: error.message,
      });
    }
  }

  // Generate localized response based on detected language
  generateLocalizedResponse(intentData, originalText, detectedLanguage) {
    const intent = intentData?.intent || "unknown";

    console.log("Generating localized response:", {
      intent,
      detectedLanguage,
      originalText: originalText?.substring(0, 50) + "...",
    });

    // English responses
    const englishResponses = {
      order:
        "I'd be happy to help you with your order. What would you like to order?",
      greeting: "Hello! Welcome to our service. How can I assist you today?",
      menu: "Let me show you our menu. What type of food are you interested in?",
      search_restaurant:
        "I'll help you find restaurants. What type of cuisine are you looking for?",
      check_status: "Let me check the status of your order for you.",
      question: "That's a great question. Let me help you with that.",
      complaint:
        "I'm sorry to hear about your concern. Let me help resolve this for you.",
      unknown: "I understand your request. How can I help you further?",
      other: "I'm here to help. What would you like to do?",
    };

    // Roman Urdu responses (English mixed Urdu)
    const romanUrduResponses = {
      order:
        "G bilkul, main aap ka order kar sakta hun. Aap kya order karna chahte hain?",
      greeting:
        "Assalam o Alaikum! Khush amdeed. Main aap ki kya madad kar sakta hun?",
      menu: "Main aap ko menu dikhata hun. Aap kis type ka food chahte hain?",
      search_restaurant:
        "Main aap ke liye restaurant dhundta hun. Aap kaun sa cuisine prefer karte hain?",
      check_status: "Main aap ke order ka status check karta hun.",
      question: "Ye acha sawal hai. Main aap ki madad karta hun.",
      complaint:
        "Mujhe afsos hai ke aap ko problem hui. Main iska solution nikalta hun.",
      unknown:
        "Main samjha, aap ki request clear nahi hui. Kya main aur koi madad kar sakta hun?",
      other: "Main yahan hun aap ki madad ke liye. Aap kya karna chahte hain?",
    };

    // Determine if response should be in Urdu
    const isUrduResponse =
      detectedLanguage === "ur-PK" || detectedLanguage === "hi-IN";

    const responses = isUrduResponse ? romanUrduResponses : englishResponses;
    const response = responses[intent] || responses.unknown;

    // Add context-specific information if available
    if (intentData?.entities?.restaurant) {
      if (isUrduResponse) {
        return (
          response +
          ` Main dekh raha hun aap ne ${intentData.entities.restaurant} mention kiya hai.`
        );
      } else {
        return (
          response + ` I see you mentioned ${intentData.entities.restaurant}.`
        );
      }
    }

    if (intentData?.entities?.food_items?.length > 0) {
      if (isUrduResponse) {
        return (
          response +
          ` Aap ${intentData.entities.food_items.join(
            ", "
          )} ke bare mein pooch rahe hain.`
        );
      } else {
        return (
          response +
          ` I noticed you're interested in ${intentData.entities.food_items.join(
            ", "
          )}.`
        );
      }
    }

    return response;
  }

  // Method for authenticated voice commands (with user context)
  async processAuthenticatedVoiceCommand(req, res) {
    try {
      const { text, language = "en-US" } = req.body;
      const userId = req.user.id;

      console.log("Authenticated voice command request:", {
        textLength: text.length,
        language,
        userId,
        timestamp: new Date().toISOString(),
      });

      // Get user preferences for personalized response
      const userPreferences = await this.getUserPreferences(userId);

      // Use user's preferred language if not specified
      const effectiveLanguage = language || userPreferences.language || "en-US";

      // Process with user context
      const result = await this.voiceService.processVoiceCommand(
        text,
        effectiveLanguage,
        {
          userId,
          preferences: userPreferences,
          isAuthenticated: true,
        }
      );

      // Save to user's voice history (optional)
      await this.saveToVoiceHistory(userId, {
        input: text,
        output: result.response,
        intent: result.intent,
        language: effectiveLanguage,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in processAuthenticatedVoiceCommand:", {
        message: error.message,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });

      res.status(500).json({
        success: false,
        message: "Failed to process authenticated voice command",
        error: error.message,
      });
    }
  }

  // Get user's voice interaction history
  async getVoiceHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      // This would typically fetch from your database
      // const history = await VoiceHistory.find({ userId })
      //   .sort({ timestamp: -1 })
      //   .limit(limit * 1)
      //   .skip((page - 1) * limit);

      // Mock response for now
      const history = [];

      res.json({
        success: true,
        data: {
          history,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: history.length,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching voice history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch voice history",
      });
    }
  }

  // Clear user's voice history
  async clearVoiceHistory(req, res) {
    try {
      const userId = req.user.id;

      // This would typically delete from your database
      // await VoiceHistory.deleteMany({ userId });

      console.log("Voice history cleared for user:", userId);

      res.json({
        success: true,
        message: "Voice history cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing voice history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear voice history",
      });
    }
  }

  // Get user's voice preferences
  async getVoicePreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = await this.getUserPreferences(userId);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      console.error("Error fetching voice preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch voice preferences",
      });
    }
  }

  // Update user's voice preferences
  async updateVoicePreferences(req, res) {
    try {
      const userId = req.user.id;
      const { language, voiceGender, speakingRate, pitch } = req.body;

      const updatedPreferences = {
        language: language || "en-US",
        voiceGender: voiceGender || "NEUTRAL",
        speakingRate: speakingRate || 1.0,
        pitch: pitch || 0,
        updatedAt: new Date(),
      };

      // This would typically update in your database
      // await UserVoicePreferences.findOneAndUpdate(
      //   { userId },
      //   updatedPreferences,
      //   { upsert: true }
      // );

      console.log(
        "Voice preferences updated for user:",
        userId,
        updatedPreferences
      );

      res.json({
        success: true,
        data: updatedPreferences,
        message: "Voice preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating voice preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update voice preferences",
      });
    }
  }

  // Get supported languages
  async getSupportedLanguages(req, res) {
    try {
      res.json({
        success: true,
        data: {
          languages: this.supportedLanguages,
          default: "en-US",
        },
      });
    } catch (error) {
      console.error("Error fetching supported languages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch supported languages",
      });
    }
  }

  // Middleware for handling file uploads
  uploadAudio() {
    return this.upload.single("audio");
  }

  // Helper method to get user preferences
  async getUserPreferences(userId) {
    try {
      // This would typically fetch from your database
      // const preferences = await UserVoicePreferences.findOne({ userId });

      // Return default preferences for now
      return {
        language: "en-US", // Keep default as English
        voiceGender: "NEUTRAL",
        speakingRate: 1.0,
        pitch: 0,
      };
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      // Return defaults on error
      return {
        language: "en-US",
        voiceGender: "NEUTRAL",
        speakingRate: 1.0,
        pitch: 0,
      };
    }
  }

  // Helper method to save voice history
  async saveToVoiceHistory(userId, data) {
    try {
      // This would typically save to your database
      // await new VoiceHistory({
      //   userId,
      //   ...data
      // }).save();

      console.log("Voice interaction saved to history:", { userId, ...data });
    } catch (error) {
      console.error("Error saving voice history:", error);
      // Don't throw error, just log it
    }
  }
}

module.exports = new VoiceController();