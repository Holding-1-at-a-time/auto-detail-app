import * as Sentry from "@sentry/nextjs";

// Server runtime Sentry initialization. Only define here.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  _experiments: {
    enableLogs: true,
  },
  tracesSampleRate: 1.0,
});

export const { logger } = Sentry;
