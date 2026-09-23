"use client";

import { Fragment } from "react";

/** Pecah token frac(a,b) menjadi pecahan atas–bawah. */
function renderInline(text: string, keyPrefix: string) {
  const parts: React.ReactNode[] = [];
  const re = /frac\(([^,()]+),([^,()]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={`${keyPrefix}t${i++}`}>{text.slice(last, m.index)}</Fragment>);
    parts.push(
      <span key={`${keyPrefix}f${i++}`} className="mx-0.5 inline-flex flex-col items-center align-middle leading-none">
        <span className="px-1 pb-[2px] text-[0.92em]">{m[1]}</span>
        <span className="h-px w-full bg-current" />
        <span className="px-1 pt-[2px] text-[0.92em]">{m[2]}</span>
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={`${keyPrefix}t${i++}`}>{text.slice(last)}</Fragment>);
  return parts;
}

/** Teks satu baris yang boleh memuat pecahan. */
export function MathInline({ text, className = "" }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text, "i")}</span>;
}

interface Props {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "success" | "warn" | "plain";
}

/**
 * Blok langkah pengerjaan:
 *  • baris ">" → kalimat penjelas
 *  • baris lain dipecah pada "=" pertama sehingga tanda "=" SEJAJAR
 */
export default function MathSteps({ text, className = "", size = "md", tone = "default" }: Props) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const fontSize = size === "sm" ? "text-[12.5px]" : size === "lg" ? "text-base sm:text-lg" : "text-[13.5px] sm:text-sm";
  const toneCls =
    tone === "success" ? "border-[#10B981]/25 bg-[#F0FDF7]"
    : tone === "warn" ? "border-[#F59E0B]/30 bg-[#FFFCF2]"
    : tone === "plain" ? "border-transparent bg-transparent p-0"
    : "border-[#ECECEC] bg-[#FAFAFA]";

  return (
    <div className={`rounded-xl border ${toneCls} ${tone === "plain" ? "" : "px-3.5 py-3"} ${className}`}>
      <div className="grid gap-y-1.5" style={{ gridTemplateColumns: "max-content 1fr" }}>
        {lines.map((line, i) => {
          if (line.startsWith(">")) {
            const body = line.slice(1).trim();
            const strong = /^(LANGKAH|Jadi|Kesimpulan)/i.test(body);
            return (
              <p
                key={i}
                className={`col-span-2 ${i > 0 ? "mt-1.5" : ""} font-sans text-[12.5px] leading-relaxed ${
                  strong ? "font-bold text-[#1A1A1A]" : "text-[#525252]"
                }`}
              >
                <MathInline text={body} />
              </p>
            );
          }
          const idx = line.indexOf("=");
          if (idx === -1) {
            return (
              <span key={i} className={`col-span-2 font-mono ${fontSize} text-[#1A1A1A]`}>
                <MathInline text={line} />
              </span>
            );
          }
          const lhs = line.slice(0, idx).trim();
          const rhs = line.slice(idx + 1).trim();
          return (
            <Fragment key={i}>
              <span className={`justify-self-end whitespace-nowrap font-mono ${fontSize} leading-relaxed text-[#1A1A1A]`}>
                <MathInline text={lhs} />
              </span>
              <span className={`whitespace-nowrap pl-2 font-mono ${fontSize} leading-relaxed text-[#1A1A1A]`}>
                = <MathInline text={rhs} />
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
