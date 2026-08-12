import { InteriorPage } from "@/components/interior-page";
import { SiteSearch } from "@/components/site-search";

export default function SearchPage() {
  return (
    <InteriorPage
      description="FIND COFFEE, BREW PROTOCOLS, ORDERS, AND ANSWERS."
      eyebrow="// SEARCH / GLOBAL_INDEX"
      title="SEARCH."
    >
      <SiteSearch />
    </InteriorPage>
  );
}
