import type { Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { ChatService } from "./chat.service"
import { chatSchema, type ChatSchema } from "./chat.schema"

class ChatController extends Controller {
  public readonly chatService = new ChatService()

  constructor() {
    super()
    this.bindRoutes([
      { method: "get", path: "/session", handler: this.generateSession },
      {
        method: "post",
        path: "/chat",
        handler: this.handleChat,
        schema: chatSchema,
      },
    ])
  }

  async generateSession(req: Request, res: Response) {
    const sessionId = this.chatService.generateSessionId()
    res.status(200).json({ sessionId })
  }

  async handleChat(req: Request, res: Response) {
    const { prompt, sessionId } = req.validated as ChatSchema
    const response = await this.chatService.getResponse(prompt, sessionId)
    res.status(200).json({ response })
  }
}

export { ChatController }
