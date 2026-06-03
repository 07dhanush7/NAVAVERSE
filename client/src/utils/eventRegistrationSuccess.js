const STORAGE_KEY = "navaverse:event-registration-success";

const FALLBACK_TEXT = "Not available";

const formatValue = (value, fallback = FALLBACK_TEXT) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();
  return normalized || fallback;
};

const formatEventDate = (value) => {
  if (!value) {
    return FALLBACK_TEXT;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return formatValue(value);
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatRegistrationDate = (value) => {
  if (!value) {
    return FALLBACK_TEXT;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return formatValue(value);
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const buildRegistrationSuccessPayload = ({ event, user, registration }) => ({
  event: {
    id: event?._id || "",
    name: formatValue(event?.title),
    image: formatValue(event?.image, ""),
    date: formatValue(event?.date),
    dateLabel: formatEventDate(event?.date),
    time: formatValue(event?.time),
    location: formatValue(event?.location, "Online"),
  },
  user: {
    name: formatValue(user?.username || user?.name),
    email: formatValue(user?.email),
  },
  registration: {
    id: formatValue(registration?._id),
    date: registration?.createdAt || "",
    dateLabel: formatRegistrationDate(registration?.createdAt),
    phone: formatValue(registration?.phone || registration?.phoneNumber, ""),
  },
});

export const persistRegistrationSuccessPayload = (payload) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const getPersistedRegistrationSuccessPayload = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const sanitizePdfFileName = (eventName) => {
  const safeEventName = Array.from(formatValue(eventName, "Event"))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && !'<>:"/.|?*'.includes(character);
    })
    .join("")
    .replace(/.+/g, "_");

  return `${safeEventName}_Registration_NAVAVERSE.pdf`;
};


