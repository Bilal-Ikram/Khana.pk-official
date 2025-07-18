const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voiceController");
const { requireAuth: authenticate, optionalAuth } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

// Create the upload middleware ONCE
const uploadMiddleware = voiceController.uploadAudio();

// Debug each method that's used in routes
console.log("=== CHECKING ALL ROUTE METHODS ===");
console.log("uploadAudio result:", uploadMiddleware);
console.log("processVoiceCommand:", typeof voiceController.processVoiceCommand);
console.log("textToSpeech:", typeof voiceController.textToSpeech);
console.log("speechToText:", typeof voiceController.speechToText);
console.log("processAuthenticatedVoiceCommand:", typeof voiceController.processAuthenticatedVoiceCommand);
console.log("getVoiceHistory:", typeof voiceController.getVoiceHistory);
console.log("clearVoiceHistory:", typeof voiceController.clearVoiceHistory);
console.log("getVoicePreferences:", typeof voiceController.getVoicePreferences);
console.log("updateVoicePreferences:", typeof voiceController.updateVoicePreferences);
console.log("=== END METHOD CHECK ===");

// Add these debug lines
console.log("=== DEBUGGING CONTROLLER IMPORT ===");
console.log("voiceController type:", typeof voiceController);
console.log("voiceController is null/undefined:", voiceController == null);
console.log("Available methods:", Object.getOwnPropertyNames(voiceController));
console.log("processVoiceCommand exists:", typeof voiceController.processVoiceCommand === 'function');
console.log("=== END DEBUG ===");

// Rate limiting for voice endpoints (to prevent abuse)
const voiceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many voice requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for audio processing (more restrictive)
const audioRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 audio requests per windowMs
  message: {
    success: false,
    message: "Too many audio processing requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateTextInput = [
  body('text')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Text must be between 1 and 1000 characters')
    .trim()
    .escape(),
  body('language')
    .optional()
    .isIn(['en-US', 'es-ES', 'hi-IN', 'ur-PK'])
    .withMessage('Invalid language code'),
];

const validateLanguage = [
  body('language')
    .optional()
    .isIn(['en-US', 'es-ES', 'hi-IN', 'ur-PK'])
    .withMessage('Invalid language code'),
];

// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// DEBUG: Check each middleware function before using it
console.log("=== DEBUGGING MIDDLEWARE FUNCTIONS ===");
console.log("audioRateLimit:", typeof audioRateLimit);
console.log("optionalAuth:", typeof optionalAuth);
console.log("uploadMiddleware:", typeof uploadMiddleware);
console.log("validateLanguage:", typeof validateLanguage);
console.log("handleValidationErrors:", typeof handleValidationErrors);
console.log("voiceController.speechToText:", typeof voiceController.speechToText);
console.log("=== END MIDDLEWARE DEBUG ===");

// PUBLIC ENDPOINTS (No authentication required for voice agent interaction)

/**
 * @route POST /api/voice/speech-to-text
 * @desc Convert speech to text and analyze intent
 * @access Public (for voice agent interaction)
 */
console.log("🔍 About to define /speech-to-text route...");
router.post(
  "/speech-to-text",
  audioRateLimit,
  optionalAuth, // Optional auth to track users if logged in
  uploadMiddleware, // Use the pre-created middleware
  validateLanguage,
  handleValidationErrors,
  voiceController.speechToText // Line 149 is likely around here
);
console.log("✅ /speech-to-text route defined successfully");

// DEBUG: Check more middleware before next route
console.log("=== DEBUGGING NEXT ROUTE MIDDLEWARE ===");
console.log("voiceRateLimit:", typeof voiceRateLimit);
console.log("validateTextInput:", typeof validateTextInput);
console.log("voiceController.textToSpeech:", typeof voiceController.textToSpeech);
console.log("=== END NEXT MIDDLEWARE DEBUG ===");

/**
 * @route POST /api/voice/text-to-speech
 * @desc Convert text to speech
 * @access Public (for voice agent responses)
 */
console.log("🔍 About to define /text-to-speech route...");
router.post(
  "/text-to-speech",
  voiceRateLimit,
  optionalAuth, // Optional auth to track users if logged in
  validateTextInput,
  handleValidationErrors,
  voiceController.textToSpeech
);
console.log("✅ /text-to-speech route defined successfully");

