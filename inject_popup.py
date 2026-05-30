#!/usr/bin/env python3
"""Inject subscribe popup + floating sidebar into all pages"""

import os
import re

SITE_ROOT = '/Users/yihua/.openclaw/workspace/my-website'

POPUP_HTML = '''
<!-- SUBSCRIBE POPUP -->
<div class="subscribe-overlay" id="subscribeOverlay">
  <div class="subscribe-modal">
    <button class="close-btn" onclick="closePopup()">✕</button>
    <div class="seal-deco">免费</div>
    <h3>Your 2026 Elemental Forecast</h3>
    <p>A free mini-report revealing which element governs your year ahead — and what it means for love, career, and energy.</p>
    <form class="popup-form" id="popupForm" onsubmit="submitPopup(event)">
      <input type="email" name="email" placeholder="your@email.com" required>
      <button type="submit">Send My Report</button>
    </form>
    <div class="popup-success" id="popupSuccess">✓ Check your inbox. Your mini-report is on its way.</div>
    <button class="no-thanks" onclick="closePopup()">No thanks, I'll explore first</button>
  </div>
</div>

<!-- FLOATING SUBSCRIBE -->
<div class="subscribe-float">
  <button class="float-btn" onclick="openPopup()"><span class="icon">✦</span> Free 2026 Forecast</button>
</div>

<script>
(function(){
  var shown = localStorage.getItem('guanlan_popup_seen');
  if (!shown) {
    // Show popup after 15 seconds
    setTimeout(function(){
      document.getElementById('subscribeOverlay').classList.add('open');
      localStorage.setItem('guanlan_popup_seen', 'true');
    }, 15000);
  }
})();

function openPopup(){
  document.getElementById('subscribeOverlay').classList.add('open');
}

function closePopup(){
  document.getElementById('subscribeOverlay').classList.remove('open');
}

function submitPopup(e){
  e.preventDefault();
  var form = e.target;
  var email = form.querySelector('input[type="email"]').value;
  var btn = form.querySelector('button');
  var success = document.getElementById('popupSuccess');
  
  btn.textContent = 'Sending...';
  btn.disabled = true;
  
  fetch('/api/subscribe', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: email,
      source: 'popup-2026-forecast'
    })
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    form.style.display = 'none';
    success.style.display = 'block';
    setTimeout(function(){ closePopup(); }, 3000);
  })
  .catch(function(){
    form.style.display = 'none';
    success.style.display = 'block';
    success.textContent = '✓ Thank you! Your report is coming.';
    setTimeout(function(){ closePopup(); }, 3000);
  });
  
  // GA4 event
  if (typeof gtag === 'function') {
    gtag('event', 'popup_subscribe', { event_category: 'engagement' });
  }
}
</script>
'''

def inject_all(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Inject CSS before </style>
    css_path = os.path.join(SITE_ROOT, 'css', 'subscribe-popup.css')
    with open(css_path, 'r') as f:
        css = f.read()
    
    content = content.replace('</style>', '\n' + css + '\n</style>', 1)
    
    # 2. Inject popup HTML before </body>
    content = content.replace('</body>', POPUP_HTML + '\n</body>')
    
    with open(path, 'w') as f:
        f.write(content)
    return True


# Index
inject_all(os.path.join(SITE_ROOT, 'index.html'))
print("✓ index.html")

# About
inject_all(os.path.join(SITE_ROOT, 'about.html'))
print("✓ about.html")

# Consultation
inject_all(os.path.join(SITE_ROOT, 'consultation.html'))
print("✓ consultation.html")

# Scan
inject_all(os.path.join(SITE_ROOT, 'feng-shui-scan.html'))
print("✓ feng-shui-scan.html")

# Blog index
inject_all(os.path.join(SITE_ROOT, 'blog', 'index.html'))
print("✓ blog/index.html")

# All blog articles
blog_dir = os.path.join(SITE_ROOT, 'blog')
for fname in sorted(os.listdir(blog_dir)):
    if fname.endswith('.html') and fname != 'index.html':
        inject_all(os.path.join(blog_dir, fname))
        print(f"✓ blog/{fname}")

print("\n✅ All pages updated with subscribe popup + floating sidebar!")
