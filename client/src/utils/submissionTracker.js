const STORAGE_KEY = "navaverseSubmissionTracker";

const readTrackedSubmissions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeTrackedSubmissions = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const trackSubmission = ({ id, module, title, status = "pending" }) => {
  const currentItems = readTrackedSubmissions();
  const filteredItems = currentItems.filter((item) => item.id !== id);

  filteredItems.unshift({
    id,
    module,
    title,
    status,
    createdAt: new Date().toISOString(),
  });

  writeTrackedSubmissions(filteredItems);
};

export const getTrackedSubmissions = (module) => {
  const items = readTrackedSubmissions();
  if (!module) {
    return items;
  }

  return items.filter((item) => item.module === module);
};


