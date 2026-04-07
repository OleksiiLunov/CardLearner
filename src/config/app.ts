export const APP_NAME = "CardLearner";
export const APP_DESCRIPTION =
  "CardLearner helps you build vocabulary lists and review them with focused study sessions.";
export const APP_SHORT_NAME = "CardLearner";

export const DEFAULT_APP_METADATA = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: "website" as const,
  },
  twitter: {
    card: "summary" as const,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "default" as const,
  },
};
