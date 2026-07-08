import type { AuthError } from "@supabase/supabase-js";

const KNOWN_MESSAGES: Record<string, string> = {
  "User already registered": "An account with that email already exists.",
  "Invalid login credentials": "Wrong email or password.",
};

// @supabase/auth-js treats any 5xx from the Auth API as "retryable" and
// skips parsing the response body, so error.message ends up being the
// stringified (empty) Response object — literally "{}". Fall back to a
// generic message whenever we can't show something a user would understand.
export function friendlyAuthError(error: AuthError): string {
  const known = KNOWN_MESSAGES[error.message];
  if (known) return known;

  if (error.name === "AuthRetryableFetchError" || error.message === "{}") {
    return "Something went wrong on our end. Please try again in a moment.";
  }

  return error.message;
}
