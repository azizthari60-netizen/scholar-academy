document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('formMessage');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      message.textContent = 'Please fill in both fields.';
      message.className = 'form-message error';
      return;
    }

    message.textContent = 'Signing in...';
    message.className = 'form-message';

    try {
      const data = await ScholarAPI.login(email, password, role);
      ScholarAPI.setSession(data.token, data.user);
      window.location.href = `/pages/${data.user.role}/dashboard.html`;
    } catch (err) {
      message.textContent = err.message || 'Login failed. Please try again.';
      message.className = 'form-message error';
    }
  });
});
