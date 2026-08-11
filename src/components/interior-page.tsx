import type { ReactNode } from "react";
import { InteriorShell } from "./interior-shell";

type InteriorPageProps = {
  children?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function InteriorPage({
  children,
  description,
  eyebrow,
  title,
}: InteriorPageProps) {
  return (
    <InteriorShell>
      <main className="interior-page">
        <p className="interior-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="interior-description">{description}</p>
        {children}
      </main>
    </InteriorShell>
  );
}
