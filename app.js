/* =========================================================
   StackLink PNU – User Interface (Sprint 1)
   Screens: Sign in · Profile & Skills · Create Request ·
            Browse & Filter · Request Details / Join · My Activity
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = () => $("#view");

const CAT_CLASS = { "Study Session": "cat-study", "Hackathon": "cat-hack", "Graduation Project": "cat-grad" };
const CAT_ICON = { "Study Session": "📚", "Hackathon": "⚡", "Graduation Project": "🎓" };

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function initials(name) { return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase(); }

function toast(msg, type = "ok") {
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2600);
}

function liveClear(form) {
  if (form._live) return; form._live = true;
  const clear = e => { let n = e.target.name; if (!n) return; e.target.classList.remove("invalid");
    const grp = e.target.closest("[data-group]"); if (grp) { n = grp.dataset.group; grp.querySelectorAll("select").forEach(s => s.classList.remove("invalid")); }
    const el = form.querySelector(`[data-error="${n}"]`); if (el) el.textContent = ""; };
  form.addEventListener("input", clear); form.addEventListener("change", clear);
}
function showErrors(form, errors) {
  liveClear(form);
  form.querySelectorAll(".field-error").forEach(e => e.textContent = "");
  form.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
  Object.entries(errors).forEach(([k, msg]) => {
    const el = form.querySelector(`[data-error="${k}"]`);
    if (el) el.textContent = msg;
    const input = form.querySelector(`[name="${k}"]`);
    if (input) input.classList.add("invalid");
    form.querySelectorAll(`[data-group="${k}"] select`).forEach(s => s.classList.add("invalid"));
  });
}

/* ---------------- header ---------------- */
function renderHeader() {
  const u = Store.currentUser();
  const nav = $("#nav");
  const user = $("#user-chip");
  if (!u) { nav.innerHTML = ""; user.innerHTML = ""; return; }
  const route = location.hash.split("/")[1] || "browse";
  const link = (r, label) => `<a href="#/${r}" class="${route === r ? "active" : ""}">${label}</a>`;
  nav.innerHTML = link("browse", "Browse") + link("create", "Create Request") + link("collabs", "My Collaborations") + link("activity", "My Activity") + link("profile", "My Profile");
  const n = Store.unreadCount();
  user.innerHTML = `<a href="#/notifications" class="bell ${route === "notifications" ? "active" : ""}" title="Notifications" aria-label="Notifications">🔔${n ? `<span class="bell-count">${n}</span>` : ""}</a>
    <span class="avatar sm">${esc(initials(u.name))}</span><span class="uname">${esc(u.name.split(" ")[0])}</span>
    <button class="link-btn" id="signout">Sign out</button>`;
  $("#signout").onclick = () => { Store.signOut(); location.hash = "#/login"; };
}

/* ---------------- sign in ---------------- */
function viewLogin() {
  view().innerHTML = `
  <section class="auth">
    <div class="auth-intro">
      <h1>Where minds combine<br><span>&amp; visions refine</span></h1>
      <p>StackLink PNU helps Computer Science students at Princess Nourah University form balanced teams for
      study sessions, hackathons and graduation projects, by seeing skills and preferences <em>before</em> committing.</p>
      <ul class="intro-points">
        <li><b>Build your profile</b> with your level, work mode and skills</li>
        <li><b>Post a request</b> with the roles your team needs</li>
        <li><b>Find and join</b> the right collaboration</li>
      </ul>
    </div>
    <form class="card auth-card" id="login-form" novalidate>
      <h2>Sign in</h2>
      <p class="muted">Use your PNU university email. New students get an account automatically.</p>
      <label>Full name <span class="hint">(new accounts only)</span>
        <input name="name" placeholder="e.g. Fajer Alanazi" autocomplete="name"></label>
      <span class="field-error" data-error="name"></span>
      <label>University email
        <input name="email" type="email" placeholder="name${Store.PNU_DOMAIN}" autocomplete="email"></label>
      <span class="field-error" data-error="email"></span>
      <button class="btn primary full" type="submit">Continue</button>
      <p class="demo">Demo account: <a href="#" id="demo">sara.alharbi${Store.PNU_DOMAIN}</a></p>
    </form>
  </section>`;
  const form = $("#login-form");
  $("#demo").onclick = e => { e.preventDefault(); form.email.value = "sara.alharbi" + Store.PNU_DOMAIN; };
  form.onsubmit = e => {
    e.preventDefault();
    const res = Store.signIn(form.name.value, form.email.value);
    if (!res.ok) return showErrors(form, res.errors);
    toast("Welcome, " + res.user.name.split(" ")[0] + "!");
    location.hash = res.isNew ? "#/profile" : "#/browse";
  };
}

