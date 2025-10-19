/**
 * @fileoverview Note management tools.
 * Provides tools for note operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CreateNoteParams } from "../api/notes.js"
import { createToolHandler, buildParams } from "./helpers.js"

/**
 * Registers note management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerNoteTools(server: McpServer): void {
  // ============================================================================
  // TOOL: note_creates
  // Create one or more meeting notes in a single operation
  // ============================================================================
  server.registerTool(
    "note_creates",
    {
      title: "Create Notes",
      description:
        "Creates one or more notes in a single operation. Each note is fully self-contained with all parameters. Always use an array, even for a single note. Notes can include title, transcripts, user notes, meeting metadata, and attendee information.",
      inputSchema: {
        notes: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of notes to create (use single-element array for one note)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          notes: Array<{
            workspace_id: string
            title: string
            transcript?: string
            transcripts?: Array<{
              content: string
              source: string
            }>
            user_notes?: string
            is_public?: boolean
            attendees?: Array<{
              user_id?: string
              email: string
              name: string
            }>
            metadata_date?: number
            metadata_time?: number
            google_calendar_event?: {
              id: string
              recurring_event_id?: string
              title: string
              description?: string
              meeting_links?: Array<{
                provider: string
                link: string
              }>
              attendees?: Array<{
                email: string
                name: string
                organizer?: boolean
              }>
              start: number
              end: number
              updated: number
              location?: string
            }
          }>
        }
      ) => {
        // Process notes sequentially
        const results = []
        for (const note of args.notes) {
          const params = buildParams<CreateNoteParams>({
            title: note.title,
            transcript: note.transcript,
            transcripts: note.transcripts,
            user_notes: note.user_notes,
            is_public: note.is_public,
            attendees: note.attendees,
            metadata_date: note.metadata_date,
            metadata_time: note.metadata_time,
            google_calendar_event: note.google_calendar_event,
          })

          const result = await client.notes.create(note.workspace_id, params as CreateNoteParams)
          results.push(result)
        }

        return { notes: results }
      }
    )
  )

  // ============================================================================
  // TOOL: note_gets
  // Get detailed information about one or more notes in a single operation
  // ============================================================================
  server.registerTool(
    "note_gets",
    {
      title: "Get Notes",
      description:
        "Retrieves one or more notes in a single operation. Each note is fully self-contained with all parameters. Always use an array, even for a single note. Returns full note content including transcripts and metadata for each note.",
      inputSchema: {
        notes: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              note_id: z.string().describe("Note ID to retrieve"),
            })
          )
          .describe("Array of notes to retrieve (use single-element array for one note)"),
      },
    },
    createToolHandler(
      async (client, args: { notes: Array<{ workspace_id: string; note_id: string }> }) => {
        // Process notes sequentially
        const results = []
        for (const note of args.notes) {
          const result = await client.notes.get(note.workspace_id, note.note_id)
          results.push(result)
        }

        return { notes: results }
      }
    )
  )

  // ============================================================================
  // TOOL: note_get_all
  // List all notes in a workspace
  // ============================================================================
  server.registerTool(
    "note_get_all",
    {
      title: "Get All Notes",
      description: "Retrieves all notes within the specified workspace.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.notes.list(args.workspace_id)
    })
  )

  // ============================================================================
  // TOOL: note_deletes
  // Permanently delete one or more notes in a single operation
  // ============================================================================
  server.registerTool(
    "note_deletes",
    {
      title: "Delete Notes",
      description:
        "Permanently deletes one or more notes in a single operation. Each note is fully self-contained with all parameters. Always use an array, even for a single note. This action cannot be undone.",
      inputSchema: {
        notes: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              note_id: z.string().describe("Note ID to delete"),
            })
          )
          .describe("Array of notes to delete (use single-element array for one note)"),
      },
    },
    createToolHandler(
      async (client, args: { notes: Array<{ workspace_id: string; note_id: string }> }) => {
        // Process notes sequentially
        const results = []
        for (const note of args.notes) {
          const result = await client.notes.delete(note.workspace_id, note.note_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
