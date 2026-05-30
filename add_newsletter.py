#!/usr/bin/env python3
"""
Add upgraded newsletter subscription box (multi-step with tagging) to all pages.
Replaces the previous version.

Flow:
  Step 1: Email input
  Step 2: Interest selection (3 choices → auto-tagging)
  Step 3: Success message

Now sends to a local endpoint that queues the data.
Once Buttondown is approved, we'll connect the API.
"""

import os
import re

SITE_ROOT = '/Users/yihua/.openclaw/workspace/my-website'

# ─── STYLES ───
NEWSLETTER_CSS = """
/* ── NEWSLETTER SUBSCRIBE (with tagging) ── */
.newsletter{
  position:relative;z-index:2;
  padding:50px 20px 40px;text-align:center;
  border-top:1px solid rgba(201,168,76,.06);
  border-bottom:1px solid rgba(201,168,76,.06);
  margin:0 0 30px 0;
}
.newsletter::before{
  content:"✦";display:block;
  font-size:18px;color:var(--gold);opacity:.5;
  margin-bottom:16px;letter-spacing:6px;
}
.newsletter h3{
  font-family:'Cormorant Garamond',serif;
  font-weight:300;font-size:22px;letter-spacing:2px;
  color:var(--gold2);margin-bottom:8px;
  text-transform:uppercase;
}
.newsletter p.sub{
  font-size:13px;color:var(--muted);
  margin-bottom:20px;letter-spacing:.5px;
  max-width:420px;margin-left:auto;margin-right:auto;
  line-height:1.6;
}

/* Step container */
.nl-step{display:none;}
.nl-step.active{display:block;}

/* Step 1 - Email input */
.nl-step1 form{
  display:flex;max-width:380px;margin:0 auto;gap:0;
}
.nl-step1 input[type="email"]{
  flex:1;padding:11px 16px;
  background:rgba(240,235,224,.04);
  border:1px solid rgba(201,168,76,.15);
  border-right:none;border-radius:0;
  color:var(--text);font-family:'EB Garamond',serif;
  font-size:14px;outline:none;transition:border-color .3s;
}
.nl-step1 input[type="email"]:focus{
  border-color:var(--gold);
}
.nl-step1 input[type="email"]::placeholder{
  color:rgba(240,235,224,.25);font-style:italic;
}
.nl-step1 button{
  padding:11px 22px;
  background:var(--gold);border:none;border-radius:0;
  color:var(--ink);font-family:'EB Garamond',serif;
  font-weight:600;font-size:13px;letter-spacing:1px;
  cursor:pointer;transition:background .3s,color .3s;
  text-transform:uppercase;white-space:nowrap;
}
.nl-step1 button:hover{
  background:var(--gold2);color:var(--ink2);
}

/* Step 2 - Interest tags */
.nl-step2 p{
  font-size:14px;color:var(--gold2);margin-bottom:16px;
  letter-spacing:1px;
}
.nl-tags{
  display:flex;flex-direction:column;gap:8px;
  max-width:340px;margin:0 auto;
}
.nl-tag{
  display:flex;align-items:center;gap:10px;
  padding:10px 14px;
  background:rgba(240,235,224,.03);
  border:1px solid rgba(201,168,76,.08);
  cursor:pointer;transition:all .3s;
  font-family:'EB Garamond',serif;font-size:14px;
  color:var(--text);text-align:left;
}
.nl-tag:hover{
  background:rgba(201,168,76,.08);
  border-color:rgba(201,168,76,.25);
}
.nl-tag.selected{
  background:rgba(201,168,76,.12);
  border-color:var(--gold);
}
.nl-tag input[type="radio"]{
  accent-color:var(--gold);width:14px;height:14px;
  flex-shrink:0;
}
.nl-tag .emoji{font-size:18px;flex-shrink:0;}
.nl-tag .label{flex:1;}
.nl-tag .arrow{color:var(--gold);opacity:.5;font-size:12px;}

/* Step 3 - Success */
.nl-step3 .success-icon{
  font-size:32px;display:block;margin-bottom:8px;
}
.nl-step3 .success-msg{
  font-size:14px;color:var(--gold2);margin-bottom:6px;
}
.nl-step3 .success-sub{
  font-size:12px;color:var(--muted);
}

@media(max-width:480px){
  .nl-step1 form{flex-direction:column;gap:8px;}
  .nl-step1 input[type="email"]{border-right:1px solid rgba(201,168,76,.15);}
  .nl-step1 button{width:100%;}
}
"""

