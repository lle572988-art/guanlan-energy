(function () {
  var path = window.location.pathname || '';
  if (path.indexOf('/blog/') !== 0) return;
  if (path === '/blog/' || path === '/blog/index.html') return;

  var STYLE_ID = 'guanlan-blog-chrome-styles';
  var CHROME_STYLES =
    'nav.guanlan-blog-nav{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}' +
    '.guanlan-breadcrumb{max-width:720px;margin:0 auto;padding:0.65rem 1.5rem 0;font-size:0.82rem;color:rgba(155,181,204,0.55);line-height:1.5;border-bottom:1px solid rgba(197,152,74,0.08)}' +
    '.guanlan-breadcrumb a{color:rgba(226,194,122,0.75);text-decoration:none}' +
    '.guanlan-breadcrumb a:hover{color:#E2C27A}' +
    '.guanlan-breadcrumb span{color:rgba(155,181,204,0.45)}' +
    '.guanlan-article-toc{margin:0 0 2rem;padding:1rem 1.15rem;background:rgba(12,22,40,0.65);border:1px solid rgba(197,152,74,0.12);border-radius:2px}' +
    '.guanlan-article-toc-title{font-family:Cinzel,"Times New Roman",serif;font-size:0.58rem;letter-spacing:0.16em;text-transform:uppercase;color:rgba(197,152,74,0.55);margin-bottom:0.65rem}' +
    '.guanlan-article-toc ol{margin:0;padding-left:1.15rem;color:rgba(127,160,186,0.9);font-size:0.92rem}' +
    '.guanlan-article-toc li{margin-bottom:0.35rem}' +
    '.guanlan-article-toc a{color:rgba(226,194,122,0.85);text-decoration:none}' +
    '.guanlan-article-toc a:hover{color:#E2C27A;text-decoration:underline}' +
    '.guanlan-back-journal{margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid rgba(197,152,74,0.1);font-size:0.9rem}' +
    '.guanlan-back-journal a{font-family:Cinzel,"Times New Roman",serif;font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(197,152,74,0.75);text-decoration:none}' +
    '.guanlan-back-journal a:hover{color:#E2C27A}';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CHROME_STYLES;
    document.head.appendChild(style);
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 48);
  }

  function ensureNav() {
    var nav = document.querySelector('body > nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'guanlan-blog-nav';
      nav.style.cssText =
        'position:sticky;top:0;z-index:10;background:rgba(3,7,15,0.92);padding:0.9rem 1.5rem;border-bottom:1px solid rgba(197,152,74,0.12)';
      nav.innerHTML =
        '<a href="/" style="font-family:Cinzel,serif;font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A6680;text-decoration:none">Guanlan Energy</a>' +
        '<a href="/blog/" style="font-family:Cinzel,serif;font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A6680;text-decoration:none">← Journal</a>' +
        '<a href="/free-chart.html" style="font-family:Cinzel,serif;font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A6680;text-decoration:none">Free Calculator</a>';
      document.body.insertBefore(nav, document.body.firstChild);
      return nav;
    }

    nav.classList.add('guanlan-blog-nav');
    if (!nav.querySelector('a[href="/blog/"]')) {
      var journal = document.createElement('a');
      journal.href = '/blog/';
      journal.textContent = '← Journal';
      if (nav.querySelector('a')) {
        journal.className = nav.querySelector('a').className;
      } else {
        journal.style.cssText =
          'font-family:Cinzel,serif;font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A6680;text-decoration:none';
      }
      var calc = nav.querySelector('a[href="/free-chart.html"]');
      if (calc) {
        nav.insertBefore(journal, calc);
      } else {
        nav.appendChild(journal);
      }
    }
    return nav;
  }

  function addBreadcrumb(nav) {
    if (document.querySelector('.guanlan-breadcrumb')) return;
    var h1 = document.querySelector('.container h1') || document.querySelector('h1');
    var title = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : 'Article';
    if (title.length > 72) title = title.substring(0, 69) + '…';

    var bc = document.createElement('div');
    bc.className = 'guanlan-breadcrumb';
    bc.setAttribute('aria-label', 'Breadcrumb');
    bc.innerHTML =
      '<a href="/">Home</a><span aria-hidden="true"> · </span>' +
      '<a href="/blog/">Journal</a><span aria-hidden="true"> · </span>' +
      '<span>' + title + '</span>';

    if (nav && nav.nextSibling) {
      nav.parentNode.insertBefore(bc, nav.nextSibling);
    } else if (nav) {
      nav.after(bc);
    } else {
      var container = document.querySelector('.container');
      if (container) container.insertBefore(bc, container.firstChild);
    }
  }

  function addArticleToc() {
    var container = document.querySelector('.container');
    if (!container || container.querySelector('.guanlan-article-toc')) return;

    var headings = container.querySelectorAll('h2');
    if (headings.length < 3) return;

    var items = [];
    headings.forEach(function (heading, index) {
      var text = heading.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      var id = heading.id || slugify(text) || 'section-' + (index + 1);
      if (!heading.id) heading.id = id;
      items.push({ id: id, text: text });
    });

    if (items.length < 3) return;

    var toc = document.createElement('nav');
    toc.className = 'guanlan-article-toc';
    toc.setAttribute('aria-label', 'Table of contents');
    var list = items.map(function (item) {
      return '<li><a href="#' + item.id + '">' + item.text + '</a></li>';
    }).join('');
    toc.innerHTML = '<p class="guanlan-article-toc-title">In this article</p><ol>' + list + '</ol>';

    var anchor = container.querySelector('.subtitle') || container.querySelector('h1');
    if (anchor && anchor.nextSibling) {
      anchor.parentNode.insertBefore(toc, anchor.nextSibling);
    } else if (anchor) {
      anchor.after(toc);
    } else {
      container.insertBefore(toc, container.firstChild);
    }
  }

  function addBackLink() {
    var container = document.querySelector('.container');
    if (!container || container.querySelector('.guanlan-back-journal')) return;

    var back = document.createElement('p');
    back.className = 'guanlan-back-journal';
    back.innerHTML = '<a href="/blog/">← Back to Guanlan Energy Journal</a>';

    var related = container.querySelector('.related');
    if (related) {
      container.insertBefore(back, related);
    } else {
      container.appendChild(back);
    }
  }

  function run() {
    injectStyles();
    var nav = ensureNav();
    addBreadcrumb(nav);
    addArticleToc();
    addBackLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
