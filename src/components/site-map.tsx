export const siteMap = [
  {
    label: "CAFFEINE",
    links: [
      ["SHOP", "/shop"],
      ["COFFEE", "/coffee"],
      ["CART", "/cart"],
      ["SEARCH", "/search"],
    ],
  },
  {
    label: "SYSTEM",
    links: [
      ["ABOUT", "/about"],
      ["FAQ", "/faq"],
      ["CONTACT", "/contact"],
      ["ACCOUNT", "/account"],
      ["ORDERS", "/account/orders"],
    ],
  },
  {
    label: "PROTOCOL",
    links: [
      ["SHIPPING", "/shipping"],
      ["RETURNS", "/returns"],
      ["PRIVACY", "/privacy"],
      ["TERMS", "/terms"],
      ["INSTAGRAM", "https://instagram.com"],
    ],
  },
] as const;

export function SiteMap() {
  return (
    <nav aria-label="Site map" className="site-map">
      {siteMap.map((group) => (
        <section key={group.label}>
          <p>{`// ${group.label}`}</p>
          <ul>
            {group.links.map(([label, href]) => {
              return (
                <li key={label}>
                  <a className="cursor-pointer" href={href}>
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
