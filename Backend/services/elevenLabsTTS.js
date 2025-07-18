const axios = require("axios");

class ElevenLabsTTS {
  constructor() {
    this.apiKey = process.env.ELEVEN_LABS_API_KEY;
    this.baseUrl = "https://api.elevenlabs.io/v1";
    this.voices = {
      "en-US": "EXAVITQu4vr4xnSDxMaL", // Default English voice
      "es-ES": "ErXwobaYiN019PkySvjV", // Spanish voice
      "hi-IN": "AZnzlk1XvdvUeBnXmlld", // Hindi voice
    };
  }

  async textToSpeech(text, languageCode = "en-US") {
    try {
      const voiceId = this.voices[languageCode] || this.voices["en-US"];

      const response = await axios({
        method: "POST",
        url: `${this.baseUrl}/text-to-speech/${voiceId}`,
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        data: {
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        responseType: "arraybuffer",
      });

      return response.data;
    } catch (error) {
      console.error("Error in ElevenLabs TTS:", error);
      throw new Error("Failed to convert text to speech using ElevenLabs");
    }
  }

  async getAvailableVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });
      return response.data.voices;
    } catch (error) {
      console.error("Error fetching ElevenLabs voices:", error);
      throw new Error("Failed to fetch available voices");
    }
  }
}

module.exports = new ElevenLabsTTS();