/* ---------------- PB-01 + PB-02: profile & skills ---------------- */
function viewProfile() {
  const u = Store.currentUser();
  const opt = (list, val) => list.map(x => `<option ${x === val ? "selected" : ""}>${x}</option>`).join("");
  const radios = Store.WORK_MODES.map(m => `<label class="pill-radio"><input type="radio" name="workMode" value="${m}" ${u.workMode === m ? "checked" : ""}><span>${m}</span></label>`).join("");
  const tags = (list, chosen, group) => list.map(s => `<button type="button" class="tag ${chosen.includes(s) ? "on" : ""}" data-group="${group}" data-skill="${esc(s)}">${esc(s)}</button>`).join("");
  const incomplete = !Store.isProfileComplete(u);
  view().innerHTML = `
  <div class="page-head">
    <div><h1>My Profile</h1><p class="muted">This is what other students see before teaming up with you.</p></div>
  </div>
  ${incomplete ? `<div class="notice">👋 Complete your profile first so other students can understand your background.</div>` : ""}
  <div class="grid-2">
    <div>
      <form class="card" id="profile-form" novalidate>
        <h2><span class="step">1</span> Academic background</h2>
        <div class="row-2">
          <div><label>Major<select name="major"><option value="">Select…</option>${opt(Store.MAJORS, u.major)}</select></label><span class="field-error" data-error="major"></span></div>
          <div><label>Academic level<select name="level"><option value="">Select…</option>${opt(Store.LEVELS, u.level)}</select></label><span class="field-error" data-error="level"></span></div>
        </div>
        <label>Preferred work mode</label>
        <div class="pill-group">${radios}</div>
        <span class="field-error" data-error="workMode"></span>
        <label>Short bio <span class="hint" id="bio-count"></span>
          <textarea name="bio" rows="3" maxlength="300" placeholder="Interests, working style, what you are looking for…">${esc(u.bio)}</textarea></label>
        <span class="field-error" data-error="bio"></span>
        <button class="btn primary" type="submit">Save profile</button>
      </form>
      <div class="card" id="skills-card">
        <h2><span class="step">2</span> Skills</h2>
        <p class="muted">Choose from the predefined tags so matching is accurate.</p>
        <h3>Technical skills</h3><div class="tags">${tags(Store.TECH_SKILLS, u.techSkills, "tech")}</div>
        <h3>Soft skills</h3><div class="tags">${tags(Store.SOFT_SKILLS, u.softSkills, "soft")}</div>
        <button class="btn primary" id="save-skills">Save skills</button>
      </div>
    </div>
    <aside class="card preview" id="preview"></aside>
  </div>`;
  const form = $("#profile-form");
  const count = () => $("#bio-count").textContent = `${form.bio.value.length}/300`;
  form.bio.oninput = count; count();
  form.onsubmit = e => {
    e.preventDefault();
    const res = Store.saveProfile({ major: form.major.value, level: form.level.value, workMode: (form.workMode.value || ""), bio: form.bio.value });
    if (!res.ok) { showErrors(form, res.errors); toast("Please fix the highlighted fields.", "err"); return; }
    showErrors(form, {}); const n = $(".notice"); if (n) n.remove(); renderPreview(); toast("Profile saved ✔");
  };
  $("#skills-card").querySelectorAll(".tag").forEach(b => b.onclick = () => b.classList.toggle("on"));
  $("#save-skills").onclick = () => {
    const pick = g => [...document.querySelectorAll(`.tag.on[data-group="${g}"]`)].map(b => b.dataset.skill);
    Store.saveSkills(pick("tech"), pick("soft"));
    renderPreview(); toast("Skills saved ✔");
  };
  renderPreview();
}

