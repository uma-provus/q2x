import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        tenantId: string;
    }

    interface Session {
        user: {
            id: string;
            tenantId: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        tenantId: string;
    }
}
