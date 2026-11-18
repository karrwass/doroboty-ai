import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import people from "./data/people.json" with { type: "json" };

// These scenario assets are immutable; revisions require new versioned files.
const candidateFiles = new Map([
  ["candidate-anna", "anna-kowalska-cv-v1.pdf"],
  ["candidate-marek", "marek-nowak-cv-v1.pdf"],
]);

export function CvAttachment({
  candidateId,
  fallbackText,
  layout = "stack",
  preview = false,
  contextLabel = "CV z momentu aplikowania",
}: {
  candidateId: string;
  fallbackText: string;
  layout?: "stack" | "row";
  preview?: boolean;
  contextLabel?: string;
}) {
  const filename = candidateFiles.get(candidateId);
  const source = people.find((person) => person.id === candidateId);
  // An imported custom CV must not be presented as a different prepared PDF.
  if (!filename || source?.cv !== fallbackText)
    return preview || layout === "row" ? (
      <div className="cv-attachment">
        <div className="cv-file-row">
          <FileText aria-hidden="true" size={24} />
          <div className="cv-file-description">
            <strong>Zapisana treść CV</strong>
            <span>{contextLabel}</span>
          </div>
        </div>
        <p className="cv-text">{fallbackText}</p>
      </div>
    ) : (
      <p className="cv-text">{fallbackText}</p>
    );
  const href = `${import.meta.env.BASE_URL}cv/${filename}`;
  return (
    <div className="cv-attachment">
      <div className={layout === "row" ? "cv-file-row" : "cv-attachment"}>
        {layout === "row" ? (
          <>
            <FileText aria-hidden="true" size={24} />
            <div className="cv-file-description">
              <strong>{filename}</strong>
              <span>{contextLabel} · PDF</span>
            </div>
          </>
        ) : (
          <p className="ds-meta" style={{ margin: 0, overflowWrap: "anywhere" }}>
            {filename} · PDF
          </p>
        )}
        <div className="cv-actions">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Otwórz CV (PDF)<span className="sr-only"> w nowej karcie</span>
          </a>
          <a
            href={href}
            download={filename}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Pobierz CV (PDF)
          </a>
        </div>
      </div>
      {preview && (
        <iframe className="cv-preview" title="Podgląd CV (PDF)" src={`${href}#view=FitH`} />
      )}
    </div>
  );
}
