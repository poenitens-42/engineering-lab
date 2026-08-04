const owner = "poenitens-42";
const grid = document.querySelector("#project-grid");
const filters = document.querySelectorAll(".filter");
const projects = window.PORTFOLIO_PROJECTS || [];
let activeFilter = "all";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value, fallback) => {
  if (!value) return fallback;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

const statusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

const formatLogDate = (value) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
};

const renderProjects = (items) => {
  const visible = items.filter((project) => activeFilter === "all" || project.category === activeFilter);

  grid.innerHTML = visible
    .map(
      (project) => `
        <article class="project-card" data-category="${escapeHtml(project.category)}" data-repo="${escapeHtml(project.repo)}" tabindex="0" role="button" aria-haspopup="dialog">
          <div class="card-topline">
            <span class="status ${escapeHtml(statusClass(project.status))}">${escapeHtml(project.status)}</span>
            <span>${escapeHtml(project.stack)}</span>
          </div>
          <h3><a href="${escapeHtml(project.url)}" data-repo-link>${escapeHtml(project.title)}</a></h3>
          <p>${escapeHtml(project.summary)}</p>
          <dl>
            <div><dt>${escapeHtml(project.detailLabel)}</dt><dd>${escapeHtml(project.detail)}</dd></div>
            <div><dt>Updated</dt><dd>${escapeHtml(formatDate(project.updatedAt, project.fallbackUpdated))}</dd></div>
          </dl>
          <span class="devlog-hint">View devlog <span aria-hidden="true">→</span></span>
        </article>
      `
    )
    .join("");
};

// --- Devlog panel ---
const devlogOverlay = document.querySelector("#devlog-overlay");
const devlogClose = document.querySelector("#devlog-close");
const devlogStack = document.querySelector("#devlog-stack");
const devlogTitle = document.querySelector("#devlog-title");
const devlogSummary = document.querySelector("#devlog-summary");
const devlogRepoLink = document.querySelector("#devlog-repo-link");
const devlogEntries = document.querySelector("#devlog-entries");

let lastFocusedElement = null;

const renderDevlogEntries = (project) => {
  const log = project.log || [];

  if (log.length === 0) {
    devlogEntries.innerHTML = `<p class="devlog-empty">No devlog entries yet for this project — check back soon.</p>`;
    return;
  }

  const sorted = [...log].sort((a, b) => (a.date < b.date ? 1 : -1));

  devlogEntries.innerHTML = sorted
    .map(
      (entry) => `
        <article class="devlog-entry">
          <p class="devlog-entry-date">${escapeHtml(formatLogDate(entry.date))}</p>
          ${entry.title ? `<h3>${escapeHtml(entry.title)}</h3>` : ""}
          <p>${escapeHtml(entry.body)}</p>
        </article>
      `
    )
    .join("");
};

const openDevlog = (project) => {
  lastFocusedElement = document.activeElement;

  devlogStack.textContent = project.stack;
  devlogTitle.textContent = project.title;
  devlogSummary.textContent = project.summary;
  devlogRepoLink.href = project.url;
  renderDevlogEntries(project);

  devlogOverlay.hidden = false;
  document.body.classList.add("devlog-open");
  devlogClose.focus();
};

const closeDevlog = () => {
  devlogOverlay.hidden = true;
  document.body.classList.remove("devlog-open");
  if (lastFocusedElement) lastFocusedElement.focus();
};

grid.addEventListener("click", (event) => {
  if (event.target.closest("[data-repo-link]")) return; // let the title link navigate normally

  const card = event.target.closest(".project-card");
  if (!card) return;

  const project = projects.find((item) => item.repo === card.dataset.repo);
  if (project) openDevlog(project);
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".project-card");
  if (!card) return;

  event.preventDefault();
  const project = projects.find((item) => item.repo === card.dataset.repo);
  if (project) openDevlog(project);
});

devlogClose.addEventListener("click", closeDevlog);

devlogOverlay.addEventListener("click", (event) => {
  if (event.target === devlogOverlay) closeDevlog();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !devlogOverlay.hidden) closeDevlog();
});

const enrichFromGitHub = async () => {
  try {
    const response = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`);
    if (!response.ok) return projects;

    const repos = await response.json();
    const metadata = new Map(repos.map((repo) => [repo.name, repo]));

    return projects.map((project) => {
      const repo = metadata.get(project.repo);
      if (!repo) return project;

      return {
        ...project,
        updatedAt: repo.updated_at,
        stack: project.stack || repo.language || "Repository",
        url: repo.html_url || project.url
      };
    });
  } catch {
    return projects;
  }
};

filters.forEach((filter) => {
  filter.addEventListener("click", async () => {
    activeFilter = filter.dataset.filter;

    filters.forEach((button) => {
      button.classList.toggle("is-active", button === filter);
    });

    renderProjects(projects);
  });
});

renderProjects(projects);

enrichFromGitHub().then((enrichedProjects) => {
  projects.splice(0, projects.length, ...enrichedProjects);
  renderProjects(projects);
});
