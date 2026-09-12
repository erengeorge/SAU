const TITLES = {
  overview: "Overview",
  complaints: "Complaints & Requests",
  departments: "Department Activities",
  documents: "Document Tracking",
  records: "Student Records",
  visitors: "Visitor Log",
  confiscated: "Confiscated IDs",
  tasks: "Tasks",
};

let state = {
  complaints: [],
  documents: [],
  records: [],
  visitors: [],
  tasks: [],
  activities: [],
  departments: [],
  confiscated_ids: [],
};
let activeTab = "overview";
let openActivityIds = new Set();

document.getElementById("topbar-date").textContent =
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

async function api(action, payload = {}) {
  const res = await fetch("api.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json();
  if (json.error || json.ok === false) {
    showToast(json.error || "Something went wrong.");
    throw new Error(json.error || "API error");
  }
  return json;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 2400);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function qsa(selector, clickHandler, eventName = "click", handler = null) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener(eventName, () => (handler || clickHandler)(el));
  });
}

async function loadAll() {
  const res = await api("get_all");
  state = res.data;
  document.getElementById("loader")?.remove();
  render();
}

function setActiveTab(tab) {
  activeTab = tab;
  document.getElementById("page-title").textContent = TITLES[tab];
  document.querySelectorAll(".nav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  render();
}

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
});

function render() {
  const main = document.getElementById("panel-container");
  const panel = document.createElement("div");
  panel.className = "panel";

  const renderers = {
    overview: renderOverview,
    complaints: renderComplaints,
    departments: renderDepartments,
    documents: renderDocuments,
    records: renderRecords,
    visitors: renderVisitors,
    confiscated: renderConfiscated,
    tasks: renderTasks,
  };
  panel.innerHTML = renderers[activeTab]();
  main.innerHTML = "";
  main.appendChild(panel);
  attachHandlers();
}

function getDeptColor(name) {
  const d = state.departments.find((d) => d.name === name);
  return d ? d.color : "#e8479d";
}

function getContrastColor(hex) {
  if (!hex) return "#ffffff";
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16),
    g = parseInt(c.substr(2, 2), 16),
    b = parseInt(c.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#2a2429" : "#ffffff";
}

