const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class VoiceGreetingService {
  async textToSpeech(text, language = "en-US") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to convert text to speech");
      }

      if (!data.success || !data.data?.audio) {
        throw new Error("Invalid response from text-to-speech service");
      }

      return data.data.audio;
    } catch (error) {
      console.error("Error converting text to speech:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  playAudio(base64Audio) {
    try {
      if (!base64Audio) {
        throw new Error("No audio data provided");
      }

      // Create a data URL from the base64 string
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);

      // Add event listeners for better error handling
      audio.onended = () => {
        audio.remove();
      };

      audio.onerror = () => {
        console.error("Audio playback error");
        audio.remove();
        throw new Error("Failed to play audio");
      };

      // Return a promise that resolves when audio finishes playing
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          audio.remove();
          resolve();
        };
        audio.onerror = () => {
          audio.remove();
          reject(new Error("Failed to play audio"));
        };
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      throw error;
    }
  }
}

export default new VoiceGreetingService();