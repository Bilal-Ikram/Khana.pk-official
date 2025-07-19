import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Settings, Sparkles, Brain, Zap, X } from "lucide-react";
import voiceGreetingService from "../services/voiceGreetingService";
import voiceRecognitionService from "../services/voiceRecognitionService";
import EnhancedVoiceOrderingService  from "../services/voiceInteractionService";
import { toast } from "react-hot-toast";
import "../styles/voiceInteraction.css";

const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English" },
  { code: "es-ES", name: "Spanish" },
  { code: "hi-IN", name: "Hindi" },
];

const PROCESSING_STAGES = [
  { icon: Mic, text: "Capturing your voice...", duration: 800 },
  { icon: Brain, text: "Understanding your intent...", duration: 1200 },
  { icon: Sparkles, text: "Analyzing preferences...", duration: 1000 },
  { icon: Zap, text: "Preparing your order...", duration: 1500 },
];

const VoiceGreeting = () => {
  const [isListening, setIsListening] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("en-US");
  const [showSettings, setShowSettings] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentStep, setCurrentStep] = useState(null);
  const [processingStage, setProcessingStage] = useState(0);
  const [showProcessing, setShowProcessing] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [audioLevels, setAudioLevels] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasShownInitialTooltip, setHasShownInitialTooltip] = useState(false);
  const [showInitialWaves, setShowInitialWaves] = useState(true);

  const cursorRef = useRef(null);
  const feedbackRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const instructionTimeoutRef = useRef(null);

  const voiceInteractionService = new EnhancedVoiceOrderingService();


