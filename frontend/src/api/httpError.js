/**
 * Normalize Axios errors against this backend's REST payloads:
 * - ApiResponse errors: { success, status, message, errors? }
 * - Booking / handler maps: { error?: string, message?, conflictingSlot? }
 */

function firstFieldError(errors) {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return null;
  const first = Object.values(errors).find(
    (v) => typeof v === "string" && v.trim(),
  );
  return first ? first.trim() : null;
}

function extractMessageFromBody(data) {
  if (!data || typeof data !== "object") return null;
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  return firstFieldError(data.errors);
}

const FALLBACK_BY_STATUS = {
  400: "The request could not be processed. Please check your input and try again.",
  401: "You need to sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This request conflicts with existing data.",
  422: "The request could not be completed with the provided data.",
  429: "Too many requests. Please wait and try again.",
};

function fallbackMessageForStatus(status) {
  if (status == null) return "Something went wrong. Please try again.";
  if (status >= 500) {
    return "A server error occurred. Please try again later.";
  }
  return FALLBACK_BY_STATUS[status] ?? "Something went wrong. Please try again.";
}

/**
 * @param {unknown} error - Typically an Axios error from axiosClient
 * @returns {{ httpStatus: number | null, message: string, appErrorCode?: string }}
 */
export function resolveApiHttpError(error) {
  const response = error?.response;
  const status = response?.status ?? null;
  const data = response?.data;

  const appErrorCode =
    data && typeof data === "object" && typeof data.error === "string"
      ? data.error
      : undefined;

  if (
    status === 409 &&
    data &&
    typeof data === "object" &&
    data.conflictingSlot &&
    typeof data.conflictingSlot === "object"
  ) {
    const { start, end } = data.conflictingSlot;
    if (start != null && end != null) {
      return {
        httpStatus: status,
        message: `This resource is already booked from ${start} to ${end}`,
        appErrorCode,
      };
    }
  }

  const fromBody = extractMessageFromBody(data);
  if (fromBody) {
    return { httpStatus: status, message: fromBody, appErrorCode };
  }

  if (!response) {
    return {
      httpStatus: null,
      message:
        "Unable to reach the server. Check your connection and try again.",
    };
  }

  return {
    httpStatus: status,
    message: fallbackMessageForStatus(status),
    appErrorCode,
  };
}
