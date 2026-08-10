export interface RetryOptions {
  /**
   * Maximum number of attempts, including the first attempt.
   */
  attempts?: number;

  /**
   * Initial delay before the first retry.
   */
  delayMs?: number;

  /**
   * Multiplier applied to the delay after each failed attempt.
   */
  backoffMultiplier?: number;

  /**
   * Determines whether a particular error should be retried.
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * Optional callback invoked after a failed attempt
   * when another retry will occur.
   */
  onRetry?: (
    error: unknown,
    attempt: number,
    delayMs: number,
  ) => void;
}

const DEFAULT_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 250;
const DEFAULT_BACKOFF_MULTIPLIER = 2;

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = Math.max(
    1,
    options.attempts ?? DEFAULT_ATTEMPTS,
  );

  const delayMs = Math.max(
    0,
    options.delayMs ?? DEFAULT_DELAY_MS,
  );

  const backoffMultiplier = Math.max(
    1,
    options.backoffMultiplier ??
      DEFAULT_BACKOFF_MULTIPLIER,
  );

  const shouldRetry =
    options.shouldRetry ?? (() => true);

  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= attempts;
    attempt++
  ) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      const hasAttemptsRemaining =
        attempt < attempts;

      if (
        !hasAttemptsRemaining ||
        !shouldRetry(error)
      ) {
        throw error;
      }

      const retryDelay =
        delayMs *
        Math.pow(
          backoffMultiplier,
          attempt - 1,
        );

      if (options.onRetry) {
        options.onRetry(
          error,
          attempt,
          retryDelay,
        );
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, retryDelay);
      });
    }
  }

  // This is unreachable in normal execution,
  // but keeps the function type-safe.
  throw lastError;
}
