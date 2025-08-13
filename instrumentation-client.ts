"use client";

import * as Sentry from "@sentry/nextjs";

// Client-side Sentry initialization. Only needs to be defined here.
// Avoid importing secrets or server-only modules in this file.
Sentry.init({
  dsn: "https://205bd605ab50cb2a35b321d0021718a8@o4507629996146688.ingest.us.sentry.io/4509838024966145",
  // Enable log collection via Sentry's structured logger
  _experiments: {
    enableLogs: true,
  },
  // Send console.log/warn/error as logs to Sentry
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Enable tracing for custom spans created via Sentry.startSpan
  tracesSampleRate: 1.0,
});

// Optional: expose a typed logger import path if desired
export const { logger } = Sentry;
