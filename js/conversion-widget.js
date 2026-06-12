/**
 * Guanlan AI conversion widget — shared submit + loading UX.
 * POST → /api/collect-lead (production) with /api/v1/capture-lead fallback path reserved.
 */
(function () {
  const API_PRIMARY = '/api/collect-lead';
  const API_FALLBACK = '/api/v1/capture-lead';

  function setStatus(form, text, isError) {
    const el = form.querySelector('.guanlan-ai-widget__status');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#f87171' : 'rgba(201,169,110,0.85)';
  }

  function setLoading(btn, loading) {
    const label = btn.querySelector('.guanlan-ai-widget__btn-label');
    const spin = btn.querySelector('.guanlan-ai-widget__btn-spin');
    btn.disabled = loading;
    if (label) label.hidden = loading;
    if (spin) spin.hidden = !loading;
  }

  async function postLead(payload) {
    let res = await fetch(API_PRIMARY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 404) {
      res = await fetch(API_FALLBACK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    return data;
  }

  function bindForm(form) {
    if (form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const year = form.querySelector('[name="birth_year"]')?.value;
      const month = form.querySelector('[name="birth_month"]')?.value;
      const day = form.querySelector('[name="birth_day"]')?.value;
      const hour = form.querySelector('[name="birth_hour"]')?.value;
      const email = form.querySelector('[name="email"]')?.value?.trim();

      if (!email || !year || !month || !day) {
        setStatus(form, 'Please complete birth date and email.', true);
        return;
      }

      setLoading(btn, true);
      setStatus(form, 'Compiling configuration...', false);

      const payload = {
        email,
        birthYear: year,
        birthMonth: month,
        birthDay: day,
        birthHour: hour === '' ? '' : Number(hour),
        dob: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        hour: hour === '' ? '' : Number(hour),
        source: 'ai-widget-programmatic-seo',
        sourceUrl: window.location.pathname,
        page: window.location.pathname,
        pdfReady: false,
      };

      try {
        await new Promise((r) => setTimeout(r, 600));
        setStatus(form, 'Fetching transit vectors...', false);
        await new Promise((r) => setTimeout(r, 500));
        await postLead(payload);
        setStatus(form, '✓ Report queued — check your inbox within minutes.', false);
        form.reset();
      } catch (err) {
        setStatus(form, err.message || 'Network error. Try again.', true);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  document.querySelectorAll('.guanlan-ai-widget form').forEach(bindForm);
})();