function profileCard(u) {
  const chips = (arr, cls) => arr.length ? arr.map(s => `<span class="chip ${cls}">${esc(s)}</span>`).join("") : `<span class="muted small">None added yet</span>`;
  return `
    <div class="pc-top"><span class="avatar">${esc(initials(u.name))}</span>
      <div><h3>${esc(u.name)}</h3><p class="muted small">${esc(u.email)}</p></div></div>
    <dl class="facts">
      <div><dt>Major</dt><dd>${esc(u.major || "—")}</dd></div>
      <div><dt>Level</dt><dd>${esc(u.level || "—")}</dd></div>
      <div><dt>Work mode</dt><dd>${esc(u.workMode || "—")}</dd></div>
    </dl>
    <p class="bio">${esc(u.bio || "No bio yet.")}</p>
    <h4>Technical skills</h4><div class="chips">${chips(u.techSkills, "tech")}</div>
    <h4>Soft skills</h4><div class="chips">${chips(u.softSkills, "soft")}</div>`;
}
function renderPreview() {
  $("#preview").innerHTML = `<p class="eyebrow">Profile preview</p>` + profileCard(Store.currentUser());
}

/* ---------------- PB-03 + PB-20: create / edit request ---------------- */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function viewRequestForm(editId) {
  const u = Store.currentUser();
  if (!Store.isProfileComplete(u)) {
    view().innerHTML = `<div class="card empty"><h2>Complete your profile first</h2><p class="muted">Other students review your profile before joining your request.</p><a class="btn primary" href="#/profile">Go to my profile</a></div>`;
    return;
  }
  const ex = editId ? Store.getRequest(editId) : null;
  if (editId && (!ex || ex.ownerId !== u.id)) { view().innerHTML = `<div class="card empty"><h2>You cannot edit this request</h2><a class="btn" href="#/browse">Back</a></div>`; return; }
  const v = ex || { category: "", title: "", description: "", date: "", locationType: "", location: "", roles: [], maxSize: 4, seeking: "Team" };
  const [yy, mm, dd] = v.date ? v.date.split("-") : ["", "", ""];
  const sel = (a, b) => a === b ? "selected" : "";
  const cats = Store.CATEGORIES.map(c => `<label class="cat-option ${CAT_CLASS[c]}"><input type="radio" name="category" value="${c}" ${v.category === c ? "checked" : ""}><span>${CAT_ICON[c]} ${c}</span></label>`).join("");
  view().innerHTML = `
  ${ex ? `<a class="back" href="#/request/${ex.id}">← Back to the request</a>` : ""}
  <div class="page-head"><div><h1>${ex ? "Edit Collaboration Request" : "Create a Collaboration Request"}</h1><p class="muted">${ex ? "Members and pending applicants will be notified about the changes." : "Describe the opportunity so students can decide before joining."}</p></div></div>
  <form class="card form-wide" id="req-form" novalidate>
    <label>Category</label>
    <div class="cat-group">${cats}</div><span class="field-error" data-error="category"></span>
    <label>Title<input name="title" value="${esc(v.title)}" placeholder="e.g. Algorithms final exam review"></label><span class="field-error" data-error="title"></span>
    <label>Description <span class="hint">(optional)</span><textarea name="description" rows="2" placeholder="What is the goal of this collaboration?">${esc(v.description)}</textarea></label>
    <div class="row-3">
      <div><label>Date</label><div class="date-select" data-group="date">
        <select name="dDay" aria-label="Day"><option value="">Day</option>${Array.from({length:31},(_,i)=>{const x=String(i+1).padStart(2,"0");return `<option value="${x}" ${sel(x,dd)}>${i+1}</option>`;}).join("")}</select>
        <select name="dMonth" aria-label="Month"><option value="">Month</option>${MONTHS.map((m,i)=>{const x=String(i+1).padStart(2,"0");return `<option value="${x}" ${sel(x,mm)}>${m}</option>`;}).join("")}</select>
        <select name="dYear" aria-label="Year"><option value="">Year</option>${[0,1].map(k=>String(new Date().getFullYear()+k)).map(y=>`<option ${sel(y,yy)}>${y}</option>`).join("")}</select>
      </div><span class="field-error" data-error="date"></span></div>
      <div><label>Location type<select name="locationType"><option value="">Select…</option><option ${sel("Online",v.locationType)}>Online</option><option ${sel("Offline",v.locationType)}>Offline</option></select></label><span class="field-error" data-error="locationType"></span></div>
      <div><label>Place / platform<input name="location" value="${esc(v.location)}" placeholder="e.g. Building 7 or Teams"></label><span class="field-error" data-error="location"></span></div>
    </div>
    <label>Needed roles <span class="hint">(press Enter to add)</span></label>
    <div class="role-input"><div id="roles" class="chips"></div><input id="role-entry" placeholder="e.g. Front-end Developer"></div>
    <span class="field-error" data-error="roles"></span>
    <div class="row-2">
      <div><label>Maximum group size <span class="hint">(including you)</span><input type="number" name="maxSize" min="2" max="10" value="${v.maxSize}"></label><span class="field-error" data-error="maxSize"></span></div>
      <div><label>Looking for</label><div class="pill-group">
        <label class="pill-radio"><input type="radio" name="seeking" value="Partner" ${v.seeking === "Partner" ? "checked" : ""}><span>A partner</span></label>
        <label class="pill-radio"><input type="radio" name="seeking" value="Team" ${v.seeking === "Team" ? "checked" : ""}><span>A team</span></label></div>
        <span class="field-error" data-error="seeking"></span></div>
    </div>
    <div class="actions"><a class="btn ghost" href="${ex ? "#/request/" + ex.id : "#/browse"}">Cancel</a><button class="btn primary" type="submit">${ex ? "Save changes" : "Publish request"}</button></div>
  </form>`;
  const roles = [...v.roles];
  const drawRoles = () => $("#roles").innerHTML = roles.map((r, i) => `<span class="chip role">${esc(r)}<button type="button" data-i="${i}" aria-label="remove">×</button></span>`).join("");
  drawRoles();
  $("#role-entry").onkeydown = e => {
    if (e.key === "Enter") { e.preventDefault(); const x = e.target.value.trim(); if (x && !roles.includes(x)) { roles.push(x); drawRoles(); $('[data-error="roles"]').textContent = ""; } e.target.value = ""; }
  };
  $("#roles").onclick = e => { if (e.target.dataset.i) { roles.splice(+e.target.dataset.i, 1); drawRoles(); } };
  const form = $("#req-form");
  form.onsubmit = e => {
    e.preventDefault();
    const pending = $("#role-entry").value.trim(); if (pending && !roles.includes(pending)) { roles.push(pending); drawRoles(); $("#role-entry").value = ""; }
    const val = n => (form.querySelector(`[name="${n}"]:checked`) || {}).value || "";
    const data = { category: val("category"), title: form.title.value, description: form.description.value,
      date: readDate(form), locationType: form.locationType.value, location: form.location.value, roles, maxSize: form.maxSize.value, seeking: val("seeking") };
    const res = ex ? Store.updateRequest(ex.id, data) : Store.createRequest(data);
    if (!res.ok) { showErrors(form, res.errors); toast("Please fix the highlighted fields.", "err"); return; }
    toast(ex ? "Changes saved ✔" : "Request published ✔");
    location.hash = "#/request/" + res.request.id;
  };
}

