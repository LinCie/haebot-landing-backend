import { z } from "zod"

export const chatSchema = z.object({
  prompt: z
    .string({ required_error: "Prompt is required" })
    .min(1, "Prompt cannot be empty"),
  sessionId: z
    .string({ required_error: "Session ID is required" })
    .uuid("Invalid Session ID format"),
})

export type ChatSchema = z.infer<typeof chatSchema>
