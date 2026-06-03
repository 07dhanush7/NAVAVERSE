export const extractYouTubeVideoId = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(hostname)) {
      return "";
    }

    if (url.pathname === "/watch") {
      return url.searchParams.get("v") || "";
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const targetIndex = segments.findIndex((segment) => ["embed", "shorts", "live"].includes(segment));

    if (targetIndex >= 0 && segments[targetIndex + 1]) {
      return segments[targetIndex + 1];
    }

    return "";
  } catch {
    return "";
  }
};

export const isValidYouTubeUrl = (input) => Boolean(extractYouTubeVideoId(input));

export const toYouTubeEmbedUrl = (input) => {
  const videoId = extractYouTubeVideoId(input);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};


