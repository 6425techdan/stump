document.getElementById('settings-btn').addEventListener('click', openSettingsPage);

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

let currentSettings = { ...defaultSettings };

function openSettingsPage() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
  
    const closeModal = document.getElementsByClassName('close')[0];
    closeModal.onclick = function () {
      modal.style.display = 'none';
    };
  
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  
    const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('submit', saveSettings);
  }

function saveSettings(event) {
  event.preventDefault();

  const additionalSmall = parseInt(document.getElementById('additional-small').value) || 0;
  const additionalMedium = parseInt(document.getElementById('additional-medium').value) || 0;
  const additionalLarge = parseInt(document.getElementById('additional-large').value) || 0;
  const additionalXLarge = parseInt(document.getElementById('additional-xlarge').value) || 0;

  currentSettings = {
    small: {
      firstLargest: currentSettings.small.firstLargest,
      additional: additionalSmall
    },
    medium: {
      firstLargest: currentSettings.medium.firstLargest,
      additional: additionalMedium
    },
    large: {
      firstLargest: currentSettings.large.firstLargest,
      additional: additionalLarge
    },
    xlarge: {
      firstLargest: currentSettings.xlarge.firstLargest,
      additional: additionalXLarge
    }
  };

  console.log('Updated settings:', currentSettings);

  // Close the modal
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

function calculateTotal() {
  // Create an array of stump types
  const stumpTypes = ['small', 'medium', 'large', 'xlarge'];

  // Fetch the counts of each stump type
  const stumpCounts = stumpTypes.map(type => parseInt(document.getElementById(type).value) || 0);

  // Fetch the settings of each stump type
  const stumpSettings = stumpTypes.map(type => currentSettings[type]);

  // Determine the largest stump type
  const largestStumpIndex = stumpCounts.reduce((maxIndex, stumpCount, index) =>
    (stumpCount > 0 && stumpSettings[index].firstLargest > stumpSettings[maxIndex].firstLargest) ? index : maxIndex, 0);

  // Calculate the total cost for the largest stump type
  let total = 0;
  if (stumpCounts[largestStumpIndex] > 0) {
    total += stumpSettings[largestStumpIndex].firstLargest;  // initial price for the first largest stump
    stumpCounts[largestStumpIndex] -= 1;  // decrease the count of largest stump by one
  }

  // Calculate the total cost for the rest of the stumps
  for (let i = 0; i < stumpTypes.length; i++) {
    total += stumpCounts[i] * stumpSettings[i].additional;
  }

  return total;
}

document.getElementById('calculate-btn').addEventListener('click', function () {
  const total = calculateTotal();
  document.getElementById('result').textContent = `Total Price: $${total}`;
});
