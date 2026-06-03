const YOUTUBE_HOSTS = new Set([
  "youtu.be",
  "www.youtu.be",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

export const extractYouTubeVideoId = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  try {
    const url = new URL(input.trim());
    const hostname = url.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(hostname)) {
      return "";
    }

    if (hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (url.pathname === "/watch") {
      return url.searchParams.get("v") || "";
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const embedIndex = segments.findIndex((segment) => ["embed", "shorts", "live"].includes(segment));

    if (embedIndex >= 0 && segments[embedIndex + 1]) {
      return segments[embedIndex + 1];
    }

    return "";
  } catch (error) {
    return "";
  }
};

export const isValidYouTubeUrl = (input) => Boolean(extractYouTubeVideoId(input));

export const buildYouTubeEmbedUrl = (input) => {
  const videoId = extractYouTubeVideoId(input);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};
