document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  const auth = await requireAuth(['student']);
  if (!auth) return;
  initDashboardShell('student', page);
  renderUserChip(auth.user);

  if (page === 'dashboard') await loadStudentDashboard();
  else if (page === 'assignments') await loadAssignments();
  else if (page === 'results') await loadStudentResults();
  else if (page === 'timetable') await loadStudentTimetable();
  else if (page === 'notices') await loadNotices();
  else if (page === 'fees') await loadStudentFees();
  else if (page === 'courses') await loadCourses();
});

async function loadStudentDashboard() {
  const data = await ScholarAPI.get('/api/dashboard/student');
  document.getElementById('welcomeName').textContent = data.profile.user.name;
  document.getElementById('statAttendance').textContent = `${data.stats.attendance}%`;
  document.getElementById('statAssignments').textContent = data.stats.assignments;
  document.getElementById('statScore').textContent = `${data.stats.avgScore}%`;
  document.getElementById('statPending').textContent = data.stats.pendingAssignments;
  document.getElementById('programInfo').textContent = `${data.profile.program} • Batch ${data.profile.batch}`;

  const schedule = document.getElementById('scheduleList');
  schedule.innerHTML = data.timetable.slice(0, 4).map((t) => `
    <div class="list-item">
      <div><strong>${t.subject}</strong><div class="muted">${t.day} • ${t.startTime} • ${t.classroom || 'TBA'}</div></div>
      <span class="badge blue">${t.day}</span>
    </div>`).join('') || '<div class="empty-state">No timetable entries yet.</div>';

  const progress = document.getElementById('progressStack');
  const bySubject = {};
  data.results.forEach((r) => { bySubject[r.subject] = r.score; });
  progress.innerHTML = Object.entries(bySubject).map(([subject, score]) => `
    <div class="progress-row"><div class="muted">${subject}</div><div class="bar"><span style="width:${score}%"></span></div></div>`).join('')
    || '<div class="empty-state">No results yet.</div>';
}

async function loadAssignments() {
  const assignments = await ScholarAPI.get('/api/assignments');
  document.getElementById('dataTableBody').innerHTML = assignments.length
    ? assignments.map((a) => `
      <tr><td>${a.title}</td><td>${a.subject}</td><td>${formatDate(a.dueDate)}</td><td>${statusBadge(a.status)}</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">No assignments.</td></tr>';
}

async function loadStudentResults() {
  const results = await ScholarAPI.get('/api/results');
  document.getElementById('dataTableBody').innerHTML = results.length
    ? results.map((r) => `<tr><td>${r.subject}</td><td>${r.examType}</td><td>${r.term}</td><td>${r.score}%</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">No results yet.</td></tr>';
}

async function loadStudentTimetable() {
  const auth = await ScholarAPI.me();
  const entries = await ScholarAPI.get(`/api/timetable?program=${auth.profile.program}&section=${auth.profile.section}`);
  document.getElementById('dataTableBody').innerHTML = entries.length
    ? entries.map((e) => `<tr><td>${e.day}</td><td>${e.startTime} – ${e.endTime}</td><td>${e.subject}</td><td>${e.classroom || '—'}</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">No timetable entries.</td></tr>';
}

async function loadNotices() {
  const notices = await ScholarAPI.get('/api/notices');
  document.getElementById('noticesList').innerHTML = notices.length
    ? notices.map((n) => `
      <article class="panel" style="margin-bottom:12px">
        <div class="panel-header"><h4>${n.isPinned ? '📌 ' : ''}${n.title}</h4><span class="muted">${formatDate(n.createdAt)}</span></div>
        <p>${n.content}</p>
      </article>`).join('')
    : '<div class="empty-state">No notices posted.</div>';
}

async function loadStudentFees() {
  const fees = await ScholarAPI.get('/api/fees');
  document.getElementById('dataTableBody').innerHTML = fees.length
    ? fees.map((f) => `<tr><td>${f.month || '—'}</td><td>Rs. ${f.amount.toLocaleString()}</td><td>${formatDate(f.dueDate)}</td><td>${statusBadge(f.status)}</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">No fee records.</td></tr>';
}

async function loadCourses() {
  const auth = await ScholarAPI.me();
  document.getElementById('coursesGrid').innerHTML = `
    <article class="panel"><h4>${auth.profile.program}</h4><p class="muted">Section ${auth.profile.section} • Batch ${auth.profile.batch}</p><p>Roll Number: <strong>${auth.profile.rollNumber}</strong></p></article>
    <article class="panel"><h4>Core Subjects</h4><p class="muted">${auth.profile.program === 'Pre-Medical' ? 'Biology, Chemistry, Physics' : auth.profile.program === 'Pre-Engineering' ? 'Mathematics, Physics, Chemistry' : 'Programming, Mathematics, ICT'}</p></article>`;
}
