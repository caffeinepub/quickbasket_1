import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cart {
    items: Array<CartItem>;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface ProductDeal {
    id: bigint;
    originalPrice: bigint;
    name: string;
    discountPercent: bigint;
    category: bigint;
    discountedPrice: bigint;
}
export interface ProductCategory {
    id: bigint;
    name: string;
    emoji: string;
}
export interface backendInterface {
    addItemToCart(productId: bigint, quantity: bigint): Promise<void>;
    clearCart(): Promise<void>;
    getCartContents(): Promise<Cart>;
    getCategories(): Promise<Array<ProductCategory>>;
    getFeaturedDeals(): Promise<Array<ProductDeal>>;
    getItemCount(productId: bigint): Promise<bigint>;
    getTotalItemCount(): Promise<bigint>;
    removeItemFromCart(productId: bigint, quantity: bigint): Promise<void>;
}
