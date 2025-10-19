/**
 * Utilitaires pour les appels fetch avec retry, timeout et gestion d'erreurs
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Fetch avec timeout
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError('Request timeout', 408);
    }
    throw error;
  }
}

/**
 * Fetch avec retry automatique
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);

      // Ne pas retry sur les erreurs client (4xx) sauf 408 et 429
      if (!response.ok) {
        const shouldRetry =
          response.status === 408 ||
          response.status === 429 ||
          response.status >= 500;

        if (!shouldRetry || attempt === retries) {
          throw new FetchError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response
          );
        }
        // Continuer pour retry
      } else {
        return response;
      }
    } catch (error) {
      lastError = error as Error;

      // Ne pas retry sur les erreurs de réseau si c'est la dernière tentative
      if (attempt === retries) {
        if (error instanceof FetchError) {
          throw error;
        }
        throw new FetchError(
          'Network error: Unable to reach server',
          0,
          undefined
        );
      }

      // Attendre avant de retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError || new FetchError('Request failed after retries');
}

/**
 * Fetch JSON avec retry et validation
 */
export async function fetchJSON<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new FetchError('Invalid JSON response');
  }
}

/**
 * POST JSON avec retry
 */
export async function postJSON<T>(
  url: string,
  data: unknown,
  options: FetchOptions = {}
): Promise<T> {
  return fetchJSON<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}
