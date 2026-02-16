import { z } from "zod";
import { searchLogs, getLogSummary } from "../services/rag-store.js";

export const SearchLogsSchema = z.object({
  keyword: z.string().optional().describe("Search keyword across tool, team, params, and response"),
  tool: z.string().optional().describe("Filter by tool name"),
  team: z.string().optional().describe("Filter by team name"),
  startTime: z.string().optional().describe("Start of time range (ISO 8601)"),
  endTime: z.string().optional().describe("End of time range (ISO 8601)"),
  status: z.enum(["success", "error"]).optional().describe("Filter by status"),
  limit: z.number().optional().describe("Max results to return (default: 50)"),
});

export const LogSummarySchema = z.object({
  hoursBack: z.number().optional().describe("Hours to look back (default: 24)"),
});

export async function handleSearchLogs(params: z.infer<typeof SearchLogsSchema>): Promise<string> {
  const results = searchLogs(params);
  if (results.length === 0) return "No log entries found matching the filters.";
  return JSON.stringify(results, null, 2);
}

export async function handleGetLogSummary(params: z.infer<typeof LogSummarySchema>): Promise<string> {
  const summary = getLogSummary(params.hoursBack);
  return JSON.stringify(summary, null, 2);
}

export const logsRagTools = [
  {
    name: "coolify_search_logs",
    description: "Search Coolify API call logs by keyword, tool, team, time range, or status",
    inputSchema: SearchLogsSchema,
    handler: handleSearchLogs,
  },
  {
    name: "coolify_get_log_summary",
    description: "Get a summary of Coolify API activity (calls, errors, by team/tool)",
    inputSchema: LogSummarySchema,
    handler: handleGetLogSummary,
  },
];