/**
 * @route POST /api/voice/process
 * @desc Process voice command and return response with audio
 * @access Public (main voice agent endpoint)
 */
console.log("🔍 About to define /process route...");
console.log("voiceController.processVoiceCommand:", typeof voiceController.processVoiceCommand);
router.post(
  "/process",
  // Add debug logging middleware inline
  (req, res, next) => {
    console.log("🚨 ROUTE HIT: /process endpoint reached");
    console.log("🚨 Request body:", req.body);
    console.log("🚨 Request user:", req.user);
    console.log("🚨 About to call voiceController.processVoiceCommand");
    next();
  },
  voiceRateLimit,
  optionalAuth,
  validateTextInput,
  handleValidationErrors,
  voiceController.processVoiceCommand
);
console.log("✅ /process route defined successfully");

// AUTHENTICATED ENDPOINTS (For logged-in users with additional features)

/**
 * @route POST /api/voice/process-authenticated
 * @desc Process voice command with user context and history
 * @access Private
 */
console.log("🔍 About to define /process-authenticated route...");
console.log("authenticate:", typeof authenticate);
console.log("voiceController.processAuthenticatedVoiceCommand:", typeof voiceController.processAuthenticatedVoiceCommand);
router.post(
  "/process-authenticated",
  voiceRateLimit,
  authenticate,
  validateTextInput,
  handleValidationErrors,
  voiceController.processAuthenticatedVoiceCommand
);
console.log("✅ /process-authenticated route defined successfully");

/**
 * @route GET /api/voice/history
 * @desc Get user's voice interaction history
 * @access Private
 */
console.log("🔍 About to define /history GET route...");
console.log("voiceController.getVoiceHistory:", typeof voiceController.getVoiceHistory);
router.get(
  "/history",
  authenticate,
  voiceController.getVoiceHistory
);
console.log("✅ /history GET route defined successfully");

/**
 * @route DELETE /api/voice/history
 * @desc Clear user's voice interaction history
 * @access Private
 */
console.log("🔍 About to define /history DELETE route...");
console.log("voiceController.clearVoiceHistory:", typeof voiceController.clearVoiceHistory);
router.delete(
  "/history",
  authenticate,
  voiceController.clearVoiceHistory
);
console.log("✅ /history DELETE route defined successfully");

/**
 * @route GET /api/voice/preferences
 * @desc Get user's voice preferences
 * @access Private
 */
console.log("🔍 About to define /preferences GET route...");
console.log("voiceController.getVoicePreferences:", typeof voiceController.getVoicePreferences);
router.get(
  "/preferences",
  authenticate,
  voiceController.getVoicePreferences
);
console.log("✅ /preferences GET route defined successfully");

/**
 * @route PUT /api/voice/preferences
 * @desc Update user's voice preferences
 * @access Private
 */
console.log("🔍 About to define /preferences PUT route...");
console.log("voiceController.updateVoicePreferences:", typeof voiceController.updateVoicePreferences);
router.put(
  "/preferences",
  authenticate,
  [
    body('language').optional().isIn(['en-US', 'es-ES', 'hi-IN', 'ur-PK']),
    body('voiceGender').optional().isIn(['MALE', 'FEMALE', 'NEUTRAL']),
    body('speakingRate').optional().isFloat({ min: 0.25, max: 4.0 }),
    body('pitch').optional().isFloat({ min: -20.0, max: 20.0 }),
  ],
  handleValidationErrors,
  voiceController.updateVoicePreferences
);
console.log("✅ /preferences PUT route defined successfully");

// UTILITY ENDPOINTS

/**
 * @route GET /api/voice/supported-languages
 * @desc Get list of supported languages
 * @access Public
 */