// ---------------- OVERVIEW ----------------
function renderOverview() {
  const openComplaints = state.complaints.filter(
    (c) => c.status !== "done",
  ).length;
  const pendingDocs = state.documents.filter(
    (d) => d.status !== "completed",
  ).length;
  const pendingTasks = state.tasks.filter((t) => !Number(t.done)).length;
  const todayVisitors = state.visitors.filter(
    (v) => v.visit_date === todayStr(),
  ).length;

  const activityAlerts = state.activities
    .map((a) => ({
      ...a,
      pending: a.requirements.filter((r) => !Number(r.submitted)).length,
    }))
    .filter((a) => a.pending > 0)
    .slice(0, 4);

  return `
    <div class="grid">
      <div class="stat"><div class="num">${openComplaints}</div><div class="label">Open complaints/requests</div></div>
      <div class="stat"><div class="num">${pendingDocs}</div><div class="label">Pending papers</div></div>
      <div class="stat"><div class="num">${pendingTasks}</div><div class="label">Pending tasks</div></div>
      <div class="stat"><div class="num">${todayVisitors}</div><div class="label">Visitors today</div></div>
    </div>
    <div class="card">
      <h2>Departments with pending requirements</h2>
      ${
        activityAlerts.length
          ? `<ul class="list">${activityAlerts
              .map(
                (a) => `
        <li><div class="item-main">
          <span class="dept-badge" style="background:${getDeptColor(a.department)};color:${getContrastColor(getDeptColor(a.department))};">${escapeHtml(a.department)}</span>
          <div class="item-title">${escapeHtml(a.activity_name)}</div>
          <div class="item-meta">${a.pending} requirement${a.pending > 1 ? "s" : ""} still pending</div>
        </div></li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">All caught up, no pending requirements.</div>`
      }
    </div>
  `;
}

// ---------------- COMPLAINTS ----------------
function renderComplaints() {
  const items = [...state.complaints];
  return `
    <div class="card">
      <h2>Log a complaint or request</h2>
      <form id="complaint-form" class="form-grid">
        <div class="field">
          <label for="c-name">Student name</label>
          <input type="text" id="c-name" required>
        </div>
        <div class="field">
          <label for="c-course">Course/Year</label>
          <input type="text" id="c-course" placeholder="Optional">
        </div>
        <div class="field">
          <label for="c-type">Type</label>
          <select id="c-type">
            <option value="Complaint">Complaint</option>
            <option value="Request">Request</option>
          </select>
        </div>
        <div class="field field-full">
          <label for="c-desc">Details</label>
          <textarea id="c-desc" required></textarea>
        </div>
        <div class="form-actions"><button type="submit" class="btn">Add entry</button></div>
      </form>
    </div>
    <div class="card">
      <h2>All entries (${items.length})</h2>
      ${
        items.length
          ? `<ul class="list">${items
              .map(
                (c) => `
        <li>
          <div class="item-main">
            <span class="badge badge-${c.status === "done" ? "done" : c.status === "progress" ? "progress" : "open"}">${c.status === "done" ? "Resolved" : c.status === "progress" ? "In progress" : "Open"}</span>
            <span class="item-title">${escapeHtml(c.type)}, ${escapeHtml(c.name)}</span>
            <div class="item-meta">${escapeHtml(c.course || "")} &middot; ${c.date_added}</div>
            <div class="item-desc">${escapeHtml(c.description)}</div>
          </div>
          <div class="actions">
            <select class="status-select" data-action="status" data-id="${c.id}">
              <option value="open" ${c.status === "open" ? "selected" : ""}>Open</option>
              <option value="progress" ${c.status === "progress" ? "selected" : ""}>In progress</option>
              <option value="done" ${c.status === "done" ? "selected" : ""}>Resolved</option>
            </select>
            <button class="btn-outline" data-action="delete-complaint" data-id="${c.id}">Delete</button>
          </div>
        </li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">No entries yet.</div>`
      }
    </div>
  `;
}

// ---------------- DOCUMENT TRACKING ----------------
function renderDocuments() {
  const items = [...state.documents];
  return `
    <div class="card">
      <h2>Log a paper</h2>
      <form id="document-form" class="form-grid">
        <div class="field">
          <label for="doc-direction">Direction</label>
          <select id="doc-direction">
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>
        </div>
        <div class="field">
          <label for="doc-tracking">Tracking / reference no.</label>
          <input type="text" id="doc-tracking" placeholder="Optional">
        </div>
        <div class="field">
          <label for="doc-party">From / To</label>
          <input type="text" id="doc-party" placeholder="Who it's from or to">
        </div>
        <div class="field field-full">
          <label for="doc-subject">Subject / title</label>
          <input type="text" id="doc-subject" required>
        </div>
        <div class="field field-full">
          <label for="doc-notes">Notes</label>
          <textarea id="doc-notes" placeholder="Optional"></textarea>
        </div>
        <div class="form-actions"><button type="submit" class="btn">Add entry</button></div>
      </form>
    </div>
    <div class="card">
      <h2>Log (${items.length})</h2>
      ${
        items.length
          ? `<ul class="list">${items
              .map(
                (d) => `
        <li>
          <div class="item-main">
            <span class="badge ${d.direction === "incoming" ? "badge-progress" : "badge-open"}">${d.direction === "incoming" ? "Incoming" : "Outgoing"}</span>
            <span class="badge ${d.status === "completed" ? "badge-done" : "badge-open"}">${d.status === "completed" ? "Completed" : "Pending"}</span>
            <div class="item-title">${escapeHtml(d.subject)}</div>
            <div class="item-meta">
              ${d.tracking_no ? "Ref: " + escapeHtml(d.tracking_no) + " &middot; " : ""}${d.party ? escapeHtml(d.party) + " &middot; " : ""}${d.date_logged}
            </div>
            ${d.notes ? `<div class="item-desc">${escapeHtml(d.notes)}</div>` : ""}
          </div>
          <div class="actions">
            <select class="status-select" data-action="doc-status" data-id="${d.id}">
              <option value="pending" ${d.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="completed" ${d.status === "completed" ? "selected" : ""}>Completed</option>
            </select>
            <button class="btn-outline" data-action="delete-document" data-id="${d.id}">Delete</button>
          </div>
        </li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">No papers logged yet.</div>`
      }
    </div>
  `;
}

// ---------------- DEPARTMENT ACTIVITIES ----------------
function renderDepartments() {
  const items = [...state.activities];
  const depts = state.departments;
  return `
    <div class="card">
      <h2>Add a department activity</h2>
      ${depts.length ? "" : `<div class="empty" style="text-align:left;padding:0 0 14px;">No departments set up yet. Use the settings icon (top right) to add one first.</div>`}
      <form id="activity-form" class="form-grid">
        <div class="field">
          <label for="d-dept">Department</label>
          <select id="d-dept" required ${depts.length ? "" : "disabled"}>
            <option value="" disabled selected>Select department</option>
            ${depts.map((d) => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="d-name">Activity name</label>
          <input type="text" id="d-name" required>
        </div>
        <div class="field">
          <label for="d-date">Date</label>
          <input type="date" id="d-date">
        </div>
        <div class="field field-full">
          <label for="d-notes">Notes</label>
          <textarea id="d-notes" placeholder="Optional"></textarea>
        </div>
        <div class="field field-full">
          <label for="d-reqs">Requirements</label>
          <input type="text" id="d-reqs" placeholder="Comma-separated, e.g. Activity proposal, Budget request, Attendance sheet">
          <div class="field-hint">Separate each requirement with a comma. You can add more later.</div>
        </div>
        <div class="form-actions"><button type="submit" class="btn" ${depts.length ? "" : "disabled"}>Add activity</button></div>
      </form>
    </div>

    <div class="card">
      <h2>Monitoring (${items.length} activit${items.length === 1 ? "y" : "ies"})</h2>
      ${items.length ? items.map((a) => renderActivityCard(a)).join("") : `<div class="empty">No department activities logged yet.</div>`}
    </div>
  `;
}

function renderActivityCard(a) {
  const total = a.requirements.length;
  const submitted = a.requirements.filter((r) => Number(r.submitted)).length;
  const pct = total ? Math.round((submitted / total) * 100) : 0;
  const isOpen = openActivityIds.has(String(a.id));
  const color = getDeptColor(a.department);
  const textColor = getContrastColor(color);
  return `
    <div class="activity-card ${isOpen ? "open" : ""}" data-activity-id="${a.id}">
      <div class="activity-head" data-action="toggle-activity" data-id="${a.id}">
        <div class="activity-head-left">
          <span class="dept-badge" style="background:${color};color:${textColor};">${escapeHtml(a.department)}</span>
          <div class="activity-name">${escapeHtml(a.activity_name)}</div>
          ${a.activity_date ? `<div class="activity-date">${a.activity_date}</div>` : ""}
        </div>
        <div class="progress-wrap">
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="progress-text">${submitted}/${total}</div>
        </div>
        <div class="chevron"></div>
      </div>
      <div class="activity-body">
        ${a.notes ? `<div class="notes-line">${escapeHtml(a.notes)}</div>` : ""}
        <ul class="req-list">
          ${
            a.requirements
              .map(
                (r) => `
            <li>
              <input type="checkbox" class="req-check" data-action="toggle-req" data-id="${r.id}" ${Number(r.submitted) ? "checked" : ""}>
              <span class="req-name">${escapeHtml(r.requirement_name)}</span>
              <button class="req-del" data-action="delete-req" data-id="${r.id}" aria-label="Remove requirement">&times;</button>
            </li>`,
              )
              .join("") ||
            `<li class="empty" style="padding:8px 0;">No requirements added yet.</li>`
          }
        </ul>
        <div class="add-req-row">
          <input type="text" placeholder="Add a requirement" data-new-req="${a.id}">
          <button class="btn-outline" data-action="add-req" data-id="${a.id}">Add</button>
        </div>
        <div style="margin-top:12px;">
          <button class="btn-ghost" data-action="delete-activity" data-id="${a.id}">Delete this activity</button>
        </div>
      </div>
    </div>
  `;
}

// ---------------- RECORDS ----------------
function renderRecords() {
  return `
    <div class="card">
      <h2>Add student record</h2>
      <form id="record-form" class="form-grid">
        <div class="field">
          <label for="r-name">Full name</label>
          <input type="text" id="r-name" required>
        </div>
        <div class="field">
          <label for="r-id">Student ID</label>
          <input type="text" id="r-id">
        </div>
        <div class="field">
          <label for="r-course">Course &amp; Year</label>
          <input type="text" id="r-course">
        </div>
        <div class="field">
          <label for="r-contact">Contact</label>
          <input type="text" id="r-contact" placeholder="Number or email">
        </div>
        <div class="field field-full">
          <label for="r-notes">Notes</label>
          <textarea id="r-notes" placeholder="Optional"></textarea>
        </div>
        <div class="form-actions"><button type="submit" class="btn">Add record</button></div>
      </form>
    </div>
    <div class="card">
      <h2>Search records</h2>
      <div class="field" style="margin-bottom:14px;">
        <input type="text" id="record-search" placeholder="Search by name or ID">
      </div>
      <ul class="list" id="records-list"></ul>
    </div>
  `;
}

function renderRecordsList(filter) {
  const listEl = document.getElementById("records-list");
  if (!listEl) return;
  const f = (filter || "").toLowerCase();
  const items = state.records.filter(
    (r) =>
      !f ||
      r.name.toLowerCase().includes(f) ||
      (r.student_id || "").toLowerCase().includes(f),
  );
  listEl.innerHTML = items.length
    ? items
        .map(
          (r) => `
    <li>
      <div class="item-main">
        <div class="item-title">${escapeHtml(r.name)} ${r.student_id ? `(${escapeHtml(r.student_id)})` : ""}</div>
        <div class="item-meta">${escapeHtml(r.course || "")}${r.contact ? " &middot; " + escapeHtml(r.contact) : ""}</div>
        ${r.notes ? `<div class="item-desc">${escapeHtml(r.notes)}</div>` : ""}
      </div>
      <div class="actions">
        <button class="btn-outline" data-action="delete-record" data-id="${r.id}">Delete</button>
      </div>
    </li>`,
        )
        .join("")
    : `<div class="empty">No matching records.</div>`;

  listEl.querySelectorAll('[data-action="delete-record"]').forEach((b) => {
    b.addEventListener("click", async () => {
      await api("delete_record", { id: b.dataset.id });
      state.records = state.records.filter(
        (r) => String(r.id) !== b.dataset.id,
      );
      renderRecordsList(document.getElementById("record-search").value);
      showToast("Record deleted.");
    });
  });
}

// ---------------- VISITORS ----------------
function renderVisitors() {
  const items = [...state.visitors];
  return `
    <div class="card">
      <h2>Log a walk-in visitor</h2>
      <form id="visitor-form" class="form-grid">
        <div class="field">
          <label for="v-name">Visitor name</label>
          <input type="text" id="v-name" required>
        </div>
        <div class="field">
          <label for="v-purpose">Purpose of visit</label>
          <input type="text" id="v-purpose" required>
        </div>
        <div class="field">
          <label for="v-time">Time</label>
          <input type="time" id="v-time">
        </div>
        <div class="form-actions"><button type="submit" class="btn">Add entry</button></div>
      </form>
    </div>
    <div class="card">
      <h2>Log (${items.length})</h2>
      ${
        items.length
          ? `<ul class="list">${items
              .map(
                (v) => `
        <li>
          <div class="item-main">
            <div class="item-title">${escapeHtml(v.name)}</div>
            <div class="item-meta">${v.visit_date}${v.visit_time ? " &middot; " + v.visit_time : ""}</div>
            <div class="item-desc">${escapeHtml(v.purpose)}</div>
          </div>
          <div class="actions">
            <button class="btn-outline" data-action="delete-visitor" data-id="${v.id}">Delete</button>
          </div>
        </li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">No visitors logged yet.</div>`
      }
    </div>
  `;
}

// ---------------- CONFISCATED IDS ----------------
function renderConfiscated() {
  const items = [...state.confiscated_ids];
  const held = items.filter((c) => c.status === "held");
  const released = items.filter((c) => c.status === "released");
  return `
    <div class="card">
      <h2>Log a confiscated ID</h2>
      <form id="confiscated-form" class="form-grid">
        <div class="field">
          <label for="ci-name">Student name</label>
          <input type="text" id="ci-name" required>
        </div>
        <div class="field">
          <label for="ci-id">Student ID no.</label>
          <input type="text" id="ci-id" placeholder="Optional">
        </div>
        <div class="field field-full">
          <label for="ci-reason">Reason confiscated</label>
          <input type="text" id="ci-reason" required>
        </div>
        <div class="form-actions"><button type="submit" class="btn">Add entry</button></div>
      </form>
    </div>
    <div class="card">
      <h2>Currently held (${held.length})</h2>
      ${
        held.length
          ? `<ul class="list">${held
              .map(
                (c) => `
        <li>
          <div class="item-main">
            <span class="badge badge-open">Held</span>
            <span class="item-title">${escapeHtml(c.student_name)}${c.student_id_no ? " (" + escapeHtml(c.student_id_no) + ")" : ""}</span>
            <div class="item-meta">Confiscated ${c.date_confiscated}</div>
            <div class="item-desc">${escapeHtml(c.reason)}</div>
          </div>
          <div class="actions">
            <button class="btn-outline" data-action="release-confiscated" data-id="${c.id}">Release</button>
            <button class="btn-outline" data-action="delete-confiscated" data-id="${c.id}">Delete</button>
          </div>
        </li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">None currently held.</div>`
      }
    </div>
    <div class="card">
      <h2>Released (${released.length})</h2>
      ${
        released.length
          ? `<ul class="list">${released
              .map(
                (c) => `
        <li>
          <div class="item-main">
            <span class="badge badge-done">Released</span>
            <span class="item-title">${escapeHtml(c.student_name)}${c.student_id_no ? " (" + escapeHtml(c.student_id_no) + ")" : ""}</span>
            <div class="item-meta">Confiscated ${c.date_confiscated} &middot; Released ${c.date_released || ""}</div>
            <div class="item-desc">${escapeHtml(c.reason)}</div>
            ${c.released_by || c.release_reason ? `<div class="item-desc">Released by ${escapeHtml(c.released_by || "unspecified")}${c.release_reason ? ": " + escapeHtml(c.release_reason) : ""}</div>` : ""}
          </div>
          <div class="actions">
            <button class="btn-outline" data-action="delete-confiscated" data-id="${c.id}">Delete</button>
          </div>
        </li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">No release history yet.</div>`
      }
    </div>
  `;
}

// ---------------- TASKS ----------------
function renderTasks() {
  const items = [...state.tasks];
  return `
    <div class="card">
      <h2>Add task</h2>
      <form id="task-form" class="form-grid">
        <div class="field">
          <label for="t-title">Task</label>
          <input type="text" id="t-title" required>
        </div>
        <div class="field">
          <label for="t-due">Due date</label>
          <input type="date" id="t-due">
        </div>
        <div class="form-actions"><button type="submit" class="btn">Add task</button></div>
      </form>
    </div>
    <div class="card">
      <h2>To-do list (${items.filter((t) => !Number(t.done)).length} pending)</h2>
      ${
        items.length
          ? `<ul class="list">${items
              .map(
                (t) => `
        <li>
          <div class="item-main">
            <label style="display:flex;gap:10px;align-items:center;cursor:pointer;">
              <input type="checkbox" class="req-check" data-action="toggle-task" data-id="${t.id}" ${Number(t.done) ? "checked" : ""}>
              <span style="${Number(t.done) ? "text-decoration:line-through;color:var(--muted);" : ""}">${escapeHtml(t.title)}</span>
            </label>
            ${t.due_date ? `<div class="item-meta" style="margin-left:28px;">Due ${t.due_date}</div>` : ""}
          </div>
          <div class="actions">
            <button class="btn-outline" data-action="delete-task" data-id="${t.id}">Delete</button>
          </div>
        </li>`,
              )
              .join("")}</ul>`
          : `<div class="empty">No tasks yet.</div>`
      }
    </div>
  `;
}

// ---------------- SETTINGS (modal, opened from gear icon) ----------------
function renderSettingsContent() {
  const depts = [...state.departments];
  return `
    <form id="dept-form" class="form-grid" style="margin-bottom:20px;">
      <div class="field field-full">
        <label for="dept-name">Department name</label>
        <input type="text" id="dept-name" placeholder="e.g. CCS, CBA, CON" required>
      </div>
      <div class="field">
        <label for="dept-color">Color</label>
        <input type="color" id="dept-color" value="#e8479d">
      </div>
      <div class="form-actions"><button type="submit" class="btn">Add department</button></div>
    </form>
    <div>
      ${
        depts.length
          ? depts
              .map(
                (d) => `
        <div class="dept-row">
          <input type="color" data-action="dept-color" data-id="${d.id}" value="${d.color}" title="Change color">
          <span class="dept-swatch" style="background:${d.color};"></span>
          <span class="dept-name">${escapeHtml(d.name)}</span>
          <button class="btn-outline" data-action="delete-dept" data-id="${d.id}">Delete</button>
        </div>
      `,
              )
              .join("")
          : `<div class="empty">No departments added yet.</div>`
      }
    </div>
  `;
}

function openSettingsModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box wide">
      <div class="modal-box-head">
        <h3>Departments</h3>
        <button type="button" class="modal-close" id="settings-close" aria-label="Close">&times;</button>
      </div>
      <div id="settings-body"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  function refresh() {
    document.getElementById("settings-body").innerHTML =
      renderSettingsContent();
    attachSettingsHandlers();
  }

  function attachSettingsHandlers() {
    const deptf = document.getElementById("dept-form");
    if (deptf)
      deptf.addEventListener("submit", async (e) => {
        e.preventDefault();
        await api("add_department", {
          name: val("dept-name"),
          color: document.getElementById("dept-color").value,
        });
        await loadAll();
        refresh();
        showToast("Department added.");
      });
    qsa('[data-action="dept-color"]', null, "change", async (input) => {
      const dept = state.departments.find(
        (d) => String(d.id) === input.dataset.id,
      );
      if (!dept) return;
      await api("update_department", {
        id: input.dataset.id,
        name: dept.name,
        color: input.value,
      });
      await loadAll();
      refresh();
      if (activeTab === "departments") render();
      showToast("Color updated.");
    });
    qsa('[data-action="delete-dept"]', async (b) => {
      await api("delete_department", { id: b.dataset.id });
      await loadAll();
      refresh();
      if (activeTab === "departments") render();
      showToast("Department removed.");
    });
  }

  refresh();

  document
    .getElementById("settings-close")
    .addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

document
  .getElementById("settings-btn")
  .addEventListener("click", openSettingsModal);

// ---------------- EVENT HANDLERS ----------------
function attachHandlers() {
  const cf = document.getElementById("complaint-form");
  if (cf)
    cf.addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("add_complaint", {
        name: val("c-name"),
        course: val("c-course"),
        type: val("c-type"),
        description: val("c-desc"),
      });
      await loadAll();
      setActiveTab("complaints");
      showToast("Entry added.");
    });
  qsa('[data-action="delete-complaint"]', async (b) => {
    await api("delete_complaint", { id: b.dataset.id });
    await loadAll();
    setActiveTab("complaints");
    showToast("Entry deleted.");
  });
  qsa('[data-action="status"]', null, "change", async (sel) => {
    await api("update_complaint_status", {
      id: sel.dataset.id,
      status: sel.value,
    });
    await loadAll();
    setActiveTab("complaints");
    showToast("Status updated.");
  });

  const docf = document.getElementById("document-form");
  if (docf)
    docf.addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("add_document", {
        direction: val("doc-direction"),
        tracking_no: val("doc-tracking"),
        subject: val("doc-subject"),
        party: val("doc-party"),
        notes: val("doc-notes"),
      });
      await loadAll();
      setActiveTab("documents");
      showToast("Paper logged.");
    });
  qsa('[data-action="doc-status"]', null, "change", async (sel) => {
    await api("update_document_status", {
      id: sel.dataset.id,
      status: sel.value,
    });
    await loadAll();
    setActiveTab("documents");
    showToast("Status updated.");
  });
  qsa('[data-action="delete-document"]', async (b) => {
    await api("delete_document", { id: b.dataset.id });
    await loadAll();
    setActiveTab("documents");
    showToast("Entry deleted.");
  });

  const df = document.getElementById("activity-form");
  if (df)
    df.addEventListener("submit", async (e) => {
      e.preventDefault();
      const reqsRaw = val("d-reqs");
      const requirements = reqsRaw
        ? reqsRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      await api("add_activity", {
        department: val("d-dept"),
        activity_name: val("d-name"),
        activity_date: val("d-date"),
        notes: val("d-notes"),
        requirements,
      });
      await loadAll();
      setActiveTab("departments");
      showToast("Activity added.");
    });
  qsa('[data-action="toggle-activity"]', (btn) => {
    const id = btn.dataset.id;
    if (openActivityIds.has(id)) openActivityIds.delete(id);
    else openActivityIds.add(id);
    render();
  });
  qsa('[data-action="toggle-req"]', async (cb) => {
    await api("toggle_requirement", {
      id: cb.dataset.id,
      submitted: cb.checked ? 1 : 0,
    });
    await loadAll();
    setActiveTab("departments");
  });
  qsa('[data-action="delete-req"]', async (btn) => {
    await api("delete_requirement", { id: btn.dataset.id });
    await loadAll();
    setActiveTab("departments");
    showToast("Requirement removed.");
  });
  qsa('[data-action="add-req"]', async (btn) => {
    const input = document.querySelector(`[data-new-req="${btn.dataset.id}"]`);
    const name = input.value.trim();
    if (!name) {
      showToast("Enter a requirement name first.");
      return;
    }
    await api("add_requirement", {
      activity_id: btn.dataset.id,
      requirement_name: name,
    });
    openActivityIds.add(btn.dataset.id);
    await loadAll();
    setActiveTab("departments");
    showToast("Requirement added.");
  });
  qsa('[data-action="delete-activity"]', async (btn) => {
    await api("delete_activity", { id: btn.dataset.id });
    await loadAll();
    setActiveTab("departments");
    showToast("Activity deleted.");
  });

  const rf = document.getElementById("record-form");
  if (rf)
    rf.addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("add_record", {
        name: val("r-name"),
        student_id: val("r-id"),
        course: val("r-course"),
        contact: val("r-contact"),
        notes: val("r-notes"),
      });
      await loadAll();
      setActiveTab("records");
      showToast("Record added.");
    });
  const searchEl = document.getElementById("record-search");
  if (searchEl) {
    renderRecordsList("");
    searchEl.addEventListener("input", () => renderRecordsList(searchEl.value));
  }

  const vf = document.getElementById("visitor-form");
  if (vf)
    vf.addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("add_visitor", {
        name: val("v-name"),
        purpose: val("v-purpose"),
        visit_time: val("v-time"),
      });
      await loadAll();
      setActiveTab("visitors");
      showToast("Visitor logged.");
    });
  qsa('[data-action="delete-visitor"]', async (b) => {
    await api("delete_visitor", { id: b.dataset.id });
    await loadAll();
    setActiveTab("visitors");
    showToast("Visitor removed.");
  });

  const cif = document.getElementById("confiscated-form");
  if (cif)
    cif.addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("add_confiscated_id", {
        student_name: val("ci-name"),
        student_id_no: val("ci-id"),
        reason: val("ci-reason"),
      });
      await loadAll();
      setActiveTab("confiscated");
      showToast("Logged.");
    });
  qsa('[data-action="release-confiscated"]', (btn) => {
    openReleaseDialog(btn.dataset.id);
  });
  qsa('[data-action="delete-confiscated"]', async (b) => {
    await api("delete_confiscated_id", { id: b.dataset.id });
    await loadAll();
    setActiveTab("confiscated");
    showToast("Entry deleted.");
  });

  const tf = document.getElementById("task-form");
  if (tf)
    tf.addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("add_task", { title: val("t-title"), due_date: val("t-due") });
      await loadAll();
      setActiveTab("tasks");
      showToast("Task added.");
    });
  qsa('[data-action="toggle-task"]', null, "change", async (cb) => {
    await api("toggle_task", { id: cb.dataset.id, done: cb.checked ? 1 : 0 });
    await loadAll();
    setActiveTab("tasks");
  });
  qsa('[data-action="delete-task"]', async (b) => {
    await api("delete_task", { id: b.dataset.id });
    await loadAll();
    setActiveTab("tasks");
    showToast("Task deleted.");
  });
}

function openReleaseDialog(id) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-box-head">
        <h3>Release ID</h3>
        <button type="button" class="modal-close" id="rel-close" aria-label="Close">&times;</button>
      </div>
      <form id="release-form" class="form-grid">
        <div class="field field-full">
          <label for="rel-by">Released by</label>
          <input type="text" id="rel-by" placeholder="Your name" required>
        </div>
        <div class="field field-full">
          <label for="rel-reason">Reason for release</label>
          <input type="text" id="rel-reason" required>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-outline" id="rel-cancel">Cancel</button>
          <button type="submit" class="btn">Release</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  document.getElementById("rel-close").addEventListener("click", close);
  document.getElementById("rel-cancel").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document
    .getElementById("release-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await api("release_confiscated_id", {
        id,
        released_by: document.getElementById("rel-by").value.trim(),
        release_reason: document.getElementById("rel-reason").value.trim(),
      });
      overlay.remove();
      await loadAll();
      setActiveTab("confiscated");
      showToast("ID released.");
    });
}

// ---------------- GLOBAL SEARCH ----------------
function setupSearch() {
  const input = document.getElementById("global-search");
  const resultsEl = document.getElementById("search-results");
  if (!input || !resultsEl) return;
  let debounce;

  const typeMeta = {
    complaints: { label: "Complaint/Request", tab: "complaints" },
    records: { label: "Student record", tab: "records" },
    documents: { label: "Document", tab: "documents" },
    confiscated: { label: "Confiscated ID", tab: "confiscated" },
  };

  input.addEventListener("input", () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (!q) {
      resultsEl.classList.remove("show");
      resultsEl.innerHTML = "";
      return;
    }
    debounce = setTimeout(async () => {
      const res = await api("search_all", { q });
      renderResults(res.results, q);
    }, 250);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) resultsEl.classList.remove("show");
  });

  function renderResults(results, q) {
    if (!results.length) {
      resultsEl.innerHTML = `<div class="search-empty">No matches for "${escapeHtml(q)}"</div>`;
    } else {
      resultsEl.innerHTML = results
        .map(
          (r) => `
        <button type="button" class="search-result-item" data-tab="${typeMeta[r.type].tab}">
          <div class="search-result-type">${typeMeta[r.type].label}</div>
          <div class="search-result-title">${escapeHtml(r.title)}</div>
          ${r.subtitle && r.subtitle.trim() ? `<div class="search-result-subtitle">${escapeHtml(r.subtitle)}</div>` : ""}
        </button>
      `,
        )
        .join("");
      resultsEl.querySelectorAll(".search-result-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          setActiveTab(btn.dataset.tab);
          input.value = "";
          resultsEl.classList.remove("show");
        });
      });
    }
    resultsEl.classList.add("show");
  }
}

loadAll();
setupSearch();