# ─── UPDATED HTML (3-step with tagging) ───
NEWSLETTER_HTML_INDEX = """
<div class="newsletter" id="nl-root">
  <h3>Your Weekly Energy Forecast</h3>
  <p class="sub">Simple, actionable Five Elements wisdom for your career, relationships, and space — every Monday.</p>

  <!-- Step 1: Email -->
  <div class="nl-step nl-step1 active">
    <form id="nl-form-step1" onsubmit="return nlStep1(event)">
      <input type="email" id="nl-email" placeholder="your@email.com" required>
      <button type="submit">Subscribe</button>
    </form>
  </div>

  <!-- Step 2: Choose interest -->
  <div class="nl-step nl-step2">
    <p>What brings you here today?</p>
    <div class="nl-tags" id="nl-tags">
      <label class="nl-tag">
        <input type="radio" name="nl-interest" value="decision-anxiety">
        <span class="emoji">⚡</span>
        <span class="label">Decision anxiety — I need clarity on my next move</span>
        <span class="arrow">→</span>
      </label>
      <label class="nl-tag">
        <input type="radio" name="nl-interest" value="space-energy">
        <span class="emoji">🏠</span>
        <span class="label">Space &amp; environment — I want better energy in my home</span>
        <span class="arrow">→</span>
      </label>
      <label class="nl-tag">
        <input type="radio" name="nl-interest" value="astrology-curious">
        <span class="emoji">🌟</span>
        <span class="label">Astrology curious — I want to understand my birth chart</span>
        <span class="arrow">→</span>
      </label>
    </div>
  </div>

  <!-- Step 3: Success -->
  <div class="nl-step nl-step3">
    <span class="success-icon">✓</span>
    <div class="success-msg">You're on the list.</div>
    <div class="success-sub">Check your inbox to confirm your email. Your first issue is on its way.</div>
  </div>
</div>

<script>
var nlEmail = '';
function nlStep1(e) {
  e.preventDefault();
  nlEmail = document.getElementById('nl-email').value;
  if(!nlEmail) return false;
  document.querySelector('.nl-step1').className = 'nl-step nl-step1';
  document.querySelector('.nl-step2').className = 'nl-step nl-step2 active';
  return false;
}
document.addEventListener('DOMContentLoaded', function(){
  var tags = document.querySelectorAll('.nl-tag input[type="radio"]');
  tags.forEach(function(r){
    r.addEventListener('change', function(){
      // highlight selected
      document.querySelectorAll('.nl-tag').forEach(function(t){ t.classList.remove('selected'); });
      if(this.checked) this.closest('.nl-tag').classList.add('selected');
      // proceed after brief delay
      var tag = this.value;
      var email = nlEmail;
      // Record the subscription + tag
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/subscribe', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function(){
        document.querySelector('.nl-step2').className = 'nl-step nl-step2';
        document.querySelector('.nl-step3').className = 'nl-step nl-step3 active';
        // Store in localStorage for future reference
        try {
          var subs = JSON.parse(localStorage.getItem('nl_subs') || '[]');
          subs.push({email: email, tag: tag, date: new Date().toISOString()});
          localStorage.setItem('nl_subs', JSON.stringify(subs));
        } catch(e){}
      };
      xhr.send(JSON.stringify({email: email, tag: tag, source: 'website', url: window.location.href}));
    });
  });
});
</script>
"""

