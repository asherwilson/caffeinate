import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { InteriorPage } from "@/components/interior-page";
import { findProduct, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  return (
    <InteriorPage
      description={product.description.toUpperCase()}
      eyebrow={`// COFFEE / ${product.slug.toUpperCase()}`}
      title={`${product.name}.`}
    >
      <div className="product-detail">
        <div className="product-detail-image">
          <Image
            alt={product.name}
            fill
            priority
            sizes="(max-width: 720px) 100vw, 55vw"
            src={product.image}
          />
        </div>
        <div className="product-detail-controls">
          <p>ROAST / {product.roast}</p>
          <p>FORMAT / 340G / WHOLE_BEAN</p>
          <p>PRICE / ${product.price} CAD</p>
          <AddToCart slug={product.slug} />
        </div>
      </div>
    </InteriorPage>
  );
}
