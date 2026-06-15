/**
 * Post-purchase intake — floor plan + facing + birth data for manual report delivery.
 */
(function () {
  'use strict';

  var FACING_OPTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  function el(id) { return document.getElementById(id); }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function uploadImage(dataUrl) {
    return fetch('/api/upload-compass-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: dataUrl }),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Upload failed');
        return data.url;
      });
    });
  }

  function prefillFromIntake() {
    var intake = window.CompassIntake && CompassIntake.load();
    if (!intake) return;
    if (intake.dob && el('intakeDob')) el('intakeDob').value = intake.dob;
    if (intake.gender && el('intakeGender')) el('intakeGender').value = intake.gender;
    if (intake.facing && el('intakeFacing')) el('intakeFacing').value = intake.facing;
  }

  function init() {
    var form = el('intakeForm');
    if (!form) return;

    prefillFromIntake();

    var params = new URLSearchParams(location.search);
    var product = params.get('product') || 'compass-home';
    if (el('intakeProduct')) el('intakeProduct').value = product;

    var emailParam = params.get('email');
    if (emailParam && el('intakeEmail')) el('intakeEmail').value = emailParam;

    var drop = el('intakeDrop');
    var fileInput = el('intakeFile');
    var preview = el('intakePreview');
    var previewImg = el('intakePreviewImg');
    var fileDataUrl = null;

    function showPreview(src) {
      if (!preview || !previewImg) return;
      previewImg.src = src;
      preview.hidden = false;
    }

    function onFile(file) {
      if (!file) return;
      readFileAsDataUrl(file).then(function (url) {
        fileDataUrl = url;
        showPreview(url);
      }).catch(function () {
        alert('Could not read that image. Try JPG or PNG.');
      });
    }

    if (drop && fileInput) {
      drop.addEventListener('click', function () { fileInput.click(); });
      drop.addEventListener('dragover', function (e) {
        e.preventDefault();
        drop.classList.add('drag');
      });
      drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
      drop.addEventListener('drop', function (e) {
        e.preventDefault();
        drop.classList.remove('drag');
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', function () {
        if (fileInput.files[0]) onFile(fileInput.files[0]);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = el('intakeSubmit');
      var err = el('intakeError');
      var ok = el('intakeSuccess');
      if (err) err.hidden = true;
      if (ok) ok.hidden = true;

      if (!fileDataUrl) {
        if (err) {
          err.textContent = 'Please upload your floor plan.';
          err.hidden = false;
        }
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Uploading…';

      uploadImage(fileDataUrl)
        .then(function (floorPlanUrl) {
          btn.textContent = 'Submitting…';
          return fetch('/api/compass-report-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: el('intakeEmail').value.trim(),
              facing: el('intakeFacing').value,
              dob: el('intakeDob').value,
              gender: el('intakeGender').value,
              notes: el('intakeNotes').value.trim(),
              floorPlanUrl: floorPlanUrl,
              product: el('intakeProduct').value,
            }),
          }).then(function (r) {
            return r.json().then(function (data) {
              if (!r.ok) throw new Error(data.error || 'Submit failed');
              return data;
            });
          });
        })
        .then(function () {
          form.hidden = true;
          if (ok) ok.hidden = false;
          if (window.CompassIntake) {
            CompassIntake.save({
              dob: el('intakeDob').value,
              gender: el('intakeGender').value,
              facing: el('intakeFacing').value,
            });
            CompassIntake.track('compass_intake_complete', { product: el('intakeProduct').value });
          }
        })
        .catch(function (ex) {
          if (err) {
            err.textContent = ex.message || 'Something went wrong. Email hello@metaphysicflow.com.';
            err.hidden = false;
          }
          btn.disabled = false;
          btn.textContent = 'Submit home details';
        });
    });

    if (window.CompassIntake) CompassIntake.track('compass_intake_view', { product: product });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
