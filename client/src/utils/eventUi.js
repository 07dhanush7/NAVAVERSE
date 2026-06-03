import { apiOrigin } from "../api/axios";
const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop";

const IMAGE_BASE_URL = apiOrigin;

const normalizeText = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
};

export const getEventImageUrl = (image) => {
  const normalizedImage = normalizeText(image);

  if (!normalizedImage) {
    return FALLBACK_EVENT_IMAGE;
  }

  if (/^https?:../i.test(normalizedImage)) {
    return normalizedImage;
  }

  return `${IMAGE_BASE_URL}${encodeURI(normalizedImage)}`;
};

export const getEventFallbackImage = () => FALLBACK_EVENT_IMAGE;

export const formatEventDate = (value) => {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "Date to be announced";
  }

  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) {
    return normalizedValue;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatEventTime = (value) => {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "Time to be announced";
  }

  const parsed = new Date(`1970-01-01T${normalizedValue}`);
  if (Number.isNaN(parsed.getTime())) {
    return normalizedValue;
  }

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getEventOrganizerName = (event) =>
  normalizeText(event?.organizer || event?.creatorName, "NAVAVERSE");

export const getEventLocationLabel = (event) => normalizeText(event?.location, "Online");

export const getEventExcerpt = (description, maxLength = 120) => {
  const content = normalizeText(description, "Discover community sessions, workshops, and live NAVAVERSE meetups.");

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength).trim()}...`;
};

const splitParagraphs = (description) =>
  normalizeText(description)
    .split(/..*./)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const extractSection = (content, label) => {
  const regex = new RegExp(`${label}.s*:?.s*([.s.S]*?)(?=.n.s*[A-Za-z ]+.s*:|$)`, "i");
  const match = content.match(regex);
  return normalizeText(match?.[1]);
};

export const getEventContentSections = (description) => {
  const content = normalizeText(description, "Event details will be shared by the organizer soon.");
  const paragraphs = splitParagraphs(content);
  const details =
    extractSection(content, "agenda|details") ||
    (paragraphs.length > 1 ? paragraphs.slice(1).join("..") : content);
  const requirements = extractSection(content, "requirements?");

  return {
    description: paragraphs[0] || content,
    details,
    requirements,
  };
};


