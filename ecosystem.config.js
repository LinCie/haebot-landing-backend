export const apps = [
  {
    // --- General Settings ---
    name: "haebot-chatbot-server",
    script: "./server",

    // --- Deployment Settings ---
    exec_mode: "fork",
    instances: 1,
    watch: false,
    autorestart: true,

    // --- Resource Management ---
    max_memory_restart: "256M",

    // --- Logging ---
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    out_file: "./logs/out.log",
    error_file: "./logs/error.log",
    merge_logs: true,

    // --- Environment Variables ---
    env: {
      NODE_ENV: "production",
      PORT: 8000,
      FRONTEND_URL: "https://haebot.com",
    },
  },
]
