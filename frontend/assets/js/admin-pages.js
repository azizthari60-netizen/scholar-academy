document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  const auth = await requireAuth(['admin']);
  if (!auth) return;
  initDashboardShell('admin', page);
  renderUserChip(auth.user);

  const handlers = {
    students: initStudentsPage,
    teachers: initTeachersPage,
    results: initResultsPage,
    fees: initFeesPage,
    admissions: initAdmissionsPage,
    notices: initNoticesPage,
    timetable: initTimetablePage,
  };

  if (handlers[page]) await handlers[page]();
});

async function initStudentsPage() {
  const tbody = document.getElementById('dataTableBody');
  const modal = document.getElementById('formModal');
  const form = document.getElementById('dataForm');
  let editingId = null;

  async function load() {
    const students = await ScholarAPI.get('/api/students');
    tbody.innerHTML = students.length
      ? students.map((s) => `
        <tr>
          <td>${s.rollNumber}</td>
          <td>${s.user.name}</td>
          <td>${s.program}</td>
          <td>${s.batch}</td>
          <td>${s.attendancePercent}%</td>
          <td>
            <button class="btn-sm btn-secondary" data-edit="${s._id}">Edit</button>
            <button class="btn-sm btn-danger" data-del="${s._id}">Delete</button>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-state">No students yet.</td></tr>';

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const student = students.find((s) => s._id === btn.dataset.edit);
        editingId = student._id;
        form.name.value = student.user.name;
        form.email.value = student.user.email;
        form.phone.value = student.user.phone || '';
        form.rollNumber.value = student.rollNumber;
        form.program.value = student.program;
        form.batch.value = student.batch;
        form.section.value = student.section;
        form.guardianName.value = student.guardianName || '';
        form.guardianPhone.value = student.guardianPhone || '';
        form.password.required = false;
        document.getElementById('modalTitle').textContent = 'Edit Student';
        openModal('formModal');
      });
    });

    tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this student?')) return;
        await ScholarAPI.del(`/api/students/${btn.dataset.del}`);
        load();
      });
    });
  }

  document.getElementById('addBtn').addEventListener('click', () => {
    editingId = null;
    form.reset();
    form.password.required = true;
    document.getElementById('modalTitle').textContent = 'Add Student';
    openModal('formModal');
  });

  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('formModal'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    if (editingId) {
      await ScholarAPI.put(`/api/students/${editingId}`, payload);
    } else {
      await ScholarAPI.post('/api/students', payload);
    }
    closeModal('formModal');
    load();
  });

  await load();
}

async function initTeachersPage() {
  const tbody = document.getElementById('dataTableBody');
  const form = document.getElementById('dataForm');
  let editingId = null;

  async function load() {
    const teachers = await ScholarAPI.get('/api/teachers');
    tbody.innerHTML = teachers.length
      ? teachers.map((t) => `
        <tr>
          <td>${t.user.name}</td>
          <td>${t.subject}</td>
          <td>${t.qualification || '—'}</td>
          <td>${(t.assignedPrograms || []).join(', ') || '—'}</td>
          <td>
            <button class="btn-sm btn-secondary" data-edit="${t._id}">Edit</button>
            <button class="btn-sm btn-danger" data-del="${t._id}">Delete</button>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty-state">No teachers yet.</td></tr>';

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const teacher = teachers.find((t) => t._id === btn.dataset.edit);
        editingId = teacher._id;
        form.name.value = teacher.user.name;
        form.email.value = teacher.user.email;
        form.phone.value = teacher.user.phone || '';
        form.subject.value = teacher.subject;
        form.qualification.value = teacher.qualification || '';
        form.experience.value = teacher.experience || '';
        form.assignedPrograms.value = (teacher.assignedPrograms || []).join(', ');
        form.password.required = false;
        document.getElementById('modalTitle').textContent = 'Edit Teacher';
        openModal('formModal');
      });
    });

    tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this teacher?')) return;
        await ScholarAPI.del(`/api/teachers/${btn.dataset.del}`);
        load();
      });
    });
  }

  document.getElementById('addBtn').addEventListener('click', () => {
    editingId = null;
    form.reset();
    form.password.required = true;
    document.getElementById('modalTitle').textContent = 'Add Teacher';
    openModal('formModal');
  });
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('formModal'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    payload.assignedPrograms = payload.assignedPrograms
      ? payload.assignedPrograms.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (editingId) await ScholarAPI.put(`/api/teachers/${editingId}`, payload);
    else await ScholarAPI.post('/api/teachers', payload);
    closeModal('formModal');
    load();
  });

  await load();
}

