import { createContext, useContext, useState, useCallback } from "react";

const VoiceAssistantContext = createContext();

export const VoiceAssistantProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [language, setLanguage] = useState("en-US");

  const startListening = useCallback(async () => {
    try {
      setIsListening(true);
      // Web Speech API implementation will go here
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const processVoiceCommand = useCallback(
    async (text) => {
      try {
        setIsProcessing(true);
        // API call to backend for processing voice command
        const response = await fetch("/api/voice/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, language }),
        });
        const data = await response.json();
        setResponse(data.response);
        // Text-to-speech implementation will go here
      } catch (error) {
        console.error("Error processing voice command:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [language]
  );

  const value = {
    isListening,
    transcript,
    isProcessing,
    response,
    language,
    startListening,
    stopListening,
    processVoiceCommand,
    setLanguage,
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error(
      "useVoiceAssistant must be used within a VoiceAssistantProvider"
    );
  }
  return context;
};
