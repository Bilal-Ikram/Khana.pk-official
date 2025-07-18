export const ErrorTypes = {
  NETWORK: "NETWORK",
  PERMISSION: "PERMISSION",
  BACKEND: "BACKEND",
  UNKNOWN: "UNKNOWN",
};

export const extractErrorDetails = (error) => {
  if (error.name === "NotAllowedError") {
    return {
      type: ErrorTypes.PERMISSION,
      message: "Microphone access was denied",
      service: "Microphone",
    };
  }

  if (error.name === "NetworkError" || !navigator.onLine) {
    return {
      type: ErrorTypes.NETWORK,
      message: "Network connection error",
      service: "Network",
    };
  }

  return {
    type: ErrorTypes.UNKNOWN,
    message: error.message || "An unexpected error occurred",
    service: "Voice Assistant",
  };
};

export const getUserFriendlyMessage = (errorDetails) => {
  if (!errorDetails) return null;

  const messages = {
    [ErrorTypes.NETWORK]:
      "Please check your internet connection and try again.",
    [ErrorTypes.PERMISSION]:
      "Please allow microphone access in your browser settings.",
    [ErrorTypes.UNKNOWN]:
      "Please try again or contact support if the problem persists.",
  };

  return messages[errorDetails.type] || errorDetails.message;
};
