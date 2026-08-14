export interface RetryOptions {
  attempts: number;
  delayMs: number;
  backoffMultiplier: number;
  onRetry?: (
    error: unknown,
    attempt: number,
    delayMs: number,
  ) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  if (
    !Number.isInteger(options.attempts) ||
    options.attempts <= 0
  ) {
    throw new Error(
      "Retry attempts must be a positive integer.",
    );
  }

  if (
    !Number.isFinite(options.delayMs) ||
    options.delayMs < 0
  ) {
    throw new Error(
      "Retry delay must be a non-negative number.",
    );
  }

  if (
    !Number.isFinite(
      options.backoffMultiplier,
    ) ||
    options.backoffMultiplier <= 0
  ) {
    throw new Error(
      "Retry backoff multiplier must be greater than zero.",
    );
  }

  let attempt = 1;
  let currentDelay = options.delayMs;

  while (true) {
    try {
      return await operation();
    } catch (error: unknown) {
      /*
       * Preserve the exact original error when
       * retry attempts are exhausted.
       */
      if (attempt >= options.attempts) {
        throw error;
      }

      options.onRetry?.(
        error,
        attempt,
        currentDelay,
      );

      if (currentDelay > 0) {
        await sleep(currentDelay);
      }

      attempt += 1;

      currentDelay *=
        options.backoffMultiplier;
    }
  }
}

/*
 * Backwards-compatible name used by existing
 * Firestore writers/tests.
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  return retry(
    operation,
    options,
  );
}