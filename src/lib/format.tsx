import React from "react";

/**
 * A ultra-lightweight, high-performance Markdown-to-JSX parser.
 * Converts bold (**), inline code (`), and lists (* or -) into native React components
 * without importing heavy third-party parsing engines.
 */
export function formatMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  
  // Split input by newlines to process paragraphs and bullet points
  const lines = text.split("\n");
  
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-2" />; // Empty line spacer
    }

    // Detect if the line represents a bullet list item
    const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
    const cleanLine = isBullet ? trimmed.substring(2).trim() : line;

    // Process bold segments (**) and inline code (`)
    const parts = cleanLine.split(/(\*\*|`)/g);
    let isBold = false;
    let isCode = false;

    const formattedElements = parts.map((part, partIdx) => {
      if (part === "**") {
        isBold = !isBold;
        return null;
      }
      if (part === "`") {
        isCode = !isCode;
        return null;
      }

      if (isCode) {
        return (
          <code
            key={`${lineIdx}-${partIdx}`}
            className="bg-slate-950 border border-slate-900/60 px-1.5 py-0.5 rounded font-mono text-indigo-300 text-[11px] font-semibold"
          >
            {part}
          </code>
        );
      }
      if (isBold) {
        return (
          <strong
            key={`${lineIdx}-${partIdx}`}
            className="text-white font-extrabold"
          >
            {part}
          </strong>
        );
      }
      return <span key={`${lineIdx}-${partIdx}`}>{part}</span>;
    }).filter(Boolean);

    if (isBullet) {
      return (
        <li
          key={lineIdx}
          className="list-disc list-inside ml-2 text-xs text-slate-300 leading-relaxed mb-1"
        >
          {formattedElements}
        </li>
      );
    }

    return (
      <p
        key={lineIdx}
        className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2 last:mb-0"
      >
        {formattedElements}
      </p>
    );
  });
}
