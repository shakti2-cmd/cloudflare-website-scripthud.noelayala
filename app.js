(function () {
  'use strict';

  var root = document.documentElement;
  var storageKey = 'scripthud_theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      var lbl = toggleBtn.querySelector('.theme-label');
      if (lbl) lbl.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
      toggleBtn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (e) {}
  applyTheme(saved || 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(root.getAttribute('data-theme') || 'dark');

    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var cur = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        var nxt = cur === 'dark' ? 'light' : 'dark';
        applyTheme(nxt);
        try { localStorage.setItem(storageKey, nxt); } catch (e) {}
      });
    }

    // Mobile nav toggle
    var menuBtn = document.getElementById('mobile-menu-btn');
    var navMenu = document.getElementById('nav-menu');
    if (menuBtn && navMenu) {
      menuBtn.addEventListener('click', function () {
        var exp = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', String(!exp));
        navMenu.classList.toggle('is-open');
      });
      navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menuBtn.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('is-open');
        });
      });
    }

    // Interactive HUD Cue Simulator in Hero
    var cueText = document.getElementById('sim-cue-text');
    var simSpeedBtns = document.querySelectorAll('[data-sim-wpm]');
    var simCueSamples = {
      '120': '[Cue · 120 WPM Steady]: “Hi Sarah — let me walk you through the 3 automation bottlenecks we found on your site.”',
      '145': '[Cue · 145 WPM Natural]: “Notice how the floating HUD keeps you centered on the camera lens without looking away.”',
      'voice': '[Cue · Voice-Sync AI]: Listening... auto-advancing line on natural spoken pause (0ms lag).'
    };
    simSpeedBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        simSpeedBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var key = btn.getAttribute('data-sim-wpm');
        if (cueText && simCueSamples[key]) {
          cueText.textContent = simCueSamples[key];
        }
      });
    });

    // Monthly / Annual Subscription Toggle
    var billingCycle = 'annual';
    var billingBtns = document.querySelectorAll('[data-billing-mode]');
    var priceEls = document.querySelectorAll('[data-price-annual][data-price-monthly]');
    var periodNotes = document.querySelectorAll('[data-billing-note]');

    function updatePricingDisplay(mode) {
      billingCycle = mode;
      billingBtns.forEach(function (b) {
        var active = b.getAttribute('data-billing-mode') === mode;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      priceEls.forEach(function (el) {
        var val = mode === 'annual' ? el.getAttribute('data-price-annual') : el.getAttribute('data-price-monthly');
        el.textContent = '$' + val;
      });
      periodNotes.forEach(function (el) {
        var ann = el.getAttribute('data-note-annual');
        var mon = el.getAttribute('data-note-monthly');
        el.textContent = mode === 'annual' ? ann : mon;
      });
    }

    billingBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        updatePricingDisplay(btn.getAttribute('data-billing-mode'));
      });
    });

    // Subscription Checkout / License Modal
    var subModal = document.getElementById('subscription-modal');
    var subClose = document.getElementById('sub-modal-close');
    var subPlanName = document.getElementById('sub-plan-name');
    var subPlanPrice = document.getElementById('sub-plan-price');
    var subHiddenPlan = document.getElementById('sub-hidden-plan');
    var subEmailInput = document.getElementById('sub-email');
    var lastFocus = null;

    function openSubModal(plan, annualPrice, monthlyPrice, triggerEl) {
      if (!subModal) return;
      lastFocus = triggerEl || document.activeElement;
      var activePrice = billingCycle === 'annual' ? annualPrice : monthlyPrice;
      var label = plan + ' (' + (billingCycle === 'annual' ? 'Annual Plan' : 'Monthly Plan') + ')';
      var priceStr = activePrice === '0' ? '$0 / Free Forever' : '$' + activePrice + ' / mo';
      if (subPlanName) subPlanName.textContent = label;
      if (subPlanPrice) subPlanPrice.textContent = priceStr;
      if (subHiddenPlan) subHiddenPlan.value = label + ' — ' + priceStr;
      subModal.classList.add('is-open');
      subModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (subEmailInput) subEmailInput.focus();
    }

    function closeSubModal() {
      if (!subModal || !subModal.classList.contains('is-open')) return;
      subModal.classList.remove('is-open');
      subModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    document.querySelectorAll('[data-subscribe-plan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openSubModal(
          btn.getAttribute('data-subscribe-plan'),
          btn.getAttribute('data-annual'),
          btn.getAttribute('data-monthly'),
          btn
        );
      });
    });

    if (subClose) subClose.addEventListener('click', closeSubModal);
    if (subModal) {
      subModal.addEventListener('click', function (e) {
        if (e.target === subModal) closeSubModal();
      });
    }

    // Lightbox Image Modal
    var imgModal = document.getElementById('image-modal');
    var imgClose = document.getElementById('img-modal-close');
    var imgTarget = document.getElementById('img-modal-pic');
    var imgTitle = document.getElementById('img-modal-title');

    function openImgModal(src, title, triggerEl) {
      if (!imgModal || !imgTarget) return;
      lastFocus = triggerEl || document.activeElement;
      imgTarget.src = src;
      imgTarget.alt = title || 'ScriptHud Preview';
      if (imgTitle) imgTitle.textContent = title || 'Preview';
      imgModal.classList.add('is-open');
      imgModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (imgClose) imgClose.focus();
    }

    function closeImgModal() {
      if (!imgModal || !imgModal.classList.contains('is-open')) return;
      imgModal.classList.remove('is-open');
      imgModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
      el.addEventListener('click', function () {
        openImgModal(
          el.getAttribute('data-lightbox-src'),
          el.getAttribute('data-lightbox-title'),
          el
        );
      });
    });

    if (imgClose) imgClose.addEventListener('click', closeImgModal);
    if (imgModal) {
      imgModal.addEventListener('click', function (e) {
        if (e.target === imgModal) closeImgModal();
      });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var exp = btn.getAttribute('aria-expanded') === 'true';
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var icon = btn.querySelector('.faq-icon');
        btn.setAttribute('aria-expanded', String(!exp));
        if (panel) {
          if (exp) panel.setAttribute('hidden', '');
          else panel.removeAttribute('hidden');
        }
        if (icon) icon.textContent = exp ? '+' : '−';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSubModal();
        closeImgModal();
      }
    });

    // Checkout / Pre-Order FormSubmit AJAX
    var subForm = document.getElementById('sub-checkout-form');
    var subStatus = document.getElementById('sub-form-status');
    var subSubmitBtn = document.getElementById('sub-submit-btn');

    if (subForm) {
      subForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (subSubmitBtn) {
          subSubmitBtn.disabled = true;
          subSubmitBtn.textContent = 'Reserving License...';
        }
        if (subStatus) {
          subStatus.textContent = '';
          subStatus.className = 'form-status';
        }
        fetch(subForm.action, {
          method: 'POST',
          body: new FormData(subForm),
          headers: { 'Accept': 'application/json' }
        })
          .then(function (r) {
            if (r.ok) {
              subForm.reset();
              if (subStatus) {
                subStatus.textContent = 'License request reserved! Download link & Stripe/LemonSqueezy checkout instructions have been routed.';
                subStatus.className = 'form-status is-success';
              }
            } else {
              throw new Error('Failed');
            }
          })
          .catch(function () {
            if (subStatus) {
              subStatus.textContent = 'Could not submit form right now. Please contact support@scripthud.app [Placeholder].';
              subStatus.className = 'form-status is-error';
            }
          })
          .finally(function () {
            if (subSubmitBtn) {
              subSubmitBtn.disabled = false;
              subSubmitBtn.textContent = 'Continue to Checkout / Reserve Access';
            }
          });
      });
    }
  });
})();
