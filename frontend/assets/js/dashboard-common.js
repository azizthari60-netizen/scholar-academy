async function requireAuth(allowedRoles = []) {
  const token = ScholarAPI.getToken();
  if (!token) {
    window.location.href = '/pages/auth/login.html';
    return null;
  }

  try {
    const data = await ScholarAPI.me();
    if (allowedRoles.length && !allowedRoles.includes(data.user.role)) {
      window.location.href = `/pages/${data.user.role}/dashboard.html`;
      return null;
    }
    return data;
  } catch {
    ScholarAPI.clearSession();
    window.location.href = '/pages/auth/login.html';
    return null;
  }
}

function initDashboardShell(role, pageKey) {
  const navMap = {
    admin: [
      { key: 'dashboard', href: 'dashboard.html', label: '📊 Overview' },
      { key: 'students', href: 'students.html', label: '👨‍🎓 Students' },
      { key: 'teachers', href: 'teachers.html', label: '👩‍🏫 Teachers' },
      { key: 'results', href: 'results.html', label: '📝 Results' },
      { key: 'fees', href: 'fees.html', label: '💳 Fees' },
      { key: 'admissions', href: 'admissions.html', label: '📋 Admissions' },
      { key: 'notices', href: 'notices.html', label: '📢 Notices' },
      { key: 'timetable', href: 'timetable.html', label: '📅 Timetable' },
    ],
    student: [
      { key: 'dashboard', href: 'dashboard.html', label: '🏠 Dashboard' },
      { key: 'courses', href: 'courses.html', label: '📚 My Courses' },
      { key: 'assignments', href: 'assignments.html', label: '📝 Assignments' },
      { key: 'results', href: 'results.html', label: '📈 Results' },
      { key: 'timetable', href: 'timetable.html', label: '📅 Timetable' },
      { key: 'notices', href: 'notices.html', label: '💬 Notice Board' },
      { key: 'fees', href: 'fees.html', label: '💳 Fees' },
    ],
    teacher: [
      { key: 'dashboard', href: 'dashboard.html', label: '📋 Overview' },
      { key: 'classes', href: 'classes.html', label: '🧠 Classes' },
      { key: 'marks', href: 'marks.html', label: '📝 Marks' },
      { key: 'attendance', href: 'attendance.html', label: '📅 Attendance' },
      { key: 'assignments', href: 'assignments.html', label: '📌 Assignments' },
      { key: 'notices', href: 'notices.html', label: '💬 Notices' },
    ],
  };

  const nav = document.querySelector('.sidebar-nav');
  if (nav && navMap[role]) {
    nav.innerHTML = navMap[role]
      .map((item) => `<a href="${item.href}" class="${item.key === pageKey ? 'active' : ''}">${item.label}</a>`)
      .join('');
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => ScholarAPI.logout());

  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  const map = {
    pending: 'orange',
    paid: 'green',
    overdue: 'orange',
    approved: 'green',
    rejected: 'orange',
    present: 'green',
    absent: 'orange',
    late: 'blue',
    active: 'blue',
    closed: 'orange',
  };
  return `<span class="badge ${map[status] || 'blue'}">${status}</span>`;
}

window.requireAuth = requireAuth;
window.initDashboardShell = initDashboardShell;
window.formatDate = formatDate;
window.statusBadge = statusBadge;
