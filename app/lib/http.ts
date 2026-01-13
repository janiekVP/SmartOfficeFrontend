const DEFAULT_TIMEOUT = 10000;

export type HttpOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  authToken?: string;
};

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !isFormData(value) &&
    !isBlob(value)
  );
}

export async function http<T>(url: string, opts: HttpOptions = {}): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT);

  const headers: Record<string, string> = { ...(opts.headers || {}) };

  if (opts.authToken) {
    headers.Authorization = `Bearer ${opts.authToken}`;
  }

  let requestBody: BodyInit | undefined = undefined;

  if (opts.body == null) {
    requestBody = undefined;
  } else if (isFormData(opts.body)) {
    requestBody = opts.body; 
  } else if (isBlob(opts.body)) {
    requestBody = opts.body;

    if (!('Content-Type' in headers) && (opts.body as Blob).type) {
      headers['Content-Type'] = (opts.body as Blob).type;
    }
  } else if (typeof opts.body === 'string') {
    requestBody = opts.body;

    if (!('Content-Type' in headers)) {
      headers['Content-Type'] = 'text/plain;charset=UTF-8';
    }
  } else if (isPlainObject(opts.body)) {
    requestBody = JSON.stringify(opts.body);
    if (!('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    requestBody = opts.body as BodyInit;
  }

  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body: requestBody,
      signal: ctrl.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
    }

    if (res.status === 204 || res.status === 205) {
      return undefined as unknown as T;
    }

    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    const text = await res.text().catch(() => '');
    if (!text) {
      return undefined as unknown as T;
    }

    if (isJson) {
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        throw new Error(`Invalid JSON in response: ${(e as Error).message}`);
      }
    }

    return undefined as unknown as T;
  } finally {
    clearTimeout(id);
  }
}
