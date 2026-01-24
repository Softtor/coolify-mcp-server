import { z } from "zod";

export interface TeamConfig {
  name: string;
  apiKey: string;
}

export interface Config {
  baseUrl: string;
  defaultTeam: string;
  teams: Map<string, TeamConfig>;
}

const ConfigSchema = z.object({
  baseUrl: z.string().url("COOLIFY_BASE_URL must be a valid URL"),
  defaultTeam: z.string().min(1),
});

function loadTeams(): Map<string, TeamConfig> {
  const teams = new Map<string, TeamConfig>();

  for (const [key, value] of Object.entries(process.env)) {
    const match = key.match(/^COOLIFY_TEAM_(.+)_API_KEY$/);
    if (match && value) {
      const teamName = match[1].toLowerCase();
      teams.set(teamName, { name: teamName, apiKey: value });
    }
  }

  if (process.env.COOLIFY_API_KEY) {
    teams.set("default", { name: "default", apiKey: process.env.COOLIFY_API_KEY });
  }

  return teams;
}

let configInstance: Config | null = null;

export function getConfig(): Config {
  if (configInstance) {
    return configInstance;
  }

  const teams = loadTeams();

  if (teams.size === 0) {
    throw new Error(
      "No API keys configured. Set COOLIFY_API_KEY or COOLIFY_TEAM_<NAME>_API_KEY environment variables."
    );
  }

  const baseUrl = process.env.COOLIFY_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "COOLIFY_BASE_URL is required. Set it to your Coolify instance URL (e.g., https://coolify.example.com)."
    );
  }
  const envDefaultTeam = process.env.COOLIFY_DEFAULT_TEAM || "default";
  const defaultTeam = teams.has(envDefaultTeam) ? envDefaultTeam : teams.keys().next().value!;

  const validatedConfig = ConfigSchema.parse({
    baseUrl,
    defaultTeam,
  });

  configInstance = {
    ...validatedConfig,
    teams,
  };

  return configInstance;
}

export function getTeamApiKey(teamName?: string): string {
  const config = getConfig();
  const team = teamName || config.defaultTeam;
  const teamConfig = config.teams.get(team.toLowerCase());

  if (!teamConfig) {
    const availableTeams = Array.from(config.teams.keys()).join(", ");
    throw new Error(`Team "${team}" not found. Available teams: ${availableTeams}`);
  }

  return teamConfig.apiKey;
}

export function listAvailableTeams(): string[] {
  const config = getConfig();
  return Array.from(config.teams.keys());
}
