// API base URL – update after deploying backend to Railway
const API_BASE = 'https://your-railway-app.railway.app/api';  // ⬅️ Replace with actual Railway URL

// State
let subjects = [];

// DOM elements
const subjectName = document.getElementById('subjectName');
const subjectGrade = document.getElementById('subjectGrade');
const subjectUnits = document.getElementById('subjectUnits');
const addBtn = document.getElementById('addSubjectBtn');
const tableBody = document.getElementById('tableBody');
const emptyMessage = document.getElementById('emptyMessage');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const resultPanel = document.getElementById('resultPanel');
const gwaValue = document.getElementById('gwaValue');
const gwaRemark = document.getElementById('gwaRemark');

// Render table
function renderTable() {
  if (subjects.length === 0) {
    tableBody.innerHTML = '';
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';
  let html = '';
  subjects.forEach((subject, index) => {
    html += `<tr>
      <td>${subject.name || '—'}</td>
      <td>${subject.grade}</td>
      <td>${subject.units}</td>
      <td><button class="delete-btn" data-index="${index}">🗑️</button></td>
    </tr>`;
  });
  tableBody.innerHTML = html;

  // Attach delete listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      subjects.splice(index, 1);
      renderTable();
      resultPanel.classList.add('hidden');
    });
  });
}

// Add subject
addBtn.addEventListener('click', () => {
  const name = subjectName.value.trim();
  const grade = parseFloat(subjectGrade.value);
  const units = parseFloat(subjectUnits.value);

  if (!name) {
    alert('Please enter subject name');
    return;
  }
  if (isNaN(grade) || grade < 1.0 || grade > 5.0) {
    alert('Grade must be between 1.0 and 5.0');
    return;
  }
  if (isNaN(units) || units <= 0) {
    alert('Units must be greater than 0');
    return;
  }

  subjects.push({ name, grade, units });
  renderTable();

  // Clear inputs
  subjectName.value = '';
  subjectGrade.value = '';
  subjectUnits.value = '';
  subjectName.focus();

  // Hide result when data changes
  resultPanel.classList.add('hidden');
});

// Clear all
clearBtn.addEventListener('click', () => {
  if (subjects.length && !confirm('Clear all subjects?')) return;
  subjects = [];
  renderTable();
  resultPanel.classList.add('hidden');
});

// Calculate GWA via backend API
calculateBtn.addEventListener('click', async () => {
  if (subjects.length === 0) {
    alert('Add at least one subject first.');
    return;
  }

  // Prepare payload
  const payload = subjects.map(s => ({
    grade: s.grade,
    units: s.units
  }));

  try {
    const response = await fetch(`${API_BASE}/gwa/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Calculation failed');
    }

    const data = await response.json();
    const gwa = data.gwa.toFixed(2);
    gwaValue.textContent = gwa;

    // Remark based on GWA
    let remark = '';
    if (gwa <= 1.5) remark = '🌟 Excellent! Summa Cum Laude standing.';
    else if (gwa <= 1.75) remark = '📘 Magna Cum Laude standing.';
    else if (gwa <= 2.0) remark = '📗 Cum Laude standing.';
    else if (gwa <= 3.0) remark = '👍 Good standing.';
    else remark = '📚 Keep pushing! You can improve.';
    gwaRemark.textContent = remark;

    resultPanel.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    alert('Error calculating GWA. Check console or backend.');
  }
});

// Initial render
renderTable();

