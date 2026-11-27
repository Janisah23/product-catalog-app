import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryHero } from "@/components/CategoryHero";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import { CtaBand } from "@/components/CtaBand";
import { ProductBrowser } from "@/components/ProductBrowser";
import { ProductCarousel } from "@/components/ProductCarousel";
import { StateMessage } from "@/components/StateMessage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllProducts, useCategories } from "@/hooks/use-catalog";
import { usePageTitle } from "@/hooks/use-page-title";
import { errorMessage } from "@/lib/api";

const CONTAINER = "mx-auto max-w-7xl px-5 md:px-8";

/** One reusable page for every category. The slug in the URL decides which products it shows. */
export default function CategoryPage() {
  const { category: slug } = useParams();
  const { data: categories, isPending, isError, error, refetch } = useCategories();
  const category = categories?.find((c) => c.slug === slug);
  usePageTitle(category?.name);

  if (isPending) {
    return (
      <div className={`${CONTAINER} space-y-6 py-8`} aria-busy="true">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }
  if (isError) {
    return (
      <StateMessage title="We couldn't load the categories" action={<Button onClick={() => refetch()}>Try again</Button>}>
        {errorMessage(error)}
      </StateMessage>
    );
  }
  if (!category) {
    return (
      <div className={CONTAINER}>
        <StateMessage title="We can't find that category" action={<Link to="/" className={buttonVariants()}>Back to the catalog</Link>}>
          It may have been renamed. Pick one of the categories below instead.
        </StateMessage>
        <CategoryNavigation variant="pills" className="justify-center pb-16 md:[&_ul]:justify-center" />
      </div>
    );
  }
  return <CategoryView slug={category.slug} />;
}

function CategoryView({ slug }: { slug: string }) {
  const { data: categories } = useCategories();
  const category = categories!.find((c) => c.slug === slug)!;
  const { data } = useAllProducts();
  const recommended = (data?.data ?? []).filter((p) => p.category !== slug).slice(0, 8);

  return (
    <div className={`${CONTAINER} pt-6 pb-16`}>
      <Breadcrumb items={[{ label: "Catalog", to: "/" }, { label: category.name }]} />

      <div className="mt-6">
        <CategoryHero category={category} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[13rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <CategoryNavigation variant="list" />
          </div>
        </aside>
        <div className="min-w-0">
          <CategoryNavigation variant="pills" className="mb-6 lg:hidden" />
          <ProductBrowser key={slug} category={slug} categoryName={category.name} />
        </div>
      </div>

      <div className="mt-20">
        <ProductCarousel title="Explore our recommendations" description="Highly rated pieces from the rest of the catalog." products={recommended} />
      </div>

      <div className="mt-20">
        <CtaBand />
      </div>
    </div>
  );
}
