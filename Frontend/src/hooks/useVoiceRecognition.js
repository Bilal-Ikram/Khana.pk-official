import { useState, useEffect, useCallback, useRef } from "react";
import voiceService from "../services/voiceService";

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en-US");

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          handleCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(event.error);
        stopListening();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, handleCommand, stopListening]);

  const handleCommand = useCallback(
    async (text) => {
      try {
        setIsProcessing(true);
        setError(null);

        const response = await voiceService.processVoiceCommand(text, language);

        if (response.data.audio) {
          await voiceService.playAudio(response.data.audio);
        }

        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [language]
  );

  const startListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      }
    } catch (error) {
      setError("Failed to start voice recognition");
      console.error("Error starting voice recognition:", error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isProcessing,
    error,
    language,
    setLanguage,
    startListening,
    stopListening,
    toggleListening,
  };
};

export default useVoiceRecognition;
