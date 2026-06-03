import { marked } from "marked";

const ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "EM",
  "H1",
  "H2",
  "H3",
  "H4",
  "HR",
  "I",
  "LI",
  "OL",
  "P",
  "PRE",
  "STRONG",
  "U",
  "UL",
]);

marked.setOptions({
  breaks: false,
  gfm: true,
  headerIds: false,
  mangle: false,
});

export const normalizeGeneratedMarkdown = (content) =>
  String(content || "")
    .replace(/\r\n/g, "\n")
    .replace(/^```(?:markdown|md|html)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const stripHtml = (html) =>
  String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sanitizeArticleHtml = (html) => {
  const template = document.createElement("template");
  template.innerHTML = String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

  const walk = (node) => {
    [...node.children].forEach((child) => {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        child.replaceWith(...child.childNodes);
        return;
      }

      [...child.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value || "";
        const isSafeHref = name === "href" && /^(https?:|mailto:|tel:|\/)/i.test(value);

        if (child.tagName === "A" && isSafeHref) {
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
        } else {
          child.removeAttribute(attribute.name);
        }
      });

      walk(child);
    });
  };

  walk(template.content);

  return template.innerHTML
    .replace(/<p>\s*(?:<br>)?\s*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const generatedContentToHtml = (data) => {
  if (data?.html) {
    return sanitizeArticleHtml(data.html);
  }

  const markdown = normalizeGeneratedMarkdown(data?.content || data?.markdown || "");
  const html = marked.parse(markdown);
  return sanitizeArticleHtml(html);
};

export const isMeaningfulArticleHtml = (html, minCharacters = 500) =>
  stripHtml(html).length >= minCharacters;

export const pasteArticleIntoQuill = (quill, html) => {
  if (!quill || !html) return;

  quill.setContents([]);
  quill.clipboard.dangerouslyPasteHTML(0, sanitizeArticleHtml(html));
  quill.setSelection(0, 0, "silent");
};
