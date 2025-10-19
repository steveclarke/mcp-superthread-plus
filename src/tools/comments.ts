/**
 * @fileoverview Comment management tools.
 * Provides tools for creating and managing comments on cards and pages.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatMentions } from "../utils.js"
import type {
  CreateCommentParams,
  UpdateCommentParams,
  ReplyToCommentParams,
} from "../api/comments.js"
import { createToolHandler, buildParams } from "./helpers.js"

/**
 * Registers comment management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCommentTools(server: McpServer) {
  // ============================================================================
  // TOOL: comment_creates
  // Create one or more comments (batch operation)
  // ============================================================================
  server.registerTool(
    "comment_creates",
    {
      title: "Create Comments",
      description:
        'Create one or more comments in a single operation. Each comment is fully self-contained with all parameters. Always use an array, even for a single comment. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}.',
      inputSchema: {
        comments: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              content: z
                .string()
                .max(102400)
                .describe(
                  'Comment text (required, maximum 102400 characters). Supports HTML formatting: <strong>, <em>, <s>, <u>, <code>, <p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>, <ul><li>, <ol><li>, <a href="">. Plain text also works. To mention users, use {{@Username}} syntax (e.g., {{@Steve Clarke}}). Use \\{{@Name}} to output literal template text.'
                ),
              card_id: z.string().optional().describe("Card ID to attach comment to"),
              page_id: z.string().optional().describe("Page ID to attach comment to"),
              schema: z.number().optional().describe("Schema version (defaults to 1)"),
              context: z.string().optional().describe("Highlighted text context"),
            })
          )
          .describe("Array of comments to create (use single-element array for one comment)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          comments: Array<{
            workspace_id: string
            content: string
            card_id?: string
            page_id?: string
            schema?: number
            context?: string
          }>
        }
      ) => {
        // Process comments sequentially
        const results = []
        for (const comment of args.comments) {
          // Process @mentions in content
          const processedContent = await formatMentions(
            comment.content,
            comment.workspace_id,
            client
          )

          const params = buildParams<CreateCommentParams>({
            content: processedContent,
            card_id: comment.card_id,
            page_id: comment.page_id,
            schema: comment.schema,
            context: comment.context,
          })

          const result = await client.comments.create(
            comment.workspace_id,
            params as CreateCommentParams
          )
          results.push(result)
        }

        return { comments: results }
      }
    )
  )

  // ============================================================================
  // TOOL: comment_updates
  // Update one or more comments (batch operation)
  // ============================================================================
  server.registerTool(
    "comment_updates",
    {
      title: "Update Comments",
      description:
        'Update one or more comments in a single operation. Each comment is fully self-contained with all parameters. Always use an array, even for a single comment. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}. Only the original author can modify comments.',
      inputSchema: {
        comments: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              comment_id: z.string().describe("Comment ID to update"),
              content: z
                .string()
                .max(102400)
                .optional()
                .describe(
                  'Updated comment text (maximum 102400 characters). Supports HTML formatting: <strong>, <em>, <s>, <u>, <code>, <p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>, <ul><li>, <ol><li>, <a href="">. Plain text also works. To mention users, use {{@Username}} syntax (e.g., {{@Steve Clarke}}). Use \\{{@Name}} to output literal template text.'
                ),
              status: z
                .enum(["resolved", "open", "orphaned"])
                .optional()
                .describe("Comment status"),
              context: z.string().optional().describe("Updated highlighted text context"),
              schema: z.number().optional().describe("Schema version"),
            })
          )
          .describe("Array of comments to update (use single-element array for one comment)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          comments: Array<{
            workspace_id: string
            comment_id: string
            content?: string
            status?: "resolved" | "open" | "orphaned"
            context?: string
            schema?: number
          }>
        }
      ) => {
        // Process comments sequentially
        const results = []
        for (const comment of args.comments) {
          // Process @mentions in content if provided
          const processedContent = comment.content
            ? await formatMentions(comment.content, comment.workspace_id, client)
            : undefined

          const params = buildParams<UpdateCommentParams>({
            content: processedContent,
            status: comment.status,
            context: comment.context,
            schema: comment.schema,
          })

          const result = await client.comments.update(
            comment.workspace_id,
            comment.comment_id,
            params as UpdateCommentParams
          )
          results.push(result)
        }

        return { comments: results }
      }
    )
  )

  // ============================================================================
  // TOOL: comment_replies
  // Reply to comments (batch operation)
  // ============================================================================
  server.registerTool(
    "comment_replies",
    {
      title: "Reply to Comments",
      description:
        'Create one or more replies to comments in a single operation. Each reply is fully self-contained with all parameters. Always use an array, even for a single reply. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}.',
      inputSchema: {
        replies: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              comment_id: z.string().describe("Parent comment ID to reply to"),
              content: z
                .string()
                .max(102400)
                .describe(
                  'Reply text (required, maximum 102400 characters). Supports HTML formatting: <strong>, <em>, <s>, <u>, <code>, <p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>, <ul><li>, <ol><li>, <a href="">. Plain text also works. To mention users, use {{@Username}} syntax (e.g., {{@Steve Clarke}}). Use \\{{@Name}} to output literal template text.'
                ),
              schema: z.number().optional().describe("Schema version"),
            })
          )
          .describe("Array of replies to create (use single-element array for one reply)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          replies: Array<{
            workspace_id: string
            comment_id: string
            content: string
            schema?: number
          }>
        }
      ) => {
        // Process replies sequentially
        const results = []
        for (const reply of args.replies) {
          // Process @mentions in content
          const processedContent = await formatMentions(reply.content, reply.workspace_id, client)

          const params = buildParams<ReplyToCommentParams>({
            content: processedContent,
            schema: reply.schema,
          })

          const result = await client.comments.reply(
            reply.workspace_id,
            reply.comment_id,
            params as ReplyToCommentParams
          )
          results.push(result)
        }

        return { replies: results }
      }
    )
  )

  // ============================================================================
  // TOOL: comment_gets
  // Get detailed information about one or more comments in a single operation
  // ============================================================================
  server.registerTool(
    "comment_gets",
    {
      title: "Get Comments",
      description:
        "Fetches the details of one or more comments in a single operation. Each comment is fully self-contained with all parameters. Always use an array, even for a single comment. Returns metadata like author, reactions, timestamps, and child comments (replies) for each comment.",
      inputSchema: {
        comments: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              comment_id: z.string().describe("Comment ID to retrieve"),
            })
          )
          .describe("Array of comments to retrieve (use single-element array for one comment)"),
      },
    },
    createToolHandler(
      async (client, args: { comments: Array<{ workspace_id: string; comment_id: string }> }) => {
        // Process comments sequentially
        const results = []
        for (const comment of args.comments) {
          const result = await client.comments.get(comment.workspace_id, comment.comment_id)
          results.push(result)
        }

        return { comments: results }
      }
    )
  )

  // ============================================================================
  // TOOL: comment_deletes
  // Permanently delete one or more comments (batch operation)
  // ============================================================================
  server.registerTool(
    "comment_deletes",
    {
      title: "Delete Comments",
      description:
        "Permanently delete one or more comments in a single operation. Each comment is fully self-contained with all parameters. Always use an array, even for a single comment. Only the original author can delete their own comments.",
      inputSchema: {
        comments: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              comment_id: z.string().describe("Comment ID to delete"),
            })
          )
          .describe("Array of comments to delete (use single-element array for one comment)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          comments: Array<{
            workspace_id: string
            comment_id: string
          }>
        }
      ) => {
        // Process comments sequentially
        const results = []
        for (const comment of args.comments) {
          const result = await client.comments.delete(comment.workspace_id, comment.comment_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )

  // ============================================================================
  // TOOL: comment_get_replies
  // Get all replies to a comment
  // ============================================================================
  server.registerTool(
    "comment_get_replies",
    {
      title: "Get Comment Replies",
      description:
        "Retrieves a list of comments (child comments or replies) associated with a parent comment. The response includes nested metadata and pagination details.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Parent comment ID to get replies from"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.comments.getReplies(args.workspace_id, args.comment_id)
    })
  )

  // ============================================================================
  // TOOL: comment_update_replies
  // Update one or more comment replies (batch operation)
  // ============================================================================
  server.registerTool(
    "comment_update_replies",
    {
      title: "Update Replies",
      description:
        'Update one or more comment replies in a single operation. Each reply is fully self-contained with all parameters. Always use an array, even for a single reply. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}. Only the original author can modify their reply.',
      inputSchema: {
        replies: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              comment_id: z.string().describe("Parent comment ID"),
              child_comment_id: z.string().describe("Child comment ID to update"),
              content: z
                .string()
                .max(102400)
                .optional()
                .describe(
                  'Updated comment text (maximum 102400 characters). Supports HTML formatting: <strong>, <em>, <s>, <u>, <code>, <p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>, <ul><li>, <ol><li>, <a href="">. Plain text also works. To mention users, use {{@Username}} syntax (e.g., {{@Steve Clarke}}). Use \\{{@Name}} to output literal template text.'
                ),
              status: z
                .enum(["resolved", "open", "orphaned"])
                .optional()
                .describe("Comment status"),
              context: z.string().optional().describe("Updated highlighted text context"),
              schema: z.number().optional().describe("Schema version"),
            })
          )
          .describe("Array of replies to update (use single-element array for one reply)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          replies: Array<{
            workspace_id: string
            comment_id: string
            child_comment_id: string
            content?: string
            status?: "resolved" | "open" | "orphaned"
            context?: string
            schema?: number
          }>
        }
      ) => {
        // Process replies sequentially
        const results = []
        for (const reply of args.replies) {
          // Process @mentions in content if provided
          const processedContent = reply.content
            ? await formatMentions(reply.content, reply.workspace_id, client)
            : undefined

          const params = buildParams<UpdateCommentParams>({
            content: processedContent,
            status: reply.status,
            context: reply.context,
            schema: reply.schema,
          })

          const result = await client.comments.updateReply(
            reply.workspace_id,
            reply.comment_id,
            reply.child_comment_id,
            params as UpdateCommentParams
          )
          results.push(result)
        }

        return { replies: results }
      }
    )
  )

  // ============================================================================
  // TOOL: comment_delete_replies
  // Permanently delete one or more replies (batch operation)
  // ============================================================================
  server.registerTool(
    "comment_delete_replies",
    {
      title: "Delete Replies",
      description:
        "Permanently delete one or more comment replies in a single operation. Each reply is fully self-contained with all parameters. Always use an array, even for a single reply. Only the original author can delete their own replies.",
      inputSchema: {
        replies: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              comment_id: z.string().describe("Parent comment ID"),
              child_comment_id: z.string().describe("Child comment ID to delete"),
            })
          )
          .describe("Array of replies to delete (use single-element array for one reply)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          replies: Array<{
            workspace_id: string
            comment_id: string
            child_comment_id: string
          }>
        }
      ) => {
        // Process replies sequentially
        const results = []
        for (const reply of args.replies) {
          const result = await client.comments.deleteReply(
            reply.workspace_id,
            reply.comment_id,
            reply.child_comment_id
          )
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