function readDate(form) {
  const d = form.dDay.value, m = form.dMonth.value, y = form.dYear.value;
  if (!d || !m || !y) return "";
  const iso = `${y}-${m}-${d}`;
  const dt = new Date(iso + "T00:00:00");
  return dt.getMonth() + 1 === +m ? iso : "invalid";
}

/* ---------------- PB-04: browse & filter ---------------- */
let browseState = { category: "All", query: "" };
function viewBrowse() {
  const tabs = ["All", ...Store.CATEGORIES].map(c => `<button class="tab ${browseState.category === c ? "on" : ""}" data-cat="${c}">${c === "All" ? "All" : CAT_ICON[c] + " " + c}</button>`).join("");
  const soon = Store.myCollaborations().filter(r => r.status !== "Completed" && Store.daysUntil(r.date) >= 0 && Store.daysUntil(r.date) <= 2);
  view().innerHTML = `
  ${soon.length ? `<div class="reminder">⏰ <b>Coming up:</b> ${soon.map(r => `<a href="#/request/${r.id}">${esc(r.title)}</a> (${whenText(r.date)})`).join(" · ")}</div>` : ""}
  <div class="page-head"><div><h1>Active Collaboration Requests</h1><p class="muted">Find a study session, hackathon team or graduation project that fits you.</p></div>
    <a class="btn primary" href="#/create">+ New request</a></div>
  <div class="filters"><div class="tabs">${tabs}</div>
    <input class="search" id="search" placeholder="Search by title, role or keyword…" value="${esc(browseState.query)}"></div>
  <p class="muted small" id="count"></p>
  <div class="cards" id="list"></div>`;
  view().querySelectorAll(".tab").forEach(b => b.onclick = () => { browseState.category = b.dataset.cat; viewBrowse(); });
  $("#search").oninput = e => { browseState.query = e.target.value; drawList(); };
  drawList();
}
function whenText(iso) { const n = Store.daysUntil(iso); return n === 0 ? "today" : n === 1 ? "tomorrow" : n > 1 ? `in ${n} days` : fmtDate(iso); }
const STATUS_BADGE = { Pending: "pending", Accepted: "ok", Declined: "no", Withdrawn: "muted-b", Open: "ok", Confirmed: "ok", Full: "full", Closed: "muted-b", Completed: "done" };
function badge(s, big) { return `<span class="badge st-${STATUS_BADGE[s] || "pending"}${big ? " big" : ""}">${s}</span>`; }
function requestCard(r) {
  const owner = Store.getUser(r.ownerId);
  const st = Store.joinStatus(r.id);
  const mine = r.ownerId === (Store.currentUser() || {}).id;
  const left = r.maxSize - Store.memberCount(r.id);
  return `<article class="req-card" onclick="location.hash='#/request/${r.id}'">
    <div class="req-top"><span class="badge ${CAT_CLASS[r.category]}">${CAT_ICON[r.category]} ${r.category}</span>
      ${mine ? `<span class="badge mine">Your request</span>` : st ? badge(st) : ""}</div>
    <h3>${esc(r.title)}</h3>
    <p class="meta">📅 ${fmtDate(r.date)}<br>📍 ${esc(r.locationType)} · ${esc(r.location)}</p>
    <div class="chips">${r.roles.map(x => `<span class="chip role">${esc(x)}</span>`).join("")}</div>
    <div class="req-foot"><span class="owner"><span class="avatar xs">${esc(initials(owner.name))}</span>${esc(owner.name)}</span>
      <span class="muted small">Seeking a ${r.seeking.toLowerCase()} · ${left} spot${left === 1 ? "" : "s"} left of ${r.maxSize}</span></div>
  </article>`;
}
function drawList() {
  const list = Store.listActive(browseState);
  $("#count").textContent = `${list.length} active request${list.length === 1 ? "" : "s"}`;
  $("#list").innerHTML = list.length ? list.map(requestCard).join("") :
    `<div class="card empty"><h3>No active requests found</h3><p class="muted">Try another category or keyword, or create your own request.</p></div>`;
}

