/**
 * Type declarations for urlcat
 * The library has types but they can't be resolved due to package.json exports issue
 * See: https://github.com/balazsbotond/urlcat/issues/248
 */
declare module "urlcat" {
  function urlcat(baseUrl: string, path: string, params?: Record<string, unknown>): string
  function urlcat(baseUrl: string, params?: Record<string, unknown>): string
  export default urlcat
}
