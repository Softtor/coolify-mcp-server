import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export interface LogEntry {
  timestamp: string;
  tool: string;
  team: string;
  params: Record<string, unknown>;
  status: "success" | "error";
  responseSummary: string;
  durationMs: number;
}

export interface SearchFilters {
  keyword?: string;
  tool?: string;
  team?: string;
  startTime?: string;
  endTime?: string;
  status?: "success" | "error";
  limit?: number;
}

export interface LogSummary {
  totalCalls: number;
  successCount: number;
  errorCount: number;
  byTeam: Record<string, number>;
  byTool: Record<string, number>;
  byStatus: Record<string, number>;
  avgDurationMs: number;
  periodStart: string;
  periodEnd: string;
}

function getConfigDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg || path.join(os.homedir(), ".config");
  return path.join(base, "coolify-mcp");
}

function getLogPath(): string {
  return path.join(getConfigDir(), "logs.jsonl");
}

function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function appendLog(entry: LogEntry): void {
  ensureConfigDir();
  fs.appendFileSync(getLogPath(), JSON.stringify(entry) + "\n");
}

function readAllLogs(): LogEntry[] {
  const logPath = getLogPath();
  if (!fs.existsSync(logPath)) return [];
  const content = fs.readFileSync(logPath, "utf-8").trim();
  if (!content) return [];
  return content.split("\n").map((line) => JSON.parse(line) as LogEntry);
}

export function searchLogs(filters: SearchFilters): LogEntry[] {
  let logs = readAllLogs();
  const limit = filters.limit ?? 50;

  if (filters.tool) {
    const t = filters.tool.toLowerCase();
    logs = logs.filter((l) => l.tool.toLowerCase().includes(t));
  }
  if (filters.team) {
    const t = filters.team.toLowerCase();
    logs = logs.filter((l) => l.team.toLowerCase() === t);
  }
  if (filters.status) {
    logs = logs.filter((l) => l.status === filters.status);
  }
  if (filters.startTime) {
    const start = new Date(filters.startTime).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= start);
  }
  if (filters.endTime) {
    const end = new Date(filters.endTime).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() <= end);
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.tool.toLowerCase().includes(kw) ||
        l.team.toLowerCase().includes(kw) ||
        l.responseSummary.toLowerCase().includes(kw) ||
        JSON.stringify(l.params).toLowerCase().includes(kw)
    );
  }

  return logs.slice(-limit);
}

export function getLogSummary(hoursBack: number = 24): LogSummary {
  const cutoff = new Date(Date.now() - hoursBack * 3600 * 1000);
  const logs = readAllLogs().filter((l) => new Date(l.timestamp) >= cutoff);

  const byTeam: Record<string, number> = {};
  const byTool: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalDuration = 0;

  for (const l of logs) {
    byTeam[l.team] = (byTeam[l.team] || 0) + 1;
    byTool[l.tool] = (byTool[l.tool] || 0) + 1;
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    totalDuration += l.durationMs;
  }

  return {
    totalCalls: logs.length,
    successCount: byStatus["success"] || 0,
    errorCount: byStatus["error"] || 0,
    byTeam,
    byTool,
    byStatus,
    avgDurationMs: logs.length ? Math.round(totalDuration / logs.length) : 0,
    periodStart: cutoff.toISOString(),
    periodEnd: new Date().toISOString(),
  };
}
