export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const UserStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export const OrderType = {
    OFFLINE: "OFFLINE",
    ONLINE: "ONLINE"
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];
