const STORAGE_KEY = 'stumpCalculatorSettings';

const stumpTypes = [
  { id: 'small', label: 'Small', size: '<1 ft' },
  { id: 'medium', label: 'Medium', size: '1-2 ft' },
  { id: 'large', label: 'Large', size: '2-3 ft' },
  { id: 'xlarge', label: 'X-Large', size: '3+ ft' }
];

const defaultSettings = {
  small: {
    firstLargest: 125,
    additional: 25
  },
  medium: {
    firstLargest: 200,
    additional: 75
  },
  large: {
    firstLargest: 275,
    additional: 125
  },
  xlarge: {
    firstLargest: 350,
    additional: 175
  }
};

let currentSettings = loadSettings();

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

document.getElementById('settings-btn').addEventListener('click', openSettingsPage);
document.getElementById('calculate-btn').addEventListener('click', renderEstimate);
document.getElementById('settings-form').addEventListener('submit', saveSettings);
document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);
document.querySelector('.close').addEventListener('click', closeSettingsPage);
document.getElementById('modal').addEventListener('click', function (event) {
  if (event.target === event.currentTarget) {
    closeSettingsPage();
  }
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeSettingsPage();
  }
});

function openSettingsPage() {
  populateSettingsForm();
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('base-small').focus();
}

function closeSettingsPage() {
  document.getElementById('modal').style.display = 'none';
}

function populateSettingsForm() {
  stumpTypes.forEach(function (type) {
    document.getElementById(`base-${type.id}`).value = currentSettings[type.id].firstLargest;
    document.getElementById(`additional-${type.id}`).value = currentSettings[type.id].additional;
  });
}

function saveSettings(event) {
  event.preventDefault();

  currentSettings = stumpTypes.reduce(function (settings, type) {
    settings[type.id] = {
      firstLargest: readWholeNumberInput(`base-${type.id}`),
      additional: readWholeNumberInput(`additional-${type.id}`)
    };

    return settings;
  }, {});

  saveSettingsToStorage(currentSettings);
  closeSettingsPage();
  renderEstimate();
}

function resetSettings() {
  currentSettings = cloneSettings(defaultSettings);
  saveSettingsToStorage(currentSettings);
  populateSettingsForm();
  renderEstimate();
}

function calculateEstimate() {
  const counts = getStumpCounts();
  const largestType = [...stumpTypes].reverse().find(function (type) {
    return counts[type.id] > 0;
  });

  if (!largestType) {
    return {
      total: 0,
      largestType: null,
      rows: []
    };
  }

  let total = currentSettings[largestType.id].firstLargest;
  const remainingCounts = { ...counts };
  remainingCounts[largestType.id] -= 1;

  const rows = [{
    label: `${largestType.label} base visit rate`,
    quantity: 1,
    rate: currentSettings[largestType.id].firstLargest,
    subtotal: currentSettings[largestType.id].firstLargest
  }];

  stumpTypes.forEach(function (type) {
    const quantity = remainingCounts[type.id];
    const rate = currentSettings[type.id].additional;
    const subtotal = quantity * rate;

    if (quantity > 0) {
      rows.push({
        label: `${type.label} additional stump (${type.size})`,
        quantity,
        rate,
        subtotal
      });
      total += subtotal;
    }
  });

  return {
    total,
    largestType,
    rows
  };
}

function renderEstimate() {
  const result = document.getElementById('result');
  const estimate = calculateEstimate();

  if (!estimate.largestType) {
    result.innerHTML = '<p class="text-center text-gray-500">Enter at least one stump to calculate a quote.</p>';
    return;
  }

  const rows = estimate.rows.map(function (row) {
    return `
      <tr class="border-t">
        <td class="py-2 pr-2">${row.label}</td>
        <td class="py-2 px-2 text-right">${row.quantity}</td>
        <td class="py-2 px-2 text-right">${formatCurrency(row.rate)}</td>
        <td class="py-2 pl-2 text-right font-bold">${formatCurrency(row.subtotal)}</td>
      </tr>
    `;
  }).join('');

  result.innerHTML = `
    <div class="border rounded p-4 bg-gray-50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-bold text-xl">Estimate breakdown</h2>
        <span class="font-bold text-2xl text-blue-600">${formatCurrency(estimate.total)}</span>
      </div>
      <p class="text-sm text-gray-600 mb-3">
        Largest stump tier: ${estimate.largestType.label}. One stump receives that base rate; the rest use additional-stump rates.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-gray-500">
              <th class="text-left pb-2">Line item</th>
              <th class="text-right pb-2">Qty</th>
              <th class="text-right pb-2">Rate</th>
              <th class="text-right pb-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function getStumpCounts() {
  return stumpTypes.reduce(function (counts, type) {
    counts[type.id] = readWholeNumberInput(type.id);
    return counts;
  }, {});
}

function readWholeNumberInput(id) {
  const value = Number(document.getElementById(id).value);

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeSettings(savedSettings);
  } catch (error) {
    return cloneSettings(defaultSettings);
  }
}

function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    // The current session should keep working even when browser storage is blocked.
  }
}

function normalizeSettings(settings) {
  return stumpTypes.reduce(function (normalized, type) {
    const defaultTypeSettings = defaultSettings[type.id];
    const savedTypeSettings = settings && settings[type.id] ? settings[type.id] : {};

    normalized[type.id] = {
      firstLargest: toNonNegativeInteger(savedTypeSettings.firstLargest, defaultTypeSettings.firstLargest),
      additional: toNonNegativeInteger(savedTypeSettings.additional, defaultTypeSettings.additional)
    };

    return normalized;
  }, {});
}

function cloneSettings(settings) {
  return normalizeSettings(settings);
}

function toNonNegativeInteger(value, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return Math.floor(numericValue);
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}
