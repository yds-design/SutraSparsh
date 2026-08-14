import { describe, expect, it, vi } from "vitest";
import { retry } from "../../src/shared/retry.js";

describe("retry", () => {
  it("returns immediately when the operation succeeds", async () => {
    const operation = vi
      .fn()
      .mockResolvedValue("success");

    const result = await retry(operation, {
      attempts: 3,
      delayMs: 1,
      backoffMultiplier: 2,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries after a transient failure", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("temporary failure"),
      )
      .mockResolvedValueOnce("success");

    const result = await retry(operation, {
      attempts: 3,
      delayMs: 1,
      backoffMultiplier: 2,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("retries until the operation succeeds", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("failure 1"),
      )
      .mockRejectedValueOnce(
        new Error("failure 2"),
      )
      .mockResolvedValueOnce("success");

    const result = await retry(operation, {
      attempts: 3,
      delayMs: 1,
      backoffMultiplier: 2,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("throws the final error when all attempts fail", async () => {
    const error = new Error(
      "permanent failure",
    );

    const operation = vi
      .fn()
      .mockRejectedValue(error);

    await expect(
      retry(operation, {
        attempts: 3,
        delayMs: 1,
        backoffMultiplier: 2,
      }),
    ).rejects.toThrow(
      "permanent failure",
    );

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("does not retry when attempts is one", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(
        new Error("failure"),
      );

    await expect(
      retry(operation, {
        attempts: 1,
        delayMs: 1,
        backoffMultiplier: 2,
      }),
    ).rejects.toThrow("failure");

    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry for each retry", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("failure 1"),
      )
      .mockRejectedValueOnce(
        new Error("failure 2"),
      )
      .mockResolvedValue("success");

    const onRetry = vi.fn();

    await retry(operation, {
      attempts: 3,
      delayMs: 1,
      backoffMultiplier: 2,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(2);

    expect(onRetry).toHaveBeenNthCalledWith(
      1,
      expect.any(Error),
      1,
      1,
    );

    expect(onRetry).toHaveBeenNthCalledWith(
      2,
      expect.any(Error),
      2,
      2,
    );
  });

  it("rejects invalid retry attempts", async () => {
    const operation = vi
      .fn()
      .mockResolvedValue("success");

    await expect(
      retry(operation, {
        attempts: 0,
        delayMs: 1,
        backoffMultiplier: 2,
      }),
    ).rejects.toThrow(
      "Retry attempts must be a positive integer.",
    );

    expect(operation).not.toHaveBeenCalled();
  });

  it("rejects invalid retry configuration", async () => {
    const operation = vi
      .fn()
      .mockResolvedValue("success");

    await expect(
      retry(operation, {
        attempts: 3,
        delayMs: -1,
        backoffMultiplier: 2,
      }),
    ).rejects.toThrow(
      "Retry delay must be a non-negative number.",
    );

    expect(operation).not.toHaveBeenCalled();
  });

  it("rejects an invalid backoff multiplier", async () => {
    const operation = vi
      .fn()
      .mockResolvedValue("success");

    await expect(
      retry(operation, {
        attempts: 3,
        delayMs: 1,
        backoffMultiplier: 0,
      }),
    ).rejects.toThrow(
      "Retry backoff multiplier must be greater than zero.",
    );

    expect(operation).not.toHaveBeenCalled();
  });
});