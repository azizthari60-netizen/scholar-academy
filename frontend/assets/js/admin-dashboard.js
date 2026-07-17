document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAuth(['admin']);
  if (!auth) return;
  initDashboardShell('admin', 'dashboard');
  renderUserChip(auth.user);

  try {
    const data = await ScholarAPI.get('/api/dashboard/admin');
    document.getElementById('statStudents').textContent = data.stats.totalStudents;
    document.getElementById('statTeachers').textContent = data.stats.activeTeachers;
    document.getElementById('statAttendance').textContent = `${data.stats.attendanceRate}%`;
    document.getElementById('statFees').textContent = data.stats.pendingFees;
    document.getElementById('sidebarAdmissions').textContent = `${data.stats.pendingAdmissions} pending admission requests`;

    const admissionsList = document.getElementById('recentAdmissions');
    if (admissionsList) {
      admissionsList.innerHTML = data.recentAdmissions.length
        ? data.recentAdmissions.map((a) => `
          <div class="list-item">
            <div><strong>${a.name}</strong><div class="muted">${a.program}</div></div>
            ${statusBadge(a.status)}
          </div>`).join('')
        : '<div class="empty-state">No admission requests yet.</div>';
    }

    const resultsList = document.getElementById('recentResults');
    if (resultsList) {
      resultsList.innerHTML = data.recentResults.length
        ? data.recentResults.map((r) => `
          <div class="list-item">
            <div><strong>${r.student?.user?.name || 'Student'}</strong><div class="muted">${r.subject} • ${r.examType}</div></div>
            <span class="badge blue">${r.score}%</span>
          </div>`).join('')
        : '<div class="empty-state">No results uploaded yet.</div>';
    }
  } catch (err) {
    console.error(err);
  }
});
