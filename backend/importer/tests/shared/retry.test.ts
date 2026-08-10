import { describe, expect, it, vi } from "vitest";

import { retry } from "../../src/shared/retry.js";

describe("retry", () => {
  it("returns immediately when the operation succeeds", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await retry(operation);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries after a failure and eventually succeeds", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("temporary failure"),
      )
      .mockResolvedValueOnce("success");

    const result = await retry(operation, {
      attempts: 2,
      delayMs: 0,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("retries until the maximum number of attempts", async () => {
    const error = new Error("persistent failure");

    const operation = vi
      .fn()
      .mockRejectedValue(error);

    await expect(
      retry(operation, {
        attempts: 3,
        delayMs: 0,
      }),
    ).rejects.toBe(error);

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("does not retry when shouldRetry returns false", async () => {
    const error = new Error("non-retryable");

    const operation = vi
      .fn()
      .mockRejectedValue(error);

    await expect(
      retry(operation, {
        attempts: 3,
        delayMs: 0,
        shouldRetry: () => false,
      }),
    ).rejects.toBe(error);

    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry before each retry", async () => {
    const error = new Error("temporary failure");

    const operation = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce("success");

    const onRetry = vi.fn();

    const result = await retry(operation, {
      attempts: 2,
      delayMs: 0,
      onRetry,
    });

    expect(result).toBe("success");

    expect(onRetry).toHaveBeenCalledTimes(1);

    expect(onRetry).toHaveBeenCalledWith(
      error,
      1,
      0,
    );
  });

  it("applies exponential backoff", async () => {
    const error = new Error("temporary failure");

    const operation = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce("success");

    const onRetry = vi.fn();

    const result = await retry(operation, {
      attempts: 3,
      delayMs: 10,
      backoffMultiplier: 2,
      onRetry,
    });

    expect(result).toBe("success");

    expect(onRetry).toHaveBeenNthCalledWith(
      1,
      error,
      1,
      10,
    );

    expect(onRetry).toHaveBeenNthCalledWith(
      2,
      error,
      2,
      20,
    );
  });

  it("handles a non-Error rejection value", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce("temporary error")
      .mockResolvedValueOnce("success");

    const result = await retry(operation, {
      attempts: 2,
      delayMs: 0,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("normalizes invalid retry configuration", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(
        new Error("temporary"),
      );

    await expect(
      retry(operation, {
        attempts: 0,
        delayMs: -100,
        backoffMultiplier: 0,
      }),
    ).rejects.toThrow("temporary");

    expect(operation).toHaveBeenCalledTimes(1);
  });
});