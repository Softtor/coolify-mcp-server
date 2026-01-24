import { z } from "zod";

export const TeamParamSchema = z.object({
  team: z.string().optional().describe("Team name to use (default: configured default team)"),
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
