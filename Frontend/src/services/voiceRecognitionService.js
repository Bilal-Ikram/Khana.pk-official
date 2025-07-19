// This file provides a frontend service that:

// Captures voice input using the browser's microphone.
// Sends recorded audio to a backend API for processing via Speech-to-Text (STT).
// Receives transcribed text and intent analysis.
// Optionally converts text back to speech using Text-to-Speech (TTS).
// Provides callbacks to notify the UI about status changes, errors, or final transcription results.

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://khana-backend-88zs.onrender.com";

class VoiceRecognitionService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusCallback = null;
    this.continuousMode = false;
    this.recordingTimeout = null;
    this.preferredLanguage = "auto"; // 'auto' for automatic detection
    this.supportedLanguages = ["en-US", "ur-PK", "hi-IN", "es-ES"];
  }

  // Set preferred language for recognition
  setPreferredLanguage(language) {
    this.preferredLanguage = language;
    console.log("Preferred language set to:", language);
  }

  // Get current preferred language
  getPreferredLanguage() {
    return this.preferredLanguage;
  }

  // Get list of supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  async startRecording(options = {}) {
    try {
      const {
        continuous = false,
        language = this.preferredLanguage,
        maxDuration = 10000,
        enableAutoDetection = true,
      } = options;

      this.continuousMode = continuous;

      // Request audio stream with enhanced constraints for better quality
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          // Enhanced constraints for better speech recognition
          latency: 0.01,
          volume: 1.0,
        },
      });

      // Log available audio tracks
      const audioTracks = this.stream.getAudioTracks();
      console.log(
        "Audio tracks available:",
        audioTracks.map((track) => ({
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: track.getSettings(),
        }))
      );

      // Check if the browser supports the desired mime type
      const mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(
          "Preferred mime type not supported, falling back to default"
        );
        this.mediaRecorder = new MediaRecorder(this.stream);
      } else {
        this.mediaRecorder = new MediaRecorder(this.stream, {
          mimeType: mimeType,
          audioBitsPerSecond: 48000,
        });
      }

      console.log("MediaRecorder created:", {
        mimeType: this.mediaRecorder.mimeType,
        state: this.mediaRecorder.state,
        audioBitsPerSecond: this.mediaRecorder.audioBitsPerSecond,
        language: language,
        autoDetection: enableAutoDetection,
      });

      // Add state change monitoring
      this.mediaRecorder.onstatechange = (event) => {
        console.log("MediaRecorder state changed:", {
          state: event.target.state,
          timestamp: new Date().toISOString(),
        });
      };

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        console.log("Data available event:", {
          size: event.data.size,
          type: event.data.type,
          state: this.mediaRecorder.state,
          timestamp: new Date().toISOString(),
        });
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        } else {
          console.warn("Received empty audio chunk");
        }
      };

      this.mediaRecorder.onstop = async () => {
        console.log("Recording stopped, processing chunks:", {
          totalChunks: this.audioChunks.length,
          totalSize: this.audioChunks.reduce(
            (sum, chunk) => sum + chunk.size,
            0
          ),
          language: language,
          autoDetection: enableAutoDetection,
        });

        if (this.audioChunks.length === 0) {
          console.warn("No audio chunks were recorded");
          this.notifyError("No audio was recorded");
          return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        console.log("Audio blob created:", {
          size: audioBlob.size,
          type: audioBlob.type,
        });

        try {
          await this.sendAudioToServer(audioBlob, {
            language: language,
            enableAutoDetection: enableAutoDetection,
          });
        } catch (error) {
          console.error("Error processing audio:", error);
          this.notifyError("Failed to process audio");
        }

        // If in continuous mode, restart recording
        if (this.continuousMode && this.isRecording) {
          this.audioChunks = [];
          this.mediaRecorder.start(1000);
        }
      };

      // Start recording with a shorter timeslice for more frequent data events
      this.mediaRecorder.start(1000);
      console.log("Recording started with configuration:", {
        mode: continuous ? "continuous" : "single",
        state: this.mediaRecorder.state,
        language: language,
        maxDuration: maxDuration,
        autoDetection: enableAutoDetection,
        timestamp: new Date().toISOString(),
      });

      this.isRecording = true;
      this.notifyStatus("recording_started");

      // Set a timeout to stop recording after specified duration if not in continuous mode
      if (!continuous) {
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.log(`Auto-stopping recording after ${maxDuration}ms`);
            this.stopRecording();
          }
        }, maxDuration);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      let errorMessage = "Failed to start voice recording";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Microphone access denied. Please allow microphone access and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Voice recording is not supported in this browser.";
      }

      this.notifyError(errorMessage);
      throw error;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      console.log("Stopping recording...");
      this.continuousMode = false;
      this.isRecording = false;

      // Clear the timeout if it exists
      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }

      // Stop the MediaRecorder
      if (this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop();
      }

      // Stop all audio tracks
      if (this.stream) {
        this.stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Audio track stopped:", track.label);
        });
      }

      this.notifyStatus("recording_stopped");
    }
  }

  async sendAudioToServer(audioBlob, options = {}) {
    try {
      this.notifyStatus("processing");

      // In your frontend, ensure you're sending:
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm"); // or 'audio.ogg'
      formData.append(
        "options",
        JSON.stringify({
          encoding: "WEBM_OPUS", // Make sure this matches
          sampleRateHertz: 48000,
          language: options.language || this.preferredLanguage,
          enableAutoDetection: options.enableAutoDetection !== false,
        })
      );

      console.log("Sending audio to server:", {
        size: audioBlob.size,
        language: options.language || this.preferredLanguage,
        autoDetection: options.enableAutoDetection !== false,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/voice/speech-to-text`, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header, let browser set it with boundary for FormData
        },
      });

      console.log("Server response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error("Server error:", errorData);
        throw new Error(
          errorData.message || "Failed to convert speech to text"
        );
      }

      const data = await response.json();
      console.log("Server response data:", data);

      if (data.success && data.data) {
        // After getting speech recognition result, call the full processing endpoint for automation
        if (data.data.text) {
          try {
            console.log("Calling full processing endpoint for automation...");
            const processResponse = await fetch(
              `${API_BASE_URL}/api/voice/process`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  // Only add Authorization header if token exists
                  ...(localStorage.getItem("token") && {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }),
                },
                body: JSON.stringify({
                  text: data.data.text,
                  language:
                    data.data.detectedLanguage ||
                    options.language ||
                    this.preferredLanguage,
                }),
              }
            );

            if (processResponse.ok) {
              const processResult = await processResponse.json();
              console.log("Full processing result:", processResult);

              // Enhance the result with automation data
              const enhancedResult = {
                ...data.data,
                clientTimestamp: new Date().toISOString(),
                requestedLanguage: options.language || this.preferredLanguage,
                autoDetectionEnabled: options.enableAutoDetection !== false,
                automationResult: processResult.success
                  ? processResult.data
                  : null,
                automationError: !processResult.success
                  ? processResult.message
                  : null,
              };

              if (this.onResultCallback) {
                this.onResultCallback(enhancedResult);
              }
            } else {
              console.error("Process endpoint failed:", processResponse.status);
              // Still call the callback with the original result
              const enhancedResult = {
                ...data.data,
                clientTimestamp: new Date().toISOString(),
                requestedLanguage: options.language || this.preferredLanguage,
                autoDetectionEnabled: options.enableAutoDetection !== false,
                automationError: "Failed to process automation request",
              };

              if (this.onResultCallback) {
                this.onResultCallback(enhancedResult);
              }
            }
          } catch (processError) {
            console.error("Error calling process endpoint:", processError);
            // Still call the callback with the original result
            const enhancedResult = {
              ...data.data,
              clientTimestamp: new Date().toISOString(),
              requestedLanguage: options.language || this.preferredLanguage,
              autoDetectionEnabled: options.enableAutoDetection !== false,
              automationError: "Network error during automation processing",
            };

            if (this.onResultCallback) {
              this.onResultCallback(enhancedResult);
            }
          }
        } else {
          // No text detected, just return the original result
          const enhancedResult = {
            ...data.data,
            clientTimestamp: new Date().toISOString(),
            requestedLanguage: options.language || this.preferredLanguage,
            autoDetectionEnabled: options.enableAutoDetection !== false,
          };

          if (this.onResultCallback) {
            this.onResultCallback(enhancedResult);
          }
        }
      } else if (!data.success) {
        throw new Error(data.message || "Server processing failed");
      }

      this.notifyStatus("processed");
      return data;
    } catch (error) {
      console.error("Error sending audio to server:", error);
      let errorMessage = "Failed to process voice input";

      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }

      this.notifyError(errorMessage);
      throw error;
    }
  }

  // Enhanced text-to-speech method
  async textToSpeech(text, options = {}) {
    try {
      const {
        language = this.preferredLanguage === "auto"
          ? "en-US"
          : this.preferredLanguage,
        voice = "default",
        speed = 1.0,
        pitch = 0,
      } = options;

      this.notifyStatus("generating_speech");

      const response = await fetch(`${API_BASE_URL}/api/voice/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language,
          voice,
          speed,
          pitch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Failed to generate speech");
      }

      const data = await response.json();

      if (data.success) {
        // Convert base64 audio to blob and play
        const audioData = atob(data.data.audio);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }

        const audioBlob = new Blob([audioArray], { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio
          .play()
          .then(() => {
            console.log("Audio playback started");
            this.notifyStatus("playing_speech");
          })
          .catch((error) => {
            console.error("Audio playback failed:", error);
            this.notifyError("Failed to play generated speech");
          });

        // Clean up the URL after playback
        audio.addEventListener("ended", () => {
          URL.revokeObjectURL(audioUrl);
          this.notifyStatus("speech_completed");
        });

        return audioBlob;
      } else {
        throw new Error(data.message || "Speech generation failed");
      }
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      this.notifyError("Failed to generate speech");
      throw error;
    }
  }

  // Get available voices for text-to-speech
  async getAvailableVoices() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voice/supported-languages`
      );
      const data = await response.json();

      if (data.success) {
        return data.data.languages;
      }
      return this.supportedLanguages;
    } catch (error) {
      console.error("Error getting available voices:", error);
      return this.supportedLanguages;
    }
  }

  onResult(callback) {
    this.onResultCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onStatus(callback) {
    this.onStatusCallback = callback;
  }

  notifyError(message) {
    console.error("VoiceRecognitionService Error:", message);
    if (this.onErrorCallback) {
      this.onErrorCallback(message);
    }
  }

  notifyStatus(status) {
    console.log("VoiceRecognitionService Status:", status);
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  getCurrentRecordingState() {
    return {
      isRecording: this.isRecording,
      continuousMode: this.continuousMode,
      preferredLanguage: this.preferredLanguage,
      mediaRecorderState: this.mediaRecorder?.state || "inactive",
    };
  }

  // Cleanup method
  cleanup() {
    this.stopRecording();
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusCallback = null;
  }
}

export default new VoiceRecognitionService();

// // This file provides a frontend service that:

// // Captures voice input using the browser's microphone.
// // Sends recorded audio to a backend API for processing via Speech-to-Text (STT).
// // Receives transcribed text and intent analysis.
// // Optionally converts text back to speech using Text-to-Speech (TTS).
// // Provides callbacks to notify the UI about status changes, errors, or final transcription results.

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// class VoiceRecognitionService {
//   constructor() {
//     this.mediaRecorder = null;
//     this.audioChunks = [];
//     this.isRecording = false;
//     this.stream = null;
//     this.onResultCallback = null;
//     this.onErrorCallback = null;
//     this.onStatusCallback = null;
//     this.continuousMode = false;
//     this.recordingTimeout = null;
//     this.preferredLanguage = 'auto'; // 'auto' for automatic detection
//     this.supportedLanguages = ['en-US', 'ur-PK', 'hi-IN', 'es-ES'];
//   }

//   // Set preferred language for recognition
//   setPreferredLanguage(language) {
//     this.preferredLanguage = language;
//     console.log('Preferred language set to:', language);
//   }

//   // Get current preferred language
//   getPreferredLanguage() {
//     return this.preferredLanguage;
//   }

//   // Get list of supported languages
//   getSupportedLanguages() {
//     return this.supportedLanguages;
//   }

//   async startRecording(options = {}) {
//     try {
//       const {
//         continuous = false,
//         language = this.preferredLanguage,
//         maxDuration = 10000,
//         enableAutoDetection = true
//       } = options;

//       this.continuousMode = continuous;

//       // Request audio stream with enhanced constraints for better quality
//       this.stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//           channelCount: 1,
//           sampleRate: 48000,
//           // Enhanced constraints for better speech recognition
//           latency: 0.01,
//           volume: 1.0
//         },
//       });

//       // Log available audio tracks
//       const audioTracks = this.stream.getAudioTracks();
//       console.log(
//         "Audio tracks available:",
//         audioTracks.map((track) => ({
//           label: track.label,
//           enabled: track.enabled,
//           muted: track.muted,
//           readyState: track.readyState,
//           settings: track.getSettings()
//         }))
//       );

//       // Check if the browser supports the desired mime type
//       const mimeType = "audio/webm;codecs=opus";
//       if (!MediaRecorder.isTypeSupported(mimeType)) {
//         console.warn(
//           "Preferred mime type not supported, falling back to default"
//         );
//         this.mediaRecorder = new MediaRecorder(this.stream);
//       } else {
//         this.mediaRecorder = new MediaRecorder(this.stream, {
//           mimeType: mimeType,
//           audioBitsPerSecond: 48000,
//         });
//       }

//       console.log("MediaRecorder created:", {
//         mimeType: this.mediaRecorder.mimeType,
//         state: this.mediaRecorder.state,
//         audioBitsPerSecond: this.mediaRecorder.audioBitsPerSecond ,
//         language: language,
//         autoDetection: enableAutoDetection
//       });

//       // Add state change monitoring
//       this.mediaRecorder.onstatechange = (event) => {
//         console.log("MediaRecorder state changed:", {
//           state: event.target.state,
//           timestamp: new Date().toISOString(),
//         });
//       };

//       this.audioChunks = [];

//       this.mediaRecorder.ondataavailable = (event) => {
//         console.log("Data available event:", {
//           size: event.data.size,
//           type: event.data.type,
//           state: this.mediaRecorder.state,
//           timestamp: new Date().toISOString(),
//         });
//         if (event.data.size > 0) {
//           this.audioChunks.push(event.data);
//         } else {
//           console.warn("Received empty audio chunk");
//         }
//       };

//       this.mediaRecorder.onstop = async () => {
//         console.log("Recording stopped, processing chunks:", {
//           totalChunks: this.audioChunks.length,
//           totalSize: this.audioChunks.reduce(
//             (sum, chunk) => sum + chunk.size,
//             0
//           ),
//           language: language,
//           autoDetection: enableAutoDetection
//         });

//         if (this.audioChunks.length === 0) {
//           console.warn("No audio chunks were recorded");
//           this.notifyError("No audio was recorded");
//           return;
//         }

//         const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
//         console.log("Audio blob created:", {
//           size: audioBlob.size,
//           type: audioBlob.type,
//         });

//         try {
//           await this.sendAudioToServer(audioBlob, {
//             language: language,
//             enableAutoDetection: enableAutoDetection
//           });
//         } catch (error) {
//           console.error("Error processing audio:", error);
//           this.notifyError("Failed to process audio");
//         }

//         // If in continuous mode, restart recording
//         if (this.continuousMode && this.isRecording) {
//           this.audioChunks = [];
//           this.mediaRecorder.start(1000);
//         }
//       };

//       // Start recording with a shorter timeslice for more frequent data events
//       this.mediaRecorder.start(1000);
//       console.log("Recording started with configuration:", {
//         mode: continuous ? "continuous" : "single",
//         state: this.mediaRecorder.state,
//         language: language,
//         maxDuration: maxDuration,
//         autoDetection: enableAutoDetection,
//         timestamp: new Date().toISOString(),
//       });

//       this.isRecording = true;
//       this.notifyStatus("recording_started");

//       // Set a timeout to stop recording after specified duration if not in continuous mode
//       if (!continuous) {
//         this.recordingTimeout = setTimeout(() => {
//           if (this.isRecording) {
//             console.log(`Auto-stopping recording after ${maxDuration}ms`);
//             this.stopRecording();
//           }
//         }, maxDuration);
//       }
//     } catch (error) {
//       console.error("Error starting recording:", error);
//       let errorMessage = "Failed to start voice recording";

//       if (error.name === 'NotAllowedError') {
//         errorMessage = "Microphone access denied. Please allow microphone access and try again.";
//       } else if (error.name === 'NotFoundError') {
//         errorMessage = "No microphone found. Please connect a microphone and try again.";
//       } else if (error.name === 'NotSupportedError') {
//         errorMessage = "Voice recording is not supported in this browser.";
//       }

//       this.notifyError(errorMessage);
//       throw error;
//     }
//   }

//   stopRecording() {
//     if (this.mediaRecorder && this.isRecording) {
//       console.log("Stopping recording...");
//       this.continuousMode = false;
//       this.isRecording = false;

//       // Clear the timeout if it exists
//       if (this.recordingTimeout) {
//         clearTimeout(this.recordingTimeout);
//         this.recordingTimeout = null;
//       }

//       // Stop the MediaRecorder
//       if (this.mediaRecorder.state === "recording") {
//         this.mediaRecorder.stop();
//       }

//       // Stop all audio tracks
//       if (this.stream) {
//         this.stream.getTracks().forEach((track) => {
//           track.stop();
//           console.log("Audio track stopped:", track.label);
//         });
//       }

//       this.notifyStatus("recording_stopped");
//     }
//   }

//   async sendAudioToServer(audioBlob, options = {}) {
//     try {
//       this.notifyStatus("processing");

//       // In your frontend, ensure you're sending:
//       const formData = new FormData();
//       formData.append('audio', audioBlob, 'audio.webm'); // or 'audio.ogg'
//       formData.append('options', JSON.stringify({
//         encoding: 'WEBM_OPUS', // Make sure this matches
//         sampleRateHertz: 48000,
//         language: options.language || this.preferredLanguage,
//         enableAutoDetection: options.enableAutoDetection !== false
//       }));

//       console.log("Sending audio to server:", {
//         size: audioBlob.size,
//         language: options.language || this.preferredLanguage,
//         autoDetection: options.enableAutoDetection !== false,
//         timestamp: new Date().toISOString()
//       });

//       const response = await fetch(`${API_BASE_URL}/api/voice/speech-to-text`, {
//         method: "POST",
//         body: formData,
//         headers: {
//           // Don't set Content-Type header, let browser set it with boundary for FormData
//         }
//       });

//       console.log("Server response status:", response.status);
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({
//           message: `HTTP ${response.status}: ${response.statusText}`
//         }));
//         console.error("Server error:", errorData);
//         throw new Error(
//           errorData.message || "Failed to convert speech to text"
//         );
//       }

//       const data = await response.json();
//       console.log("Server response data:", data);

//       if (data.success && this.onResultCallback) {
//         // Enhance the result with frontend metadata
//         const enhancedResult = {
//           ...data.data,
//           clientTimestamp: new Date().toISOString(),
//           requestedLanguage: options.language || this.preferredLanguage,
//           autoDetectionEnabled: options.enableAutoDetection !== false
//         };
//         this.onResultCallback(enhancedResult);
//       } else if (!data.success) {
//         throw new Error(data.message || "Server processing failed");
//       }

//       this.notifyStatus("processed");
//       return data;
//     } catch (error) {
//       console.error("Error sending audio to server:", error);
//       let errorMessage = "Failed to process voice input";

//       if (error.message.includes('network') || error.message.includes('fetch')) {
//         errorMessage = "Network error. Please check your connection and try again.";
//       } else if (error.message.includes('timeout')) {
//         errorMessage = "Request timed out. Please try again.";
//       }

//       this.notifyError(errorMessage);
//       throw error;
//     }
//   }

//   // Enhanced text-to-speech method
//   async textToSpeech(text, options = {}) {
//     try {
//       const {
//         language = this.preferredLanguage === 'auto' ? 'en-US' : this.preferredLanguage,
//         voice = 'default',
//         speed = 1.0,
//         pitch = 0
//       } = options;

//       this.notifyStatus("generating_speech");

//       const response = await fetch(`${API_BASE_URL}/api/voice/text-to-speech`, {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           text,
//           language,
//           voice,
//           speed,
//           pitch
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({
//           message: `HTTP ${response.status}: ${response.statusText}`
//         }));
//         throw new Error(errorData.message || "Failed to generate speech");
//       }

//       const data = await response.json();

//       if (data.success) {
//         // Convert base64 audio to blob and play
//         const audioData = atob(data.data.audio);
//         const audioArray = new Uint8Array(audioData.length);
//         for (let i = 0; i < audioData.length; i++) {
//           audioArray[i] = audioData.charCodeAt(i);
//         }

//         const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         const audio = new Audio(audioUrl);

//         audio.play().then(() => {
//           console.log("Audio playback started");
//           this.notifyStatus("playing_speech");
//         }).catch(error => {
//           console.error("Audio playback failed:", error);
//           this.notifyError("Failed to play generated speech");
//         });

//         // Clean up the URL after playback
//         audio.addEventListener('ended', () => {
//           URL.revokeObjectURL(audioUrl);
//           this.notifyStatus("speech_completed");
//         });

//         return audioBlob;
//       } else {
//         throw new Error(data.message || "Speech generation failed");
//       }
//     } catch (error) {
//       console.error("Error in text-to-speech:", error);
//       this.notifyError("Failed to generate speech");
//       throw error;
//     }
//   }

//   // Get available voices for text-to-speech
//   async getAvailableVoices() {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/voice/supported-languages`);
//       const data = await response.json();

//       if (data.success) {
//         return data.data.languages;
//       }
//       return this.supportedLanguages;
//     } catch (error) {
//       console.error("Error getting available voices:", error);
//       return this.supportedLanguages;
//     }
//   }

//   onResult(callback) {
//     this.onResultCallback = callback;
//   }

//   onError(callback) {
//     this.onErrorCallback = callback;
//   }

//   onStatus(callback) {
//     this.onStatusCallback = callback;
//   }

//   notifyError(message) {
//     console.error("VoiceRecognitionService Error:", message);
//     if (this.onErrorCallback) {
//       this.onErrorCallback(message);
//     }
//   }

//   notifyStatus(status) {
//     console.log("VoiceRecognitionService Status:", status);
//     if (this.onStatusCallback) {
//       this.onStatusCallback(status);
//     }
//   }

//   isSupported() {
//     return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
//   }

//   getCurrentRecordingState() {
//     return {
//       isRecording: this.isRecording,
//       continuousMode: this.continuousMode,
//       preferredLanguage: this.preferredLanguage,
//       mediaRecorderState: this.mediaRecorder?.state || 'inactive'
//     };
//   }

//   // Cleanup method
//   cleanup() {
//     this.stopRecording();
//     this.onResultCallback = null;
//     this.onErrorCallback = null;
//     this.onStatusCallback = null;
//   }
// }

// export default new VoiceRecognitionService();
