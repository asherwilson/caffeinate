import type { ReactNode } from "react";

type SystemStateProps = {
  action?: ReactNode;
  code: string;
  description: string;
  eyebrow: string;
  secondaryAction?: ReactNode;
  title: string;
};

export function SystemState({
  action,
  code,
  description,
  eyebrow,
  secondaryAction,
  title,
}: SystemStateProps) {
  return (
    <section className="system-state" aria-labelledby="system-state-title">
      <div className="system-state-header">
        <p>{eyebrow}</p>
        <p>CODE / {code}</p>
      </div>
      <div className="system-state-body">
        <h1 id="system-state-title">{title}</h1>
        <p>{description}</p>
        {action || secondaryAction ? (
          <div className="system-state-actions">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>
      <div className="system-state-diagnostic" aria-hidden="true">
        <span>▓▓▓▓▓▓▓▓░░</span>
        <span>RECOVERY_PATH / AVAILABLE</span>
      </div>
    </section>
  );
}
