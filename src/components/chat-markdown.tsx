"use client";

import React from "react";

/**
 * Renderer teks ringan untuk bubble chat Chef AI.
 *
 * AI (dan beberapa fallback lokal) sering mengirim markdown seperti
 * `**Nasi Goreng**`, `*Catatan:*`, bullet `* item` / `- item`, atau numbered list.
 * Karena bubble sebelumnya merender plain text, simbol `*` muncul apa adanya.
 *
 * Komponen ini mengubah markdown sederhana menjadi elemen React (bold, italic,
 * code, bullet & numbered list) dan menyingkirkan sisa tanda `*` yang tidak
 * berpasangan supaya jawaban tetap bersih tanpa simbol aneh.
 */

type InlineToken = {
  type: "text" | "bold" | "italic" | "code";
  value: string;
};

const INLINE_SOURCE =
  "(\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__|\\*[^*\\n]+\\*|_[^_\\n]+_|`[^`\\n]+`)";

const BULLET_RE = /^\s*[*•▪‣·+-]\s+(.*)$/;
const ORDERED_RE = /^\s*(\d+)[.)]\s+(.*)$/;
const HEADING_RE = /^\s*#{1,6}\s+(.*)$/;

function stripStrayMarkers(text: string): string {
  // Buang sisa tanda * / _ yang tidak berpasangan (sisa markdown yang gagal di-parse).
  return text.replace(/\*+/g, "").replace(/(^|\s)_+|_+(\s|$)/g, "$1$2");
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = new RegExp(INLINE_SOURCE, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: stripStrayMarkers(text.slice(lastIndex, match.index)),
      });
    }

    const raw = match[0];
    if (raw.startsWith("**") || raw.startsWith("__")) {
      tokens.push({ type: "bold", value: raw.slice(2, -2) });
    } else if (raw.startsWith("`")) {
      tokens.push({ type: "code", value: raw.slice(1, -1) });
    } else {
      tokens.push({ type: "italic", value: raw.slice(1, -1) });
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: stripStrayMarkers(text.slice(lastIndex)),
    });
  }

  return tokens.filter((token) => token.value !== "");
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return parseInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === "bold") {
      return (
        <strong key={key} className="font-bold text-stone-900">
          {token.value}
        </strong>
      );
    }

    if (token.type === "italic") {
      return (
        <em key={key} className="italic">
          {token.value}
        </em>
      );
    }

    if (token.type === "code") {
      return (
        <code
          key={key}
          className="rounded bg-stone-200/70 px-1 py-0.5 font-mono text-[11px] text-stone-800"
        >
          {token.value}
        </code>
      );
    }

    return <React.Fragment key={key}>{token.value}</React.Fragment>;
  });
}

interface ChatMarkdownProps {
  text: string;
  className?: string;
  /** Warna teks default mengikuti bubble induk. */
  tone?: "dark" | "light";
}

export default function ChatMarkdown({ text, className, tone = "dark" }: ChatMarkdownProps) {
  if (!text) return null;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let listBuffer: { ordered: boolean; items: string[] } | null = null;
  const flushList = () => {
    if (!listBuffer) return;
    const { ordered, items } = listBuffer;
    const ListTag = ordered ? "ol" : "ul";
    blocks.push(
      <ListTag
        key={`list-${blocks.length}`}
        className={`flex flex-col gap-1.5 pl-0.5 ${ordered ? "list-none" : "list-none"}`}
      >
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            {ordered ? (
              <span
                className={`shrink-0 text-[10px] font-bold leading-5 ${
                  tone === "light" ? "text-white/80" : "text-orange-700"
                }`}
              >
                {index + 1}.
              </span>
            ) : (
              <span
                className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                  tone === "light" ? "bg-white/70" : "bg-orange-700"
                }`}
              />
            )}
            <span className="flex-1">{renderInline(item, `li-${blocks.length}-${index}`)}</span>
          </li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(BULLET_RE);
    const orderedMatch = line.match(ORDERED_RE);
    const headingMatch = line.match(HEADING_RE);

    if (bulletMatch) {
      if (!listBuffer || listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(bulletMatch[1]);
      return;
    }

    if (orderedMatch) {
      if (!listBuffer || !listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(orderedMatch[2]);
      return;
    }

    flushList();

    if (headingMatch) {
      blocks.push(
        <p key={`h-${index}`} className="font-bold text-stone-900">
          {renderInline(headingMatch[1], `h-${index}`)}
        </p>
      );
      return;
    }

    if (line.trim() === "") {
      // Baris kosong = jarak antar paragraf.
      blocks.push(<div key={`sp-${index}`} className="h-1" />);
      return;
    }

    blocks.push(<p key={`p-${index}`}>{renderInline(line, `p-${index}`)}</p>);
  });

  flushList();

  return <div className={`flex flex-col gap-1 ${className ?? ""}`}>{blocks}</div>;
}