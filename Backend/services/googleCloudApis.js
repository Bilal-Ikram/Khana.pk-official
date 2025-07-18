const { SpeechClient } = require("@google-cloud/speech");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

class GoogleCloudApis {
  constructor() {
    this.speechClient = new SpeechClient();
    this.ttsClient = new TextToSpeechClient();
  }

  async speechToText(audioBuffer, languageCode = "en-US") {
    try {
      const request = {
        audio: {
          content: audioBuffer.toString("base64"),
        },
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: languageCode,
        },
      };

      const [response] = await this.speechClient.recognize(request);
      return response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");
    } catch (error) {
      console.error("Error in speech to text conversion:", error);
      throw new Error("Failed to convert speech to text");
    }
  }

  async textToSpeech(text, languageCode = "en-US") {
    try {
      const request = {
        input: { text },
        voice: {
          languageCode,
          ssmlGender: "NEUTRAL",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
          pitch: 0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error("Error in text to speech conversion:", error);
      throw new Error("Failed to convert text to speech");
    }
  }
}

module.exports = new GoogleCloudApis();
