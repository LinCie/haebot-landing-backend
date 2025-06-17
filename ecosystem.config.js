export const apps = [
  {
    name: "haebot-chatbot-server",
    script: "./server",
    exec_mode: "fork",
    instances: 1,
    watch: false,
    autorestart: true,
    max_memory_restart: "256M",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    out_file: "./logs/out.log",
    error_file: "./logs/error.log",
    merge_logs: true,

    env_file: ".env",
  },
]
