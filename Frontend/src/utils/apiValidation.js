export class APIKeyError extends Error {
  constructor(service) {
    super(
      `${service} API key is missing. Please set the required environment variable.`
    );
    this.name = "APIKeyError";
    this.service = service;
  }
}

export const validateBackendConnection = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    return {
      error: true,
      message: "Backend URL is missing in your .env file",
      help: "Set VITE_BACKEND_URL in your .env file to point to your backend server",
    };
  }
  return { error: false };
};

export const getBackendErrorMessage = () => {
  const { error, message, help } = validateBackendConnection();
  if (!error) return null;
  return `${message}\nHelp: ${help}`;
};
