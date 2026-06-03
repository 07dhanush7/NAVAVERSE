const STORAGE_KEYS = {
  users: "jobDemo_users",
  currentUser: "jobDemo_currentUser",
  jobs: "jobDemo_jobs",
  applications: "jobDemo_applications",
  counters: "jobDemo_counters",
};

const seedUsers = [
  { id: "admin1", name: "Admin Meera", role: "admin" },
  { id: "user1", name: "Prajwal", role: "user" },
  { id: "user2", name: "Rahul", role: "user" },
  { id: "user3", name: "Ananya", role: "user" },
];

const seedJobs = [
  {
    id: "job_1",
    title: "Frontend Developer",
    company: "ABC",
    createdBy: "user1",
    creatorName: "Prajwal",
    creatorRole: "user",
  },
  {
    id: "job_2",
    title: "Platform Engineer",
    company: "Navaverse",
    createdBy: "admin1",
    creatorName: "Admin Meera",
    creatorRole: "admin",
  },
];

const seedCounters = {
  job: seedJobs.length + 1,
  application: 1,
};

const currentUserSelect = document.querySelector("#currentUserSelect");
const currentUserCard = document.querySelector("#currentUserCard");
const jobsList = document.querySelector("#jobsList");
const applicationsList = document.querySelector("#applicationsList");
const usersPreview = document.querySelector("#usersPreview");
const jobsPreview = document.querySelector("#jobsPreview");
const applicationsPreview = document.querySelector("#applicationsPreview");
const jobForm = document.querySelector("#jobForm");
const seedButton = document.querySelector("#seedButton");
const clearApplicationsButton = document.querySelector("#clearApplicationsButton");
const jobCardTemplate = document.querySelector("#jobCardTemplate");
const applicationCardTemplate = document.querySelector("#applicationCardTemplate");

initializeDemo();
bindEvents();
renderApp();

function initializeDemo() {
  const hasUsers = Boolean(load(STORAGE_KEYS.users));
  if (!hasUsers) {
    resetDemoData();
  }
}

function bindEvents() {
  currentUserSelect.addEventListener("change", (event) => {
    save(STORAGE_KEYS.currentUser, event.target.value);
    renderApp();
  });

  jobForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createJob();
  });

  seedButton.addEventListener("click", () => {
    resetDemoData();
    renderApp();
  });

  clearApplicationsButton.addEventListener("click", () => {
    save(STORAGE_KEYS.applications, []);
    saveCounter("application", 1);
    renderApp();
  });
}

function createJob() {
  const currentUser = getCurrentUser();
  const jobs = getJobs();
  const title = document.querySelector("#jobTitle").value.trim();
  const company = document.querySelector("#jobCompany").value.trim();

  if (!title || !company) {
    return;
  }

  const job = {
    id: getNextId("job", "job_"),
    title,
    company,
    createdBy: currentUser.id,
    creatorName: currentUser.name,
    creatorRole: currentUser.role,
  };

  jobs.unshift(job);
  save(STORAGE_KEYS.jobs, jobs);
  jobForm.reset();
  renderApp();
}

function applyToJob(jobId) {
  const currentUser = getCurrentUser();
  const jobs = getJobs();
  const applications = getApplications();

  // Step 1: fetch the job using jobId.
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    window.alert("Job not found.");
    return;
  }

  if (job.createdBy === currentUser.id) {
    window.alert("You cannot apply to your own job.");
    return;
  }

  const alreadyApplied = applications.some(
    (application) =>
      application.jobId === job.id && application.applicantId === currentUser.id
  );

  if (alreadyApplied) {
    window.alert("You have already applied to this job.");
    return;
  }

  // Step 2: extract job.createdBy.
  const receiverId = job.createdBy;

  // Step 3: save receiverId = job.createdBy.
  const application = {
    id: getNextId("application", "app_"),
    jobId: job.id,
    jobTitle: job.title,
    applicantId: currentUser.id,
    applicantName: currentUser.name,
    receiverId,
    status: "Pending",
  };

  applications.unshift(application);
  save(STORAGE_KEYS.applications, applications);
  renderApp();
}

function renderApp() {
  renderCurrentUserSelect();
  renderCurrentUserCard();
  renderJobs();
  renderApplications();
  renderPreviews();
}

