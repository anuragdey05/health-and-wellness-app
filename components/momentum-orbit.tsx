"use client";

import { CheckIcon } from "@phosphor-icons/react";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function MomentumOrbit({ counts }: { counts: number[] }) {
  const active = counts.filter(Boolean).length;
  return (
    <section className="momentum" aria-labelledby="momentum-title">
      <div>
        <h2 id="momentum-title">Seven-day momentum</h2>
        <p>{active ? `${active} ${active === 1 ? "day" : "days"} with a reset` : "Your first reset starts the orbit."}</p>
      </div>
      <div className="momentum-days" aria-label={`${active} active days in the last seven days`}>
        {counts.map((count, index) => (
          <div className="momentum-day" key={`${DAY_LABELS[index]}-${index}`}>
            <span className={count ? "is-active" : ""}>
              {count ? <CheckIcon aria-hidden size={15} weight="bold" /> : null}
            </span>
            <small>{DAY_LABELS[index]}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
