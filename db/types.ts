import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { UserRole, UserStatus, OrderType } from "./enums";

export type Account = {
    id: Generated<number>;
    userId: number;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
};
export type Brand = {
    id: Generated<number>;
    name: string;
};
export type Category = {
    id: Generated<number>;
    name: string;
    parentId: number | null;
};
export type Order = {
    id: Generated<number>;
    userId: number;
    orderDate: Timestamp;
    orderType: Generated<OrderType>;
    totalAmountPaid: number;
};
export type OrderDetails = {
    id: Generated<number>;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
};
export type PasswordResetToken = {
    id: Generated<number>;
    email: string;
    token: string;
    expires: Timestamp;
};
export type Product = {
    id: Generated<number>;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    tags: string[];
    type: string;
    categoryId: number;
    brandId: number;
    properties: unknown | null;
};
export type Review = {
    id: Generated<number>;
    rating: Generated<number>;
    comment: string | null;
    userId: number;
    productId: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type TwoFactorConfirmation = {
    id: Generated<number>;
    userId: number;
};
export type TwoFactorToken = {
    id: Generated<number>;
    email: string;
    token: string;
    expires: Timestamp;
};
export type User = {
    id: Generated<number>;
    name: string | null;
    email: string | null;
    emailVerified: Timestamp | null;
    image: string | null;
    password: string | null;
    role: Generated<UserRole>;
    status: Generated<UserStatus>;
    isTwoFactorEnabled: Generated<boolean>;
    phone: string | null;
    shippingAddress: string | null;
    billingAddress: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type VerificationToken = {
    id: Generated<number>;
    email: string;
    token: string;
    expires: Timestamp;
};
export type DB = {
    Account: Account;
    Brand: Brand;
    Category: Category;
    Order: Order;
    OrderDetails: OrderDetails;
    PasswordResetToken: PasswordResetToken;
    Product: Product;
    Review: Review;
    TwoFactorConfirmation: TwoFactorConfirmation;
    TwoFactorToken: TwoFactorToken;
    User: User;
    VerificationToken: VerificationToken;
};
