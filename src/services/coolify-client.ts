import axios, { type AxiosRequestConfig } from "axios";
import { getConfig, getTeamApiKey } from "../config.js";
import { handleApiError, formatErrorResponse } from "./error-handler.js";
import { appendLog, type LogEntry } from "./rag-store.js";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
  team?: string;
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function coolifyRequest<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  data?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const config = getConfig();
  const apiKey = getTeamApiKey(options.team);

  const axiosConfig: AxiosRequestConfig = {
    method,
    url: `${config.baseUrl}/api/v1${endpoint}`,
    timeout: options.timeout ?? 30000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };

  if (data) {
    axiosConfig.data = data;
  }

  if (options.params) {
    const filteredParams: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        filteredParams[key] = value;
      }
    }
    axiosConfig.params = filteredParams;
  }

  const startTime = Date.now();
  let logStatus: LogEntry["status"] = "success";
  let responseSummary = "";

  try {
    const response = await axios(axiosConfig);
    const data = response.data;
    responseSummary = typeof data === "object"
      ? JSON.stringify(data).slice(0, 200)
      : String(data).slice(0, 200);
    return data;
  } catch (error) {
    logStatus = "error";
    const apiError = handleApiError(error);
    responseSummary = apiError.message;
    throw new Error(formatErrorResponse(apiError));
  } finally {
    try {
      appendLog({
        timestamp: new Date().toISOString(),
        tool: `${method} ${endpoint}`,
        team: options.team || config.defaultTeam,
        params: (data as Record<string, unknown>) ?? options.params ?? {},
        status: logStatus,
        responseSummary,
        durationMs: Date.now() - startTime,
      });
    } catch {
      // Never let logging break API calls
    }
  }
}

export async function coolifyGet<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  return coolifyRequest<T>(endpoint, "GET", undefined, options);
}

export async function coolifyPost<T>(
  endpoint: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return coolifyRequest<T>(endpoint, "POST", data, options);
}

export async function coolifyPatch<T>(
  endpoint: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return coolifyRequest<T>(endpoint, "PATCH", data, options);
}

export async function coolifyDelete<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  return coolifyRequest<T>(endpoint, "DELETE", undefined, options);
}