router.get("/supported-languages", (req, res) => {
  res.json({
    success: true,
    data: {
      languages: [
        { code: "en-US", name: "English (US)", flag: "🇺🇸" },
        { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
        { code: "hi-IN", name: "Hindi (India)", flag: "🇮🇳" },
        { code: "ur-PK", name: "Urdu (Pakistan)", flag: "🇵🇰" }
      ]
    }
  });
});

/**
 * @route GET /api/voice/health
 * @desc Health check for voice services
 * @access Public
 */
router.get("/health", async (req, res) => {
  try {
    // You can add actual health checks here
    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          textToSpeech: "operational",
          speechToText: "operational",
          intentAnalysis: "operational"
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      data: {
        status: "unhealthy",
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Error handling middleware specific to voice routes
router.use((error, req, res, next) => {
  console.error("Voice route error:", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: "Audio file too large. Maximum size is 10MB."
    });
  }

  if (error.message.includes('Only audio files are allowed')) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only audio files are allowed."
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error in voice processing"
  });
});

console.log("🎉 All routes defined successfully!");

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const voiceController = require("../controllers/voiceController");
// const { authenticate, optionalAuth } = require("../middleware/auth");
// const rateLimit = require("express-rate-limit");
// const { body, validationResult } = require("express-validator");

// const uploadMiddleware = voiceController.uploadAudio();

// // Debug each method that's used in routes
// console.log("=== CHECKING ALL ROUTE METHODS ===");
// console.log("uploadAudio result:", uploadMiddleware);
// console.log("processVoiceCommand:", typeof voiceController.processVoiceCommand);
// console.log("textToSpeech:", typeof voiceController.textToSpeech);
// console.log("speechToText:", typeof voiceController.speechToText);
// console.log("processAuthenticatedVoiceCommand:", typeof voiceController.processAuthenticatedVoiceCommand);
// console.log("getVoiceHistory:", typeof voiceController.getVoiceHistory);
// console.log("clearVoiceHistory:", typeof voiceController.clearVoiceHistory);
// console.log("getVoicePreferences:", typeof voiceController.getVoicePreferences);
// console.log("updateVoicePreferences:", typeof voiceController.updateVoicePreferences);
// console.log("=== END METHOD CHECK ===");
// // Add these debug lines
// console.log("=== DEBUGGING CONTROLLER IMPORT ===");
// console.log("voiceController type:", typeof voiceController);
// console.log("voiceController is null/undefined:", voiceController == null);
// console.log("Available methods:", Object.getOwnPropertyNames(voiceController));
// console.log("processVoiceCommand exists:", typeof voiceController.processVoiceCommand === 'function');
// console.log("=== END DEBUG ===");


// // Rate limiting for voice endpoints (to prevent abuse)
// const voiceRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: "Too many voice requests, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Rate limiting for audio processing (more restrictive)
// const audioRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 30, // limit each IP to 30 audio requests per windowMs
//   message: {
//     success: false,
//     message: "Too many audio processing requests, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Validation middleware
// const validateTextInput = [
//   body('text')
//     .isLength({ min: 1, max: 1000 })
//     .withMessage('Text must be between 1 and 1000 characters')
//     .trim()
//     .escape(),
//   body('language')
//     .optional()
//     .isIn(['en-US', 'es-ES', 'hi-IN', 'ur-PK'])
//     .withMessage('Invalid language code'),
// ];

// const validateLanguage = [
//   body('language')
//     .optional()
//     .isIn(['en-US', 'es-ES', 'hi-IN', 'ur-PK'])
//     .withMessage('Invalid language code'),
// ];

// // Error handling middleware for validation
// const handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation failed",
//       errors: errors.array(),
//     });
//   }
//   next();
// };



// // PUBLIC ENDPOINTS (No authentication required for voice agent interaction)

// /**
//  * @route POST /api/voice/speech-to-text
//  * @desc Convert speech to text and analyze intent
//  * @access Public (for voice agent interaction)
//  */
// router.post(
//   "/speech-to-text",
//   audioRateLimit,
//   optionalAuth, // Optional auth to track users if logged in
//   uploadMiddleware, // Use the pre-created middleware
//   validateLanguage,
//   handleValidationErrors,
//   (req, res) => voiceController.speechToText(req, res)
// );

// /**
//  * @route POST /api/voice/text-to-speech
//  * @desc Convert text to speech
//  * @access Public (for voice agent responses)
//  */
// router.post(
//   "/text-to-speech",
//   voiceRateLimit,
//   optionalAuth, // Optional auth to track users if logged in
//   validateTextInput,
//   handleValidationErrors,
//   (req, res) => voiceController.textToSpeech(req, res)
// );

// /**
//  * @route POST /api/voice/process
//  * @desc Process voice command and return response with audio
//  * @access Public (main voice agent endpoint)
//  */
// router.post(
//   "/process",
//   // Add debug logging middleware inline
//   (req, res, next) => {
//     console.log("🚨 ROUTE HIT: /process endpoint reached");
//     console.log("🚨 Request body:", req.body);
//     console.log("🚨 Request user:", req.user);
//     console.log("🚨 About to call voiceController.processVoiceCommand");
//     next();
//   },
//   voiceRateLimit,
//   optionalAuth,
//   validateTextInput,
//   handleValidationErrors,
//   // Wrap the controller method to preserve 'this' context
//   (req, res) => {
//     console.log("🚨 CALLING CONTROLLER METHOD NOW");
//     return voiceController.processVoiceCommand(req, res);
//   }
// );

// // AUTHENTICATED ENDPOINTS (For logged-in users with additional features)

// /**
//  * @route POST /api/voice/process-authenticated
//  * @desc Process voice command with user context and history
//  * @access Private
//  */
// router.post(
//   "/process-authenticated",
//   voiceRateLimit,
//   authenticate,
//   validateTextInput,
//   handleValidationErrors,
//   (req, res) => voiceController.processAuthenticatedVoiceCommand(req, res)
// );

// /**
//  * @route GET /api/voice/history
//  * @desc Get user's voice interaction history
//  * @access Private
//  */
// router.get(
//   "/history",
//   authenticate,
//   (req, res) => voiceController.getVoiceHistory(req, res)
// );

// /**
//  * @route DELETE /api/voice/history
//  * @desc Clear user's voice interaction history
//  * @access Private
//  */
// router.delete(
//   "/history",
//   authenticate,
//   (req, res) => voiceController.clearVoiceHistory(req, res)
// );

// /**
//  * @route GET /api/voice/preferences
//  * @desc Get user's voice preferences
//  * @access Private
//  */
// router.get(
//   "/preferences",
//   authenticate,
//   (req, res) => voiceController.getVoicePreferences(req, res)
// );

// /**
//  * @route PUT /api/voice/preferences
//  * @desc Update user's voice preferences
//  * @access Private
//  */
// router.put(
//   "/preferences",
//   authenticate,
//   [
//     body('language').optional().isIn(['en-US', 'es-ES', 'hi-IN', 'ur-PK']),
//     body('voiceGender').optional().isIn(['MALE', 'FEMALE', 'NEUTRAL']),
//     body('speakingRate').optional().isFloat({ min: 0.25, max: 4.0 }),
//     body('pitch').optional().isFloat({ min: -20.0, max: 20.0 }),
//   ],
//   handleValidationErrors,
//   (req, res) => voiceController.updateVoicePreferences(req, res)
// );

// // UTILITY ENDPOINTS

// /**
//  * @route GET /api/voice/supported-languages
//  * @desc Get list of supported languages
//  * @access Public
//  */
// router.get("/supported-languages", (req, res) => {
//   res.json({
//     success: true,
//     data: {
//       languages: [
//         { code: "en-US", name: "English (US)", flag: "🇺🇸" },
//         { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
//         { code: "hi-IN", name: "Hindi (India)", flag: "🇮🇳" },
//         { code: "ur-PK", name: "Urdu (Pakistan)", flag: "🇵🇰" }
//       ]
//     }
//   });
// });

// /**
//  * @route GET /api/voice/health
//  * @desc Health check for voice services
//  * @access Public
//  */
// router.get("/health", async (req, res) => {
//   try {
//     // You can add actual health checks here
//     res.json({
//       success: true,
//       data: {
//         status: "healthy",
//         timestamp: new Date().toISOString(),
//         services: {
//           textToSpeech: "operational",
//           speechToText: "operational",
//           intentAnalysis: "operational"
//         }
//       }
//     });
//   } catch (error) {
//     res.status(503).json({
//       success: false,
//       message: "Service temporarily unavailable",
//       data: {
//         status: "unhealthy",
//         timestamp: new Date().toISOString()
//       }
//     });
//   }
// });

// // Error handling middleware specific to voice routes
// router.use((error, req, res, next) => {
//   console.error("Voice route error:", {
//     message: error.message,
//     stack: error.stack,
//     path: req.path,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });

//   if (error.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({
//       success: false,
//       message: "Audio file too large. Maximum size is 10MB."
//     });
//   }

//   if (error.message.includes('Only audio files are allowed')) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid file type. Only audio files are allowed."
//     });
//   }

//   res.status(500).json({
//     success: false,
//     message: "Internal server error in voice processing"
//   });
// });

// module.exports = router;