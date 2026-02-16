/**
 * Response summarizer — reduces API responses to essential fields
 * to minimize context window usage in LLM interactions.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

function pick<T extends Record<string, Any>>(obj: T, keys: string[]): Partial<T> {
  const result: Record<string, Any> = {};
  for (const key of keys) {
    if (key.includes("*")) {
      const prefix = key.replace("*", "");
      for (const k of Object.keys(obj)) {
        if (k.startsWith(prefix)) result[k] = obj[k];
      }
    } else if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result as Partial<T>;
}

// ── Applications ──

const APP_LIST_FIELDS = [
  "uuid", "name", "status", "fqdn", "git_repository", "git_branch",
  "build_pack", "last_online_at", "server_status", "description",
];

const APP_DETAIL_EXTRA = [
  "dockerfile_location", "ports_exposes", "health_check_enabled",
  "health_check_path", "limits_memory", "limits_cpus",
  "environment_id", "created_at", "updated_at",
];

export function summarizeApp(app: Any): Any {
  return pick(app, APP_LIST_FIELDS);
}

export function summarizeAppDetail(app: Any): Any {
  return pick(app, [...APP_LIST_FIELDS, ...APP_DETAIL_EXTRA]);
}

// ── Databases ──

const DB_LIST_FIELDS = [
  "uuid", "name", "status", "database_type", "image", "is_public",
  "public_port", "last_online_at", "server_status", "internal_db_url",
];

const DB_DETAIL_EXTRA = [
  "limits_*", "backup_configs", "external_db_url", "enable_ssl",
];

export function summarizeDatabase(db: Any): Any {
  return pick(db, DB_LIST_FIELDS);
}

export function summarizeDatabaseDetail(db: Any): Any {
  return pick(db, [...DB_LIST_FIELDS, ...DB_DETAIL_EXTRA]);
}

// ── Services ──

const SVC_LIST_FIELDS = [
  "uuid", "name", "status", "service_type", "server_status",
  "description", "created_at",
];

export function summarizeService(svc: Any): Any {
  return pick(svc, SVC_LIST_FIELDS);
}

export function summarizeServiceDetail(svc: Any): Any {
  const summary = pick(svc, [...SVC_LIST_FIELDS, "updated_at"]);
  if (Array.isArray(svc.applications)) {
    (summary as Any).applications = svc.applications.map(summarizeApp);
  }
  if (Array.isArray(svc.databases)) {
    (summary as Any).databases = svc.databases.map(summarizeDatabase);
  }
  return summary;
}

// ── Servers (kept as-is, already small) ──

export function summarizeServer(srv: Any): Any {
  return srv;
}

// ── Logs ──

export interface SummarizedLogs {
  lines: string[];
  totalLines: number;
  truncated: boolean;
  errorWarnCount: number;
}

export function summarizeLogs(logsResponse: Any): SummarizedLogs {
  // logsResponse may be a string or an object with a logs/output field
  let raw: string;
  if (typeof logsResponse === "string") {
    raw = logsResponse;
  } else if (logsResponse?.logs) {
    raw = typeof logsResponse.logs === "string" ? logsResponse.logs : JSON.stringify(logsResponse.logs);
  } else {
    raw = JSON.stringify(logsResponse);
  }

  const allLines = raw.split("\n").filter((l: string) => l.trim().length > 0);
  const totalLines = allLines.length;

  if (totalLines <= 50) {
    const errorWarn = allLines.filter((l: string) => /\b(ERROR|WARN|WARNING|FATAL|CRITICAL)\b/i.test(l));
    return { lines: allLines, totalLines, truncated: false, errorWarnCount: errorWarn.length };
  }

  // Prioritize error/warn lines
  const errorWarnLines: string[] = [];
  const generalLines: string[] = [];
  for (const line of allLines) {
    if (/\b(ERROR|WARN|WARNING|FATAL|CRITICAL)\b/i.test(line)) {
      errorWarnLines.push(line);
    } else {
      generalLines.push(line);
    }
  }

  const selectedErrorWarn = errorWarnLines.slice(-20);
  const remainingSlots = 50 - selectedErrorWarn.length;
  const selectedGeneral = generalLines.slice(-remainingSlots);

  return {
    lines: [...selectedErrorWarn, ...selectedGeneral],
    totalLines,
    truncated: true,
    errorWarnCount: errorWarnLines.length,
  };
}
