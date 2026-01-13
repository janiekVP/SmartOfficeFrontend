import axios, { AxiosError, AxiosInstance } from "axios";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:5273";

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// (Optioneel) JWT injecteren
api.interceptors.request.use((config) => {
  // const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const parsed = parseAspNetProblemDetails(error);
    return Promise.reject(parsed ?? error);
  }
);

/** ASP.NET Core ValidationProblem -> nette Error */
export function parseAspNetProblemDetails(error: AxiosError) {
  const data = (error.response?.data ?? {}) as any;
  const ct = String(error.response?.headers?.["content-type"] || "");
  const isProblemJson = ct.toLowerCase().includes("application/problem+json");

  if (isProblemJson && data) {
    const status = data.status ?? error.response?.status ?? 400;
    const title = data.title ?? "Validatiefout";
    const detail = data.detail ?? "";
    const instance = data.instance ?? "";
    const errors = data.errors ?? {};

    const flatErrors =
      typeof errors === "object"
        ? Object.entries(errors).map(([field, msgs]) => ({
            field,
            messages: Array.isArray(msgs) ? msgs : [String(msgs)],
          }))
        : [];

    const friendly =
      flatErrors.length > 0
        ? `${title}: ` +
          flatErrors.map((e) => `${e.field}: ${e.messages.join(", ")}`).join(" | ")
        : title;

    return new ApiValidationError(friendly, {
      status,
      detail,
      instance,
      errors: flatErrors,
      original: error,
    });
  }

  return null;
}

export class ApiValidationError extends Error {
  status?: number;
  detail?: string;
  instance?: string;
  errors?: { field: string; messages: string[] }[];
  original?: AxiosError;

  constructor(message: string, opts?: Partial<ApiValidationError>) {
    super(message);
    this.name = "ApiValidationError";
    Object.assign(this, opts);
  }
}
