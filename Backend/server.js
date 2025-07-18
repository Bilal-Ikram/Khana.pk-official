require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const path = require("path");
const voiceRoutes = require("./routes/voiceRoutes");

const app = express();

// 🚨 DEBUG: Server startup logging
console.log("🚀 Starting server initialization...");
console.log("🔧 Environment:", process.env.NODE_ENV || "development");
console.log("📂 Current working directory:", process.cwd());

// Connect to MongoDB
connectDB();

// 🚨 DEBUG: Global request logger (FIRST middleware)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log(`📍 IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`🔗 User-Agent: ${req.get('User-Agent')?.substring(0, 50) || 'Unknown'}...`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body keys: [${Object.keys(req.body).join(', ')}]`);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`❓ Query params: ${JSON.stringify(req.query)}`);
  }
  
  next();
});

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3001",
    "http://localhost:5175",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
};

// 🚨 DEBUG: CORS debugging
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`🔄 CORS Preflight for: ${req.originalUrl}`);
    console.log(`🔗 Origin: ${req.get('Origin')}`);
  }
  next();
});

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🚨 DEBUG: Body parsing verification
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log(`📝 Body parsing - Content-Type: ${req.get('Content-Type')}`);
    console.log(`📏 Body size: ${JSON.stringify(req.body).length} characters`);
  }
  next();
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🚨 DEBUG: Route registration logging
console.log("📋 Registering routes...");

// Auth routes
console.log("🔐 Mounting auth routes at /api/auth");
app.use("/api/auth", authRoutes);

// Voice routes - with additional debugging
console.log("🎤 Mounting voice routes at /api/voice");
app.use("/api/voice", (req, res, next) => {
  console.log(`🎤 VOICE ROUTE HIT: ${req.method} ${req.originalUrl}`);
  console.log(`🔍 Voice route path: ${req.path}`);
  console.log(`🎯 Voice route params:`, req.params);
  next();
}, voiceRoutes);

// Additional routes
const restaurantRoutes = require("./routes/restaurants");
const orderRoutes = require("./routes/orders");
const menuItemRoutes = require("./routes/menu-items");

console.log("🍽️  Mounting restaurant routes at /api/restaurants");
app.use("/api/restaurants", restaurantRoutes);

console.log("📋 Mounting order routes at /api/orders");
app.use("/api/orders", orderRoutes);

console.log("🍕 Mounting menu-item routes at /api/menu-items");
app.use("/api/menu-items", menuItemRoutes);

// 🚨 DEBUG: Route debugging endpoint
app.get("/api/debug/routes", (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, prefix = '') {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.regexp) {
        const match = layer.regexp.source.match(/^\^\\?(.+)\\\?\$?/);
        if (match) {
          const nestedPrefix = prefix + match[1].replace(/\\\//g, '/');
          extractRoutes(layer.handle.stack, nestedPrefix);
        }
      }
    });
  }
  
  extractRoutes(app._router.stack);
  
  res.json({
    message: "Available routes",
    routes: routes.sort(),
    totalRoutes: routes.length
  });
});

// 🚨 DEBUG: Test endpoint for connectivity
app.get("/api/health", (req, res) => {
  console.log("💚 Health check endpoint hit");
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// 🚨 DEBUG: Catch-all for unmatched routes (BEFORE error handler)
app.use("*", (req, res, next) => {
  console.log(`❌ UNMATCHED ROUTE: ${req.method} ${req.originalUrl}`);
  console.log(`📍 Available routes can be viewed at: /api/debug/routes`);
  
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: "Check /api/debug/routes for available endpoints"
  });
});

