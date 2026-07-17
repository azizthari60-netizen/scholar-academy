document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAuth(['admin']);
  if (!auth) return;
  initDashboardShell('admin', 'receipts');
  renderUserChip(auth.user);

  const params = new URLSearchParams(window.location.search);
  const feeId = params.get('feeId');
  const receiptContent = document.getElementById('receiptContent');

  if (!feeId) {
    receiptContent.innerHTML = '<div class="empty-state">Receipt ID is missing.</div>';
    return;
  }

  try {
    const html = await ScholarAPI.fetchHtml(`/api/fees/${feeId}/receipt`);
    receiptContent.innerHTML = html;
  } catch (err) {
    receiptContent.innerHTML = `<div class="empty-state">Unable to load receipt: ${err.message}</div>`;
  }
});
