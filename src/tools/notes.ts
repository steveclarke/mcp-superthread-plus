/**
 * @fileoverview Note management tools.
 * Provides tools for note operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type { CreateNoteParams } from "../api/notes.js"

/**
 * Registers note management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerNoteTools(server: McpServer): void {
  // note_create - Create new note
  server.registerTool(
    "note_create",
    {
      title: "Create Note",
      description:
        "Creates a new note within the specified workspace. Notes can include title, transcripts, user notes, meeting metadata, and attendee information.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        title: z.string().describe("Note title"),
        transcript: z.string().optional().describe("Note transcript"),
        transcripts: z
          .array(
            z.object({
              content: z.string().describe("Transcript content"),
              source: z.string().describe("Transcript source"),
            })
          )
          .optional()
          .describe("Array of transcript entries"),
        user_notes: z.string().optional().describe("User notes (max 102400 chars)"),
        is_public: z.boolean().optional().describe("Whether note is public"),
        attendees: z
          .array(
            z.object({
              user_id: z.string().optional().describe("User ID if Superthread member"),
              email: z.string().describe("Email address"),
              name: z.string().describe("Attendee name"),
            })
          )
          .optional()
          .describe("List of meeting attendees"),
        metadata_date: z.number().optional().describe("Meeting date (Unix timestamp)"),
        metadata_time: z.number().optional().describe("Meeting time (Unix timestamp)"),
        google_calendar_event: z
          .object({
            id: z.string().describe("Event ID"),
            recurring_event_id: z.string().optional().describe("Recurring event ID"),
            title: z.string().describe("Event title"),
            description: z.string().optional().describe("Event description"),
            meeting_links: z
              .array(
                z.object({
                  provider: z.string().describe("Link provider"),
                  link: z.string().describe("Meeting link URL"),
                })
              )
              .optional()
              .describe("Meeting links"),
            attendees: z
              .array(
                z.object({
                  email: z.string().describe("Email"),
                  name: z.string().describe("Name"),
                  organizer: z.boolean().optional().describe("Is organizer"),
                })
              )
              .optional()
              .describe("Calendar event attendees"),
            start: z.number().describe("Start time (Unix timestamp)"),
            end: z.number().describe("End time (Unix timestamp)"),
            updated: z.number().describe("Last updated (Unix timestamp)"),
            location: z.string().optional().describe("Event location"),
          })
          .optional()
          .describe("Google Calendar event details"),
      },
    },
    async (args) => {
      try {
        const client = createClient()

        const params: CreateNoteParams = {
          title: args.title,
        }

        if (args.transcript !== undefined) params.transcript = args.transcript
        if (args.transcripts !== undefined) params.transcripts = args.transcripts
        if (args.user_notes !== undefined) params.user_notes = args.user_notes
        if (args.is_public !== undefined) params.is_public = args.is_public
        if (args.attendees !== undefined) params.attendees = args.attendees
        if (args.metadata_date !== undefined) params.metadata_date = args.metadata_date
        if (args.metadata_time !== undefined) params.metadata_time = args.metadata_time
        if (args.google_calendar_event !== undefined)
          params.google_calendar_event = args.google_calendar_event

        const note = await client.notes.create(args.workspace_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(note, null, 2),
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        }
      }
    }
  )

  // note_get - Get a specific note
  server.registerTool(
    "note_get",
    {
      title: "Get Note",
      description: "Retrieves a specific note within the specified workspace.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        note_id: z.string().describe("Note ID to retrieve"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const note = await client.notes.get(args.workspace_id, args.note_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(note, null, 2),
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        }
      }
    }
  )

  // note_get_all - Get all notes
  server.registerTool(
    "note_get_all",
    {
      title: "Get All Notes",
      description: "Retrieves all notes within the specified workspace.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const notes = await client.notes.list(args.workspace_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(notes, null, 2),
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        }
      }
    }
  )

  // note_delete - Delete a note
  server.registerTool(
    "note_delete",
    {
      title: "Delete Note",
      description: "Permanently deletes a note. This action cannot be undone.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        note_id: z.string().describe("Note ID to delete"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const result = await client.notes.delete(args.workspace_id, args.note_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        }
      }
    }
  )
}
