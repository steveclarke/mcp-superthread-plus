/**
 * @fileoverview Generic utility functions for the MCP SuperThread Plus server.
 * Provides helper functions for data formatting and common operations.
 */

/**
 * Formats a date to ISO 8601 string.
 * @param date - Date to format
 * @returns ISO 8601 formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString()
}

/**
 * Parses a Unix timestamp to a Date object.
 * @param timestamp - Unix timestamp in seconds
 * @returns Date object
 */
export function parseUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000)
}

/**
 * Converts a Date to Unix timestamp in seconds.
 * @param date - Date to convert
 * @returns Unix timestamp in seconds
 */
export function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

/**
 * Safely extracts error message from unknown error type.
 * @param error - Error of unknown type
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Unknown error occurred"
}

