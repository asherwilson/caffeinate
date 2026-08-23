import { InteriorPage } from "@/components/interior-page";
import { ProductDetail } from "@/components/product-detail";

/**
 * One product, read live from QuickDash.
 *
 * 🔴 No `generateStaticParams` any more, deliberately. It used to pre-render
 * three hardcoded slugs and 404 everything else — so a product added in
 * QuickDash was unreachable until somebody edited this file and deployed. A
 * shop where adding a product needs a deploy is not a shop.
 *
 * The catalog is fetched in the browser through `CatalogProvider`, so this page
 * is a shell and the detail below is a client component.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <InteriorPage
      description="PRODUCT RECORD"
      eyebrow={`// COFFEE / ${slug.toUpperCase()}`}
      title="COFFEE."
    >
      <ProductDetail slug={slug} />
    </InteriorPage>
  );
}
