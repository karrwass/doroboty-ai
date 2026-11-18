/** Match Score is a text-similarity fact, never a chance of being hired; neutral tag. */
export function MatchScore({ score }: { score: number }) {
  return (
    <span className="match-score" title="Ocena zgodności tekstów 0–100, nie szansa na zatrudnienie">
      Match Score: {score}%
    </span>
  );
}