/* ---------------- PB-05/06/07/08/10/15/20: request details ---------------- */
function viewRequest(id) {
  const r = Store.getRequest(id);
  if (!r) { view().innerHTML = `<div class="card empty"><h2>Request not found</h2><a class="btn" href="#/browse">Back to browse</a></div>`; return; }
  const me = Store.currentUser();
  const owner = Store.getUser(r.ownerId);
  const mine = r.ownerId === me.id;
  const st = Store.joinStatus(r.id);
  const applicants = Store.applicantsFor(r.id).filter(a => a.status !== "Withdrawn");
  const members = Store.membersOf(r.id);
  const count = members.length, full = count >= r.maxSize;
  let action;
  if (mine) {
    const pend = applicants.filter(a => a.status === "Pending").length;
    action = `<p class="eyebrow">Owner tools</p>
      <div class="status-row">${badge(r.status, true)}<span class="muted">${count}/${r.maxSize} members · ${pend} pending</span></div>
      <div class="tool-btns">
        ${["Open", "Full"].includes(r.status) ? `<a class="btn" href="#/edit/${r.id}">✏️ Edit request</a>` : ""}
        ${["Open", "Full"].includes(r.status) ? `<button class="btn" id="close-req">🔒 Close request</button>` : ""}
        ${r.status !== "Completed" && r.status !== "Closed" ? `<button class="btn primary" id="complete-req">✅ Mark as completed</button>` : ""}
      </div>`;
  } else if (st === "Accepted") action = `<div class="status-box">${badge("Accepted", true)}<p class="muted">You are a member of this collaboration. It appears in <a href="#/collabs">My Collaborations</a>.</p></div>`;
  else if (st === "Declined") action = `<div class="status-box">${badge("Declined", true)}<p class="muted">The owner declined this join request.</p></div>`;
  else if (st === "Pending") action = `<div class="status-box">${badge("Pending", true)}<p class="muted">Your join request stays pending until ${esc(owner.name.split(" ")[0])} responds.</p>
      <button class="btn ghost full" id="withdraw">↩️ Withdraw my request</button></div>`;
  else if (r.status === "Full") action = `<div class="notice">This team is full (${count}/${r.maxSize} members).</div>`;
  else if (r.status !== "Open") action = `<div class="notice">This request is ${r.status.toLowerCase()}.</div>`;
  else if (!Store.isProfileComplete(me)) action = `<div class="notice">Complete <a href="#/profile">your profile</a> before sending a join request.</div>`;
  else action = `<form id="join-form"><label>Message to the owner <span class="hint">(optional)</span>
      <textarea name="message" rows="2" placeholder="Why are you a good fit?"></textarea></label>
      <button class="btn primary full" type="submit">Send join request</button></form>`;
  const appList = mine ? `<h4>Join requests (${applicants.length})</h4>${applicants.length ? `<ul class="applicants">${applicants.map(a => `
      <li><span class="avatar xs">${esc(initials(a.user.name))}</span><div class="ap-main"><b>${esc(a.user.name)}</b>
        <span class="muted small">${esc(a.user.major)} · ${esc(a.user.level)} · ${a.user.techSkills.slice(0, 3).map(esc).join(", ")}</span>
        ${a.message ? `<span class="ap-msg">“${esc(a.message)}”</span>` : ""}</div>
        <div class="ap-act"><a class="btn sm" href="#/student/${a.user.id}?req=${r.id}">View profile</a>
        ${a.status === "Pending" ? `<button class="btn sm primary" data-acc="${a.id}" ${full ? "disabled title='Team is full'" : ""}>Accept</button><button class="btn sm danger" data-dec="${a.id}">Decline</button>` : badge(a.status)}</div></li>`).join("")}</ul>` : `<p class="muted">No join requests yet.</p>`}` : "";
  view().innerHTML = `
  <a class="back" href="#/browse">← Back to requests</a>
  <div class="grid-2">
    <div class="card">
      <span class="badge ${CAT_CLASS[r.category]}">${CAT_ICON[r.category]} ${r.category}</span> ${!mine ? badge(r.status) : ""}
      <h1 class="req-title">${esc(r.title)}</h1>
      <p>${esc(r.description || "No description provided.")}</p>
      <dl class="facts wide">
        <div><dt>Date</dt><dd>${fmtDate(r.date)}</dd></div>
        <div><dt>Location</dt><dd>${esc(r.locationType)} · ${esc(r.location)}</dd></div>
        <div><dt>Looking for</dt><dd>A ${r.seeking.toLowerCase()}</dd></div>
        <div><dt>Team</dt><dd>${count} of ${r.maxSize} members</dd></div>
      </dl>
      <div class="meter"><span style="width:${Math.min(100, count / r.maxSize * 100)}%"></span></div>
      <h4>Needed roles</h4><div class="chips">${r.roles.map(x => `<span class="chip role">${esc(x)}</span>`).join("")}</div>
      <h4>Members</h4><div class="chips">${members.map(m => `<span class="chip member"><span class="avatar xs">${esc(initials(m.name))}</span>${esc(m.name)}${m.id === r.ownerId ? " (owner)" : ""}</span>`).join("")}</div>
      ${appList}
    </div>
    <aside>
      <div class="card">${action}</div>
      <div class="card"><p class="eyebrow">Posted by</p>${profileCard(owner)}</div>
    </aside>
  </div>`;
  const jf = $("#join-form");
  if (jf) jf.onsubmit = e => {
    e.preventDefault();
    const res = Store.sendJoinRequest(r.id, jf.message.value);
    if (!res.ok) { toast(res.error, "err"); return; }
    toast("Join request sent ✔"); router();
  };
  const w = $("#withdraw"); if (w) w.onclick = () => { if (!confirm("Withdraw your join request?")) return; const res = Store.withdrawJoin(r.id); toast(res.ok ? "Join request withdrawn" : res.error, res.ok ? "ok" : "err"); router(); };
  view().querySelectorAll("[data-acc]").forEach(b => b.onclick = () => { const res = Store.decideJoin(b.dataset.acc, "Accepted"); if (!res.ok) return toast(res.error, "err"); toast(res.full ? "Accepted ✔ – the team is now full" : "Member accepted ✔"); router(); });
  view().querySelectorAll("[data-dec]").forEach(b => b.onclick = () => { const res = Store.decideJoin(b.dataset.dec, "Declined"); if (!res.ok) return toast(res.error, "err"); toast("Join request declined"); router(); });
  const cr = $("#close-req"); if (cr) cr.onclick = () => { if (!confirm("Close this request? Pending applicants will be notified.")) return; Store.closeRequest(r.id); toast("Request closed"); router(); };
  const cp = $("#complete-req"); if (cp) cp.onclick = () => { if (!confirm("Mark this collaboration as completed?")) return; const res = Store.completeCollaboration(r.id); if (!res.ok) return toast(res.error, "err"); toast("Collaboration completed ✅"); router(); };
}

