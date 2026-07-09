async function loadStudents() {
  const students = await ScholarAPI.get('/api/students');
  const tbody = document.querySelector('#studentsTable tbody');
  const feeStudent = document.getElementById('feeStudent');
  tbody.innerHTML = '';
  feeStudent.innerHTML = '<option value="">Select student</option>';
  students.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.name || s.user?.name || 'Unknown'}</td><td>${s.phone||''}</td><td>${s.program||''}</td><td><button data-id="${s._id}" class="btn small create-fee">Create Fee</button></td>`;
    tbody.appendChild(tr);
    const opt = document.createElement('option'); opt.value = s._id; opt.textContent = s.name || s.user?.name || 'Student'; feeStudent.appendChild(opt);
  });
}

async function loadFees() {
  const fees = await ScholarAPI.get('/api/fees');
  const tbody = document.querySelector('#feesTable tbody');
  tbody.innerHTML = '';
  fees.forEach((f) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${f.student?.user?.name || f.student?.name || 'Unknown'}</td><td>${Number(f.amount).toFixed(2)}</td><td>${f.status === 'paid' ? 'Paid' : 'Pending'}</td>
      <td>${f.status === 'paid' ? `<button data-id="${f._id}" class="btn small receipt">Receipt</button>` : `<button data-id="${f._id}" class="btn small pay">Mark Paid</button> <button data-id="${f._id}" class="btn small receipt">Receipt</button>`}</td>`;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAuth(['admin']);
  if (!auth) return;

  const studentForm = document.getElementById('studentForm');
  const feeForm = document.getElementById('feeForm');

  await loadStudents();
  await loadFees();

  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sName').value.trim();
    const phone = document.getElementById('sPhone').value.trim();
    const email = document.getElementById('sEmail').value.trim();
    const program = document.getElementById('sProgram').value;
    try {
      await ScholarAPI.post('/api/students', { name, phone, email, program });
      studentForm.reset();
      await loadStudents();
    } catch (err) { alert(err.message); }
  });

  feeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('feeStudent').value;
    const amount = Number(document.getElementById('feeAmount').value);
    const description = document.getElementById('feeDesc').value.trim();
    try {
      await ScholarAPI.post('/api/fees', { studentId, amount, description });
      feeForm.reset();
      await loadFees();
    } catch (err) { alert(err.message); }
  });

  document.body.addEventListener('click', async (e) => {
    if (e.target.matches('.pay')) {
      const id = e.target.dataset.id;
      try {
        await ScholarAPI.patch(`/api/fees/${id}/pay`, { paidAmount: undefined });
        await loadFees();
      } catch (err) { alert(err.message); }
    }
    if (e.target.matches('.receipt')) {
      const id = e.target.dataset.id;
      const url = `/api/fees/${id}/receipt`;
      window.open(url, '_blank');
    }
    if (e.target.matches('.create-fee')) {
      const id = e.target.dataset.id;
      document.getElementById('feeStudent').value = id;
      document.getElementById('feeAmount').focus();
    }
  });
});
