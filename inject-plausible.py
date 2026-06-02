#!/usr/bin/env python3
"""Inject Plausible Analytics + custom event tracking into all HTML files."""

import os, glob, re

ROOT = "/Users/yihua/.openclaw/workspace"

PLAUSIBLE_SRC = "https://plausible.io/js/script.js"
EXCLUDE_DIRS = {"node_modules", ".git", "1099savvy", "passterra", "social-sniper"}

PLAUSIBLE_SNIPPET = """<!-- Plausible Analytics -->
<script defer data-domain="metaphysicflow.com" src="https://plausible.io/js/script.js"></script>
<script>
window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
</script>
"""

CUSTOM_EVENTS = """<!-- Funnel Tracking (Plausible custom events) -->
<script>
(function() {
  // form_view: when form card enters viewport
  var formCard = document.querySelector(".form-card");
  if (formCard) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { plausible("form_view"); obs.disconnect(); }
      });
    }, { threshold: 0.3 });
    obs.observe(formCard);
  }

  // form_start: first field focus
  var inputs = document.querySelectorAll("#username, #birthdate, #birthtime, .gw-field");
  var started = false;
  inputs.forEach(function(inp) {
    inp.addEventListener("focus", function() {
      if (!started) { started = true; plausible("form_start"); }
    });
  });

  // form_submit: BaZi form submission
  var baziForm = document.querySelector("form[onsubmit*='runGuanlanEngine']");
  if (baziForm) {
    baziForm.addEventListener("submit", function() { plausible("form_submit"); });
  }

  // report_generated: patch runGuanlanEngine
  var origEngine = window.runGuanlanEngine;
  if (origEngine) {
    window.runGuanlanEngine = function(e) {
      origEngine(e);
      // The original code sets results display after 4200ms via setTimeout
      // We intercept the relevant setTimeout to fire our event
      var origST = window.setTimeout;
      window.setTimeout = function(fn, ms) {
        return origST(function() {
          fn();
          if (ms > 4000) {
            setTimeout(function() { plausible("report_generated"); }, 200);
            window.setTimeout = origST;
          }
        }, ms);
      };
    };
  }

  // paywall_view & paywall_click
  var paywallBtn = document.querySelector(".cta-btn.gumroad-button");
  if (paywallBtn) {
    var pwObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { plausible("paywall_view"); pwObs.disconnect(); }
      });
    }, { threshold: 0.3 });
    pwObs.observe(paywallBtn);
    paywallBtn.addEventListener("click", function() { plausible("paywall_click"); });
  }

  // email_subscribe: popup form + widget
  var popupForm = document.querySelector(".popup-form");
  if (popupForm) popupForm.addEventListener("submit", function() { plausible("email_subscribe"); });

  var widgetBtn = document.querySelector(".gw-email-box .gw-btn");
  if (widgetBtn) widgetBtn.addEventListener("click", function() { plausible("email_subscribe"); });

  // gumroad purchase_complete (fires when user lands back from Gumroad)
  if (window.location.search.includes("gumroad_return")) {
    plausible("purchase_complete");
  }
})();
</script>
"""

KEY_PAGES = {
    "index.html", "about.html", "consultation.html", "forecast.html",
    "article-detail.html", "widget-bazi-wealth.html", "feng-shui-scan.html",
    "disclaimer.html", "privacy.html", "terms.html", "refund.html",
}

count_total = 0
count_custom = 0

for root, dirs, files in os.walk(ROOT):
    # Skip excluded dirs
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

    for f in files:
        if not f.endswith(".html"):
            continue
        fpath = os.path.join(root, f)

        with open(fpath, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()

        # Skip if already has Plausible
        if "plausible.io" in content:
            continue

        # Find </head> and inject snippet before it
        if "</head>" not in content:
            continue

        # Determine relative path for KEY_PAGES matching
        rel = os.path.relpath(fpath, ROOT)
        is_key = rel in KEY_PAGES

        # Inject Plausible snippet
        content = content.replace("</head>", PLAUSIBLE_SNIPPET + "</head>", 1)

        # Inject custom events for key pages only
        if is_key:
            content = content.replace("</head>", CUSTOM_EVENTS + "</head>", 1)
            count_custom += 1

        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)

        count_total += 1

print(f"Plausible snippet injected: {count_total} files")
print(f"Custom events injected: {count_custom} files (key pages)")
print()
print("=== Verification ===")
os.system("cd '{}' && grep -rl 'plausible.io' --include='*.html' --exclude-dir=node_modules --exclude-dir=.git . | wc -l".format(ROOT))
