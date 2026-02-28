export type ToastFn = (message: string, type?: "success" | "error" | "info") => void;

let globalToast: ToastFn | null = null;

export const registerGlobalToast = (fn: ToastFn) => {
  globalToast = fn;
};

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const status = response.status;

      // Handle rate limiting
      if (status === 429) {
        globalToast?.("Too many requests. Please wait a moment.", "error");
      }
      // Handle server errors
      else if (status >= 500) {
        globalToast?.("Something went wrong on the server. Please try again.", "error");
      }
      // Handle client errors with messages
      else if (status >= 400) {
        try {
          const data = await response.json();
          // Clone response so it can be read again by caller if needed?
          // Actually json() consumes body.
          // Ideally we peek.
          // But here we are just surfacing errors.
          // Let's assume backend returns { detail: "message" }
          const message = data.detail || data.message || "An error occurred";
          globalToast?.(message, "error");

          // Re-throw with data attached
          const error: any = new Error(message);
          error.status = status;
          error.data = data;
          throw error;
        } catch (e) {
          if (e instanceof Error && (e as any).status) throw e; // Re-throw parsed error
          globalToast?.("An error occurred.", "error");
        }
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error && (error as any).status) {
      throw error;
    }
    // Network errors
    globalToast?.("Network connection issue.", "error");
    throw error;
  }
}
