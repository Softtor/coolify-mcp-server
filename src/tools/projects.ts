import { z } from "zod";
import { coolifyGet } from "../services/coolify-client.js";
import { TeamParamSchema, UuidParamSchema } from "../schemas/common.js";

export const ListProjectsSchema = TeamParamSchema;
export const GetProjectSchema = UuidParamSchema;

export const ListTeamsSchema = z.object({
  team: z.string().optional().describe("Team name to use for authentication"),
});

export const GetTeamSchema = z.object({
  team: z.string().optional().describe("Team name to use for authentication"),
  id: z.number().describe("Team ID"),
});

export async function listProjects(params: z.infer<typeof ListProjectsSchema>) {
  const data = await coolifyGet<unknown[]>("/projects", { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function getProject(params: z.infer<typeof GetProjectSchema>) {
  const data = await coolifyGet<unknown>(`/projects/${params.uuid}`, { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function listTeams(params: z.infer<typeof ListTeamsSchema>) {
  const data = await coolifyGet<unknown[]>("/teams", { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function getTeam(params: z.infer<typeof GetTeamSchema>) {
  const data = await coolifyGet<unknown>(`/teams/${params.id}`, { team: params.team });
  return JSON.stringify(data, null, 2);
}

export const projectTools = [
  {
    name: "coolify_list_projects",
    description: "List all projects in Coolify",
    inputSchema: ListProjectsSchema,
    handler: listProjects,
  },
  {
    name: "coolify_get_project",
    description: "Get details of a specific project by UUID",
    inputSchema: GetProjectSchema,
    handler: getProject,
  },
  {
    name: "coolify_list_teams",
    description: "List all teams accessible with current API key",
    inputSchema: ListTeamsSchema,
    handler: listTeams,
  },
  {
    name: "coolify_get_team",
    description: "Get details of a specific team by ID",
    inputSchema: GetTeamSchema,
    handler: getTeam,
  },
];
