/**
 * LifeSync Web - Analytics Tracking
 * Tracks user events and stores them in Supabase
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5174";

export interface AnalyticsEvent {
  event_name: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Track an analytics event
 */
export async function track(
  eventName: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const event: AnalyticsEvent = {
      event_name: eventName,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    // Try to send to backend (if endpoint exists)
    // For now, we'll just log to console and store in localStorage
    if (typeof window !== "undefined") {
      // Store in localStorage as backup
      const events = JSON.parse(
        localStorage.getItem("lifesync_analytics") || "[]"
      );
      events.push(event);
      localStorage.setItem("lifesync_analytics", JSON.stringify(events.slice(-100))); // Keep last 100 events

      // Try to send to backend (non-blocking)
      fetch(`${API_BASE_URL}/v1/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch((err) => {
        console.warn("Failed to send analytics event:", err);
      });
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics:", eventName, metadata);
    }
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

/**
 * Track quiz started
 */
export async function trackQuizStarted(): Promise<void> {
  await track("quiz_started", {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track quiz completed
 */
export async function trackQuizCompleted(assessmentId: string): Promise<void> {
  await track("quiz_completed", {
    assessment_id: assessmentId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track result viewed
 */
export async function trackResultViewed(assessmentId: string): Promise<void> {
  await track("result_viewed", {
    assessment_id: assessmentId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track PDF downloaded
 */
export async function trackPDFDownloaded(assessmentId: string): Promise<void> {
  await track("pdf_downloaded", {
    assessment_id: assessmentId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track result shared
 */
export async function trackResultShared(assessmentId: string, shareId: string): Promise<void> {
  await track("result_shared", {
    assessment_id: assessmentId,
    share_id: shareId,
    timestamp: new Date().toISOString(),
  });
}