useEffect(() => {
  const timer = setTimeout(() => {
    setShowInitialWaves(false);
  }, 5000); // 5 seconds

  return () => clearTimeout(timer);
}, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-show tooltip on mobile after page load
  useEffect(() => {
    if (isMobile && !hasShownInitialTooltip) {
      const timer = setTimeout(() => {
        setShowInstructions(true);
        setHasShownInitialTooltip(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowInstructions(false);
        }, 6000);
      }, 2000); // Show after 2 seconds of page load
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, hasShownInitialTooltip]);

  useEffect(() => {
    // Set up voice recognition callbacks
    voiceRecognitionService.onResult((data) => {
      setTranscript(data.text);

      // Handle intent data
      if (data.intent) {
        const { intent, response, confidence } = data.intent;

        // Show confidence level
        if (confidence < 0.7) {
          toast.error(
            "I'm not sure I understood correctly. Could you please repeat?"
          );
          return;
        }

        // Show the response
        toast.success(response);

        // Start voice-guided interaction (currently limited to UI feedback)
        try {
          voiceInteractionService.startGuidedInteraction(
            intent,
            data.intent.entities
          );
        } catch (error) {
          console.error("Voice interaction error:", error);
          toast.error("Voice interaction temporarily unavailable");
        }
      }
    });

    voiceRecognitionService.onError((error) => {
      console.error("Voice recognition error:", error);
      toast.error(error);
      setIsListening(false);
    });

    voiceRecognitionService.onStatus((newStatus) => {
      setStatus(newStatus);
    });

    // Set up voice interaction callbacks
    voiceInteractionService.onStepChange((step) => {
      setCurrentStep(step);
      if (step?.target) {
        moveCursorToElement(step.target);
      }
    });

    return () => {
      voiceRecognitionService.stopRecording();
      voiceInteractionService.stopGuidedInteraction();
    };
  }, []);

    // Simulate audio levels for visual feedback
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        const newLevels = Array.from({ length: 8 }, () => Math.random() * 100);
        setAudioLevels(newLevels);
        setPulseIntensity(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevels([]);
      setPulseIntensity(0);
    }
  }, [isListening]);

  // Enhanced processing simulation
  useEffect(() => {
    if (status === "processing") {
      setShowProcessing(true);
      setProcessingStage(0);
      
      const runStages = async () => {
        for (let i = 0; i < PROCESSING_STAGES.length; i++) {
          setProcessingStage(i);
          await new Promise(resolve => 
            setTimeout(resolve, PROCESSING_STAGES[i].duration)
          );
        }
        setShowProcessing(false);
        setStatus("completed");
      };
      
      runStages();
    }
  }, [status]);


  // Move cursor to element (currently just for visual feedback)
  const moveCursorToElement = (selector) => {
    if (!selector) return; // Handle null/undefined selector
    
    const element = document.querySelector(`[data-voice-target="${selector}"]`);
    if (element && cursorRef.current) {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;

      if (feedbackRef.current) {
        feedbackRef.current.style.setProperty("--x", `${x}px`);
        feedbackRef.current.style.setProperty("--y", `${y}px`);
        feedbackRef.current.classList.add("active");
        setTimeout(() => feedbackRef.current.classList.remove("active"), 1000);
      }
    }
  };

  const playGreeting = async () => {
    try {
      setIsPlaying(true);
      const greeting =
        "Hello! I'm your voice assistant. How can I help you today?";
      const audioData = await voiceGreetingService.textToSpeech(
        greeting,
        currentLanguage
      );
      await voiceGreetingService.playAudio(audioData);
      setHasGreeted(true);
    } catch (error) {
      console.error("Error playing greeting:", error);
      toast.error("Failed to play greeting");
    } finally {
      setIsPlaying(false);
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      voiceRecognitionService.stopRecording();
      setIsListening(false);
    } else {
      try {
        if (!hasGreeted) {
          await playGreeting();
        }
        await voiceRecognitionService.startRecording(continuousMode);
        setIsListening(true);
      } catch (error) {
        console.error("Error starting voice recognition:", error);
        toast.error("Failed to start voice recognition");
      }
    }
  };

  const showInstructionsTooltip = () => {
    setShowInstructions(true);
    // Clear any existing timeout
    if (instructionTimeoutRef.current) {
      clearTimeout(instructionTimeoutRef.current);
    }
    // Set new timeout for 60 seconds
    instructionTimeoutRef.current = setTimeout(() => {
      setShowInstructions(false);
    }, 60000);
  };

  const hideInstructionsTooltip = () => {
    setShowInstructions(false);
    if (instructionTimeoutRef.current) {
      clearTimeout(instructionTimeoutRef.current);
    }
  };

    // Handle mobile tap for tooltip
  const handleMobileTooltip = () => {
    if (isMobile) {
      setShowInstructions(!showInstructions);
    } else {
      toggleListening();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }
    };
  }, []);

  const changeLanguage = async (languageCode) => {
    setCurrentLanguage(languageCode);
    setShowSettings(false);

    // Play confirmation in new language
    try {
      const confirmation = `Language changed to ${
        SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode)?.name
      }`;
      const audioData = await voiceGreetingService.textToSpeech(
        confirmation,
        languageCode
      );
      await voiceGreetingService.playAudio(audioData);
    } catch (error) {
      console.error("Error playing language confirmation:", error);
    }
  };

  return (
    <>
      {/* Enhanced Voice Cursor */}
      <div 
        className="fixed pointer-events-none z-50 w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-all duration-300"
        ref={cursorRef}
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: currentStep ? 1 : 0,
          boxShadow: currentStep ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
        }}
      />

      {/* Enhanced Voice Feedback */}
      <div 
        className="fixed pointer-events-none z-40 w-20 h-20 rounded-full border-2 border-blue-500 opacity-0 transition-all duration-500"
        ref={feedbackRef}
        style={{
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 0.5s ease-in-out'
        }}
      />

      {/* Main Control Panel */}
      <div className="fixed bottom-8 left-8 z-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Audio Visualizer */}
          {isListening && (
            <div className="flex items-end space-x-1 h-12 mb-4">
              {audioLevels.map((level, index) => (
                <div
                  key={index}
                  className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, level * 0.4)}px`,
                    opacity: 0.7 + (level * 0.003)
                  }}
                />
              ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center space-x-3">
            {/* Greeting Button */}
            {!hasGreeted && (
              <button
                onClick={playGreeting}
                disabled={isPlaying}
                className={`hidden md:block group relative p-3 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  isPlaying
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                }`}
                aria-label="Play welcome message"
              >
                <Volume2 className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                )}
              </button>
            )}

            {/* Main Mic Button */}
            <div className="relative">
              {/* Instructions Tooltip */}
              {showInstructions && (
                <div className="absolute bottom-full left-3/4 md:left-0 transform -translate-x-1/2 ml-20  mb-6 w-80 bg-white/95 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/20 z-10 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">
                      How AI Works?
                      {isMobile && (
  <button
    onClick={() => setShowInstructions(false)}
    className="mt-4 ml-8 text-gray-400  bg-slate-100 p-2 rounded-full hover:text-gray-700"
    aria-label="Close instructions"
  >
    <X size={16} />
  </button>
)}
                    </h4>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Try speaking after clicking the Mic button
                    </p>
                    <div className="bg-blue-50 p-4 rounded-xl mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Order</strong> <em>Foodname</em> <strong>from</strong> <em>RestaurantName</em>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        (only below listed restaurant will work)
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                      <p className="text-sm text-green-700 font-medium">
                        e.g. &quot;Order Burger from kababjess&quot;
                      </p>
                    </div>
                    
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/95"></div>
                </div>
              )}

              {/* Main Mic Button Container with Wave Animation */}
              <div className="relative">
                {/* Attention Wave Rings - Only show when not listening */}
                {!isListening && showInitialWaves &&  (
                  <>
                    {/* <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                    <div className="absolute inset-0 rounded-3xl border-2 border-purple-400/30 animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                    <div className="absolute inset-0 rounded-3xl border-2 border-pink-400/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
                     */}
                    {/* Expanding Wave Rings */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 animate-ping" style={{ animationDelay: '0s', animationDuration: '2s'}} />
                    <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                    <div className="absolute inset-0 rounded-3xl border-2 border-purple-400/30 animate-ping" style={{ animationDelay: '1s', animationDuration: '2s' }} />
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                  </>
                )}

                <button
                  onClick={handleMobileTooltip}
                  onMouseEnter={showInstructionsTooltip}
                  onMouseLeave={hideInstructionsTooltip}
                  onDoubleClick={isMobile ? toggleListening : undefined}
                  className={`group relative p-5 rounded-3xl shadow-2xl transition-all duration-300 transform hover:scale-105 z-10 ${
                    isListening
                      ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  }`}
                  style={{
                    boxShadow: isListening 
                      ? `0 0 30px rgba(239, 68, 68, ${0.3 + pulseIntensity * 0.007})` 
                      : '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}
                  aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <Mic className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" />
                  )}
                  
                  {/* Pulse Ring */}
                  {isListening && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-ping" style={{ animationDelay: '0s', animationDuration: '2s'}} />
                  )}
                  
                  {/* Status Indicator */}
                  {status === "recording" && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                  )}
                </button>
              </div>

              {/* Mobile Instructions */}
              {isMobile && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 text-center">
                  <p className="text-white/70 text-sm">
                    Tap for help • Double-tap to {isListening ? 'stop' : 'start'}
                  </p>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="hidden md:block group relative p-3 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Enhanced Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-24 left-0 bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/20 min-w-[280px]">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="continuousMode"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                />
                <label
                  htmlFor="continuousMode"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Continuous Listening
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Processing Modal */}
      {showProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg p-2 md:p-8 rounded-3xl shadow-2xl max-w-md w-full mx-5 text-center">
            <div className="mb-6 ">
              {React.createElement(PROCESSING_STAGES[processingStage].icon, {
                className: "w-16 h-16 mx-auto text-blue-500 animate-bounce"
              })}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              AI is Working
            </h3>
            <p className="text-gray-600 mb-6">
              {PROCESSING_STAGES[processingStage].text}
            </p>
            <div className="flex justify-center space-x-2">
              {PROCESSING_STAGES.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === processingStage
                      ? 'bg-blue-500 scale-125'
                      : index < processingStage
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Transcript Display */}
      {transcript && !showProcessing && (
        <div className="fixed bottom-32 md:left-8 bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl max-w-300px md:max-w-md border border-white/20 mx-auto z-50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{transcript}</p>
              {currentStep && (
                <div className="mt-3 text-sm text-blue-600 font-medium">
                  {currentStep.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>
    </>
  );
};

export default VoiceGreeting;







// import { useState, useEffect, useRef } from "react";
// import { Mic, MicOff, Volume2, Settings } from "lucide-react";
// import voiceGreetingService from "../services/voiceGreetingService";
// import voiceRecognitionService from "../services/voiceRecognitionService";
// import voiceInteractionService from "../services/voiceInteractionService";
// import { toast } from "react-hot-toast";
// import "../styles/voiceInteraction.css";

// const SUPPORTED_LANGUAGES = [
//   { code: "en-US", name: "English" },
//   { code: "es-ES", name: "Spanish" },
//   { code: "hi-IN", name: "Hindi" },
// ];

// const VoiceGreeting = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [hasGreeted, setHasGreeted] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [currentLanguage, setCurrentLanguage] = useState("en-US");
//   const [showSettings, setShowSettings] = useState(false);
//   const [continuousMode, setContinuousMode] = useState(false);
//   const [status, setStatus] = useState("idle");
//   const [currentStep, setCurrentStep] = useState(null);
//   const cursorRef = useRef(null);
//   const feedbackRef = useRef(null);

//   useEffect(() => {
//     // Set up voice recognition callbacks
//     voiceRecognitionService.onResult((data) => {
//       setTranscript(data.text);

//       // Handle intent data
//       if (data.intent) {
//         const { intent, response, confidence } = data.intent;

//         // Show confidence level
//         if (confidence < 0.7) {
//           toast.error(
//             "I'm not sure I understood correctly. Could you please repeat?"
//           );
//           return;
//         }

//         // Show the response
//         toast.success(response);

//         // Start voice-guided interaction
//         voiceInteractionService.startGuidedInteraction(
//           intent,
//           data.intent.entities
//         );
//       }
//     });

//     voiceRecognitionService.onError((error) => {
//       console.error("Voice recognition error:", error);
//       toast.error(error);
//       setIsListening(false);
//     });

//     voiceRecognitionService.onStatus((newStatus) => {
//       setStatus(newStatus);
//     });

//     // Set up voice interaction callbacks
//     voiceInteractionService.onStepChange((step) => {
//       setCurrentStep(step);
//       if (step?.target) {
//         moveCursorToElement(step.target);
//       }
//     });

//     return () => {
//       voiceRecognitionService.stopRecording();
//       voiceInteractionService.stopGuidedInteraction();
//     };
//   }, []);

//   // Move cursor to element
//   const moveCursorToElement = (selector) => {
//     const element = document.querySelector(`[data-voice-target="${selector}"]`);
//     if (element && cursorRef.current) {
//       const rect = element.getBoundingClientRect();
//       const x = rect.left + rect.width / 2;
//       const y = rect.top + rect.height / 2;

//       cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;

//       if (feedbackRef.current) {
//         feedbackRef.current.style.setProperty("--x", `${x}px`);
//         feedbackRef.current.style.setProperty("--y", `${y}px`);
//         feedbackRef.current.classList.add("active");
//         setTimeout(() => feedbackRef.current.classList.remove("active"), 1000);
//       }
//     }
//   };

//   const playGreeting = async () => {
//     try {
//       setIsPlaying(true);
//       const greeting =
//         "Hello! I'm your voice assistant. How can I help you today?";
//       const audioData = await voiceGreetingService.textToSpeech(
//         greeting,
//         currentLanguage
//       );
//       await voiceGreetingService.playAudio(audioData);
//       setHasGreeted(true);
//     } catch (error) {
//       console.error("Error playing greeting:", error);
//       toast.error("Failed to play greeting");
//     } finally {
//       setIsPlaying(false);
//     }
//   };

//   const toggleListening = async () => {
//     if (isListening) {
//       voiceRecognitionService.stopRecording();
//       setIsListening(false);
//     } else {
//       try {
//         if (!hasGreeted) {
//           await playGreeting();
//         }
//         await voiceRecognitionService.startRecording(continuousMode);
//         setIsListening(true);
//       } catch (error) {
//         console.error("Error starting voice recognition:", error);
//         toast.error("Failed to start voice recognition");
//       }
//     }
//   };

//   const changeLanguage = async (languageCode) => {
//     setCurrentLanguage(languageCode);
//     setShowSettings(false);

//     // Play confirmation in new language
//     try {
//       const confirmation = `Language changed to ${
//         SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode)?.name
//       }`;
//       const audioData = await voiceGreetingService.textToSpeech(
//         confirmation,
//         languageCode
//       );
//       await voiceGreetingService.playAudio(audioData);
//     } catch (error) {
//       console.error("Error playing language confirmation:", error);
//     }
//   };

//   return (
//     <>
//       <div className="voice-cursor" ref={cursorRef} />
//       <div className="voice-feedback" ref={feedbackRef} />

//       <div className="fixed bottom-4 left-4 z-50 flex gap-2">
//         {!hasGreeted && (
//           <button
//             onClick={playGreeting}
//             disabled={isPlaying}
//             className={`p-4 rounded-full shadow-lg transition-all ${
//               isPlaying
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-500 hover:bg-green-600"
//             }`}
//             aria-label="Play welcome message"
//           >
//             <Volume2 className="w-6 h-6 text-white" />
//           </button>
//         )}

//         <button
//           onClick={toggleListening}
//           className={`p-4 rounded-full shadow-lg transition-all relative ${
//             isListening
//               ? "bg-red-500 hover:bg-red-600"
//               : "bg-blue-500 hover:bg-blue-600"
//           }`}
//           aria-label={isListening ? "Stop listening" : "Start listening"}
//         >
//           {isListening ? (
//             <MicOff className="w-6 h-6 text-white" />
//           ) : (
//             <Mic className="w-6 h-6 text-white" />
//           )}
//           {status === "recording" && (
//             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
//           )}
//         </button>

//         <button
//           onClick={() => setShowSettings(!showSettings)}
//           className="p-4 rounded-full shadow-lg transition-all bg-gray-500 hover:bg-gray-600"
//           aria-label="Settings"
//         >
//           <Settings className="w-6 h-6 text-white" />
//         </button>

//         {showSettings && (
//           <div className="absolute bottom-20 left-4 bg-white p-4 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold mb-2">Settings</h3>
//             <div className="space-y-2">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Language
//                 </label>
//                 <select
//                   value={currentLanguage}
//                   onChange={(e) => changeLanguage(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                 >
//                   {SUPPORTED_LANGUAGES.map((lang) => (
//                     <option key={lang.code} value={lang.code}>
//                       {lang.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="continuousMode"
//                   checked={continuousMode}
//                   onChange={(e) => setContinuousMode(e.target.checked)}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label
//                   htmlFor="continuousMode"
//                   className="ml-2 block text-sm text-gray-700"
//                 >
//                   Continuous Listening
//                 </label>
//               </div>
//             </div>
//           </div>
//         )}

//         {transcript && (
//           <div className="fixed bottom-20 left-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
//             <p className="text-gray-800">{transcript}</p>
//             {status === "processing" && (
//               <div className="mt-2 flex items-center">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
//                 <span className="text-sm text-gray-500">Processing...</span>
//               </div>
//             )}
//             {currentStep && (
//               <div className="mt-2 text-sm text-blue-600">
//                 {currentStep.message}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default VoiceGreeting;
// // 
