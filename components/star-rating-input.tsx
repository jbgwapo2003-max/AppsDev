"use client";

import { Fragment } from "react";

export function StarRatingInput({ name, value, onChange, label }: { name: string; value: number; onChange: (value: number) => void; label: string }) {
  return (
    <fieldset className="star-rating-field" aria-label={label}>
      <legend className="sr-only">{label}</legend>
      <div className="rating">
        {[5, 4, 3, 2, 1].map((star) => {
          const id = `${name}-star-${star}`;
          return (
            <Fragment key={star}>
              <input value={star} name={name} id={id} type="radio" checked={value === star} onChange={() => onChange(star)} />
              <label htmlFor={id}>
                <span className="sr-only">
                  {star} star{star > 1 ? "s" : ""}
                </span>
              </label>
            </Fragment>
          );
        })}
      </div>
    </fieldset>
  );
}
