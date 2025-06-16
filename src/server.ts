import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import { FRONTEND_URL } from "@/configs/env.config"
import { logger } from "@/utilities/logger.utility"
import { errorMiddleware } from "@/middlewares/error.middleware"
import { ChatController } from "./modules"

const app = express()

// Before request middlewares
app
  .use(
    morgan("tiny", {
      stream: {
        write: (message) => {
          logger.info(message.trim())
        },
      },
    })
  )
  .use(helmet())
  .use(cors({ origin: FRONTEND_URL }))
  .use(express.json())

// Regular Routes
app
  // Index
  .get("/", (req, res) => {
    res.send("Hello World!")
  })
  // Chat
  .use("/chat", new ChatController().router)

// After request middlewares
app.use(errorMiddleware)

export { app }
