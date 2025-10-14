/**
 * Type declarations for urlcat
 * The library has types but they can't be resolved due to package.json exports issue
 */
declare module "urlcat" {
  export default function urlcat(
    baseUrl: string,
    path: string,
    params?: Record<string, unknown>
  ): string
  export default function urlcat(baseUrl: string, params?: Record<string, unknown>): string
}
