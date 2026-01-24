import { z } from "zod";
import { coolifyGet } from "../services/coolify-client.js";
import { TeamParamSchema, UuidParamSchema } from "../schemas/common.js";

export const ListServersSchema = TeamParamSchema;
export const GetServerSchema = UuidParamSchema;
export const GetServerResourcesSchema = UuidParamSchema;
export const GetServerDomainsSchema = UuidParamSchema;

export async function listServers(params: z.infer<typeof ListServersSchema>) {
  const data = await coolifyGet<unknown[]>("/servers", { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function getServer(params: z.infer<typeof GetServerSchema>) {
  const data = await coolifyGet<unknown>(`/servers/${params.uuid}`, { team: params.team });
  return JSON.stringify(data, null, 2);
}

export async function getServerResources(params: z.infer<typeof GetServerResourcesSchema>) {
  const data = await coolifyGet<unknown>(`/servers/${params.uuid}/resources`, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export async function getServerDomains(params: z.infer<typeof GetServerDomainsSchema>) {
  const data = await coolifyGet<unknown>(`/servers/${params.uuid}/domains`, {
    team: params.team,
  });
  return JSON.stringify(data, null, 2);
}

export const serverTools = [
  {
    name: "coolify_list_servers",
    description: "List all servers in Coolify",
    inputSchema: ListServersSchema,
    handler: listServers,
  },
  {
    name: "coolify_get_server",
    description: "Get details of a specific server by UUID",
    inputSchema: GetServerSchema,
    handler: getServer,
  },
  {
    name: "coolify_get_server_resources",
    description: "Get all resources (apps, databases, services) on a server",
    inputSchema: GetServerResourcesSchema,
    handler: getServerResources,
  },
  {
    name: "coolify_get_server_domains",
    description: "Get all domains mapped on a server",
    inputSchema: GetServerDomainsSchema,
    handler: getServerDomains,
  },
];
