/**
 * @fileoverview Notes API client for Superthread.
 * Handles note operations including creation, retrieval, and deletion.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Meeting participant
 */
export interface MeetingParticipant {
  user_id?: string
  email: string
  name: string
}

/**
 * Transcript entry
 */
export interface TranscriptEntry {
  content: string
  source: string
}

/**
 * Meeting link
 */
export interface MeetingLink {
  provider: string
  link: string
}

/**
 * Google Calendar event attendee
 */
export interface GoogleCalendarAttendee {
  email: string
  name: string
  organizer?: boolean
}

/**
 * Google Calendar event
 */
export interface GoogleCalendarEvent {
  id: string
  recurring_event_id?: string
  title: string
  description?: string
  meeting_links?: MeetingLink[]
  attendees?: GoogleCalendarAttendee[]
  start: number
  end: number
  updated: number
  location?: string
}

/**
 * Parameters for creating a new note
 */
export interface CreateNoteParams {
  title: string
  transcript?: string | null
  transcripts?: TranscriptEntry[]
  user_notes?: string | null
  is_public?: boolean | null
  attendees?: MeetingParticipant[]
  metadata_date?: number | null
  metadata_time?: number | null
  google_calendar_event?: GoogleCalendarEvent
}

/**
 * Note API resource for managing notes.
 */
export class NoteResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new note in a workspace.
   * API: POST /:workspace/notes
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Note creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateNoteParams): Promise<unknown> {
    const path = urlcat("/:workspace/notes", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Retrieves a specific note by ID.
   * API: GET /:workspace/notes/:note
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param noteId - Note ID to retrieve
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, noteId: string): Promise<unknown> {
    const path = urlcat("/:workspace/notes/:note", {
      workspace: safeId("workspaceId", workspaceId),
      note: safeId("noteId", noteId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Lists all notes in a workspace.
   * API: GET /:workspace/notes
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns API response (passed through to LLM)
   */
  async list(workspaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/notes", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Permanently deletes a note.
   * API: DELETE /:workspace/notes/:note
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param noteId - Note ID to delete
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, noteId: string): Promise<unknown> {
    const path = urlcat("/:workspace/notes/:note", {
      workspace: safeId("workspaceId", workspaceId),
      note: safeId("noteId", noteId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
