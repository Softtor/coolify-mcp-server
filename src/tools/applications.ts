import { z } from "zod";
import { coolifyGet, coolifyPost } from "../services/coolify-client.js";
import { TeamParamSchema, UuidParamSchema, LogsParamSchema } from "../schemas/common.js";
import { summarizeApp, summarizeAppDetail, summarizeLogs } from "../services/summarizer.js";

export const ListApplicationsSchema = TeamParamSchema;
export const GetApplicationSchema = UuidParamSchema;
export const StartApplicationSchema = UuidParamSchema;
export const StopApplicationSchema = UuidParamSchema;
export const RestartApplicationSchema = UuidParamSchema;
export const GetApplicationLogsSchema = LogsParamSchema;

export async function listApplications(params: z.infer<typeof ListApplicationsSchema>) {
  const data = await coolifyGet<unknown[]>("/applications", { team: params.team });
  if (params.verbose) return JSON.stringify(data, null, 2);
  const summarized = (data as Record<string, unknown>[]).map(summarizeApp);
  return JSON.stringify(summarized, null, 2);
}

export async function getApplication(params: z.infer<typeof GetApplicationSchema>) {
  const data = await coolifyGet<unknown>(`/applications/${params.uuid}`, { team: params.team });
  if (params.verbose) return JSON.stringify(data, null, 2);
  return JSON.stringify(summarizeAppDetail(data), null, 2);
}

export async function startApplication(params: z.infer<typeof StartApplicationSchema>) {
  const data = await coolifyPost<unknown>(`/applications/${params.uuid}/start`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function stopApplication(params: z.infer<typeof StopApplicationSchema>) {
  const data = await coolifyPost<unknown>(`/applications/${params.uuid}/stop`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function restartApplication(params: z.infer<typeof RestartApplicationSchema>) {
  const data = await coolifyPost<unknown>(`/applications/${params.uuid}/restart`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function getApplicationLogs(params: z.infer<typeof GetApplicationLogsSchema>) {
  const since = params.since ?? 3600;
  const data = await coolifyGet<unknown>(`/applications/${params.uuid}/logs`, {
    team: params.team,
    params: { since },
  });
  if (params.verbose) return JSON.stringify(data, null, 2);
  return JSON.stringify(summarizeLogs(data), null, 2);
}

export const applicationTools = [
  {
    name: "coolify_list_applications",
    description: "List all applications in Coolify (summarized by default, use verbose for full response)",
    inputSchema: ListApplicationsSchema,
    handler: listApplications,
  },
  {
    name: "coolify_get_application",
    description: "Get details of a specific application by UUID (summarized by default)",
    inputSchema: GetApplicationSchema,
    handler: getApplication,
  },
  {
    name: "coolify_start_application",
    description: "Start/deploy an application",
    inputSchema: StartApplicationSchema,
    handler: startApplication,
  },
  {
    name: "coolify_stop_application",
    description: "Stop a running application",
    inputSchema: StopApplicationSchema,
    handler: stopApplication,
  },
  {
    name: "coolify_restart_application",
    description: "Restart an application",
    inputSchema: RestartApplicationSchema,
    handler: restartApplication,
  },
  {
    name: "coolify_get_application_logs",
    description: "Get container logs for an application (summarized: last 50 lines prioritizing errors)",
    inputSchema: GetApplicationLogsSchema,
    handler: getApplicationLogs,
  },
];
