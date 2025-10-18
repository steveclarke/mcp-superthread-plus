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
  // comment_create - Create a new comment
  server.registerTool(
    "comment_create",
    {
      title: "Create Comment",
      description:
        'Adds a new comment to a specified card or page. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}. The content field is required, with optional fields for context, page_id, or card_id.',
      inputSchema: {
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
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          content: string
          card_id?: string
          page_id?: string
          schema?: number
          context?: string
        }
      ) => {
        // Process @mentions in content
        const processedContent = await formatMentions(args.content, args.workspace_id, client)

        const params = buildParams<CreateCommentParams>({
          content: processedContent,
          card_id: args.card_id,
          page_id: args.page_id,
          schema: args.schema,
          context: args.context,
        })

        return client.comments.create(args.workspace_id, params as CreateCommentParams)
      }
    )
  )

  // comment_update - Update an existing comment
  server.registerTool(
    "comment_update",
    {
      title: "Edit Comment",
      description:
        'Modifies the fields of an existing comment. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}. Only the original author can modify comments. The request body should specify the fields to update, such as content, status, or context. Omitted fields will remain unchanged. The status field accepts the following values: resolved, open, orphaned.',
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to update"),
        content: z
          .string()
          .max(102400)
          .optional()
          .describe(
            'Updated comment text (maximum 102400 characters). Supports HTML formatting: <strong>, <em>, <s>, <u>, <code>, <p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>, <ul><li>, <ol><li>, <a href="">. Plain text also works. To mention users, use {{@Username}} syntax (e.g., {{@Steve Clarke}}). Use \\{{@Name}} to output literal template text.'
          ),
        status: z.enum(["resolved", "open", "orphaned"]).optional().describe("Comment status"),
        context: z.string().optional().describe("Updated highlighted text context"),
        schema: z.number().optional().describe("Schema version"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          comment_id: string
          content?: string
          status?: "resolved" | "open" | "orphaned"
          context?: string
          schema?: number
        }
      ) => {
        // Process @mentions in content if provided
        const processedContent = args.content
          ? await formatMentions(args.content, args.workspace_id, client)
          : undefined

        const params = buildParams<UpdateCommentParams>({
          content: processedContent,
          status: args.status,
          context: args.context,
          schema: args.schema,
        })

        return client.comments.update(
          args.workspace_id,
          args.comment_id,
          params as UpdateCommentParams
        )
      }
    )
  )

  // comment_reply - Create a reply to a comment
  server.registerTool(
    "comment_reply",
    {
      title: "Reply to Comment",
      description:
        'Creates a new child comment (reply) under the parent comment specified by comment_id. Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}. The request body must include the content field and can optionally include additional metadata such as schema. The child comment can also be referred to as a reply or a thread.',
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Parent comment ID to reply to"),
        content: z
          .string()
          .max(102400)
          .describe(
            'Reply text (required, maximum 102400 characters). Supports HTML formatting: <strong>, <em>, <s>, <u>, <code>, <p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>, <ul><li>, <ol><li>, <a href="">. Plain text also works. To mention users, use {{@Username}} syntax (e.g., {{@Steve Clarke}}). Use \\{{@Name}} to output literal template text.'
          ),
        schema: z.number().optional().describe("Schema version"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          comment_id: string
          content: string
          schema?: number
        }
      ) => {
        // Process @mentions in content
        const processedContent = await formatMentions(args.content, args.workspace_id, client)

        const params = buildParams<ReplyToCommentParams>({
          content: processedContent,
          schema: args.schema,
        })

        return client.comments.reply(
          args.workspace_id,
          args.comment_id,
          params as ReplyToCommentParams
        )
      }
    )
  )

  // comment_get - Get a single comment
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
    createToolHandler(async (client, args) => {
      return client.comments.get(args.workspace_id, args.comment_id)
    })
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
    createToolHandler(async (client, args) => {
      return client.comments.delete(args.workspace_id, args.comment_id)
    })
  )

  // comment_get_replies - Get comment replies
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

  // comment_update_reply - Update a reply
  server.registerTool(
    "comment_update_reply",
    {
      title: "Edit Reply",
      description:
        'Modifies a specific child comment (reply). Content supports HTML formatting including: text formatting (<strong>, <em>, <s>, <u>, <code>), block elements (<p>, <h1>-<h6>, <blockquote>, <pre><code>, <br>, <hr>), lists (<ul><li>, <ol><li>), and links (<a href="">). Plain text also works. Supports @mentions - use {{@Username}} syntax to tag workspace members (names must match exactly). To output literal {{@Name}} text without mentioning, escape it with backslash: \\{{@Name}}. Only the original author can modify their reply. The request body should specify the fields to update, such as content, status, or context.',
      inputSchema: {
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
        status: z.enum(["resolved", "open", "orphaned"]).optional().describe("Comment status"),
        context: z.string().optional().describe("Updated highlighted text context"),
        schema: z.number().optional().describe("Schema version"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          comment_id: string
          child_comment_id: string
          content?: string
          status?: "resolved" | "open" | "orphaned"
          context?: string
          schema?: number
        }
      ) => {
        // Process @mentions in content if provided
        const processedContent = args.content
          ? await formatMentions(args.content, args.workspace_id, client)
          : undefined

        const params = buildParams<UpdateCommentParams>({
          content: processedContent,
          status: args.status,
          context: args.context,
          schema: args.schema,
        })

        return client.comments.updateReply(
          args.workspace_id,
          args.comment_id,
          args.child_comment_id,
          params as UpdateCommentParams
        )
      }
    )
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
    createToolHandler(async (client, args) => {
      return client.comments.deleteReply(args.workspace_id, args.comment_id, args.child_comment_id)
    })
  )
}
