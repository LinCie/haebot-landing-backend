import type { Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { EventService } from "./event.service"
import { eventSchema, type EventSchema } from "./event.schema"

class EventController extends Controller {
  public readonly eventService = new EventService()

  constructor() {
    super()
    this.bindRoutes([
      {
        method: "post",
        path: "/",
        handler: this.handleEvent,
        schema: eventSchema,
      },
    ])
  }

  async handleEvent(req: Request, res: Response) {
    const data: EventSchema = req.body
    const event = await this.eventService.createEvent(data)
    res.send(event)
  }
}

export { EventController }
