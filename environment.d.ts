namespace NodeJS {
  interface ProcessEnv {
    // Clerk;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in";
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up";

    // Liveblocks
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: string;
    LIVEBLOCKS_SECRET_KEY: string;
  }
}
