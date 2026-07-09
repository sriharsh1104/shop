const TOKEN_KEY = 'token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function httpRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed');
  }

  return data as T;
}

export function createServiceClient(baseUrl: string) {
  const url = (path: string) => `${baseUrl}${path}`;

  return {
    get: <T>(path: string, auth = false) =>
      httpRequest<T>(url(path), { method: 'GET', auth }),

    post: <T>(path: string, body?: unknown, auth = false) =>
      httpRequest<T>(url(path), { method: 'POST', body, auth }),

    put: <T>(path: string, body?: unknown, auth = false) =>
      httpRequest<T>(url(path), { method: 'PUT', body, auth }),

    patch: <T>(path: string, body?: unknown, auth = false) =>
      httpRequest<T>(url(path), { method: 'PATCH', body, auth }),

    delete: <T>(path: string, auth = false) =>
      httpRequest<T>(url(path), { method: 'DELETE', auth }),
  };
}
