/**
 * @fileoverview Comments and replies tools implementation.
 * Provides tools for managing comments and replies on cards and pages.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

/**
 * Registers comment management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCommentTools(server: McpServer) {
  // create_comment - Create comment
  server.registerTool(
    "create_comment",
    {
      title: "Create Comment",
      description: "Add a comment to a card or page",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        content: z.string().describe("Comment text"),
        target_type: z.enum(["card", "page"]).describe("What to comment on"),
        target_id: z.string().describe("Card ID or Page ID"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.create(workspace_id, data)
      throw new Error("create_comment not implemented yet")
    }
  )

  // edit_comment - Edit comment
  server.registerTool(
    "edit_comment",
    {
      title: "Edit Comment",
      description: "Edit an existing comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to edit"),
        content: z.string().describe("New comment text"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.edit(workspace_id, comment_id, data)
      throw new Error("edit_comment not implemented yet")
    }
  )

  // get_comment - Get comment
  server.registerTool(
    "get_comment",
    {
      title: "Get Comment",
      description: "Get detailed information about a specific comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to retrieve"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.get(workspace_id, comment_id)
      throw new Error("get_comment not implemented yet")
    }
  )

  // get_all_replies_to_comment - Get replies
  server.registerTool(
    "get_all_replies_to_comment",
    {
      title: "Get All Replies to Comment",
      description: "Get all replies to a comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to get replies for"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.getAllReplies(workspace_id, comment_id)
      throw new Error("get_all_replies_to_comment not implemented yet")
    }
  )

  // reply_to_comment - Reply to comment
  server.registerTool(
    "reply_to_comment",
    {
      title: "Reply to Comment",
      description: "Reply to an existing comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to reply to"),
        content: z.string().describe("Reply text"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.reply(workspace_id, comment_id, data)
      throw new Error("reply_to_comment not implemented yet")
    }
  )

  // edit_reply - Edit reply
  server.registerTool(
    "edit_reply",
    {
      title: "Edit Reply",
      description: "Edit a reply to a comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID"),
        reply_id: z.string().describe("Reply ID to edit"),
        content: z.string().describe("New reply text"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.editReply(workspace_id, comment_id, reply_id, data)
      throw new Error("edit_reply not implemented yet")
    }
  )

  // delete_reply - Delete reply
  server.registerTool(
    "delete_reply",
    {
      title: "Delete Reply",
      description: "Delete a reply to a comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID"),
        reply_id: z.string().describe("Reply ID to delete"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.deleteReply(workspace_id, comment_id, reply_id)
      throw new Error("delete_reply not implemented yet")
    }
  )

  // delete_comment - Delete comment
  server.registerTool(
    "delete_comment",
    {
      title: "Delete Comment",
      description: "Permanently delete a comment",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        comment_id: z.string().describe("Comment ID to delete"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().comments.delete(workspace_id, comment_id)
      throw new Error("delete_comment not implemented yet")
    }
  )
}

