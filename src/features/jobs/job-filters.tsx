import type { JobFilters } from "./types";
import { contractLabels, functionLabels, remoteLabels, seniorityLabels } from "./presentation";
/** One condition per group; changes apply immediately (URL owns the applied criteria). */
export function JobFiltersForm({
  filters,
  onChange,
  onReset,
}: {
  filters: JobFilters;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="ds-filters">
      <div className="ds-filters-head">
        <h2>Filtry</h2>
        <button type="button" className="ds-link" onClick={onReset}>
          Wyczyść
        </button>
      </div>
      {(
        [
          ["remote", "Tryb pracy", remoteLabels],
          ["seniority", "Doświadczenie", seniorityLabels],
          ["contract", "Forma współpracy", contractLabels],
          ["function", "Funkcja", functionLabels],
        ] as const
      ).map(([key, label, options]) => (
        <fieldset className="ds-filter-group" key={key}>
          <legend>{label}</legend>
          {Object.entries(options).map(([value, text]) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={filters[key] === value}
                onChange={() => onChange(key, filters[key] === value ? "" : value)}
              />
              {text}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
