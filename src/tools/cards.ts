/**
 * @fileoverview Card/task management tools implementation.
 * Provides tools for creating, updating, and managing cards (tasks) in SuperThread.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

/**
 * Registers card management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCardTools(server: McpServer) {
  // create_card - Create a new card
  server.registerTool(
    "create_card",
    {
      title: "Create Card",
      description: "Create a new card (task/ticket) in SuperThread",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        title: z.string().describe("Card title"),
        content: z.string().optional().describe("Card description/content"),
        board_id: z.string().optional().describe("Board ID"),
        list_id: z.string().describe("List ID (status column)"),
        project_id: z.string().optional().describe("Project ID"),
        owner_id: z.string().optional().describe("Assignee user ID"),
        priority: z.number().optional().describe("Priority level"),
        estimate: z.number().optional().describe("Story points estimate"),
        due_date: z.number().optional().describe("Due date (Unix timestamp)"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.create(workspace_id, data)
      throw new Error("create_card not implemented yet")
    }
  )

  // update_card - Update a card
  server.registerTool(
    "update_card",
    {
      title: "Update Card",
      description: "Update an existing card's properties",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to update"),
        title: z.string().optional().describe("New title"),
        content: z.string().optional().describe("New content"),
        list_id: z.string().optional().describe("Move to list ID"),
        owner_id: z.string().optional().describe("New assignee ID"),
        priority: z.number().optional().describe("New priority"),
        estimate: z.number().optional().describe("New estimate"),
        due_date: z.number().optional().describe("New due date"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.update(workspace_id, card_id, data)
      throw new Error("update_card not implemented yet")
    }
  )

  // get_card - Get card details
  server.registerTool(
    "get_card",
    {
      title: "Get Card",
      description: "Get detailed information about a specific card",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to retrieve"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.get(workspace_id, card_id)
      throw new Error("get_card not implemented yet")
    }
  )

  // duplicate_card - Clone a card
  server.registerTool(
    "duplicate_card",
    {
      title: "Duplicate Card",
      description: "Create a copy of an existing card",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to duplicate"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.duplicate(workspace_id, card_id)
      throw new Error("duplicate_card not implemented yet")
    }
  )

  // get_cards_assigned_to_user - Get user's assigned cards
  server.registerTool(
    "get_cards_assigned_to_user",
    {
      title: "Get Cards Assigned to User",
      description: "Get all cards assigned to a specific user",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        user_id: z.string().describe("User ID to get cards for"),
        project_id: z.string().optional().describe("Filter by project ID"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.getAssignedToUser(workspace_id, user_id, project_id)
      throw new Error("get_cards_assigned_to_user not implemented yet")
    }
  )

  // add_related_card - Add card relationship
  server.registerTool(
    "add_related_card",
    {
      title: "Add Related Card",
      description:
        "Create a relationship between two cards (blocks, blocked_by, relates_to)",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID"),
        related_card_id: z.string().describe("Related card ID"),
        relation_type: z
          .enum(["blocks", "blocked_by", "relates_to"])
          .describe("Type of relationship"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.addRelated(workspace_id, card_id, related_card_id, relation_type)
      throw new Error("add_related_card not implemented yet")
    }
  )

  // remove_related_card - Remove card relationship
  server.registerTool(
    "remove_related_card",
    {
      title: "Remove Related Card",
      description: "Remove a relationship between two cards",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID"),
        related_card_id: z.string().describe("Related card ID to remove"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.removeRelated(workspace_id, card_id, related_card_id)
      throw new Error("remove_related_card not implemented yet")
    }
  )

  // archive_card - Archive a card
  server.registerTool(
    "archive_card",
    {
      title: "Archive Card",
      description: "Archive a card (hide from active view but keep for reference)",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to archive"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.archive(workspace_id, card_id)
      throw new Error("archive_card not implemented yet")
    }
  )

  // delete_card - Delete a card
  server.registerTool(
    "delete_card",
    {
      title: "Delete Card",
      description: "Permanently delete a card",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to delete"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.delete(workspace_id, card_id)
      throw new Error("delete_card not implemented yet")
    }
  )

  // get_tags - List available tags
  server.registerTool(
    "get_tags",
    {
      title: "Get Tags",
      description: "Get all available tags in the workspace",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.getTags(workspace_id)
      throw new Error("get_tags not implemented yet")
    }
  )

  // add_tags_to_card - Tag a card
  server.registerTool(
    "add_tags_to_card",
    {
      title: "Add Tags to Card",
      description: "Add one or more tags to a card",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID"),
        tag_ids: z.array(z.string()).describe("Array of tag IDs to add"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.addTags(workspace_id, card_id, tag_ids)
      throw new Error("add_tags_to_card not implemented yet")
    }
  )

  // remove_tag_from_card - Remove tag from card
  server.registerTool(
    "remove_tag_from_card",
    {
      title: "Remove Tag from Card",
      description: "Remove a tag from a card",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID"),
        tag_id: z.string().describe("Tag ID to remove"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().cards.removeTag(workspace_id, card_id, tag_id)
      throw new Error("remove_tag_from_card not implemented yet")
    }
  )
}

