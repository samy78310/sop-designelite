"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  const sanitized = DOMPurify.sanitize(content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allowfullscreen",
      "allow",
      "frameborder",
      "src",
      "style",
      "class",
      "width",
      "height",
    ],
    FORCE_BODY: false,
  });

  useEffect(() => {
    if (!ref.current) return;

    // Add anchor links to h2/h3 headings
    const headings = ref.current.querySelectorAll("h2, h3");
    headings.forEach((heading) => {
      if (!heading.id) {
        const id = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-") || "";
        heading.id = id;
      }

      // Add anchor icon
      if (!heading.querySelector(".anchor-link")) {
        const anchor = document.createElement("a");
        anchor.href = `#${heading.id}`;
        anchor.className =
          "anchor-link ml-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-brand-500 transition text-lg";
        anchor.innerHTML = "#";
        heading.classList.add("group", "flex", "items-center");
        heading.appendChild(anchor);
      }
    });
  }, [content]);

  return (
    <div
      ref={ref}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
