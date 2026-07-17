document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  const auth = await requireAuth(['teacher']);
  if (!auth) return;
  initDashboardShell('teacher', page);
  renderUserChip(auth.user);

  if (page === 'dashboard') await loadTeacherDashboard();
  else if (page === 'classes') await loadClasses();
  else if (page === 'marks') await loadMarks();
  else if (page === 'attendance') await initAttendance();
  else if (page === 'assignments') await initTeacherAssignments();
  else if (page === 'notices') await loadTeacherNotices();
});

async function loadTeacherDashboard() {
  const data = await ScholarAPI.get('/api/dashboard/teacher');
  document.getElementById('welcomeName').textContent = data.profile.user.name;
  document.getElementById('statClasses').textContent = data.stats.classes;
  document.getElementById('statStudents').textContent = data.stats.students;
  document.getElementById('statPending').textContent = data.stats.pendingReviews;
  document.getElementById('statNotes').textContent = data.stats.assignments;
  document.getElementById('subjectInfo').textContent = `${data.profile.subject} • ${(data.profile.assignedPrograms || []).join(', ')}`;

  document.getElementById('progressTable').innerHTML = data.results.slice(0, 6).map((r) => `
    <tr>
      <td>${r.student?.user?.name || '—'}</td>
      <td>${r.subject}</td>
      <td>${r.score >= 80 ? statusBadge('present').replace('present', 'Strong') : r.score >= 60 ? '<span class="badge blue">Improving</span>' : statusBadge('pending').replace('pending', 'Needs Review')}</td>
      <td>${r.score}%</td>
    </tr>`).join('') || '<tr><td colspan="4" class="empty-state">No results yet.</td></tr>';

  document.getElementById('agendaList').innerHTML = data.timetable.slice(0, 4).map((t) => `
    <div class="timeline-item"><div class="dot"></div><div><strong>${t.startTime}</strong><div class="muted">${t.subject} • ${t.classroom || 'TBA'}</div></div></div>`).join('')
    || '<div class="empty-state">No classes scheduled.</div>';
}

async function loadClasses() {
  const data = await ScholarAPI.get('/api/dashboard/teacher');
  document.getElementById('dataTableBody').innerHTML = data.timetable.length
    ? data.timetable.map((t) => `<tr><td>${t.day}</td><td>${t.startTime} – ${t.endTime}</td><td>${t.subject}</td><td>${t.program}</td><td>${t.classroom || '—'}</td></tr>`).join('')
    : '<tr><td colspan="5" class="empty-state">No classes assigned.</td></tr>';
}

async function loadMarks() {
  const [results, students] = await Promise.all([ScholarAPI.get('/api/results'), ScholarAPI.get('/api/students')]);
  const form = document.getElementById('marksForm');
  if (form && !form.dataset.bound) {
    form.student.innerHTML = students.map((s) => `<option value="${s._id}">${s.user.name}</option>`).join('');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      payload.score = Number(payload.score);
      await ScholarAPI.post('/api/results', payload);
      form.reset();
      loadMarks();
    });
    form.dataset.bound = 'true';
  }

  document.getElementById('dataTableBody').innerHTML = results.length
    ? results.map((r) => `<tr><td>${r.student?.user?.name || '—'}</td><td>${r.subject}</td><td>${r.examType}</td><td>${r.score}%</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">No marks recorded.</td></tr>';
}

async function initAttendance() {
  const students = await ScholarAPI.get('/api/students');
  const dateInput = document.getElementById('attendanceDate');
  const subjectInput = document.getElementById('attendanceSubject');
  dateInput.value = new Date().toISOString().split('T')[0];

  async function renderRows() {
    let existing = [];
    try {
      existing = await ScholarAPI.get(`/api/attendance?date=${dateInput.value}`);
    } catch {
      existing = [];
    }

    document.getElementById('attendanceBody').innerHTML = students.map((s) => {
      const record = existing.find((item) => String(item.student?._id || item.student) === String(s._id));
      const status = record?.status || 'present';
      return `
      <tr>
        <td>${s.user.name}</td>
        <td>${s.rollNumber}</td>
        <td>
          <select data-student="${s._id}">
            <option value="present" ${status === 'present' ? 'selected' : ''}>Present</option>
            <option value="late" ${status === 'late' ? 'selected' : ''}>Late</option>
            <option value="absent" ${status === 'absent' ? 'selected' : ''}>Absent</option>
          </select>
        </td>
      </tr>`;
    }).join('');
  }

  dateInput.addEventListener('change', renderRows);
  subjectInput?.addEventListener('change', renderRows);
  await renderRows();

  document.getElementById('saveAttendance').addEventListener('click', async () => {
    const records = [...document.querySelectorAll('#attendanceBody select')].map((sel) => ({
      student: sel.dataset.student,
      date: dateInput.value,
      status: sel.value,
      subject: subjectInput.value,
    }));
    await ScholarAPI.post('/api/attendance/bulk', { records });
    alert('Attendance saved successfully.');
  });
}

async function initTeacherAssignments() {
  const form = document.getElementById('assignmentForm');
  async function load() {
    const assignments = await ScholarAPI.get('/api/assignments');
    document.getElementById('dataTableBody').innerHTML = assignments.length
      ? assignments.map((a) => `<tr><td>${a.title}</td><td>${a.program}</td><td>${formatDate(a.dueDate)}</td><td>${statusBadge(a.status)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="empty-state">No assignments.</td></tr>';
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    await ScholarAPI.post('/api/assignments', payload);
    form.reset();
    load();
  });
  await load();
}

async function loadTeacherNotices() {
  const notices = await ScholarAPI.get('/api/notices');
  document.getElementById('noticesList').innerHTML = notices.length
    ? notices.map((n) => `<article class="panel" style="margin-bottom:12px"><div class="panel-header"><h4>${n.title}</h4><span class="muted">${formatDate(n.createdAt)}</span></div><p>${n.content}</p></article>`).join('')
    : '<div class="empty-state">No notices.</div>';
}
