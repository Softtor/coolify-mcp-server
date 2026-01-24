import { AxiosError } from "axios";

export interface CoolifyError {
  message: string;
  status?: number;
  details?: unknown;
}

export function handleApiError(error: unknown): CoolifyError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      return {
        message: "Authentication failed. Check your API key.",
        status,
        details: data,
      };
    }

    if (status === 403) {
      return {
        message: "Access denied. Your API key may not have permission for this operation.",
        status,
        details: data,
      };
    }

    if (status === 404) {
      return {
        message: "Resource not found.",
        status,
        details: data,
      };
    }

    if (status === 422) {
      return {
        message: "Validation error.",
        status,
        details: data,
      };
    }

    return {
      message: data?.message || error.message || "Unknown API error",
      status,
      details: data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Unknown error occurred",
    details: error,
  };
}

export function formatErrorResponse(error: CoolifyError): string {
  let response = `Error: ${error.message}`;
  if (error.status) {
    response += ` (HTTP ${error.status})`;
  }
  if (error.details) {
    response += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
  }
  return response;
}
