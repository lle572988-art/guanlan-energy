#!/bin/bash
# Inject Plausible Analytics snippet + GA4 custom events into all HTML files
# Usage: cd /path/to/website && bash inject-plausible.sh

PLAUSIBLE_SNIPPET='<!-- Plausible Analytics -->
<script defer data-domain="metaphysicflow.com" src="https://plausible.io/js/script.js"></script>
<script>
window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
</script>'

# The GA4 custom events script
CUSTOM_EVENTS_SCRIPT='<!-- Plausible Custom Events for Funnel Tracking -->
<script>
(function() {
  // === page_view is auto-tracked by Plausible ===

  // form_view: wait for results section to scroll into view
  var formCard = document.querySelector(".form-card");
  if (formCard) {
    var formObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          plausible("form_view");
          formObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    formObserver.observe(formCard);
  }

  // form_start: first input focus
  var formInputs = document.querySelectorAll("#username, #birthdate, .gw-field");
  formInputs.forEach(function(inp) {
    inp.addEventListener("focus", function handler() {
      plausible("form_start");
      formInputs.forEach(function(i) { i.removeEventListener("focus", handler); });
    }, { once: true });
  });

  // form_submit: on the BaZi form submission
  var baziForm = document.querySelector("form[onsubmit*='runGuanlanEngine']");
  if (baziForm) {
    baziForm.addEventListener("submit", function() {
      plausible("form_submit");
    });
  }

  // report_generated: when results section displays
  var origRun = window.runGuanlanEngine;
  if (origRun) {
    window.runGuanlanEngine = function(e) {
      origRun(e);
      // Override the setTimeout that shows results to fire event
      var origSetTimeout = window.setTimeout;
      window.setTimeout = function(fn, ms) {
        return origSetTimeout(function() {
          fn();
          if (ms > 4000) {
            plausible("report_generated");
            // Restore setTimeout after firing
            window.setTimeout = origSetTimeout;
          }
        }, ms);
      };
    };
  }

  // paywall_view & paywall_click
  var paywallBtn = document.querySelector(".cta-btn.gumroad-button");
  if (paywallBtn) {
    var paywallObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          plausible("paywall_view");
          paywallObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    paywallObserver.observe(paywallBtn);

    paywallBtn.addEventListener("click", function() {
      plausible("paywall_click");
    });
  }

  // email_subscribe: popup form
  var popupForm = document.querySelector(".popup-form");
  if (popupForm) {
    popupForm.addEventListener("submit", function() {
      plausible("email_subscribe");
    });
  }

  // email_subscribe: widget email overlay
  var widgetForm = document.querySelector(".gw-email-box .gw-btn");
  if (widgetForm) {
    widgetForm.addEventListener("click", function() {
      plausible("email_subscribe");
    });
  }
})();
</script>'

COUNT=0
for f in $(find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/1099savvy/*" -not -path "*/passterra/*" -not -path "*/social-sniper/*"); do
  # Skip if already has Plausible
  if grep -q "plausible.io" "$f"; then
    continue
  fi

  # Inject Plausible snippet before </head>
  sed -i '' 's#</head>#'"$PLAUSIBLE_SNIPPET"'\n</head>#' "$f"
  
  # Only inject custom events script into non-blog non-pages pages 
  # (blog/pages are too many and don't have form/paywall)
  if echo "$f" | grep -qE '/(index|about|consultation|forecast|article-detail|widget-bazi-wealth|feng-shui-scan)\.html$'; then
    sed -i '' 's#</head>#'"$CUSTOM_EVENTS_SCRIPT"'\n</head>#' "$f"
  fi

  COUNT=$((COUNT + 1))
done

echo "Plausible snippet injected into $COUNT files"
echo "Custom events injected into key page files"
echo ""
echo "=== Verification: files with plausible ==="
grep -rl "plausible.io" --include="*.html" --exclude-dir=node_modules --exclude-dir=.git . | wc -l
echo "total files"
