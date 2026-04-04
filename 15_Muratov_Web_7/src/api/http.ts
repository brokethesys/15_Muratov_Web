export class HttpError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

export const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, init);
    const body = await parseJsonSafely<T & { message?: string }>(response);

    if (!response.ok) {
      const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : `Ошибка HTTP ${response.status}`;

      throw new HttpError(message, response.status);
    }

    if (body === null) {
      return {} as T;
    }

    return body as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`Сетевая ошибка: ${error.message}`);
    }

    throw new Error('Неизвестная сетевая ошибка.');
  }
};