// Error handling middleware (MUST BE LAST)
app.use((err, req, res, next) => {
  console.error("🔥 ERROR HANDLER TRIGGERED:");
  console.error("📍 Route:", req.method, req.originalUrl);
  console.error("💥 Error:", err.message);
  console.error("📚 Stack:", err.stack);
  
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong!",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("\n🎉 SERVER STARTED SUCCESSFULLY!");
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛠️  Debug routes: http://localhost:${PORT}/api/debug/routes`);
  console.log("✅ Allowed origins:", corsOptions.origin);
  
  // 🚨 DEBUG: Route validation
  console.log("\n🔍 ROUTE VALIDATION:");
  console.log("📋 Registered route prefixes:");
  app._router.stack.forEach((layer, index) => {
    if (layer.regexp) {
      const match = layer.regexp.source.match(/^\^\\?(.+?)\\\?\$?/);
      if (match) {
        const route = match[1].replace(/\\\//g, '/');
        console.log(`  ${index + 1}. ${route}`);
      }
    }
  });
  
  console.log("\n🎤 VOICE ROUTE SPECIFIC TESTS:");
  console.log("Test these URLs:");
  console.log(`  • GET  http://localhost:${PORT}/api/voice (should list voice routes)`);
  console.log(`  • POST http://localhost:${PORT}/api/voice/process (your main endpoint)`);
  console.log(`  • GET  http://localhost:${PORT}/api/debug/routes (see all routes)`);
  
  console.log("\n🚀 Server ready for requests!");
});


// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/auth");
// const mongoose = require("mongoose");
// const path = require("path");
// const voiceRoutes = require("./routes/voice");

// const app = express();

// // 🚨 DEBUG: Server startup logging
// console.log("🚀 Starting server initialization...");
// console.log("🔧 Environment:", process.env.NODE_ENV || "development");
// console.log("📂 Current working directory:", process.cwd());

// // Connect to MongoDB
// connectDB();

// // 🚨 DEBUG: Global request logger (FIRST middleware)
// app.use((req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`\n🌐 [${timestamp}] ${req.method} ${req.originalUrl}`);
//   console.log(`📍 IP: ${req.ip || req.connection.remoteAddress}`);
//   console.log(`🔗 User-Agent: ${req.get('User-Agent')?.substring(0, 50) || 'Unknown'}...`);
  
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log(`📦 Body keys: [${Object.keys(req.body).join(', ')}]`);
//   }
  
//   if (req.query && Object.keys(req.query).length > 0) {
//     console.log(`❓ Query params: ${JSON.stringify(req.query)}`);
//   }
  
//   next();
// });

// // CORS Configuration
// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "http://localhost:5174",
//     "http://localhost:3001",
//     "http://localhost:5175",
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "Accept",
//     "X-Requested-With",
//   ],
// };

// // 🚨 DEBUG: CORS debugging
// app.use((req, res, next) => {
//   if (req.method === 'OPTIONS') {
//     console.log(`🔄 CORS Preflight for: ${req.originalUrl}`);
//     console.log(`🔗 Origin: ${req.get('Origin')}`);
//   }
//   next();
// });

// app.use(cors(corsOptions));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // 🚨 DEBUG: Body parsing verification
// app.use((req, res, next) => {
//   if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
//     console.log(`📝 Body parsing - Content-Type: ${req.get('Content-Type')}`);
//     console.log(`📏 Body size: ${JSON.stringify(req.body).length} characters`);
//   }
//   next();
// });

// // Serve static files from the uploads directory
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // 🚨 DEBUG: Route registration logging
// console.log("📋 Registering routes...");

// // Auth routes
// console.log("🔐 Mounting auth routes at /api/auth");
// app.use("/api/auth", authRoutes);

// // Voice routes - with additional debugging
// console.log("🎤 Mounting voice routes at /api/voice");
// app.use("/api/voice", (req, res, next) => {
//   console.log(`🎤 VOICE ROUTE HIT: ${req.method} ${req.originalUrl}`);
//   console.log(`🔍 Voice route path: ${req.path}`);
//   console.log(`🎯 Voice route params:`, req.params);
//   next();
// }, voiceRoutes);

// // Additional routes
// const restaurantRoutes = require("./routes/restaurants");
// const orderRoutes = require("./routes/orders");
// const menuItemRoutes = require("./routes/menu-items");

// console.log("🍽️  Mounting restaurant routes at /api/restaurants");
// app.use("/api/restaurants", restaurantRoutes);

// console.log("📋 Mounting order routes at /api/orders");
// app.use("/api/orders", orderRoutes);

// console.log("🍕 Mounting menu-item routes at /api/menu-items");
// app.use("/api/menu-items", menuItemRoutes);

// // 🚨 DEBUG: Route debugging endpoint
// app.get("/api/debug/routes", (req, res) => {
//   const routes = [];
  
//   function extractRoutes(stack, prefix = '') {
//     stack.forEach(layer => {
//       if (layer.route) {
//         const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
//         routes.push(`${methods} ${prefix}${layer.route.path}`);
//       } else if (layer.name === 'router' && layer.regexp) {
//         const match = layer.regexp.source.match(/^\^\\?(.+)\\\?\$?/);
//         if (match) {
//           const nestedPrefix = prefix + match[1].replace(/\\\//g, '/');
//           extractRoutes(layer.handle.stack, nestedPrefix);
//         }
//       }
//     });
//   }
  
//   extractRoutes(app._router.stack);
  
//   res.json({
//     message: "Available routes",
//     routes: routes.sort(),
//     totalRoutes: routes.length
//   });
// });

// // 🚨 DEBUG: Test endpoint for connectivity
// app.get("/api/health", (req, res) => {
//   console.log("💚 Health check endpoint hit");
//   res.json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     version: process.version
//   });
// });

// // 🚨 DEBUG: Catch-all for unmatched routes (BEFORE error handler)
// app.use("*", (req, res, next) => {
//   console.log(`❌ UNMATCHED ROUTE: ${req.method} ${req.originalUrl}`);
//   console.log(`📍 Available routes can be viewed at: /api/debug/routes`);
  
//   res.status(404).json({
//     error: "Route not found",
//     method: req.method,
//     path: req.originalUrl,
//     message: `Cannot ${req.method} ${req.originalUrl}`,
//     suggestion: "Check /api/debug/routes for available endpoints"
//   });
// });

// // Error handling middleware (MUST BE LAST)
// app.use((err, req, res, next) => {
//   console.error("🔥 ERROR HANDLER TRIGGERED:");
//   console.error("📍 Route:", req.method, req.originalUrl);
//   console.error("💥 Error:", err.message);
//   console.error("📚 Stack:", err.stack);
  
//   res.status(err.status || 500).json({
//     error: "Internal Server Error",
//     message: err.message || "Something went wrong!",
//     path: req.originalUrl,
//     method: req.method,
//     timestamp: new Date().toISOString(),
//     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

// const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => {
//   console.log("\n🎉 SERVER STARTED SUCCESSFULLY!");
//   console.log(`🌐 Server running on port ${PORT}`);
//   console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`🛠️  Debug routes: http://localhost:${PORT}/api/debug/routes`);
//   console.log("✅ Allowed origins:", corsOptions.origin);
  
//   // 🚨 DEBUG: Route validation
//   console.log("\n🔍 ROUTE VALIDATION:");
//   console.log("📋 Registered route prefixes:");
//   app._router.stack.forEach((layer, index) => {
//     if (layer.regexp) {
//       const match = layer.regexp.source.match(/^\^\\?(.+?)\\\?\$?/);
//       if (match) {
//         const route = match[1].replace(/\\\//g, '/');
//         console.log(`  ${index + 1}. ${route}`);
//       }
//     }
//   });
  
//   console.log("\n🎤 VOICE ROUTE SPECIFIC TESTS:");
//   console.log("Test these URLs:");
//   console.log(`  • GET  http://localhost:${PORT}/api/voice (should list voice routes)`);
//   console.log(`  • POST http://localhost:${PORT}/api/voice/process (your main endpoint)`);
//   console.log(`  • GET  http://localhost:${PORT}/api/debug/routes (see all routes)`);
  
//   console.log("\n🚀 Server ready for requests!");
// });

// // require("dotenv").config();
// // const express = require("express");
// // const cors = require("cors");
// // const connectDB = require("./config/db");
// // const authRoutes = require("./routes/auth");
// // const mongoose = require("mongoose");
// // const path = require("path");
// // const voiceRoutes = require("./routes/voice");

// // const app = express();

// // // Connect to MongoDB
// // connectDB();

// // // Middleware
// // app.use(
// //   cors({
// //     origin: [
// //       "http://localhost:5173",
// //       "http://localhost:5174",
// //       "http://localhost:3001",
// //       "http://localhost:5175",
// //     ],
// //     credentials: true,
// //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
// //     allowedHeaders: [
// //       "Content-Type",
// //       "Authorization",
// //       "Accept",
// //       "X-Requested-With",
// //     ],
// //   })
// // );

// // app.use(express.json());

// // // Serve static files from the uploads directory
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // Routes
// // app.use("/api/auth", authRoutes);
// // app.use("/api/voice", voiceRoutes);

// // // Import additional routes
// // const restaurantRoutes = require("./routes/restaurants");
// // const orderRoutes = require("./routes/orders");
// // const menuItemRoutes = require("./routes/menu-items");

// // // Register additional routes
// // app.use("/api/restaurants", restaurantRoutes);
// // app.use("/api/orders", orderRoutes);
// // app.use("/api/menu-items", menuItemRoutes);

// // // Error handling middleware (MOVED TO END)
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({
// //     error: "Internal Server Error",
// //     message: err.message || "Something went wrong!",
// //     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
// //   });
// // });

// // const PORT = process.env.PORT || 3001;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// //   console.log("Allowed origins:", [
// //     "http://localhost:5173",
// //     "http://localhost:5174",
// //     "http://localhost:3001",
// //     "http://localhost:5175",
// //   ]);
// // });