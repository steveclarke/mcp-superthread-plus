/**
 * @fileoverview Notes API client for Superthread.
 * Handles note operations including creation, retrieval, and deletion.
 */

import type { SuperthreadClient } from "./client.js"

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
 * Note response object
 */
export interface Note {
  id: string
  title: string
  transcript?: string
  transcripts?: Array<{
    content: string
    source: string
    id: string
    time_created: number
    time_updated: number
  }>
  user_notes?: string
  ai_notes?: Array<{
    id: string
    note_template_id: string
    title: string
    content: string
    time_updated: number
    related_resources?: Array<{
      id: string
      type: string
      cosine_similarity: number
    }>
  }>
  user?: unknown
  user_updated?: unknown
  team_id: string
  last_note_template_id?: string
  is_public?: boolean
  public_settings?: {
    url: string
  }
  time_created: number
  time_updated: number
  meeting_metadata?: {
    id: string
    name: string
    description: string
    links: MeetingLink[]
    location: string
    start_time: number
    end_time: number
  }
  meeting_date?: number
  meeting_time?: number
  meeting_organizer?: MeetingParticipant
  meeting_attendees?: MeetingParticipant[]
}

/**
 * Note API resource for managing notes.
 */
export class NoteResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new note in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Note creation parameters
   * @returns Created note details
   */
  async create(workspaceId: string, params: CreateNoteParams): Promise<Note> {
    const response = await this.client.request<{ note: Note }>(`/${workspaceId}/notes`, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.note
  }

  /**
   * Retrieves a specific note by ID.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param noteId - Note ID to retrieve
   * @returns Note details
   */
  async get(workspaceId: string, noteId: string): Promise<Note> {
    const response = await this.client.request<{ note: Note }>(`/${workspaceId}/notes/${noteId}`, {
      method: "GET",
    })
    return response.note
  }

  /**
   * Lists all notes in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns Array of notes
   */
  async list(workspaceId: string): Promise<Note[]> {
    const response = await this.client.request<{ notes: Note[] }>(`/${workspaceId}/notes`, {
      method: "GET",
    })
    return response.notes
  }

  /**
   * Permanently deletes a note.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param noteId - Note ID to delete
   * @returns Success response
   */
  async delete(workspaceId: string, noteId: string): Promise<{ success: boolean }> {
    return await this.client.request<{ success: boolean }>(`/${workspaceId}/notes/${noteId}`, {
      method: "DELETE",
    })
  }
}
