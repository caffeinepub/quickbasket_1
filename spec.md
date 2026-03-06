# QuickBasket - Grocery Delivery App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Home page with a sticky top header: logo, delivery location, and a prominent search bar
- Product category grid (Fruits, Vegetables, Dairy, Snacks, Beverages, Bakery, Meat & Fish, Frozen Foods) with icons/images and labels
- Horizontal scrolling "Featured Deals" section with product cards showing name, price, discount badge, and "Add to Cart" button
- Cart state: item count badge on a cart icon in the header, managed in frontend state
- "Add to Cart" button on each product card that increments cart count
- Clean white and yellow color theme throughout

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: store product categories and featured deals (name, price, discount, image placeholder)
2. Frontend:
   - Header with logo, location pill, search bar, cart icon with badge
   - Category grid section (8 categories, 2 or 4 columns depending on screen)
   - Featured Deals horizontal scroll section with product cards
   - Product cards with name, original price, discounted price, discount badge, and Add to Cart button
   - Cart state managed with React useState, updating badge count on add
   - White + yellow (#FACC15 / yellow-400) consistent color theme
