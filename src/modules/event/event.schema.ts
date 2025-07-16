import { z } from "zod"

export const eventSchema = z.object({
  event: z
    .string({ required_error: "Event is required" })
    .min(1, "Event cannot be empty"),
})

export type EventSchema = z.infer<typeof eventSchema>
