import Image from "next/image";

export function FeaturedRelease() {
  return (
    <section className="featured-release" aria-labelledby="release-title">
      <p className="release-label">{"// RELEASE_0001 / FEATURED_BUILD"}</p>

      <div className="release-image">
        <Image
          alt="Espresso resting on a dark textured table"
          fill
          sizes="100vw"
          src="/images/image-1.jpg"
        />
        <span>BUILD / 0001</span>
      </div>

      <div className="release-information">
        <div className="release-story">
          <h2 id="release-title">
            HOUSE
            <br />
            PROCESS.
          </h2>
          <p>
            THE DEFAULT BUILD.
            <br />
            RELIABLE UNDER
            <br />
            UNREASONABLE LOAD.
          </p>
        </div>

        <div className="release-specification">
          <p>
            <span>ORIGIN /</span>
            <span>COLOMBIA</span>
          </p>
          <p>
            <span>PROCESS /</span>
            <span>WASHED</span>
          </p>
          <p>
            <span>ALTITUDE /</span>
            <span>1,800M</span>
          </p>
          <p>
            <span>ROAST /</span>
            <span>MEDIUM</span>
          </p>
          <p>
            <span>NOTES /</span>
            <span>CHOCOLATE / CARAMEL / BROWN SUGAR</span>
          </p>
        </div>
      </div>

      <div className="release-actions">
        <a
          className="release-action cursor-pointer"
          href="/coffee/house-process"
        >
          INSPECT RELEASE
        </a>
        <button className="release-action cursor-pointer" type="button">
          ADD TO CART
        </button>
      </div>
    </section>
  );
}
