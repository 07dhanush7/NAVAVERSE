const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "u",
  "ul",
]);

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const stripHtml = (value) =>
  String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeHref = (href) => {
  const trimmed = String(href || "").trim();
  if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return "";
};

export const sanitizeHtml = (value) => {
  const withoutDangerousBlocks = String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  return withoutDangerousBlocks
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, rawTag, rawAttrs) => {
      const tag = rawTag.toLowerCase();
      const isClosing = /^<\//.test(match);

      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }

      if (isClosing) {
        return `</${tag}>`;
      }

      if (tag === "a") {
        const hrefMatch = String(rawAttrs || "").match(/\shref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = sanitizeHref(hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3]);
        return href
          ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`
          : "<a>";
      }

      return tag === "br" || tag === "hr" ? `<${tag}>` : `<${tag}>`;
    })
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<p>\s*(?:<br>)?\s*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const ensureReadableHtml = (html, minCharacters = 180) => {
  const cleanHtml = sanitizeHtml(html);
  const plainText = stripHtml(cleanHtml);

  if (plainText.length < minCharacters) {
    const error = new Error("Content is too short. Please add complete article content.");
    error.statusCode = 400;
    throw error;
  }

  return cleanHtml;
};
