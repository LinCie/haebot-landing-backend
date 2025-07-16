import express from "express"
import morgan from "morgan"
import helmet from "helmet"
import { logger } from "@/utilities/logger.utility"
import { errorMiddleware } from "@/middlewares/error.middleware"
import { ChatController, EventController } from "./modules"

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
  .use(express.json())

// Regular Routes
app
  // Index
  .get("/", (req, res) => {
    res.send("Hello World!")
  })
  // Chat
  .use("/chat", new ChatController().router)
  .use("/event", new EventController().router)

// After request middlewares
app.use(errorMiddleware)

export { app }
