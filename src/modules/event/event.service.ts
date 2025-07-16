import { Service } from "@/structures/service.structure"
import type { EventSchema } from "./event.schema"

class EventService extends Service {
  createEvent(data: EventSchema) {
    return this.prisma.event.create({
      data,
    })
  }
}

export { EventService }
