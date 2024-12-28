// Default settings
let responseRate = 50;
let attendanceRate = 70;
let reminderEffectiveness = 15;

// Store a reference to the modal instance
let advancedModalInstance;

document.addEventListener('DOMContentLoaded', function () {
  const modalElement = document.getElementById('advancedModal');
  advancedModalInstance = new bootstrap.Modal(modalElement);

  const year = new Date().getFullYear();
  document.getElementById('year').textContent = year;

  const toggleSwitch = document.getElementById('toggleSwitch');
  toggleForms(toggleSwitch.checked);

  toggleSwitch.addEventListener('change', (event) => {
    toggleForms(event.target.checked);
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculate);
  });
});

function toggleForms(showForwards) {
  const forwardsForm = document.getElementById('forwardsForm');
  const backwardsForm = document.getElementById('backwardsForm');

  if (showForwards) {
    forwardsForm.style.display = 'block';
    backwardsForm.style.display = 'none';
    clearBackwardsFormInputs();
  } else {
    forwardsForm.style.display = 'none';
    backwardsForm.style.display = 'block';
    clearForwardsFormInputs();
  }

  document.getElementById('visualisation').innerHTML = '';
  document.querySelector('.disclaimer').style.display = 'none';
  document.getElementById('resultDisplay').textContent = "Results will appear here…";
}

function clearForwardsFormInputs() {
  document.getElementById('invitesSent').value = '';
  document.getElementById('reminders').value = '';
  document.getElementById('averageGuests').value = '';
}

function clearBackwardsFormInputs() {
  document.getElementById('targetAttendance').value = '';
  document.getElementById('remindersBackwards').value = '';
  document.getElementById('averageGuestsBackwards').value = '';
}

function calculate() {
  const isForwards = document.getElementById('forwardsForm').style.display === 'block';

  if (isForwards) {
    console.log("Calculating forwards...");
    calculateForwards();
  } else {
    console.log("Calculating backwards...");
    calculateBackwards();
  }
}

function calculateForwards() {
  const invitesSent = parseFloat(document.getElementById('invitesSent').value) || 0;
  const reminders = parseInt(document.getElementById('reminders').value) || 0;
  const averageGuests = parseFloat(document.getElementById('averageGuests').value) || 0;

  console.log("Inputs:", { invitesSent, reminders, averageGuests });

  let adjustedResponseRate = responseRate;
  let totalReminderEffect = 0;

  for (let i = 0; i < reminders; i++) {
    totalReminderEffect += reminderEffectiveness * Math.pow(0.7, i);
  }

  adjustedResponseRate += totalReminderEffect;
  adjustedResponseRate = Math.min(adjustedResponseRate, 100);

  console.log("Adjusted Response Rate:", adjustedResponseRate);

  const confirmedResponses = invitesSent * (adjustedResponseRate / 100);
  const expectedAttendance = Math.max(confirmedResponses * (attendanceRate / 100), 0) * (1 + averageGuests);

  if (!isNaN(expectedAttendance)) {
    const attending = Math.floor(expectedAttendance);
    const noReplies = Math.floor(invitesSent - confirmedResponses);
    const noShows = Math.floor(confirmedResponses - attending);

    console.log("Results:", { attending, noReplies, noShows });

    document.getElementById('resultDisplay').textContent = `Expected attendance is approximately ${attending}.`;
    updateVisualisation(attending, noReplies, noShows);
  } else {
    document.getElementById('resultDisplay').textContent = "Please fill in all fields correctly.";
  }
}

function calculateBackwards() {
  const targetAttendance = parseFloat(document.getElementById('targetAttendance').value) || 0;
  const reminders = parseInt(document.getElementById('remindersBackwards').value) || 0;
  const averageGuests = parseFloat(document.getElementById('averageGuestsBackwards').value) || 0;

  console.log("Inputs:", { targetAttendance, reminders, averageGuests });

  let adjustedResponseRate = responseRate;
  let totalReminderEffect = 0;

  for (let i = 0; i < reminders; i++) {
    totalReminderEffect += reminderEffectiveness * Math.pow(0.7, i);
  }

  adjustedResponseRate += totalReminderEffect;
  adjustedResponseRate = Math.min(adjustedResponseRate, 100);

  const effectiveRate = (adjustedResponseRate / 100) * (attendanceRate / 100);

  console.log("Effective Rate:", effectiveRate);

  if (effectiveRate > 0) {
    const totalInvites = targetAttendance / (effectiveRate * (1 + averageGuests));
    const attending = targetAttendance;
    const noReplies = Math.floor(totalInvites - (totalInvites * (adjustedResponseRate / 100)));
    const noShows = Math.floor(totalInvites * (adjustedResponseRate / 100) - attending);

    console.log("Results:", { totalInvites, attending, noReplies, noShows });

    document.getElementById('resultDisplay').textContent = `You need to send approximately ${Math.ceil(totalInvites)} invites.`;
    updateVisualisation(attending, noReplies, noShows);
  } else {
    document.getElementById('resultDisplay').textContent = "Invalid rates. Please adjust in advanced settings.";
  }
}

window.saveSettings = function saveSettings() {
    responseRate = parseFloat(document.getElementById('responseRate').value) || 50;
    attendanceRate = parseFloat(document.getElementById('attendanceRate').value) || 70;
    reminderEffectiveness = parseFloat(document.getElementById('reminderEffectiveness').value) || 15;

    console.log("Advanced Settings Updated:", { responseRate, attendanceRate, reminderEffectiveness });

    calculate();

    if (advancedModalInstance) {
        advancedModalInstance.hide();
    }
};

function updateVisualisation(attending, noReplies, noShows) {
  const visualisation = document.getElementById('visualisation');
  visualisation.innerHTML = '';

  const disclaimer = document.querySelector('.disclaimer');

  const total = attending + noReplies + noShows;

  if (total === 0) {
    disclaimer.style.display = 'none'; // Hide disclaimer if no visualisation
    return;
  }

  const totalIcons = Math.min(total, 100);
  const attendingIcons = Math.round((attending / total) * totalIcons);
  const noRepliesIcons = Math.round((noReplies / total) * totalIcons);
  const noShowsIcons = totalIcons - attendingIcons - noRepliesIcons;

  for (let i = 0; i < attendingIcons; i++) {
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-user icon';
    icon.style.color = '#ffffff';
    visualisation.appendChild(icon);
  }

  for (let i = 0; i < noRepliesIcons; i++) {
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-user icon';
    icon.style.color = '#888888';
    visualisation.appendChild(icon);
  }

  for (let i = 0; i < noShowsIcons; i++) {
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-user icon';
    icon.style.color = '#444444';
    visualisation.appendChild(icon);
  }

  // Show the disclaimer if there is visualisation content
  disclaimer.style.display = 'block';
}
