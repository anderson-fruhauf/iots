/** URL base da API (definida na implantação). */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
