(function () {
  'use strict';

  document.querySelectorAll('[data-cc-root]').forEach(initCasualCollection);

  function initCasualCollection(root) {
    /* ---------- Mobile filter drawer ---------- */
    var mobileToggle = root.querySelector('[data-cc-mobile-toggle]');
    var filtersPanel = root.querySelector('[data-cc-filters]');
    if (mobileToggle && filtersPanel) {
      mobileToggle.addEventListener('click', function () {
        var isOpen = filtersPanel.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });
    }

    /* ---------- Price dual-range slider ---------- */
    var sliderWrap = root.querySelector('[data-cc-price-slider]');
    if (sliderWrap) {
      var minInput = sliderWrap.querySelector('[data-cc-price-min]');
      var maxInput = sliderWrap.querySelector('[data-cc-price-max]');
      var rangeEl = sliderWrap.querySelector('[data-cc-price-range]');
      var minLabel = sliderWrap.querySelector('[data-cc-price-min-label]');
      var maxLabel = sliderWrap.querySelector('[data-cc-price-max-label]');
      var floor = parseFloat(sliderWrap.dataset.min);
      var ceiling = parseFloat(sliderWrap.dataset.max);

      function paintRange() {
        var minVal = parseFloat(minInput.value);
        var maxVal = parseFloat(maxInput.value);
        if (minVal > maxVal) {
          var tmp = minVal;
          minVal = maxVal;
          maxVal = tmp;
        }
        var minPct = ((minVal - floor) / (ceiling - floor)) * 100;
        var maxPct = ((maxVal - floor) / (ceiling - floor)) * 100;
        rangeEl.style.left = minPct + '%';
        rangeEl.style.width = (maxPct - minPct) + '%';
        minLabel.textContent = '$' + Math.round(minVal);
        maxLabel.textContent = '$' + Math.round(maxVal);
      }

      [minInput, maxInput].forEach(function (input) {
        input.addEventListener('input', function () {
          // keep handles from crossing awkwardly
          if (parseFloat(minInput.value) > parseFloat(maxInput.value) - 1) {
            if (input === minInput) {
              minInput.value = parseFloat(maxInput.value) - 1 >= floor ? parseFloat(maxInput.value) - 1 : floor;
            } else {
              maxInput.value = parseFloat(minInput.value) + 1 <= ceiling ? parseFloat(minInput.value) + 1 : ceiling;
            }
          }
          paintRange();
        });
      });

      paintRange();
    }

    /* ---------- Generic single/multi select toggles ---------- */
    function wireToggle(selector, multi) {
      var buttons = root.querySelectorAll(selector);
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!multi) {
            var wasActive = btn.classList.contains('is-active');
            buttons.forEach(function (b) { b.classList.remove('is-active'); });
            if (!wasActive) btn.classList.add('is-active');
          } else {
            btn.classList.toggle('is-active');
          }
        });
      });
    }
    wireToggle('[data-cc-type-filter]', false);
    wireToggle('[data-cc-color-filter]', true);
    wireToggle('[data-cc-size-filter]', true);
    wireToggle('[data-cc-style-filter]', false);

    /* ---------- Sort ---------- */
    var sortSelect = root.querySelector('[data-cc-sort]');
    var grid = root.querySelector('[data-cc-grid]');
    if (sortSelect && grid) {
      sortSelect.addEventListener('change', function () {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-cc-product]'));
        var value = sortSelect.value;
        if (value === 'price-ascending') {
          cards.sort(function (a, b) { return parseFloat(a.dataset.price) - parseFloat(b.dataset.price); });
        } else if (value === 'price-descending') {
          cards.sort(function (a, b) { return parseFloat(b.dataset.price) - parseFloat(a.dataset.price); });
        } else if (value === 'title-ascending') {
          cards.sort(function (a, b) {
            var at = a.querySelector('.cc-card-title').textContent.trim();
            var bt = b.querySelector('.cc-card-title').textContent.trim();
            return at.localeCompare(bt);
          });
        }
        cards.forEach(function (card) { grid.appendChild(card); });
      });
    }

    /* ---------- Apply filters ---------- */
    var applyBtn = root.querySelector('[data-cc-apply]');
    var noResultsEl = root.querySelector('[data-cc-no-results]');
    var resultsCountEl = root.querySelector('[data-cc-results-count]');

    if (applyBtn && grid) {
      applyBtn.addEventListener('click', function () {
        var activeType = root.querySelector('[data-cc-type-filter].is-active');
        var activeStyle = root.querySelector('[data-cc-style-filter].is-active');
        var activeColors = Array.prototype.map.call(
          root.querySelectorAll('[data-cc-color-filter].is-active'),
          function (el) { return el.dataset.value; }
        );
        var activeSizes = Array.prototype.map.call(
          root.querySelectorAll('[data-cc-size-filter].is-active'),
          function (el) { return el.dataset.value; }
        );

        var minPrice = sliderWrap ? Math.min(parseFloat(minInput.value), parseFloat(maxInput.value)) : null;
        var maxPrice = sliderWrap ? Math.max(parseFloat(minInput.value), parseFloat(maxInput.value)) : null;

        var cards = grid.querySelectorAll('[data-cc-product]');
        var visibleCount = 0;

        cards.forEach(function (card) {
          var price = parseFloat(card.dataset.price || '0');
          var colors = (card.dataset.colors || '').split(' ').filter(Boolean);
          var sizes = (card.dataset.sizes || '').split(' ').filter(Boolean);
          var types = (card.dataset.types || '').split(' ').filter(Boolean);
          var styles = (card.dataset.styles || '').split(' ').filter(Boolean);

          var passesPrice = sliderWrap ? (price >= minPrice && price <= maxPrice) : true;
          var passesType = activeType ? types.indexOf(activeType.dataset.value) !== -1 : true;
          var passesStyle = activeStyle ? styles.indexOf(activeStyle.dataset.value) !== -1 : true;
          var passesColor = activeColors.length
            ? activeColors.some(function (c) { return colors.indexOf(c) !== -1; })
            : true;
          var passesSize = activeSizes.length
            ? activeSizes.some(function (s) { return sizes.indexOf(s) !== -1; })
            : true;

          var visible = passesPrice && passesType && passesStyle && passesColor && passesSize;
          card.style.display = visible ? '' : 'none';
          if (visible) visibleCount++;
        });

        if (noResultsEl) noResultsEl.hidden = visibleCount !== 0;
        if (resultsCountEl) {
          resultsCountEl.textContent = 'Showing ' + visibleCount + ' Product' + (visibleCount === 1 ? '' : 's');
        }

        // Close mobile drawer after applying, for a native feel
        if (filtersPanel && filtersPanel.classList.contains('is-open')) {
          filtersPanel.classList.remove('is-open');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
})();
