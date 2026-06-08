/**
 * result-particles.js — gold dust drift for free-chart identity-hook
 */
(function() {
  'use strict';

  var hook = document.getElementById('identity-hook');
  var canvas = document.getElementById('result-particles');
  if (!hook || !canvas) return;

  var ctx = canvas.getContext('2d');
  var W = 0;
  var H = 0;
  var dpr = 1;
  var particles = [];
  var animId = null;
  var tabVisible = !document.hidden;
  var inViewport = false;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function spawnParticle(yOverride) {
    return {
      x: Math.random() * W,
      y: yOverride != null ? yOverride : Math.random() * H,
      r: rand(0.5, 1.5),
      speed: rand(0.2, 0.5),
      baseAlpha: rand(0.15, 0.4)
    };
  }

  function initParticles() {
    var count = Math.floor(rand(50, 81));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(spawnParticle());
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hook.clientWidth;
    H = hook.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) initParticles();
  }

  function draw() {
    if (!tabVisible || !inViewport || W <= 0 || H <= 0) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.speed;

      if (p.y < -p.r) {
        p.x = Math.random() * W;
        p.y = H + rand(0, H * 0.2);
        p.r = rand(0.5, 1.5);
        p.speed = rand(0.2, 0.5);
        p.baseAlpha = rand(0.15, 0.4);
      }

      var heightFactor = Math.max(0, Math.min(1, p.y / H));
      var alpha = p.baseAlpha * heightFactor;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(197,152,74,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  function start() {
    if (animId === null && tabVisible && inViewport) {
      animId = requestAnimationFrame(draw);
    }
  }

  function stop() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  document.addEventListener('visibilitychange', function() {
    tabVisible = !document.hidden;
    if (tabVisible && inViewport) start();
    else stop();
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(function() {
      resize();
    }).observe(hook);
  } else {
    window.addEventListener('resize', resize);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries) {
      inViewport = entries[0].isIntersecting;
      if (inViewport) {
        resize();
        start();
      } else {
        stop();
      }
    }, { threshold: 0.05 }).observe(hook);
  } else {
    inViewport = true;
    resize();
    start();
  }

  resize();
})();
