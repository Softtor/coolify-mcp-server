import { z } from "zod";
import { coolifyGet, coolifyPost } from "../services/coolify-client.js";
import { TeamParamSchema, UuidParamSchema } from "../schemas/common.js";

export const ListDatabasesSchema = TeamParamSchema;
export const GetDatabaseSchema = UuidParamSchema;
export const StartDatabaseSchema = UuidParamSchema;
export const StopDatabaseSchema = UuidParamSchema;
export const RestartDatabaseSchema = UuidParamSchema;
export const ListDatabaseBackupsSchema = UuidParamSchema;

export async function listDatabases(params: z.infer<typeof ListDatabasesSchema>) {
  const data = await coolifyGet<unknown[]>("/databases", { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function getDatabase(params: z.infer<typeof GetDatabaseSchema>) {
  const data = await coolifyGet<unknown>(`/databases/${params.uuid}`, { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function startDatabase(params: z.infer<typeof StartDatabaseSchema>) {
  const data = await coolifyPost<unknown>(`/databases/${params.uuid}/start`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function stopDatabase(params: z.infer<typeof StopDatabaseSchema>) {
  const data = await coolifyPost<unknown>(`/databases/${params.uuid}/stop`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function restartDatabase(params: z.infer<typeof RestartDatabaseSchema>) {
  const data = await coolifyPost<unknown>(`/databases/${params.uuid}/restart`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function listDatabaseBackups(params: z.infer<typeof ListDatabaseBackupsSchema>) {
  const data = await coolifyGet<unknown>(`/databases/${params.uuid}/backups`, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export const databaseTools = [
  {
    name: "coolify_list_databases",
    description: "List all databases in Coolify",
    inputSchema: ListDatabasesSchema,
    handler: listDatabases,
  },
  {
    name: "coolify_get_database",
    description: "Get details of a specific database by UUID",
    inputSchema: GetDatabaseSchema,
    handler: getDatabase,
  },
  {
    name: "coolify_start_database",
    description: "Start a database",
    inputSchema: StartDatabaseSchema,
    handler: startDatabase,
  },
  {
    name: "coolify_stop_database",
    description: "Stop a running database",
    inputSchema: StopDatabaseSchema,
    handler: stopDatabase,
  },
  {
    name: "coolify_restart_database",
    description: "Restart a database",
    inputSchema: RestartDatabaseSchema,
    handler: restartDatabase,
  },
  {
    name: "coolify_list_database_backups",
    description: "List backups for a database",
    inputSchema: ListDatabaseBackupsSchema,
    handler: listDatabaseBackups,
  },
];
