interface AnalyticsPayload {
  [key: string]: unknown;
}

const ANALYTICS_DEBUG =
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true" ||
  process.env.NODE_ENV !== "production";

function emitAnalytics(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const envelope = {
    event,
    timestamp: Date.now(),
    ...payload,
  };

  const globalAny = window as typeof window & {
    dataLayer?: Array<Record<string, unknown>>;
    analytics?: { track?: (event: string, data?: Record<string, unknown>) => void };
  };

  try {
    if (Array.isArray(globalAny.dataLayer)) {
      globalAny.dataLayer.push(envelope);
      return;
    }

    if (globalAny.analytics?.track) {
      globalAny.analytics.track(event, envelope);
      return;
    }

    if (ANALYTICS_DEBUG) {
      console.debug("[Analytics]", event, payload);
    }
  } catch (error) {
    if (ANALYTICS_DEBUG) {
      console.warn("Analytics emit failed:", error);
    }
  }
}

export function trackQuizStarted(metadata?: AnalyticsPayload) {
  emitAnalytics("quiz_started", metadata);
}

export function trackQuizCompleted(assessmentId: string) {
  emitAnalytics("quiz_completed", { assessmentId });
}

export function trackResultViewed(assessmentId: string) {
  emitAnalytics("result_viewed", { assessmentId });
}

export function trackPDFDownloaded(assessmentId: string) {
  emitAnalytics("result_pdf_downloaded", { assessmentId });
}

export function trackResultShared(
  assessmentId: string,
  shareId?: string,
  extra?: AnalyticsPayload
) {
  emitAnalytics("result_shared", {
    assessmentId,
    shareId,
    ...extra,
  });
}
