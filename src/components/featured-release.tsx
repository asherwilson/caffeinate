"use client";

import Image from "next/image";
import { useContent, useContentImage } from "./content-store";

/**
 * 🔑 Every word and the photograph come from content slots, with this file's
 * original copy as the fallback — so the section renders exactly as it did
 * until somebody changes something.
 *
 * ⚠️ The specification rows are LABEL + VALUE pairs and only the values are
 * editable. "ORIGIN /" is the structure of the table; Colombia is the content.
 */
export function FeaturedRelease() {
  const content = useContent();
  const image = useContentImage();
  const photo = image("home.featured.image");

  return (
    <section className="featured-release" aria-labelledby="release-title">
      <p className="release-label">{content("home.featured.label")}</p>

      <div className="release-image">
        {/*
         * 🟢 A stock photograph used to sit here, presented as this business's
         * own. It was removed rather than replaced, because marketing imagery
         * is chosen. The empty frame remains the honest state until it is.
         */}
        {photo ? (
          <Image
            alt=""
            className="featured-release-image"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            src={photo}
          />
        ) : (
          <div className="featured-release-image-empty" />
        )}
        <span>{content("home.featured.badge")}</span>
      </div>

      <div className="release-information">
        <div className="release-story">
          <h2 id="release-title" style={{ whiteSpace: "pre-line" }}>
            {content("home.featured.title")}
          </h2>
          <p style={{ whiteSpace: "pre-line" }}>
            {content("home.featured.copy")}
          </p>
        </div>

        <div className="release-specification">
          <p>
            <span>ORIGIN /</span>
            <span>{content("home.featured.origin")}</span>
          </p>
          <p>
            <span>PROCESS /</span>
            <span>{content("home.featured.process")}</span>
          </p>
          <p>
            <span>ALTITUDE /</span>
            <span>{content("home.featured.altitude")}</span>
          </p>
          <p>
            <span>ROAST /</span>
            <span>{content("home.featured.roast")}</span>
          </p>
          <p>
            <span>NOTES /</span>
            <span>{content("home.featured.notes")}</span>
          </p>
        </div>
      </div>

      <div className="release-actions">
        <a className="release-action cursor-pointer" href="/coffee">
          {content("home.featured.primary-cta")}
        </a>
        <button className="release-action cursor-pointer" type="button">
          {content("home.featured.secondary-cta")}
        </button>
      </div>
    </section>
  );
}
