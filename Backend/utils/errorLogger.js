const fs = require("fs");
const path = require("path");

class ErrorLogger {
  constructor() {
    this.logDir = path.join(__dirname, "../logs");
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFileName() {
    const date = new Date();
    return `error-${date.toISOString().split("T")[0]}.log`;
  }

  logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      error: {
        message: error.message,
        stack: error.stack,
      },
      context,
    };

    const logFile = path.join(this.logDir, this.getLogFileName());
    const logMessage = JSON.stringify(logEntry, null, 2) + "\n";

    fs.appendFileSync(logFile, logMessage);

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error:", logEntry);
    }
  }

  async logApiError(error, req, res) {
    const context = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      userId: req.user?.id,
      statusCode: res.statusCode,
    };

    this.logError(error, context);
  }
}

module.exports = new ErrorLogger();
