/**
 * @fileoverview MCP prompts implementation.
 * Provides reusable prompt templates for common workflows.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

/**
 * Registers prompts with the MCP server.
 * Prompts are user-driven templates that appear as slash commands in the UI.
 *
 * @param server - The McpServer instance to register prompts with
 */
export function registerPrompts(server: McpServer) {
  // screenshot-to-tasks - Convert screenshot content into actionable tasks
  server.registerPrompt(
    "screenshot-to-tasks",
    {
      title: "Screenshot to Tasks",
      description:
        "Convert screenshot content into actionable SuperThread tasks with proper structure and priorities",
      argsSchema: {
        screenshot_description: z
          .string()
          .describe("Description of what's shown in the screenshot"),

        board_id: z
          .string()
          .optional()
          .describe("Target board ID for task creation"),

        list_id: z.string().optional().describe("Target list ID (status column)"),

        project_context: z
          .string()
          .optional()
          .describe("Context about the project these tasks belong to"),
      },
    },
    ({
      screenshot_description,
      board_id = "[BOARD_ID]",
      list_id = "[LIST_ID]",
      project_context = "",
    }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to convert this screenshot content into actionable SuperThread tasks: "${screenshot_description}"

${project_context ? `Project context: ${project_context}` : ""}

Please create specific, actionable tasks that:
1. Are clearly defined and measurable
2. Can be completed by a single person
3. Have clear acceptance criteria
4. Are properly prioritized

For each task, provide:
- Title: Clear, concise task name
- Description: Detailed description with acceptance criteria
- Priority: High, Medium, or Low (as numeric value)
- Estimated effort: Time or complexity estimate (in story points)

${board_id !== "[BOARD_ID]" && list_id !== "[LIST_ID]" ? `Create the tasks in board ${board_id}, list ${list_id}` : "List the tasks for me to review before creating them"}

Format the output for easy import into SuperThread using the create_card tool.`,
            },
          },
        ],
      }
    }
  )
}