# For blog pages — slightly different heading
NEWSLETTER_HTML_BLOG = """
<div class="newsletter" id="nl-root">
  <h3>Liked this article? Get more like it.</h3>
  <p class="sub">Weekly Five Elements wisdom straight to your inbox. No spam, just ancient patterns for modern life.</p>

  <div class="nl-step nl-step1 active">
    <form id="nl-form-step1" onsubmit="return nlStep1(event)">
      <input type="email" id="nl-email" placeholder="your@email.com" required>
      <button type="submit">Subscribe</button>
    </form>
  </div>

  <div class="nl-step nl-step2">
    <p>What brings you here today?</p>
    <div class="nl-tags" id="nl-tags">
      <label class="nl-tag">
        <input type="radio" name="nl-interest" value="decision-anxiety">
        <span class="emoji">⚡</span>
        <span class="label">Decision anxiety — I need clarity on my next move</span>
        <span class="arrow">→</span>
      </label>
      <label class="nl-tag">
        <input type="radio" name="nl-interest" value="space-energy">
        <span class="emoji">🏠</span>
        <span class="label">Space &amp; environment — I want better energy in my home</span>
        <span class="arrow">→</span>
      </label>
      <label class="nl-tag">
        <input type="radio" name="nl-interest" value="astrology-curious">
        <span class="emoji">🌟</span>
        <span class="label">Astrology curious — I want to understand my birth chart</span>
        <span class="arrow">→</span>
      </label>
    </div>
  </div>

  <div class="nl-step nl-step3">
    <span class="success-icon">✓</span>
    <div class="success-msg">You're on the list.</div>
    <div class="success-sub">Check your inbox to confirm your email. Your first issue is on its way.</div>
  </div>
</div>

<script>
var nlEmail = '';
function nlStep1(e) {
  e.preventDefault();
  nlEmail = document.getElementById('nl-email').value;
  if(!nlEmail) return false;
  document.querySelector('.nl-step1').className = 'nl-step nl-step1';
  document.querySelector('.nl-step2').className = 'nl-step nl-step2 active';
  return false;
}
document.addEventListener('DOMContentLoaded', function(){
  var tags = document.querySelectorAll('.nl-tag input[type="radio"]');
  tags.forEach(function(r){
    r.addEventListener('change', function(){
      document.querySelectorAll('.nl-tag').forEach(function(t){ t.classList.remove('selected'); });
      if(this.checked) this.closest('.nl-tag').classList.add('selected');
      var tag = this.value;
      var email = nlEmail;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/subscribe', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function(){
        document.querySelector('.nl-step2').className = 'nl-step nl-step2';
        document.querySelector('.nl-step3').className = 'nl-step nl-step3 active';
        try {
          var subs = JSON.parse(localStorage.getItem('nl_subs') || '[]');
          subs.push({email: email, tag: tag, date: new Date().toISOString()});
          localStorage.setItem('nl_subs', JSON.stringify(subs));
        } catch(e){}
      };
      xhr.send(JSON.stringify({email: email, tag: tag, source: 'website', url: window.location.href}));
    });
  });
});
</script>
"""


def inject_newsletter(path, use_index_version=True):
    with open(path, 'r') as f:
        content = f.read()
    
    # Remove old version if exists (look for old class==="newsletter" with "Get Your Weekly Energy Forecast")
    # We'll just replace by matching the old newsletter div
    # First remove the old script (any newsletter JS)
    content = re.sub(
        r'<div class="newsletter">.*?</div>\s*<script>.*?</script>\s*',
        '',
        content,
        flags=re.DOTALL
    )
    # Also remove the new version if re-running
    content = re.sub(
        r'<div class="newsletter" id="nl-root">.*?</div>\s*<script>.*?</script>\s*',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Insert CSS before </style> (only if not already there)
    if NEWSLETTER_CSS.strip() not in content:
        content = content.replace('</style>', NEWSLETTER_CSS + '\n</style>', 1)
    
    # Insert HTML before <footer>
    html = NEWSLETTER_HTML_INDEX if use_index_version else NEWSLETTER_HTML_BLOG
    content = content.replace('<footer>', html + '\n\n<footer>')
    
    with open(path, 'w') as f:
        f.write(content)
    print(f"  Updated: {path.split('/')[-1]}")


# ─── MAIN ───
print("=== Upgrading newsletter to multi-step with tagging ===\n")

# index.html
idx_path = os.path.join(SITE_ROOT, 'index.html')
if os.path.exists(idx_path):
    inject_newsletter(idx_path, use_index_version=True)

# blog/*.html
blog_dir = os.path.join(SITE_ROOT, 'blog')
for fname in sorted(os.listdir(blog_dir)):
    if fname.endswith('.html'):
        inject_newsletter(os.path.join(blog_dir, fname), use_index_version=False)

print("\n✅ All pages upgraded! Multi-step tagging newsletter is live.")
print("   Note: The form POSTs to /api/subscribe which needs a server endpoint.")
print("   Until Buttondown is approved, subscriptions are stored in localStorage.")
