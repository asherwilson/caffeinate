import Image from "next/image";

const products = [
  {
    actions: [40, 41],
    details: 39,
    imageAlt: "Paper coffee bag beside a cup and brewing tools",
    imageSrc: "/images/image-2.png",
    image: 38,
    name: 37,
    notes: "CHOCOLATE / CARAMEL / BROWN SUGAR",
    number: "01",
    price: "$24 CAD",
    roast: "MEDIUM ROAST",
    slug: "house-process",
    title: "HOUSE PROCESS",
  },
  {
    actions: [45, 46],
    details: 44,
    imageAlt: "Dark espresso workstation with fresh ground coffee",
    imageSrc: "/images/image-3.png",
    image: 43,
    name: 42,
    notes: "COCOA / SMOKE / MOLASSES",
    number: "02",
    price: "$24 CAD",
    roast: "DARK ROAST",
    slug: "dark-mode",
    title: "DARK MODE",
  },
  {
    actions: [50, 51],
    details: 49,
    imageAlt: "Fresh pour-over coffee brewing in warm light",
    imageSrc: "/images/image-4.jpg",
    image: 48,
    name: 47,
    notes: "CITRUS / HONEY / STONE FRUIT",
    number: "03",
    price: "$26 CAD",
    roast: "LIGHT ROAST",
    slug: "hotfix",
    title: "HOTFIX",
  },
] as const;

export function Catalog() {
  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <p id="catalog-title" className="catalog-label">
        {"// CURRENT_COFFEES / 03"}
      </p>

      {products.map((product, index) => (
        <article
          className="product-release"
          data-reversed={index % 2 === 1 ? "true" : undefined}
          key={product.slug}
        >
          <div className="product-information">
            <h2>
              <span>#{product.number} / ROAST</span>
              {product.title}
            </h2>
            <div className="product-details">
              <p>ROAST / {product.roast}</p>
              <p>NOTES / {product.notes}</p>
              <p>FORMAT / 250G / WHOLE_BEAN</p>
              <p>PRICE / {product.price}</p>
              <p>STATUS / AVAILABLE</p>
            </div>
            <div className="product-actions">
              <a
                className="product-action cursor-pointer"
                href={`/coffee/${product.slug}`}
              >
                VIEW COFFEE
              </a>
              <button className="product-action cursor-pointer" type="button">
                ADD TO CART
              </button>
            </div>
          </div>

          <div className="product-visual">
            <Image
              alt={product.imageAlt}
              fill
              loading={index < 2 ? "eager" : "lazy"}
              sizes="(max-width: 920px) 100vw, 58vw"
              src={product.imageSrc}
            />
            <span className="product-image-label">
              IMAGE / {product.number} / {product.title}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
