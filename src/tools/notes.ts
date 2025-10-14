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
    createToolHandler(async (client, args) => {
      const params = buildParams<CreateNoteParams>({
        title: args.title,
        transcript: args.transcript,
        transcripts: args.transcripts,
        user_notes: args.user_notes,
        is_public: args.is_public,
        attendees: args.attendees,
        metadata_date: args.metadata_date,
        metadata_time: args.metadata_time,
        google_calendar_event: args.google_calendar_event,
      })

      return client.notes.create(args.workspace_id, params as CreateNoteParams)
    })
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
    createToolHandler(async (client, args) => {
      return client.notes.get(args.workspace_id, args.note_id)
    })
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
    createToolHandler(async (client, args) => {
      return client.notes.list(args.workspace_id)
    })
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
    createToolHandler(async (client, args) => {
      return client.notes.delete(args.workspace_id, args.note_id)
    })
  )
}
