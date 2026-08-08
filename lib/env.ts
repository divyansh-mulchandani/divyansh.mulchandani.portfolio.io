export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Divyansh Mulchandani",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    "Portfolio of Divyansh Mulchandani, Cloud Platform Engineer.",
} as const;

export const SOCIAL_LINKS = {
  github: "https://github.com/divyansh-mulchandani",
  medium: "https://medium.com/@divyansh.mulchandani",
  linkedin: "https://linkedin.com/in/divyansh-mulchandani/",
  email: "divyanshmulchandani@gmail.com",
  phone: "+91 9111206302",
} as const;

export function getServerEnv() {
  return {
    authSecret: process.env.AUTH_SECRET ?? "",
    adminUsername: process.env.ADMIN_USERNAME ?? "",
    adminPassword: process.env.ADMIN_PASSWORD ?? "",
    mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
    mongodbDb: process.env.MONGODB_DB ?? "portfolio",
    corsOrigin: process.env.CORS_ORIGIN ?? "https://yourdomain.com",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}
