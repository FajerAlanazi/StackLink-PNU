/* =========================================================
   StackLink PNU – Data Service (Sprint 1 + Sprint 2)
   Acts as the application's back-end layer: it stores data,
   validates input and enforces business rules.
   Data is persisted in the browser (localStorage).
   ========================================================= */

const Store = (() => {
  const KEY = "stacklink_pnu_v2";
  const PNU_DOMAIN = "@pnu.edu.sa";

  const CATEGORIES = ["Study Session", "Hackathon", "Graduation Project"];
  // Bachelor programs of the College of Computer and Information Sciences (pnu.edu.sa)
  const MAJORS = ["Computer Science", "Information Systems", "Information Technology", "Artificial Intelligence Sciences",
    "Data Science and Analytics", "Software Engineering", "Cybersecurity", "Internet of Things"];
  const LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8"];
  const WORK_MODES = ["Online", "In-person", "Hybrid"];
  const TECH_SKILLS = ["Python", "Java", "JavaScript", "HTML/CSS", "React", "Flutter", "SQL / Databases",
    "UI/UX Design", "Machine Learning", "Data Analysis", "Cybersecurity", "Networking", "Testing / QA", "Git"];
  const SOFT_SKILLS = ["Leadership", "Communication", "Time Management", "Problem Solving",
    "Presentation", "Teamwork", "Organization", "Creativity"];

  let memory = null; // fallback if localStorage is blocked

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); d.notifications = d.notifications || []; return d; }
    } catch (e) { if (memory) return memory; }
    const seeded = seed();
    save(seeded);
    return seeded;
  }

  function save(db) {
    memory = db;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* in-memory only */ }
  }

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  /* ---------- sample data so the platform is not empty ---------- */
  function seed() {
    const users = [
      { id: "u-sara", name: "Sara Alharbi", email: "sara.alharbi@pnu.edu.sa", major: "Computer Science", level: "Level 7",
        workMode: "Hybrid", bio: "Interested in web development and graduation project planning. I like clear task lists and weekly check-ins.",
        techSkills: ["JavaScript", "React", "UI/UX Design"], softSkills: ["Organization", "Communication"], completedCount: 1 },
      { id: "u-lama", name: "Lama Alqahtani", email: "lama.alqahtani@pnu.edu.sa", major: "Artificial Intelligence Sciences", level: "Level 5",
        workMode: "Online", bio: "Hackathon lover. Backend and databases are my thing.",
        techSkills: ["Python", "SQL / Databases", "Git"], softSkills: ["Problem Solving", "Teamwork"], completedCount: 2 },
      { id: "u-nouf", name: "Nouf Alshehri", email: "nouf.alshehri@pnu.edu.sa", major: "Software Engineering", level: "Level 3",
        workMode: "In-person", bio: "Looking for study partners for Data Structures and Discrete Math.",
        techSkills: ["Java", "Data Analysis"], softSkills: ["Time Management", "Presentation"], completedCount: 0 }
    ];
    const now = new Date();
    const inDays = d => { const x = new Date(now); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
    const ago = h => new Date(now.getTime() - h * 3600e3).toISOString();
    const requests = [
      { id: "r-1", ownerId: "u-sara", category: "Graduation Project", title: "Smart Campus Navigation App",
        description: "Building a graduation project team for an indoor navigation app for PNU buildings.",
        date: inDays(10), locationType: "Offline", location: "Building 7 – Library", roles: ["Front-end Developer", "Back-end Developer", "UI/UX Designer"],
        maxSize: 4, seeking: "Team", status: "Open", createdAt: ago(72) },
      { id: "r-2", ownerId: "u-lama", category: "Hackathon", title: "AI for Health Hackathon",
        description: "Need teammates for a 48-hour hackathon focused on AI solutions for healthcare.",
        date: inDays(6), locationType: "Online", location: "Microsoft Teams", roles: ["Machine Learning", "Presenter"],
        maxSize: 3, seeking: "Team", status: "Open", createdAt: ago(48) },
      { id: "r-3", ownerId: "u-nouf", category: "Study Session", title: "Data Structures Midterm Review",
        description: "Weekly study session to solve past exam questions together.",
        date: inDays(1), locationType: "Offline", location: "Building 1 – Study Room 12", roles: ["Study Partner"],
        maxSize: 5, seeking: "Partner", status: "Open", createdAt: ago(40) },
      { id: "r-4", ownerId: "u-sara", category: "Study Session", title: "Database Systems Lab Practice",
        description: "Practicing SQL queries before the lab exam.",
        date: inDays(-2), locationType: "Online", location: "Zoom", roles: ["Study Partner"],
        maxSize: 4, seeking: "Partner", status: "Closed", createdAt: ago(200) },
      { id: "r-5", ownerId: "u-lama", category: "Hackathon", title: "PNU Data Day Mini-Hackathon",
        description: "One-day hackathon on open data dashboards.",
        date: inDays(-12), locationType: "Offline", location: "Building 6 – Innovation Lab", roles: ["Data Analyst", "Front-end Developer"],
        maxSize: 3, seeking: "Team", status: "Completed", createdAt: ago(500) }
    ];
    const joinRequests = [
      { id: "j-1", requestId: "r-1", userId: "u-lama", message: "I can handle the back-end and the database.", status: "Pending", createdAt: ago(20) },
      { id: "j-2", requestId: "r-1", userId: "u-nouf", message: "I would like to help with testing and documentation.", status: "Accepted", createdAt: ago(30), decidedAt: ago(26) },
      { id: "j-3", requestId: "r-3", userId: "u-sara", message: "", status: "Accepted", createdAt: ago(30), decidedAt: ago(28) },
      { id: "j-4", requestId: "r-5", userId: "u-sara", message: "", status: "Accepted", createdAt: ago(480), decidedAt: ago(470) }
    ];
    const notifications = [
      { id: "n-1", userId: "u-sara", text: "Lama Alqahtani sent a join request to “Smart Campus Navigation App”.", link: "#/request/r-1", read: false, createdAt: ago(20) },
      { id: "n-2", userId: "u-sara", text: "Nouf Alshehri accepted your request to join “Data Structures Midterm Review”.", link: "#/request/r-3", read: true, createdAt: ago(28) }
    ];
    return { users, requests, joinRequests, notifications, currentUserId: null };
  }

  /* ---------- helpers ---------- */
  const db = () => load();
  const get = (list, id) => db()[list].find(x => x.id === id);

  function currentUser() {
    const d = db();
    return d.users.find(u => u.id === d.currentUserId) || null;
  }

  function isProfileComplete(u) {
    return !!(u && u.major && u.level && u.workMode && u.bio && u.bio.trim().length >= 10);
  }

  /* ---------- account (supports PB-01) ---------- */
  function signIn(name, email) {
    const errors = {};
    email = (email || "").trim().toLowerCase();
    name = (name || "").trim();
    if (!email) errors.email = "Email is required.";
    else if (!email.endsWith(PNU_DOMAIN)) errors.email = "Please use your PNU university email (" + PNU_DOMAIN + ").";
    const d = db();
    let user = d.users.find(u => u.email === email);
    if (!user && !name) errors.name = "Name is required for a new account.";
    if (Object.keys(errors).length) return { ok: false, errors };
    if (!user) {
      user = { id: uid("u"), name, email, major: "", level: "", workMode: "", bio: "", techSkills: [], softSkills: [], completedCount: 0 };
      d.users.push(user);
    }
    d.currentUserId = user.id;
    save(d);
    return { ok: true, user, isNew: !isProfileComplete(user) };
  }

  function signOut() { const d = db(); d.currentUserId = null; save(d); }

  /* ---------- PB-01: create / edit profile ---------- */
  function saveProfile(data) {
    const errors = {};
    if (!MAJORS.includes(data.major)) errors.major = "Please choose your major.";
    if (!LEVELS.includes(data.level)) errors.level = "Please choose your academic level.";
    if (!WORK_MODES.includes(data.workMode)) errors.workMode = "Please choose a preferred work mode.";
    if (!data.bio || data.bio.trim().length < 10) errors.bio = "Bio must be at least 10 characters.";
    else if (data.bio.length > 300) errors.bio = "Bio must be 300 characters or less.";
    if (Object.keys(errors).length) return { ok: false, errors };
    const d = db();
    const u = d.users.find(x => x.id === d.currentUserId);
    Object.assign(u, { major: data.major, level: data.level, workMode: data.workMode, bio: data.bio.trim() });
    save(d);
    return { ok: true, user: u };
  }

  /* ---------- PB-02: skills with predefined tags ---------- */
  function saveSkills(tech, soft) {
    const t = (tech || []).filter(s => TECH_SKILLS.includes(s));
    const s = (soft || []).filter(x => SOFT_SKILLS.includes(x));
    const d = db();
    const u = d.users.find(x => x.id === d.currentUserId);
    u.techSkills = [...new Set(t)];
    u.softSkills = [...new Set(s)];
    save(d);
    return { ok: true, user: u };
  }

  /* ---------- PB-03: create collaboration request ---------- */
  function validateRequest(data) {
    const errors = {};
    const today = new Date().toISOString().slice(0, 10);
    if (!CATEGORIES.includes(data.category)) errors.category = "Choose a category.";
    if (!data.title || data.title.trim().length < 5) errors.title = "Title must be at least 5 characters.";
    if (!data.date) errors.date = "Date is required.";
    else if (data.date === "invalid") errors.date = "This date does not exist.";
    else if (data.date < today) errors.date = "Date cannot be in the past.";
    if (!["Online", "Offline"].includes(data.locationType)) errors.locationType = "Choose online or offline.";
    if (!data.location || !data.location.trim()) errors.location = data.locationType === "Online" ? "Add the meeting platform or link." : "Add the place.";
    const roles = (data.roles || []).map(r => r.trim()).filter(Boolean);
    if (!roles.length) errors.roles = "Add at least one needed role.";
    const size = parseInt(data.maxSize, 10);
    if (!(size >= 2 && size <= 10)) errors.maxSize = "Group size must be between 2 and 10.";
    if (!["Partner", "Team"].includes(data.seeking)) errors.seeking = "Choose partner or team.";
    return { errors, roles, size };
  }

  function createRequest(data) {
    const { errors, roles, size } = validateRequest(data);
    if (Object.keys(errors).length) return { ok: false, errors };
    const d = db();
    const req = {
      id: uid("r"), ownerId: d.currentUserId, category: data.category, title: data.title.trim(),
      description: (data.description || "").trim(), date: data.date, locationType: data.locationType,
      location: data.location.trim(), roles, maxSize: size, seeking: data.seeking, status: "Open",
      createdAt: new Date().toISOString()
    };
    d.requests.unshift(req);
    save(d);
    return { ok: true, request: req };
  }

  /* ---------- PB-04: browse & filter active requests ---------- */
  function listActive({ category = "All", query = "" } = {}) {
    const today = new Date().toISOString().slice(0, 10);
    const q = query.trim().toLowerCase();
    return db().requests
      .filter(r => r.status === "Open" && r.date >= today)
      .filter(r => category === "All" || r.category === category)
      .filter(r => !q || (r.title + " " + r.description + " " + r.roles.join(" ")).toLowerCase().includes(q))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function myRequests() {
    const d = db();
    return d.requests.filter(r => r.ownerId === d.currentUserId);
  }

  /* ---------- PB-05: send join request ---------- */
  function joinStatus(requestId) {
    const d = db();
    const j = d.joinRequests.filter(x => x.requestId === requestId && x.userId === d.currentUserId).pop();
    return j && j.status !== "Withdrawn" ? j.status : null;
  }

  function sendJoinRequest(requestId, message) {
    const d = db();
    const req = d.requests.find(r => r.id === requestId);
    if (!req || req.status !== "Open") return { ok: false, error: "This request is no longer active." };
    if (req.ownerId === d.currentUserId) return { ok: false, error: "You cannot join your own request." };
    if (d.joinRequests.some(x => x.requestId === requestId && x.userId === d.currentUserId && x.status !== "Withdrawn"))
      return { ok: false, error: "You already sent a join request for this collaboration." };
    const j = { id: uid("j"), requestId, userId: d.currentUserId, message: (message || "").trim(), status: "Pending", createdAt: new Date().toISOString() };
    d.joinRequests.push(j);
    const me = d.users.find(u => u.id === d.currentUserId);
    notify(d, req.ownerId, `${me.name} sent a join request to “${req.title}”.`, "#/request/" + req.id);   // PB-09
    save(d);
    return { ok: true, join: j };
  }

  function myJoinRequests() {
    const d = db();
    return d.joinRequests.filter(j => j.userId === d.currentUserId)
      .map(j => ({ ...j, request: d.requests.find(r => r.id === j.requestId) }));
  }

  function applicantsFor(requestId) {
    const d = db();
    return d.joinRequests.filter(j => j.requestId === requestId)
      .map(j => ({ ...j, user: d.users.find(u => u.id === j.userId) }));
  }

  /* ---------- team size helpers (PB-10) ---------- */
  function memberCount(requestId) {   // the owner counts as a member
    return 1 + db().joinRequests.filter(j => j.requestId === requestId && j.status === "Accepted").length;
  }
  function membersOf(requestId) {
    const d = db(); const r = d.requests.find(x => x.id === requestId);
    const ids = [r.ownerId, ...d.joinRequests.filter(j => j.requestId === requestId && j.status === "Accepted").map(j => j.userId)];
    return ids.map(id => d.users.find(u => u.id === id));
  }

  /* ---------- PB-09: notifications ---------- */
  function notify(d, userId, text, link) {
    d.notifications.unshift({ id: uid("n"), userId, text, link, read: false, createdAt: new Date().toISOString() });
  }
  function myNotifications() {
    const d = db(); return d.notifications.filter(n => n.userId === d.currentUserId);
  }
  function unreadCount() { return myNotifications().filter(n => !n.read).length; }
  function markAllRead() {
    const d = db(); d.notifications.forEach(n => { if (n.userId === d.currentUserId) n.read = true; }); save(d);
  }

  /* ---------- PB-06 + PB-07: review applicants, accept or decline ---------- */
  function decideJoin(joinId, decision) {
    const d = db();
    const j = d.joinRequests.find(x => x.id === joinId);
    if (!j) return { ok: false, error: "Join request not found." };
    const r = d.requests.find(x => x.id === j.requestId);
    if (r.ownerId !== d.currentUserId) return { ok: false, error: "Only the request owner can decide." };
    if (j.status !== "Pending") return { ok: false, error: "This join request was already handled." };
    if (!["Accepted", "Declined"].includes(decision)) return { ok: false, error: "Unknown decision." };
    if (decision === "Accepted" && memberCount(r.id) >= r.maxSize)
      return { ok: false, error: "The team is already full." };                       // PB-10
    j.status = decision; j.decidedAt = new Date().toISOString();
    notify(d, j.userId, decision === "Accepted"
      ? `Your request to join “${r.title}” was accepted. 🎉`
      : `Your request to join “${r.title}” was declined.`, "#/request/" + r.id);
    save(d);
    // PB-10: close the request automatically when the team is full
    if (decision === "Accepted" && memberCount(r.id) >= r.maxSize) {
      const d2 = db(); const r2 = d2.requests.find(x => x.id === r.id);
      r2.status = "Full";
      notify(d2, r2.ownerId, `“${r2.title}” reached the maximum group size (${r2.maxSize}). It is no longer shown in Browse.`, "#/request/" + r2.id);
      save(d2);
      return { ok: true, full: true };
    }
    return { ok: true, full: false };
  }

  /* ---------- PB-08: withdraw a pending join request ---------- */
  function withdrawJoin(requestId) {
    const d = db();
    const j = d.joinRequests.find(x => x.requestId === requestId && x.userId === d.currentUserId && x.status === "Pending");
    if (!j) return { ok: false, error: "Only pending requests can be withdrawn." };
    j.status = "Withdrawn"; j.decidedAt = new Date().toISOString();
    save(d);
    return { ok: true };
  }

  /* ---------- PB-20: edit or close a request ---------- */
  function updateRequest(id, data) {
    const d = db(); const r = d.requests.find(x => x.id === id);
    if (!r || r.ownerId !== d.currentUserId) return { ok: false, errors: { title: "Only the owner can edit this request." } };
    if (["Closed", "Completed"].includes(r.status)) return { ok: false, errors: { title: "Closed or completed requests cannot be edited." } };
    const { errors, roles, size } = validateRequest(data);
    if (!errors.maxSize && size < memberCount(id)) errors.maxSize = `The team already has ${memberCount(id)} members.`;
    if (Object.keys(errors).length) return { ok: false, errors };
    Object.assign(r, { category: data.category, title: data.title.trim(), description: (data.description || "").trim(), date: data.date,
      locationType: data.locationType, location: data.location.trim(), roles, maxSize: size, updatedAt: new Date().toISOString() });
    r.status = memberCount(id) >= size ? "Full" : "Open";
    d.joinRequests.filter(j => j.requestId === id && ["Pending", "Accepted"].includes(j.status))
      .forEach(j => notify(d, j.userId, `“${r.title}” was updated by the owner. Please check the new details.`, "#/request/" + id));
    save(d);
    return { ok: true, request: r };
  }
  function closeRequest(id) {
    const d = db(); const r = d.requests.find(x => x.id === id);
    if (!r || r.ownerId !== d.currentUserId) return { ok: false, error: "Only the owner can close this request." };
    r.status = "Closed";
    d.joinRequests.filter(j => j.requestId === id && j.status === "Pending").forEach(j => {
      j.status = "Declined"; j.decidedAt = new Date().toISOString();
      notify(d, j.userId, `“${r.title}” was closed by the owner.`, "#/request/" + id);
    });
    save(d);
    return { ok: true };
  }

  /* ---------- PB-12: confirmed collaborations ---------- */
  function myCollaborations() {
    const d = db(); const me = d.currentUserId;
    return d.requests.filter(r => {
      const accepted = d.joinRequests.some(j => j.requestId === r.id && j.status === "Accepted");
      const iAmMember = d.joinRequests.some(j => j.requestId === r.id && j.userId === me && j.status === "Accepted");
      return r.status !== "Closed" && ((r.ownerId === me && accepted) || iAmMember);
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  /* ---------- PB-14: reminders before a confirmed collaboration ---------- */
  function daysUntil(iso) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((new Date(iso + "T00:00:00") - t) / 86400000);
  }
  function generateReminders() {
    const d = db(); const me = d.currentUserId; if (!me) return 0;
    d.reminders = d.reminders || [];
    let added = 0;
    myCollaborations().forEach(r => {
      const left = daysUntil(r.date);
      const key = me + ":" + r.id;
      if (r.status !== "Completed" && left >= 0 && left <= 2 && !d.reminders.includes(key)) {
        d.reminders.push(key);
        notify(d, me, `⏰ Reminder: “${r.title}” is ${left === 0 ? "today" : left === 1 ? "tomorrow" : "in 2 days"} – ${r.location}.`, "#/request/" + r.id);
        added++;
      }
    });
    if (added) save(d);
    return added;
  }

  /* ---------- PB-15: mark a collaboration as completed ---------- */
  function completeCollaboration(id) {
    const d = db(); const r = d.requests.find(x => x.id === id);
    if (!r || r.ownerId !== d.currentUserId) return { ok: false, error: "Only the owner can mark it as completed." };
    if (r.status === "Completed") return { ok: false, error: "Already completed." };
    const members = d.joinRequests.filter(j => j.requestId === id && j.status === "Accepted").map(j => j.userId);
    if (!members.length) return { ok: false, error: "Accept at least one member before completing the collaboration." };
    r.status = "Completed"; r.completedAt = new Date().toISOString();
    [r.ownerId, ...members].forEach(uidx => { const u = d.users.find(x => x.id === uidx); u.completedCount = (u.completedCount || 0) + 1; });
    d.joinRequests.filter(j => j.requestId === id && j.status === "Pending").forEach(j => { j.status = "Declined"; });
    members.forEach(m => notify(d, m, `✅ “${r.title}” was marked as completed. Your collaboration record was updated.`, "#/request/" + id));
    save(d);
    return { ok: true };
  }

  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} memory = null; return load(); }

  return {
    CATEGORIES, MAJORS, LEVELS, WORK_MODES, TECH_SKILLS, SOFT_SKILLS, PNU_DOMAIN,
    currentUser, isProfileComplete, signIn, signOut, saveProfile, saveSkills,
    createRequest, listActive, myRequests, joinStatus, sendJoinRequest, myJoinRequests,
    applicantsFor, getUser: id => get("users", id), getRequest: id => get("requests", id), reset,
    memberCount, membersOf, myNotifications, unreadCount, markAllRead, decideJoin, withdrawJoin,
    updateRequest, closeRequest, myCollaborations, generateReminders, daysUntil, completeCollaboration
  };
})();
