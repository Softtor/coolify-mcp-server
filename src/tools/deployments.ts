import { z } from "zod";
import { coolifyGet, coolifyPost } from "../services/coolify-client.js";
import { DeployParamSchema, TeamParamSchema } from "../schemas/common.js";

export const DeploySchema = DeployParamSchema.refine(
  (data) => data.uuid || data.tag,
  { message: "Either uuid or tag must be provided" }
);

export const ListDeploymentsSchema = TeamParamSchema.extend({
  uuid: z.string().describe("Application UUID to list deployments for"),
  skip: z.number().optional().describe("Number of deployments to skip (pagination)"),
  take: z.number().optional().describe("Number of deployments to take (pagination)"),
});

export async function deploy(params: z.infer<typeof DeploySchema>) {
  const queryParams: Record<string, string | boolean | undefined> = {};

  if (params.uuid) {
    queryParams.uuid = params.uuid;
  }
  if (params.tag) {
    queryParams.tag = params.tag;
  }
  if (params.force) {
    queryParams.force = params.force;
  }

  const data = await coolifyPost<unknown>("/deploy", undefined, {
    team: params.team,
    params: queryParams,
  });
  return JSON.stringify(data, null, 2);
}

export async function listDeployments(params: z.infer<typeof ListDeploymentsSchema>) {
  const data = await coolifyGet<unknown>(`/applications/${params.uuid}/deployments`, {
    team: params.team,
    params: {
      skip: params.skip,
      take: params.take,
    },
  });
  return JSON.stringify(data, null, 2);
}

export const deploymentTools = [
  {
    name: "coolify_deploy",
    description: "Deploy an application by UUID or deploy all resources with a specific tag",
    inputSchema: DeploySchema,
    handler: deploy,
  },
  {
    name: "coolify_list_deployments",
    description: "List deployment history for an application",
    inputSchema: ListDeploymentsSchema,
    handler: listDeployments,
  },
];