/* ---------------- PB-06: applicant profile ---------------- */
function viewStudent(id, reqId) {
  const u = Store.getUser(id);
  if (!u) { view().innerHTML = `<div class="card empty"><h2>Student not found</h2></div>`; return; }
  const join = reqId ? Store.applicantsFor(reqId).find(a => a.user.id === id && a.status !== "Withdrawn") : null;
  const r = reqId ? Store.getRequest(reqId) : null;
  const canDecide = join && join.status === "Pending" && r && r.ownerId === Store.currentUser().id;
  view().innerHTML = `
  ${reqId ? `<a class="back" href="#/request/${reqId}">← Back to the request</a>` : `<a class="back" href="#/browse">← Back</a>`}
  <div class="grid-2">
    <div class="card">${profileCard(u)}
      <p class="muted small" style="margin-top:14px">Completed collaborations on StackLink: <b>${u.completedCount || 0}</b></p></div>
    ${join ? `<aside class="card"><p class="eyebrow">Join request for</p><h3>${esc(r.title)}</h3>
      ${join.message ? `<p class="ap-msg">“${esc(join.message)}”</p>` : `<p class="muted">No message.</p>`}
      <div class="status-row">${badge(join.status)}<span class="muted small">Sent ${new Date(join.createdAt).toLocaleDateString("en-GB")}</span></div>
      ${canDecide ? `<div class="tool-btns"><button class="btn primary" id="acc">Accept</button><button class="btn danger" id="dec">Decline</button></div>` : ""}</aside>` : ""}
  </div>`;
  if (canDecide) {
    $("#acc").onclick = () => { const res = Store.decideJoin(join.id, "Accepted"); if (!res.ok) return toast(res.error, "err"); toast("Member accepted ✔"); location.hash = "#/request/" + reqId; };
    $("#dec").onclick = () => { Store.decideJoin(join.id, "Declined"); toast("Join request declined"); location.hash = "#/request/" + reqId; };
  }
}