async function initResultsPage() {
  const tbody = document.getElementById('dataTableBody');
  const form = document.getElementById('dataForm');
  const students = await ScholarAPI.get('/api/students');
  form.student.innerHTML = students.map((s) => `<option value="${s._id}">${s.user.name} (${s.rollNumber})</option>`).join('');

  async function load() {
    const results = await ScholarAPI.get('/api/results');
    tbody.innerHTML = results.length
      ? results.map((r) => `
        <tr>
          <td>${r.student?.user?.name || '—'}</td>
          <td>${r.subject}</td>
          <td>${r.examType}</td>
          <td>${r.score}%</td>
          <td><button class="btn-sm btn-danger" data-del="${r._id}">Delete</button></td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty-state">No results yet.</td></tr>';

    tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this result?')) return;
        await ScholarAPI.del(`/api/results/${btn.dataset.del}`);
        load();
      });
    });
  }

  document.getElementById('addBtn').addEventListener('click', () => { form.reset(); openModal('formModal'); });
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('formModal'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await ScholarAPI.post('/api/results', Object.fromEntries(new FormData(form)));
    closeModal('formModal');
    load();
  });
  await load();
}

async function initFeesPage() {
  const tbody = document.getElementById('dataTableBody');
  const form = document.getElementById('dataForm');
  const students = await ScholarAPI.get('/api/students');
  form.student.innerHTML = students.map((s) => `<option value="${s._id}">${s.user.name}</option>`).join('');

  async function load() {
    const fees = await ScholarAPI.get('/api/fees');
    tbody.innerHTML = fees.length
      ? fees.map((f) => `
        <tr>
          <td>${f.student?.user?.name || '—'}</td>
          <td>Rs. ${f.amount.toLocaleString()}</td>
          <td>${f.month || '—'}</td>
          <td>${formatDate(f.dueDate)}</td>
          <td>${statusBadge(f.status)}</td>
          <td>${f.status !== 'paid' ? `<button class="btn-sm btn-primary" data-pay="${f._id}">Mark Paid</button> ` : ''}<a class="btn-sm btn-secondary" href="/api/fees/${f._id}/receipt" target="_blank">Receipt</a></td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-state">No fee records yet.</td></tr>';

    tbody.querySelectorAll('[data-pay]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await ScholarAPI.patch(`/api/fees/${btn.dataset.pay}/pay`, {});
        load();
      });
    });
  }

  document.getElementById('addBtn').addEventListener('click', () => { form.reset(); openModal('formModal'); });
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('formModal'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    payload.studentId = payload.student;
    delete payload.student;
    payload.amount = Number(payload.amount);
    await ScholarAPI.post('/api/fees', payload);
    closeModal('formModal');
    load();
  });
  await load();
}

async function initAdmissionsPage() {
  const tbody = document.getElementById('dataTableBody');
  async function load() {
    const admissions = await ScholarAPI.get('/api/admissions');
    tbody.innerHTML = admissions.length
      ? admissions.map((a) => `
        <tr>
          <td>${a.name}</td>
          <td>${a.phone}</td>
          <td>${a.program}</td>
          <td>${formatDate(a.createdAt)}</td>
          <td>${statusBadge(a.status)}</td>
          <td>
            <button class="btn-sm btn-primary" data-status="${a._id}" data-val="approved">Approve</button>
            <button class="btn-sm btn-danger" data-status="${a._id}" data-val="rejected">Reject</button>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-state">No admission requests.</td></tr>';

    tbody.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await ScholarAPI.patch(`/api/admissions/${btn.dataset.status}`, { status: btn.dataset.val });
        load();
      });
    });
  }
  await load();
}

async function initNoticesPage() {
  const tbody = document.getElementById('dataTableBody');
  const form = document.getElementById('dataForm');
  async function load() {
    const notices = await ScholarAPI.get('/api/notices');
    tbody.innerHTML = notices.length
      ? notices.map((n) => `
        <tr>
          <td>${n.isPinned ? '📌 ' : ''}${n.title}</td>
          <td>${n.targetRole}</td>
          <td>${formatDate(n.createdAt)}</td>
          <td><button class="btn-sm btn-danger" data-del="${n._id}">Delete</button></td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="empty-state">No notices yet.</td></tr>';
    tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await ScholarAPI.del(`/api/notices/${btn.dataset.id || btn.dataset.del}`);
        load();
      });
    });
  }
  document.getElementById('addBtn').addEventListener('click', () => { form.reset(); openModal('formModal'); });
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('formModal'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    payload.isPinned = form.isPinned.checked;
    await ScholarAPI.post('/api/notices', payload);
    closeModal('formModal');
    load();
  });
  await load();
}

async function initTimetablePage() {
  const tbody = document.getElementById('dataTableBody');
  const form = document.getElementById('dataForm');
  const teachers = await ScholarAPI.get('/api/teachers');
  form.teacher.innerHTML = '<option value="">—</option>' + teachers.map((t) => `<option value="${t._id}">${t.user.name} (${t.subject})</option>`).join('');

  async function load() {
    const entries = await ScholarAPI.get('/api/timetable');
    tbody.innerHTML = entries.length
      ? entries.map((e) => `
        <tr>
          <td>${e.day}</td>
          <td>${e.startTime} – ${e.endTime}</td>
          <td>${e.subject}</td>
          <td>${e.program}</td>
          <td>${e.classroom || '—'}</td>
          <td><button class="btn-sm btn-danger" data-del="${e._id}">Delete</button></td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty-state">No timetable entries.</td></tr>';
    tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await ScholarAPI.del(`/api/timetable/${btn.dataset.del}`);
        load();
      });
    });
  }

  document.getElementById('addBtn').addEventListener('click', () => { form.reset(); openModal('formModal'); });
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('formModal'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    if (!payload.teacher) delete payload.teacher;
    await ScholarAPI.post('/api/timetable', payload);
    closeModal('formModal');
    load();
  });
  await load();
}
