# StackLink PNU

**Where minds combine & visions refine**

StackLink PNU is a web platform that helps Computer Science students at Princess Nourah bint Abdulrahman University form balanced, committed teams for **study sessions, hackathons and graduation projects**. Students see each other's skills, level and work preferences *before* committing, and owners confirm members within a clear group-size limit.

> CS 388T – Agile Software Development · Section 7C6 · Group 1
> Built with Scrum over two sprints (Sprint 1: 07/10 – 20/10/2026 · Sprint 2: 22/10 – 04/11/2026)

🔗 **Live demo:** https://YOUR-USERNAME.github.io/StackLink-PNU/

---

## ▶️ How to run

**Option 1 – online:** open the live demo link above.

**Option 2 – on your computer:**
1. Download the repository (`Code → Download ZIP`) and extract it.
2. Open `index.html` in Chrome, Edge or Safari. No installation is needed.

**Demo accounts** (or sign in with any new `@pnu.edu.sa` email):

| Email | Use it to try |
|---|---|
| `sara.alharbi@pnu.edu.sa` | Owner tools: review applicants, accept/decline, edit, complete |
| `lama.alqahtani@pnu.edu.sa` | A hackathon owner whose team can become **Full** |
| `nouf.alshehri@pnu.edu.sa` | A student who joins and receives notifications |

Use **Reset demo data** (page footer) to start again.

---

## ✅ Features (user stories delivered)

| Sprint | Story | Feature |
|---|---|---|
| 1 | PB-19 | Sign in with a PNU university email only |
| 1 | PB-01 | Student profile: major (8 CCIS programs), level, work mode, bio |
| 1 | PB-02 | Technical and soft skills from predefined tags |
| 1 | PB-03 | Create a collaboration request (category, date, location, roles, group size) |
| 1 | PB-04 | Browse active requests, filter by category, keyword search |
| 1 | PB-05 | Send a join request (Pending, no duplicates, no self-join) |
| 2 | PB-06 | Owner views an applicant's full profile before deciding |
| 2 | PB-07 | Accept or decline join requests |
| 2 | PB-10 | Group-size limit – the request becomes **Full** and leaves Browse |
| 2 | PB-08 | Withdraw a pending join request |
| 2 | PB-20 | Edit or close a collaboration request |
| 2 | PB-09 | Notifications (bell with unread counter) for requests, decisions and updates |
| 2 | PB-12 | My Collaborations – confirmed and completed collaborations |
| 2 | PB-14 | Reminders 0–2 days before a confirmed collaboration |
| 2 | PB-15 | Mark a collaboration as completed (updates every member's record) |

### Status guide
| Join request | Meaning | Request | Meaning |
|---|---|---|---|
| Pending | Waiting for the owner | Open | Accepting join requests |
| Accepted | Member of the team | Full | Group size reached – hidden from Browse |
| Declined | Not accepted / request closed | Closed | Closed by the owner |
| Withdrawn | Cancelled by the student | Completed | Finished – counted in members' records |

---

## 🧱 Project structure

```
index.html          – the complete app in one file (CSS + JS included) – open this
css/styles.css      – source: StackLink design system
js/store.js         – source: data layer (data model, validation, business rules)
js/app.js           – source: screens, routing and user interactions
docs/screenshots/   – screenshots of Sprint 1 and Sprint 2
docs/scrum/         – Scrum artifacts of each sprint (planning, backlog, review, retrospective, burndown, daily scrums)
```

**Architecture.** The UI (`app.js`) never touches data directly; every action goes through the data layer (`store.js`), which validates input and enforces the rules (PNU email only, required fields, no past dates, group size 2–10, owner counts as a member, no duplicate join requests, only owners can decide/edit/close/complete). Data is stored in the browser (`localStorage`), so each device keeps its own data.

**Technologies:** HTML5, CSS3, vanilla JavaScript (no frameworks, no build step) · hosted with GitHub Pages.

---

## 🗺️ Next release (Product Backlog)
- PB-22 – shared online database with secure password login
- PB-21 – Arabic / English interface
- PB-13 – calendar view · PB-11 – schedule-overlap warning · PB-16 – completion indicator

---

## 👩‍💻 Team

| Member | Sprint 1 role | Sprint 2 role |
|---|---|---|
| Fajr Alotaibi | Product Owner | QA Developer |
| Haneen Aldawood | Scrum Master | Product Owner |
| Yara Alqahtani | Developer 1 (Front-end) | Scrum Master |
| Fajer Alanazi | Developer 2 (Back-end) | Developer 1 (Front-end) |
| Ruba Aldawsari | QA Developer | Developer 2 (Back-end) |

Princess Nourah bint Abdulrahman University – College of Computer and Information Sciences
