export type RateLimitError = {
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
  blockedBy?: "ip" | "email";
};

type ParsedRateLimit = {
  isRateLimited: boolean;
  retryAfterSeconds: number;
  message: string;
};

const DEFAULT_RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Merci de réessayer dans quelques instants.";

const RATE_LIMIT_CODE_PREFIX = "rate_limit";

export const parseRateLimit = async (
  response: Response
): Promise<ParsedRateLimit> => {
  if (response.status !== 429) {
    return {
      isRateLimited: false,
      retryAfterSeconds: 0,
      message: "",
    };
  }

  let data: RateLimitError | null = null;

  try {
    data = (await response.clone().json()) as RateLimitError;
  } catch {
    data = null;
  }

  const retryHeader = response.headers.get("Retry-After");
  const retryFromHeader = retryHeader ? Number(retryHeader) : undefined;
  const normalizedRetryFromHeader =
    retryFromHeader !== undefined && Number.isFinite(retryFromHeader)
      ? retryFromHeader
      : undefined;
  const retryAfterSeconds = Math.max(
    1,
    data?.retryAfterSeconds ?? normalizedRetryFromHeader ?? 30
  );

  return {
    isRateLimited: true,
    retryAfterSeconds,
    message: data?.message ?? DEFAULT_RATE_LIMIT_MESSAGE,
  };
};

export const createRateLimitCode = (retryAfterSeconds: number) => {
  const normalizedRetryAfterSeconds = Math.max(
    1,
    Math.floor(retryAfterSeconds || 0)
  );

  return `${RATE_LIMIT_CODE_PREFIX}:${normalizedRetryAfterSeconds}`;
};

export const parseRateLimitCode = (
  code?: string | null
): ParsedRateLimit => {
  if (!code || !code.startsWith(`${RATE_LIMIT_CODE_PREFIX}:`)) {
    return {
      isRateLimited: false,
      retryAfterSeconds: 0,
      message: "",
    };
  }

  const retryAfterSeconds = Number(code.split(":")[1]);

  return {
    isRateLimited: true,
    retryAfterSeconds:
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds
        : 30,
    message: DEFAULT_RATE_LIMIT_MESSAGE,
  };
};