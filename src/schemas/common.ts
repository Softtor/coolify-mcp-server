import { z } from "zod";

export const TeamParamSchema = z.object({
  team: z.string().optional().describe("Team name to use (default: configured default team)"),
  verbose: z.boolean().optional().describe("Return full API response without summarization. Warning: may use significant context window."),
});

export const UuidParamSchema = TeamParamSchema.extend({
  uuid: z.string().describe("Resource UUID"),
});

export const DeployParamSchema = TeamParamSchema.extend({
  uuid: z.string().optional().describe("Application UUID to deploy"),
  tag: z.string().optional().describe("Tag to deploy (deploys all resources with this tag)"),
  force: z.boolean().optional().describe("Force rebuild without cache"),
});

export const LogsParamSchema = UuidParamSchema.extend({
  since: z.number().optional().describe("Get logs since N seconds ago (default: 3600)"),
});
