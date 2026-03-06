import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, ProductCategory, ProductDeal } from "../backend.d";
import { useActor } from "./useActor";

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetFeaturedDeals() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductDeal[]>({
    queryKey: ["featuredDeals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedDeals();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetCartContents() {
  const { actor, isFetching } = useActor();
  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return { items: [] };
      return actor.getCartContents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalItemCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["cartCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalItemCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddItemToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addItemToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveItemFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeItemFromCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
