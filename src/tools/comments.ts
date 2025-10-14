/**
 * @fileoverview Comment management tools.
 * Provides tools for creating and managing comments on cards and pages.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type {
  CreateCommentParams,
  UpdateCommentParams,
  ReplyToCommentParams,
} from "../api/comments.js"

/**
 * Registers comment management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCommentTools(server: McpServer) {
  // comment_create - Create a new comment
  server.registerTool(
    "comment_create",
    {
      title: "Create Comment",
      description:
        "Adds a new comment to a specified card or page. The content field is required, with optional fields for context, page_id, or card_id.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        content: z
          .string()
          .max(102400)
          .describe("Comment text (required, maximum 102400 characters)"),
        card_id: z.string().optional().describe("Card ID to attach comment to"),
        page_id: z.string().optional().describe("Page ID to attach comment to"),
        schema: z.number().optional().describe("Schema version (defaults to 1)"),
        context: z.string().optional().describe("Highlighted text context"),
      },
    },
    async (args: {
      workspace_id: string
      content: string
      card_id?: string
      page_id?: string
      schema?: number
      context?: string
    }) => {
      try {
        const client = createClient()

        const params: CreateCommentParams = {
          content: args.content,
        }

        if (args.card_id) params.card_id = args.card_id
        if (args.page_id) params.page_id = args.page_id
        if (args.schema !== undefined) params.schema = args.schema
        if (args.context) params.context = args.context

        const result = await client.comments.create(args.workspace_id, params)

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

  // comment_update - Update an existing comment
  server.registerTool(
    "comment_update",
    {
      title: "Edit Comment",
      description:
        "Modifies the fields of an existing comment. Only the original author can modify comments. The request body should specify the fields to update, such as content, status, or context. Omitted fields will remain unchanged. The status field accepts the following values: resolved, open, orphaned.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to update"),
        content: z
          .string()
          .max(102400)
          .optional()
          .describe("Updated comment text (maximum 102400 characters)"),
        schema: z.number().optional().describe("Schema version"),
        context: z.string().optional().describe("Updated highlighted text context"),
        status: z.enum(["resolved", "open", "orphaned"]).optional().describe("Comment status"),
      },
    },
    async (args: {
      workspace_id: string
      comment_id: string
      content?: string
      schema?: number
      context?: string
      status?: "resolved" | "open" | "orphaned"
    }) => {
      try {
        const client = createClient()

        const params: UpdateCommentParams = {}

        if (args.content !== undefined) params.content = args.content
        if (args.schema !== undefined) params.schema = args.schema
        if (args.context !== undefined) params.context = args.context
        if (args.status) params.status = args.status

        const result = await client.comments.update(args.workspace_id, args.comment_id, params)

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

  // comment_reply - Reply to an existing comment
  server.registerTool(
    "comment_reply",
    {
      title: "Reply to Comment",
      description:
        "Creates a new child comment (reply) under the parent comment specified by comment_id. The request body must include the content field and can optionally include additional metadata such as schema. The child comment can also be referred to as a reply or a thread.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Parent comment ID to reply to"),
        content: z
          .string()
          .max(102400)
          .describe("Reply text (required, maximum 102400 characters)"),
        schema: z.number().optional().describe("Schema version"),
      },
    },
    async (args: {
      workspace_id: string
      comment_id: string
      content: string
      schema?: number
    }) => {
      try {
        const client = createClient()

        const params: ReplyToCommentParams = {
          content: args.content,
        }

        if (args.schema !== undefined) params.schema = args.schema

        const result = await client.comments.reply(args.workspace_id, args.comment_id, params)

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

  // comment_get - Get a specific comment
  server.registerTool(
    "comment_get",
    {
      title: "Get Comment",
      description:
        "Fetches the details of a single comment identified by comment_id. Includes metadata like author, reactions, timestamps, and child comments (replies).",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to retrieve"),
      },
    },
    async (args: { workspace_id: string; comment_id: string }) => {
      try {
        const client = createClient()
        const result = await client.comments.get(args.workspace_id, args.comment_id)

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

  // comment_delete - Delete a comment
  server.registerTool(
    "comment_delete",
    {
      title: "Delete Comment",
      description:
        "Permanently removes the comment identified by comment_id. Only the original author can delete their own comment.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to delete"),
      },
    },
    async (args: { workspace_id: string; comment_id: string }) => {
      try {
        const client = createClient()
        await client.comments.delete(args.workspace_id, args.comment_id)

        return {
          content: [
            {
              type: "text",
              text: `Comment ${args.comment_id} successfully deleted`,
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

  // comment_get_replies - Get all replies to a comment
  server.registerTool(
    "comment_get_replies",
    {
      title: "Get All Replies",
      description:
        "Retrieves a list of comments (child comments or replies) associated with a parent comment. The response includes nested metadata and pagination details.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Parent comment ID to get replies from"),
      },
    },
    async (args: { workspace_id: string; comment_id: string }) => {
      try {
        const client = createClient()
        const result = await client.comments.getReplies(args.workspace_id, args.comment_id)

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

  // comment_update_reply - Update a reply
  server.registerTool(
    "comment_update_reply",
    {
      title: "Edit Reply",
      description:
        "Modifies a specific child comment (reply). Only the original author can modify their reply. The request body should specify the fields to update, such as content, status, or context.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Parent comment ID"),
        child_comment_id: z.string().describe("Child comment ID to update"),
        content: z
          .string()
          .max(102400)
          .optional()
          .describe("Updated comment text (maximum 102400 characters)"),
        schema: z.number().optional().describe("Schema version"),
        context: z.string().optional().describe("Updated highlighted text context"),
        status: z.enum(["resolved", "open", "orphaned"]).optional().describe("Comment status"),
      },
    },
    async (args: {
      workspace_id: string
      comment_id: string
      child_comment_id: string
      content?: string
      schema?: number
      context?: string
      status?: "resolved" | "open" | "orphaned"
    }) => {
      try {
        const client = createClient()

        const params: UpdateCommentParams = {}

        if (args.content !== undefined) params.content = args.content
        if (args.schema !== undefined) params.schema = args.schema
        if (args.context !== undefined) params.context = args.context
        if (args.status) params.status = args.status

        const result = await client.comments.updateReply(
          args.workspace_id,
          args.comment_id,
          args.child_comment_id,
          params
        )

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

  // comment_delete_reply - Delete a reply
  server.registerTool(
    "comment_delete_reply",
    {
      title: "Delete Reply",
      description:
        "Permanently removes a specific child comment (reply). Only the original author can delete their own reply.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Parent comment ID"),
        child_comment_id: z.string().describe("Child comment ID to delete"),
      },
    },
    async (args: { workspace_id: string; comment_id: string; child_comment_id: string }) => {
      try {
        const client = createClient()
        await client.comments.deleteReply(args.workspace_id, args.comment_id, args.child_comment_id)

        return {
          content: [
            {
              type: "text",
              text: `Reply ${args.child_comment_id} successfully deleted`,
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