/* ---------------- PB-12 + PB-14: my collaborations ---------------- */
function viewCollabs() {
  const list = Store.myCollaborations();
  const upcoming = list.filter(r => r.status !== "Completed"), done = list.filter(r => r.status === "Completed");
  const row = r => {
    const n = Store.daysUntil(r.date), soon = r.status !== "Completed" && n >= 0 && n <= 2;
    return `<li class="collab ${soon ? "soon" : ""}"><div class="cal"><b>${new Date(r.date + "T00:00:00").getDate()}</b><span>${MONTHS[new Date(r.date + "T00:00:00").getMonth()]}</span></div>
      <div class="c-main"><a href="#/request/${r.id}"><b>${esc(r.title)}</b></a>
      <span class="muted small">${CAT_ICON[r.category]} ${r.category} · 📍 ${esc(r.locationType)} · ${esc(r.location)} · 👥 ${Store.memberCount(r.id)} members</span></div>
      ${soon ? `<span class="badge st-pending">⏰ ${whenText(r.date)}</span>` : badge(r.status === "Completed" ? "Completed" : "Confirmed")}</li>`;
  };
  view().innerHTML = `
  <div class="page-head"><div><h1>My Collaborations</h1><p class="muted">Confirmed collaborations where you are the owner or an accepted member.</p></div></div>
  <div class="card"><h2>Upcoming</h2>${upcoming.length ? `<ul class="collab-list">${upcoming.map(row).join("")}</ul>` : `<p class="muted">No confirmed collaborations yet. When an owner accepts you, or you accept a member, it appears here.</p>`}</div>
  <div class="card"><h2>Completed</h2>${done.length ? `<ul class="collab-list">${done.map(row).join("")}</ul>` : `<p class="muted">No completed collaborations yet.</p>`}</div>`;
}

