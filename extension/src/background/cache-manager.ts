// Local (extension-side) cache of site -> selector/coordinate mappings, so repeat
// actions on a site the user has used before skip DOM/vision re-discovery.
// Functions:
//   get(siteHost, actionName): CachedSelector | null
//   set(siteHost, actionName, selector): void
//   invalidate(siteHost): void   // called when a cached selector fails at runtime