function renderCurrentUserSelect() {
  const users = getUsers();
  const currentUser = getCurrentUser();

  currentUserSelect.innerHTML = "";

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.name} (${user.role})`;
    option.selected = user.id === currentUser.id;
    currentUserSelect.appendChild(option);
  });
}

function renderCurrentUserCard() {
  const currentUser = getCurrentUser();

  currentUserCard.innerHTML = `
    <h3>${currentUser.name}</h3>
    <p><strong>User ID:</strong> ${currentUser.id}</p>
    <p><strong>Role:</strong> ${currentUser.role}</p>
    <p><strong>Dashboard Filter:</strong> receiverId === "${currentUser.id}"</p>
  `;
}

function renderJobs() {
  const jobs = getJobs();
  const currentUser = getCurrentUser();

  jobsList.innerHTML = "";

  if (jobs.length === 0) {
    jobsList.appendChild(createEmptyState("No jobs available yet."));
    return;
  }

  jobs.forEach((job) => {
    const fragment = jobCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".card");
    const badge = fragment.querySelector(".badge");
    const creatorMeta = fragment.querySelector(".creator-meta");
    const title = fragment.querySelector(".job-title");
    const companyName = fragment.querySelector(".company-name");
    const metaList = fragment.querySelector(".meta-list");
    const applyButton = fragment.querySelector(".apply-btn");

    badge.textContent = job.creatorRole === "admin" ? "Admin Job" : "User Job";
    creatorMeta.textContent = `createdBy: ${job.createdBy}`;
    title.textContent = job.title;
    companyName.textContent = job.company;

    metaList.appendChild(
      createMetaRow(`creatorName: ${job.creatorName}`)
    );
    metaList.appendChild(
      createMetaRow(`creatorRole: ${job.creatorRole}`)
    );
    metaList.appendChild(
      createMetaRow(`Rule on apply: receiverId = ${job.createdBy}`)
    );

    if (job.createdBy === currentUser.id) {
      applyButton.disabled = true;
      applyButton.textContent = "Your Job";
    } else {
      applyButton.addEventListener("click", () => applyToJob(job.id));
    }

    jobsList.appendChild(card);
  });
}

function renderApplications() {
  const currentUser = getCurrentUser();
  const applications = getApplications().filter(
    (application) => application.receiverId === currentUser.id
  );

  applicationsList.innerHTML = "";

  if (applications.length === 0) {
    applicationsList.appendChild(
      createEmptyState(
        `No applications routed to ${currentUser.name}. Only applications with receiverId = ${currentUser.id} appear here.`
      )
    );
    return;
  }

  applications.forEach((application) => {
    const fragment = applicationCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".card");
    const statusBadge = fragment.querySelector(".status-badge");
    const receiverMeta = fragment.querySelector(".receiver-meta");
    const title = fragment.querySelector(".job-title");
    const metaList = fragment.querySelector(".meta-list");

    statusBadge.textContent = application.status;
    receiverMeta.textContent = `receiverId: ${application.receiverId}`;
    title.textContent = application.jobTitle;

    metaList.appendChild(
      createMetaRow(`applicationId: ${application.id}`)
    );
    metaList.appendChild(
      createMetaRow(`applicantId: ${application.applicantId}`)
    );
    metaList.appendChild(
      createMetaRow(`applicantName: ${application.applicantName}`)
    );
    metaList.appendChild(
      createMetaRow(`jobId: ${application.jobId}`)
    );

    applicationsList.appendChild(card);
  });
}

function renderPreviews() {
  usersPreview.textContent = pretty(getUsers());
  jobsPreview.textContent = pretty(getJobs());
  applicationsPreview.textContent = pretty(getApplications());
}

function resetDemoData() {
  save(STORAGE_KEYS.users, seedUsers);
  save(STORAGE_KEYS.currentUser, "user2");
  save(STORAGE_KEYS.jobs, seedJobs);
  save(STORAGE_KEYS.applications, []);
  save(STORAGE_KEYS.counters, { ...seedCounters });
}

function getUsers() {
  return load(STORAGE_KEYS.users, []);
}

function getJobs() {
  return load(STORAGE_KEYS.jobs, []);
}

function getApplications() {
  return load(STORAGE_KEYS.applications, []);
}

function getCurrentUser() {
  const users = getUsers();
  const currentUserId = load(STORAGE_KEYS.currentUser, users[0]?.id);
  const currentUser = users.find((user) => user.id === currentUserId);
  return currentUser || users[0];
}

function getNextId(counterKey, prefix) {
  const counters = load(STORAGE_KEYS.counters, { job: 1, application: 1 });
  const value = counters[counterKey] || 1;
  counters[counterKey] = value + 1;
  save(STORAGE_KEYS.counters, counters);
  return `${prefix}${value}`;
}

function saveCounter(counterKey, value) {
  const counters = load(STORAGE_KEYS.counters, { job: 1, application: 1 });
  counters[counterKey] = value;
  save(STORAGE_KEYS.counters, counters);
}

function createMetaRow(text) {
  const row = document.createElement("div");
  row.className = "meta-row";
  row.textContent = text;
  return row;
}

function createEmptyState(text) {
  const block = document.createElement("div");
  block.className = "empty-state";
  block.textContent = text;
  return block;
}

function load(key, fallback = null) {
  const raw = window.localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function save(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}
