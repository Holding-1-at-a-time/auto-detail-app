// types/globals.d.ts
export { };

// Create a type for the roles used in your application
export type Roles = 'admin' | 'member' | 'client';

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        };
    }
}