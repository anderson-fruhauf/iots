/** URL base do backend Nest (ex.: http://localhost:3000). */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
