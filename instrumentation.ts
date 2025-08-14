import * as Sentry from "@sentry/nextjs";

// Sentry.init should not use replayIntegration or captureRouterTransitionStart directly from @sentry/nextjs
Sentry.init({
  dsn: "https://205bd605ab50cb2a35b321d0021718a8@o4507629996146688.ingest.us.sentry.io/4509838024966145",

  // No replayIntegration here; see Sentry docs for correct usage if needed
  integrations: [
    // Add integrations here if needed, e.g. new Sentry.BrowserTracing()
  ],

  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
});

// Export Sentry hooks as required by Sentry Next.js App Router instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
export const onRequestError = Sentry.captureRequestError;
