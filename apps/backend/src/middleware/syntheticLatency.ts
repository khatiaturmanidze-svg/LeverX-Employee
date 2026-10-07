import type { RequestHandler } from 'express';
export function createSyntheticLatencyMiddleware(): RequestHandler {
  const SYNTHETIC_LATENCY_MIN = getSyntheticLatencyValue(
    process.env.SYNTHETIC_LATENCY_MIN,
  );
  const SYNTHETIC_LATENCY_MAX = getSyntheticLatencyValue(
    process.env.SYNTHETIC_LATENCY_MAX,
  );
  const SYNTHETIC_LATENCY_RANGE = getSyntheticLatencyRange(
    SYNTHETIC_LATENCY_MIN,
    SYNTHETIC_LATENCY_MAX,
  );

  return async (_req, _res, next) => {
    try {
      if (!SYNTHETIC_LATENCY_RANGE) {
        next();
        return;
      }

      await sleep(
        getRandomLatency(
          SYNTHETIC_LATENCY_RANGE.min,
          SYNTHETIC_LATENCY_RANGE.max,
        ),
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}
function getSyntheticLatencyValue(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getSyntheticLatencyRange(
  min: number | null,
  max: number | null,
): { min: number; max: number } | null {
  if (min === null || max === null) {
    return null;
  }

  if (min > max) {
    console.warn(
      'Synthetic latency disabled: SYNTHETIC_LATENCY_MIN is greater than SYNTHETIC_LATENCY_MAX.',
    );
    return null;
  }

  return { min, max };
}

function getRandomLatency(min: number, max: number): number {
  const span = max - min;
  return min + Math.floor(Math.random() * (span + 1));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
