"use client";

import DOMPurify from "isomorphic-dompurify";

export default function SafeRichText({ html = "", className = "" }) {
  const value = typeof html === "string" ? html : "";

  // Existing plain text ko HTML ki tarah interpret nahi karna.
  const containsHtml = /<\/?[a-z][\s\S]*?>/i.test(value);

  const content = containsHtml
    ? value
    : value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r\n|\r|\n/g, "<br />");

  const safeHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}