const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class VoiceService {
  async processVoiceCommand(text, language = "en-US") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Only add Authorization header if token exists
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          })
        },
        body: JSON.stringify({ text, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process voice command");
      }

      // Return the full response for better handling
      return data;
    } catch (error) {
      console.error("Error processing voice command:", error);
      throw error;
    }
  }

  async textToSpeech(text, language = "en-US") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Only add Authorization header if token exists
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          })
        },
        body: JSON.stringify({ text, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to convert text to speech");
      }

      return data.data.audio;
    } catch (error) {
      console.error("Error converting text to speech:", error);
      throw error;
    }
  }

  // Enhanced playAudio method that works with base64 data
  async playAudio(audioData) {
    try {
      let audioUrl;
      
      // Check if audioData is base64 string or binary data
      if (typeof audioData === 'string') {
        // It's base64, create data URL
        audioUrl = `data:audio/mpeg;base64,${audioData}`;
      } else {
        // It's binary data, create blob URL
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        audioUrl = URL.createObjectURL(audioBlob);
      }

      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          if (audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
          resolve();
        };

        audio.onerror = () => {
          if (audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
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

export default new VoiceService();