/* ---------------- PB-09: notifications ---------------- */
function viewNotifications() {
  const list = Store.myNotifications();
  view().innerHTML = `
  <div class="page-head"><div><h1>Notifications</h1><p class="muted">Join requests, decisions, reminders and updates.</p></div></div>
  <div class="card">${list.length ? `<ul class="notif-list">${list.map(n => `<li class="${n.read ? "" : "unread"}"><a href="${n.link}">${esc(n.text)}</a><span class="muted small">${timeAgo(n.createdAt)}</span></li>`).join("")}</ul>` : `<p class="muted">You have no notifications yet.</p>`}</div>`;
  Store.markAllRead(); setTimeout(renderHeader, 1200);
}
function timeAgo(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "just now"; if (m < 60) return m + " min ago";
  const h = Math.round(m / 60); if (h < 24) return h + " h ago";
  return Math.round(h / 24) + " d ago";
}

/* ---------------- my activity ---------------- */
function viewActivity() {
  const mine = Store.myRequests();
  const joins = Store.myJoinRequests();
  view().innerHTML = `
  <div class="page-head"><div><h1>My Activity</h1><p class="muted">Your requests and the collaborations you asked to join.</p></div></div>
  <div class="grid-2 even">
    <div class="card"><h2>My collaboration requests</h2>
      ${mine.length ? `<ul class="act-list">${mine.map(r => `<li><a href="#/request/${r.id}">${esc(r.title)}</a>${badge(r.status)}<span class="muted small">${Store.memberCount(r.id)}/${r.maxSize} members · ${Store.applicantsFor(r.id).filter(a => a.status === "Pending").length} pending</span></li>`).join("")}</ul>` : `<p class="muted">You have not created any requests yet.</p><a class="btn" href="#/create">Create a request</a>`}
    </div>
    <div class="card"><h2>My join requests</h2>
      ${joins.length ? `<ul class="act-list">${joins.map(j => `<li><a href="#/request/${j.request.id}">${esc(j.request.title)}</a>${badge(j.status)}<span class="muted small">Sent ${new Date(j.createdAt).toLocaleDateString("en-GB")}</span>${j.status === "Pending" ? `<button class="btn sm ghost" data-wd="${j.request.id}">Withdraw</button>` : ""}</li>`).join("")}</ul>` : `<p class="muted">You have not sent any join requests yet.</p><a class="btn" href="#/browse">Browse requests</a>`}
    </div>
  </div>`;
  view().querySelectorAll("[data-wd]").forEach(b => b.onclick = () => { if (!confirm("Withdraw your join request?")) return; Store.withdrawJoin(b.dataset.wd); toast("Join request withdrawn"); router(); });
}

/* ---------------- router ---------------- */
function router() {
  const [path, query] = (location.hash || "#/browse").slice(2).split("?");
  const parts = path.split("/");
  const params = new URLSearchParams(query || "");
  const u = Store.currentUser();
  if (!u && parts[0] !== "login") { location.hash = "#/login"; return; }
  if (u && parts[0] === "login") { location.hash = "#/browse"; return; }
  if (u) Store.generateReminders();          // PB-14
  renderHeader();
  window.scrollTo(0, 0);
  switch (parts[0]) {
    case "login": return viewLogin();
    case "profile": return viewProfile();
    case "create": return viewRequestForm();
    case "edit": return viewRequestForm(parts[1]);
    case "request": return viewRequest(parts[1]);
    case "student": return viewStudent(parts[1], params.get("req"));
    case "collabs": return viewCollabs();
    case "notifications": return viewNotifications();
    case "activity": return viewActivity();
    default: return viewBrowse();
  }
}
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  $("#reset").onclick = e => { e.preventDefault(); if (confirm("Reset all demo data?")) { Store.reset(); location.hash = "#/login"; router(); } };
  router();
});
