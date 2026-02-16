import { z } from "zod";
import { addKey, removeKey, listKeys, rotateKey } from "../services/key-manager.js";
import { resetConfig } from "../config.js";

export const AddTeamKeySchema = z.object({
  team: z.string().describe("Team name"),
  apiKey: z.string().describe("Coolify API key for this team"),
});

export const RemoveTeamKeySchema = z.object({
  team: z.string().describe("Team name to remove"),
});

export const ListTeamKeysSchema = z.object({});

export const RotateTeamKeySchema = z.object({
  team: z.string().describe("Team name to rotate"),
  apiKey: z.string().describe("New API key"),
});

export async function handleAddTeamKey(params: z.infer<typeof AddTeamKeySchema>): Promise<string> {
  addKey(params.team, params.apiKey);
  resetConfig();
  return `Team key "${params.team}" added successfully.`;
}

export async function handleRemoveTeamKey(params: z.infer<typeof RemoveTeamKeySchema>): Promise<string> {
  const removed = removeKey(params.team);
  if (!removed) return `Team "${params.team}" not found in stored keys.`;
  resetConfig();
  return `Team key "${params.team}" removed successfully.`;
}

export async function handleListTeamKeys(): Promise<string> {
  const keys = listKeys();
  if (keys.length === 0) return "No stored team keys found.";
  return JSON.stringify(keys, null, 2);
}

export async function handleRotateTeamKey(params: z.infer<typeof RotateTeamKeySchema>): Promise<string> {
  const rotated = rotateKey(params.team, params.apiKey);
  if (!rotated) return `Team "${params.team}" not found in stored keys. Use add_team_key first.`;
  resetConfig();
  return `Team key "${params.team}" rotated successfully.`;
}

export const keysTools = [
  {
    name: "coolify_add_team_key",
    description: "Add a team API key at runtime (persisted encrypted on disk)",
    inputSchema: AddTeamKeySchema,
    handler: handleAddTeamKey,
  },
  {
    name: "coolify_remove_team_key",
    description: "Remove a stored team API key",
    inputSchema: RemoveTeamKeySchema,
    handler: handleRemoveTeamKey,
  },
  {
    name: "coolify_list_team_keys",
    description: "List configured teams with masked API keys",
    inputSchema: ListTeamKeysSchema,
    handler: handleListTeamKeys,
  },
  {
    name: "coolify_rotate_team_key",
    description: "Update an existing team API key",
    inputSchema: RotateTeamKeySchema,
    handler: handleRotateTeamKey,
  },
];
