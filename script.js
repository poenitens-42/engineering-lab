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

const renderProjects = (items) => {
  const visible = items.filter((project) => activeFilter === "all" || project.category === activeFilter);

  grid.innerHTML = visible
    .map(
      (project) => `
        <article class="project-card" data-category="${escapeHtml(project.category)}">
          <div class="card-topline">
            <span class="status ${escapeHtml(statusClass(project.status))}">${escapeHtml(project.status)}</span>
            <span>${escapeHtml(project.stack)}</span>
          </div>
          <h3><a href="${escapeHtml(project.url)}">${escapeHtml(project.title)}</a></h3>
          <p>${escapeHtml(project.summary)}</p>
          <dl>
            <div><dt>${escapeHtml(project.detailLabel)}</dt><dd>${escapeHtml(project.detail)}</dd></div>
            <div><dt>Updated</dt><dd>${escapeHtml(formatDate(project.updatedAt, project.fallbackUpdated))}</dd></div>
          </dl>
        </article>
      `
    )
    .join("");
};

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
