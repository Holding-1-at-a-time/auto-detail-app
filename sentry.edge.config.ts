import * as Sentry from "@sentry/nextjs";

// Edge runtime Sentry initialization. Only define here.
Sentry.init({
  dsn: "https://205bd605ab50cb2a35b321d0021718a8@o4507629996146688.ingest.us.sentry.io/4509838024966145",
  _experiments: {
    enableLogs: true,
  },
  tracesSampleRate: 1.0,
});

export const { logger } = Sentry;
