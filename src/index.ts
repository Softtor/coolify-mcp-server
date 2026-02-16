#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getConfig, listAvailableTeams } from "./config.js";
import { applicationTools } from "./tools/applications.js";
import { databaseTools } from "./tools/databases.js";
import { serviceTools } from "./tools/services.js";
import { serverTools } from "./tools/servers.js";
import { deploymentTools } from "./tools/deployments.js";
import { projectTools } from "./tools/projects.js";
import { logsRagTools } from "./tools/logs-rag.js";
import { keysTools } from "./tools/keys.js";

interface ToolDefinition<T = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<T>;
  handler: (params: T) => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allTools: ToolDefinition<any>[] = [
  ...applicationTools,
  ...databaseTools,
  ...serviceTools,
  ...serverTools,
  ...deploymentTools,
  ...projectTools,
  ...logsRagTools,
  ...keysTools,
];

function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
      properties[key] = zodFieldToJsonSchema(zodValue);

      if (!(zodValue instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (schema instanceof z.ZodEffects) {
    return zodToJsonSchema(schema._def.schema);
  }

  return { type: "object" };
}

function zodFieldToJsonSchema(field: z.ZodType): Record<string, unknown> {
  if (field instanceof z.ZodString) {
    return {
      type: "string",
      description: field.description,
    };
  }

  if (field instanceof z.ZodNumber) {
    return {
      type: "number",
      description: field.description,
    };
  }

  if (field instanceof z.ZodBoolean) {
    return {
      type: "boolean",
      description: field.description,
    };
  }

  if (field instanceof z.ZodOptional) {
    return zodFieldToJsonSchema(field._def.innerType);
  }

  if (field instanceof z.ZodDefault) {
    return zodFieldToJsonSchema(field._def.innerType);
  }

  return { type: "string" };
}

const server = new Server(
  {
    name: "coolify-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const config = getConfig();
  const teams = listAvailableTeams();

  const teamsInfo = `Available teams: ${teams.join(", ")}. Default: ${config.defaultTeam}`;

  return {
    tools: allTools.map((tool) => ({
      name: tool.name,
      description: `${tool.description}\n\n${teamsInfo}`,
      inputSchema: zodToJsonSchema(tool.inputSchema),
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = allTools.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const validatedArgs = tool.inputSchema.parse(args);
    const result = await tool.handler(validatedArgs);
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  try {
    getConfig();
  } catch (error) {
    console.error("Configuration error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
