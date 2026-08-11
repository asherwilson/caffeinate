import { InteriorPage } from "@/components/interior-page";

export default function SearchPage() {
  return (
    <InteriorPage
      description="FIND COFFEE, BREW PROTOCOLS, ORDERS, AND ANSWERS."
      eyebrow="// SEARCH / GLOBAL_INDEX"
      title="SEARCH."
    >
      <form className="search-form">
        <label htmlFor="site-search">% find /</label>
        <input
          className="cursor-text"
          id="site-search"
          name="query"
          placeholder="TYPE A QUERY"
          type="search"
        />
        <button className="cursor-pointer" type="submit">
          RUN
        </button>
      </form>
    </InteriorPage>
  );
}
