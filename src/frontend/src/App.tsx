import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Check,
  ChevronRight,
  MapPin,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  useAddItemToCart,
  useGetCategories,
  useGetFeaturedDeals,
  useGetTotalItemCount,
} from "./hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centsToDisplay(cents: bigint): string {
  const n = Number(cents);
  return `$${(n / 100).toFixed(2)}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  fruits: "from-rose-100 to-rose-50",
  vegetables: "from-emerald-100 to-emerald-50",
  dairy: "from-sky-100 to-sky-50",
  snacks: "from-orange-100 to-orange-50",
  beverages: "from-purple-100 to-purple-50",
  bakery: "from-amber-100 to-amber-50",
  meat: "from-red-100 to-red-50",
  seafood: "from-cyan-100 to-cyan-50",
  frozen: "from-blue-100 to-blue-50",
  pantry: "from-yellow-100 to-yellow-50",
  personal: "from-pink-100 to-pink-50",
  cleaning: "from-teal-100 to-teal-50",
};

const DEAL_PLACEHOLDER_COLORS: Record<string, string> = {
  "0": "from-rose-200 to-rose-100",
  "1": "from-emerald-200 to-emerald-100",
  "2": "from-sky-200 to-sky-100",
  "3": "from-orange-200 to-orange-100",
  "4": "from-purple-200 to-purple-100",
  "5": "from-amber-200 to-amber-100",
  "6": "from-red-200 to-red-100",
  "7": "from-cyan-200 to-cyan-100",
};

function getDealColor(categoryId: bigint): string {
  const key = String(Number(categoryId) % 8);
  return DEAL_PLACEHOLDER_COLORS[key] ?? "from-yellow-200 to-yellow-100";
}

function getCategoryBg(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "from-brand-yellow-light to-yellow-50";
}

// ─── Skeleton Components ───────────────────────────────────────────────────────

function CategorySkeletonGrid() {
  return (
    <div
      data-ocid="categories.loading_state"
      className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
    >
      {["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f", "sk-g", "sk-h"].map(
        (key) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        ),
      )}
    </div>
  );
}

function DealSkeletonRow() {
  return (
    <div data-ocid="deals.loading_state" className="flex gap-4 overflow-hidden">
      {["sk-1", "sk-2", "sk-3", "sk-4"].map((key) => (
        <div
          key={key}
          className="flex-none w-48 sm:w-52 rounded-2xl overflow-hidden border border-border"
        >
          <Skeleton className="h-36 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-9 w-full rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

function Header({ cartCount, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header
      data-ocid="header.section"
      className="sticky top-0 z-50 bg-card border-b border-border shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-none">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-yellow">
              <Zap
                className="w-4 h-4 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              Quick<span className="text-primary">Basket</span>
            </span>
          </div>

          {/* Delivery pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5 flex-none">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">
              Home <span className="text-muted-foreground">·</span>{" "}
              <span className="text-brand-green font-semibold">10 mins</span>
            </span>
          </div>

          {/* Search bar — grows on desktop */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="search.search_input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for groceries, fruits, veggies..."
              className="pl-9 h-9 text-sm rounded-xl bg-muted border-transparent focus-visible:border-primary focus-visible:ring-primary"
            />
          </div>

          {/* Cart */}
          <button
            type="button"
            data-ocid="cart.button"
            className="relative flex-none flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-3 py-2 text-sm font-semibold shadow-yellow hover:bg-brand-yellow-dark transition-colors"
            aria-label={`Shopping cart, ${cartCount} items`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:block">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-foreground text-card text-[10px] font-bold flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: delivery + search below */}
        <div className="flex md:hidden items-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 text-primary" />
            <span>
              Home ·{" "}
              <span className="text-brand-green font-semibold">10 mins</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Category Card ─────────────────────────────────────────────────────────────

interface CategoryCardProps {
  id: bigint;
  name: string;
  emoji: string;
  index: number;
  onClick: (name: string) => void;
}

function CategoryCard({ name, emoji, index, onClick }: CategoryCardProps) {
  const bgGradient = getCategoryBg(name);
  const staggerClass = `stagger-${Math.min(index + 1, 8)} fade-in-up`;

  return (
    <button
      type="button"
      data-ocid={`category.item.${index + 1}`}
      onClick={() => onClick(name)}
      className={`category-card-hover flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b ${bgGradient} border border-border/60 cursor-pointer w-full ${staggerClass}`}
      aria-label={`Browse ${name}`}
    >
      <span
        className="text-3xl sm:text-4xl leading-none"
        role="img"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="text-[10px] sm:text-xs font-semibold text-foreground text-center leading-tight line-clamp-2">
        {name}
      </span>
    </button>
  );
}

// ─── Deal Card ─────────────────────────────────────────────────────────────────

interface DealCardProps {
  id: bigint;
  name: string;
  originalPrice: bigint;
  discountedPrice: bigint;
  discountPercent: bigint;
  category: bigint;
  index: number;
  onAddToCart: (id: bigint) => Promise<void>;
  addedSet: Set<string>;
}

function DealCard({
  id,
  name,
  originalPrice,
  discountedPrice,
  discountPercent,
  category,
  index,
  onAddToCart,
  addedSet,
}: DealCardProps) {
  const colorClass = getDealColor(category);
  const isAdded = addedSet.has(String(id));
  const staggerClass = `stagger-${Math.min(index + 1, 8)} fade-in-up`;

  return (
    <div
      data-ocid={`deal.item.${index + 1}`}
      className={`deal-card-hover flex-none w-48 sm:w-52 bg-card rounded-2xl border border-border overflow-hidden ${staggerClass}`}
    >
      {/* Product image placeholder */}
      <div
        className={`h-36 w-full bg-gradient-to-br ${colorClass} relative flex items-end justify-end p-2`}
      >
        <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
          <Tag className="w-2.5 h-2.5 mr-0.5" />
          {Number(discountPercent)}% OFF
        </Badge>
      </div>

      <div className="p-3 space-y-1.5">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-foreground">
            {centsToDisplay(discountedPrice)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {centsToDisplay(originalPrice)}
          </span>
        </div>

        <button
          type="button"
          data-ocid={`deal.add_button.${index + 1}`}
          onClick={() => onAddToCart(id)}
          disabled={isAdded}
          className={`
            w-full mt-1 h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200
            ${
              isAdded
                ? "bg-brand-green text-white"
                : "bg-primary text-primary-foreground hover:bg-brand-yellow-dark shadow-yellow hover:shadow-md active:scale-95"
            }
          `}
          aria-label={isAdded ? `${name} added to cart` : `Add ${name} to cart`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Added!
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const categoriesQuery = useGetCategories();
  const dealsQuery = useGetFeaturedDeals();
  const cartCountQuery = useGetTotalItemCount();
  const addToCartMutation = useAddItemToCart();

  const cartCount = Number(cartCountQuery.data ?? BigInt(0));

  const handleAddToCart = useCallback(
    async (productId: bigint) => {
      const key = String(productId);
      try {
        await addToCartMutation.mutateAsync({ productId, quantity: BigInt(1) });
        setAddedItems((prev) => new Set(prev).add(key));
        toast.success("Added to cart!", {
          description: "Item added successfully.",
          duration: 2000,
        });
        // Revert after 2.5s
        setTimeout(() => {
          setAddedItems((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 2500);
      } catch {
        toast.error("Failed to add item", {
          description: "Please try again.",
        });
      }
    },
    [addToCartMutation],
  );

  const handleCategoryClick = useCallback((name: string) => {
    setSearchQuery(name);
  }, []);

  // Filter deals by search
  const filteredDeals = dealsQuery.data?.filter((deal) =>
    searchQuery
      ? deal.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" richColors />

      {/* ── Header ── */}
      <Header
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <section className="bg-gradient-to-r from-primary/20 via-brand-yellow-light to-accent border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-primary/30 rounded-full px-3 py-1 text-xs font-semibold text-foreground w-fit">
                <Zap className="w-3 h-3 text-primary" />
                Delivery in 10 minutes
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
                Groceries at <br className="hidden sm:block" />
                <span className="text-primary">lightning speed</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs">
                Fresh produce, dairy, snacks & more — delivered right to your
                door.
              </p>
            </div>
            <div className="flex gap-3 text-center">
              {[
                { emoji: "🥦", label: "Fresh Produce" },
                { emoji: "🥛", label: "Dairy" },
                { emoji: "🍪", label: "Snacks" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1 bg-card rounded-2xl px-4 py-3 shadow-card border border-border/60"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
          {/* ── Categories ── */}
          <section
            data-ocid="categories.section"
            aria-labelledby="categories-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="categories-heading"
                className="font-display text-xl sm:text-2xl font-bold text-foreground"
              >
                Shop by Category
              </h2>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {categoriesQuery.isLoading ? (
              <CategorySkeletonGrid />
            ) : categoriesQuery.isError ? (
              <div
                data-ocid="categories.error_state"
                className="flex flex-col items-center justify-center py-10 gap-2 text-center"
              >
                <span className="text-2xl">😕</span>
                <p className="text-sm text-muted-foreground">
                  Couldn't load categories. Please refresh.
                </p>
              </div>
            ) : categoriesQuery.data?.length === 0 ? (
              <div
                data-ocid="categories.empty_state"
                className="flex flex-col items-center justify-center py-10 gap-2 text-center"
              >
                <span className="text-3xl">🛒</span>
                <p className="text-sm text-muted-foreground">
                  No categories available yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {categoriesQuery.data!.map((cat, i) => (
                  <CategoryCard
                    key={String(cat.id)}
                    id={cat.id}
                    name={cat.name}
                    emoji={cat.emoji}
                    index={i}
                    onClick={handleCategoryClick}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Featured Deals ── */}
          <section data-ocid="deals.section" aria-labelledby="deals-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="deals-heading"
                className="font-display text-xl sm:text-2xl font-bold text-foreground"
              >
                Featured Deals
              </h2>
              <button
                type="button"
                data-ocid="deals.link"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {dealsQuery.isLoading ? (
              <DealSkeletonRow />
            ) : dealsQuery.isError ? (
              <div
                data-ocid="deals.error_state"
                className="flex flex-col items-center justify-center py-10 gap-2 text-center"
              >
                <span className="text-2xl">😕</span>
                <p className="text-sm text-muted-foreground">
                  Couldn't load deals. Please refresh.
                </p>
              </div>
            ) : filteredDeals?.length === 0 ? (
              <div
                data-ocid="deals.empty_state"
                className="flex flex-col items-center justify-center py-10 gap-3 text-center"
              >
                <span className="text-4xl">🔍</span>
                <p className="text-base font-semibold text-foreground">
                  No results for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Try a different search or browse categories above.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2 -mx-1 px-1">
                {filteredDeals!.map((deal, i) => (
                  <DealCard
                    key={String(deal.id)}
                    id={deal.id}
                    name={deal.name}
                    originalPrice={deal.originalPrice}
                    discountedPrice={deal.discountedPrice}
                    discountPercent={deal.discountPercent}
                    category={deal.category}
                    index={i}
                    onAddToCart={handleAddToCart}
                    addedSet={addedItems}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Why Choose Us ── */}
          <section
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            aria-label="Features"
          >
            {[
              {
                emoji: "⚡",
                title: "10-min Delivery",
                desc: "From store to door",
              },
              { emoji: "🌿", title: "Farm Fresh", desc: "Sourced daily" },
              {
                emoji: "💰",
                title: "Best Prices",
                desc: "Price match guarantee",
              },
              {
                emoji: "🔄",
                title: "Easy Returns",
                desc: "No questions asked",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-card"
              >
                <span className="text-2xl" role="img" aria-hidden="true">
                  {feature.emoji}
                </span>
                <p className="text-sm font-bold text-foreground">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-8 py-6 text-center text-xs text-muted-foreground bg-card">
        <p>
          © {year}. Built with{" "}
          <span className="text-destructive" aria-label="love">
            ♥
          </span>{" "}
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
