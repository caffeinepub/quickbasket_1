import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type ProductCategory = {
    id : Nat;
    name : Text;
    emoji : Text;
  };

  module ProductCategory {
    public func compare(category1 : ProductCategory, category2 : ProductCategory) : Order.Order {
      Nat.compare(category1.id, category2.id);
    };
  };

  type ProductDeal = {
    id : Nat;
    name : Text;
    originalPrice : Nat;
    discountedPrice : Nat;
    discountPercent : Nat;
    category : Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Cart = {
    items : [CartItem];
  };

  let categories = List.fromArray<ProductCategory>([
    { id = 1; name = "Fruits"; emoji = "🍎" },
    { id = 2; name = "Vegetables"; emoji = "🥦" },
    { id = 3; name = "Dairy"; emoji = "🥛" },
    { id = 4; name = "Snacks"; emoji = "🍪" },
    { id = 5; name = "Beverages"; emoji = "🥤" },
    { id = 6; name = "Bakery"; emoji = "🍞" },
    { id = 7; name = "Meat & Fish"; emoji = "🍖" },
    { id = 8; name = "Frozen Foods"; emoji = "🍦" },
  ]);

  let featuredDeals = List.fromArray<ProductDeal>([
    {
      id = 1;
      name = "Organic Bananas";
      originalPrice = 299;
      discountedPrice = 239;
      discountPercent = 20;
      category = 1;
    },
    {
      id = 2;
      name = "Fresh Spinach";
      originalPrice = 249;
      discountedPrice = 189;
      discountPercent = 24;
      category = 2;
    },
    {
      id = 3;
      name = "Almond Milk";
      originalPrice = 399;
      discountedPrice = 299;
      discountPercent = 25;
      category = 3;
    },
    {
      id = 4;
      name = "Granola Bars";
      originalPrice = 449;
      discountedPrice = 359;
      discountPercent = 20;
      category = 4;
    },
    {
      id = 5;
      name = "Sparkling Water";
      originalPrice = 199;
      discountedPrice = 159;
      discountPercent = 20;
      category = 5;
    },
    {
      id = 6;
      name = "Sourdough Bread";
      originalPrice = 599;
      discountedPrice = 449;
      discountPercent = 25;
      category = 6;
    },
    {
      id = 7;
      name = "Salmon Fillet";
      originalPrice = 1299;
      discountedPrice = 999;
      discountPercent = 23;
      category = 7;
    },
    {
      id = 8;
      name = "Frozen Berries";
      originalPrice = 599;
      discountedPrice = 399;
      discountPercent = 33;
      category = 8;
    },
    {
      id = 9;
      name = "Greek Yogurt";
      originalPrice = 349;
      discountedPrice = 259;
      discountPercent = 26;
      category = 3;
    },
    {
      id = 10;
      name = "Chicken Breast";
      originalPrice = 899;
      discountedPrice = 729;
      discountPercent = 19;
      category = 7;
    },
  ]);

  let carts = Map.empty<Principal, List.List<CartItem>>();

  public query ({ caller }) func getCategories() : async [ProductCategory] {
    categories.toArray().sort();
  };

  public query ({ caller }) func getFeaturedDeals() : async [ProductDeal] {
    featuredDeals.toArray();
  };

  public shared ({ caller }) func addItemToCart(productId : Nat, quantity : Nat) : async () {
    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    var itemFound = false;
    cart.mapInPlace(
      func(item) {
        if (item.productId == productId) {
          itemFound := true;
          {
            productId = item.productId;
            quantity = item.quantity + quantity;
          };
        } else {
          item;
        };
      }
    );

    if (not itemFound) {
      let newItem : CartItem = { productId; quantity };
      cart.add(newItem);
    };

    carts.add(caller, cart);
  };

  public shared ({ caller }) func removeItemFromCart(productId : Nat, quantity : Nat) : async () {
    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    let newCart = cart.filter(
      func(item) {
        if (item.productId == productId) {
          if (item.quantity <= quantity) {
            false;
          } else {
            cart.mapInPlace(
              func(cartItem) {
                if (cartItem.productId == productId) {
                  { productId = cartItem.productId; quantity = cartItem.quantity - quantity };
                } else {
                  cartItem;
                };
              }
            );
            true;
          };
        } else {
          true;
        };
      }
    );

    carts.add(caller, newCart);
  };

  public query ({ caller }) func getCartContents() : async Cart {
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    {
      items = cart.toArray();
    };
  };

  public query ({ caller }) func getTotalItemCount() : async Nat {
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    cart.toArray().foldLeft(
      0,
      func(acc, item) { acc + item.quantity },
    );
  };

  public shared ({ caller }) func clearCart() : async () {
    carts.remove(caller);
  };

  public query ({ caller }) func getItemCount(productId : Nat) : async Nat {
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    switch (cart.toArray().find(func(item) { item.productId == productId })) {
      case (null) { 0 };
      case (?item) { item.quantity };
    };
  };
};
