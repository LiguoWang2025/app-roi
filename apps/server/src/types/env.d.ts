declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // PostgreSQL
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      POSTGRES_HOST: string;
      POSTGRES_PORT: string;

      // Server
      SERVER_PORT: string;
      NODE_ENV: "development" | "production" | "test";

      // CORS
      CORS_ORIGIN?: string | string[];

      // Next.js
      NEXT_PUBLIC_API_URL: string;
    }
  }
}

export {};
