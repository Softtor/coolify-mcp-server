import { z } from "zod";
import { coolifyGet, coolifyPost } from "../services/coolify-client.js";
import { TeamParamSchema, UuidParamSchema } from "../schemas/common.js";

export const ListServicesSchema = TeamParamSchema;
export const GetServiceSchema = UuidParamSchema;
export const StartServiceSchema = UuidParamSchema;
export const StopServiceSchema = UuidParamSchema;
export const RestartServiceSchema = UuidParamSchema;

export async function listServices(params: z.infer<typeof ListServicesSchema>) {
  const data = await coolifyGet<unknown[]>("/services", { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function getService(params: z.infer<typeof GetServiceSchema>) {
  const data = await coolifyGet<unknown>(`/services/${params.uuid}`, { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function startService(params: z.infer<typeof StartServiceSchema>) {
  const data = await coolifyPost<unknown>(`/services/${params.uuid}/start`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function stopService(params: z.infer<typeof StopServiceSchema>) {
  const data = await coolifyPost<unknown>(`/services/${params.uuid}/stop`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function restartService(params: z.infer<typeof RestartServiceSchema>) {
  const data = await coolifyPost<unknown>(`/services/${params.uuid}/restart`, undefined, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export const serviceTools = [
  {
    name: "coolify_list_services",
    description: "List all services in Coolify",
    inputSchema: ListServicesSchema,
    handler: listServices,
  },
  {
    name: "coolify_get_service",
    description: "Get details of a specific service by UUID",
    inputSchema: GetServiceSchema,
    handler: getService,
  },
  {
    name: "coolify_start_service",
    description: "Start a service",
    inputSchema: StartServiceSchema,
    handler: startService,
  },
  {
    name: "coolify_stop_service",
    description: "Stop a running service",
    inputSchema: StopServiceSchema,
    handler: stopService,
  },
  {
    name: "coolify_restart_service",
    description: "Restart a service",
    inputSchema: RestartServiceSchema,
    handler: restartService,
  },
];
