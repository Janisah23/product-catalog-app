import { Navigate, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import { CtaBand } from "@/components/CtaBand";
import { ProductBrowser } from "@/components/ProductBrowser";
import { ProductCarousel } from "@/components/ProductCarousel";
import { CategoryStrip } from "@/components/catalog/CategoryStrip";
import { ExploreStrip } from "@/components/catalog/ExploreStrip";
import { FeatureSpotlight } from "@/components/catalog/FeatureSpotlight";
import { Hero } from "@/components/catalog/Hero";
import { MakersRow } from "@/components/catalog/MakersRow";
import { useAllProducts } from "@/hooks/use-catalog";
import { usePageTitle } from "@/hooks/use-page-title";

const CONTAINER = "mx-auto max-w-7xl px-5 md:px-8";

export default function CatalogPage() {
  usePageTitle();
  const [params] = useSearchParams();

  // Old links used /?category=slug. Categories now have their own pages.
  const legacy = params.get("category");
  if (legacy) {
    const rest = new URLSearchParams(params);
    rest.delete("category");
    rest.delete("page");
    return <Navigate to={{ pathname: `/catalog/${legacy}`, search: rest.toString() }} replace />;
  }
  return params.get("search")?.trim() ? <SearchResults /> : <Landing />;
}

function SearchResults() {
  const [params] = useSearchParams();
  return (
    <div className={`${CONTAINER} pt-6 pb-16`}>
      <Breadcrumb items={[{ label: "Catalog", to: "/" }, { label: "Search" }]} />
      <h1 className="mt-6 font-serif text-4xl md:text-5xl">Results for “{params.get("search")}”</h1>
      <CategoryNavigation variant="pills" className="mt-6 mb-8" />
      <ProductBrowser />
    </div>
  );
}

function Landing() {
  const { data, isPending } = useAllProducts();
  const all = data?.data ?? [];
  const featured = all.slice(0, 8);
  const deal = [...all].filter((p) => p.discountPercentage > 0).sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  const more = all.slice(8, 13);

  return (
    <>
      <Hero featured={all[0]} deal={deal} loading={isPending} />
      <CategoryStrip deal={deal} />

      <div className={`${CONTAINER} pt-16 md:pt-24`}>
        <ProductCarousel title="Featured products" description="The pieces shoppers rate highest." products={featured} variant="minimal" />
      </div>

      <FeatureSpotlight products={all} />
      <ExploreStrip products={more.length >= 3 ? more : all.slice(-5)} />

      <div className={`${CONTAINER} pt-16 md:pt-24`}>
        <h2 className="font-serif text-3xl md:text-4xl">All products</h2>
        <CategoryNavigation variant="pills" className="mt-5 mb-8" />
        <ProductBrowser />
      </div>

      <MakersRow products={all} />
      <div className={`${CONTAINER} pb-4`}>
        <CtaBand />
      </div>
    </>
  );
}
