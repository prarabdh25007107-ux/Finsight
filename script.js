// --- SAMPLE TRANSACTION STORAGE ---
let transactions = [
  { desc: "Netflix Monthly Premium Plan", category: "Subscriptions", amount: 649 },
  { desc: "Starbucks Coffee House", category: "Food", amount: 280 },
  { desc: "Uber Cab Ride to Station", category: "Travel", amount: 450 },
  { desc: "BSNL Broadband Internet", category: "Utilities", amount: 999 },
  { desc: "Zara Denim Jackets bought online", category: "Shopping", amount: 3499 },
  { desc: "Swiggy Delivery (Biryani feast)", category: "Food", amount: 720 },
  { desc: "Electricity Bill payment Online", category: "Utilities", amount: 1850 }
];

// --- RECALCULATE OUTFLOWS ---
function updateMetrics() {
  const sum = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  document.getElementById('val-total-spent').textContent = '₹' + sum.toLocaleString('en-IN');
  
  // Update projected outflow (simply sum + mock offset)
  const projected = Math.round(sum * 1.12);
  document.getElementById('val-projected').textContent = '₹' + projected.toLocaleString('en-IN');
}

// --- CHART HANDLERS ---
let categoryChart;
let trendChart;

function getCategoryData() {
  const counts = { Food: 0, Travel: 0, Utilities: 0, Shopping: 0, Subscriptions: 0 };
  transactions.forEach(t => {
    if (counts[t.category] !== undefined) {
      counts[t.category] += t.amount;
    }
  });
  return Object.values(counts);
}

function initCharts() {
  // Category Doughnut
  const ctxCat = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: ['Food', 'Travel', 'Utilities', 'Shopping', 'Subscriptions'],
      datasets: [{
        data: getCategoryData(),
        backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { family: 'Inter' } }
        }
      }
    }
  });

  // Monthly Trend Line
  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  trendChart = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Projected (Jul)'],
      datasets: [
        {
          label: 'Actual Outflow',
          data: [38000, 41200, 39800, 44000, 45200, 42500, null],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Forecast Trend',
          data: [null, null, null, null, null, 42500, 47200],
          borderColor: '#d946ef',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } },
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } }
      },
      plugins: {
        legend: {
          labels: { color: '#94a3b8' }
        }
      }
    }
  });
}

function refreshCharts() {
  categoryChart.data.datasets[0].data = getCategoryData();
  categoryChart.update();
  
  const sum = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  trendChart.data.datasets[0].data[5] = sum;
  trendChart.data.datasets[1].data[5] = sum;
  trendChart.data.datasets[1].data[6] = Math.round(sum * 1.12);
  trendChart.update();
}

// --- AI SIMULATION INTERACTION ---
const form = document.getElementById('categorize-form');
const rawInput = document.getElementById('raw-transaction');
const aiLoader = document.getElementById('ai-loading');
const aiStatus = document.getElementById('ai-status-text');
const btnAnalyze = document.getElementById('btn-analyze');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const rawText = rawInput.value.trim();
  if (!rawText) return;

  // Disable inputs during analysis
  rawInput.disabled = true;
  btnAnalyze.disabled = true;
  aiLoader.classList.add('active');

  // AI Simulation Steps
  const steps = [
    "LLM generating tokens...",
    "Identifying vendor labels...",
    "Running classification rules...",
    "Validating confidence boundary..."
  ];

  let stepNum = 0;
  aiStatus.textContent = steps[stepNum];

  const interval = setInterval(() => {
    stepNum++;
    if (stepNum < steps.length) {
      aiStatus.textContent = steps[stepNum];
    }
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    
    // Analyze logic mock
    let parsed = parseMockTransaction(rawText);
    
    // Add to data store
    transactions.unshift(parsed);

    // Add to visual table
    addTableRow(parsed);

    // Recalculate dashboard metrics
    updateMetrics();
    refreshCharts();

    // Reactivate form
    rawInput.disabled = false;
    btnAnalyze.disabled = false;
    rawInput.value = '';
    aiLoader.classList.remove('active');
  }, 2000);
});

// Simple NLP heuristic rules mockup
function parseMockTransaction(text) {
  let amount = 150; // default
  // extract numbers
  const numMatch = text.match(/\d+/g);
  if (numMatch) {
    amount = parseInt(numMatch[numMatch.length - 1]);
  }

  const lower = text.toLowerCase();
  let category = "Shopping"; // fallback

  if (lower.includes('burger') || lower.includes('food') || lower.includes('pizza') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('coffee') || lower.includes('starbucks') || lower.includes('swiggy') || lower.includes('zomato')) {
    category = "Food";
  } else if (lower.includes('uber') || lower.includes('cab') || lower.includes('flight') || lower.includes('train') || lower.includes('travel') || lower.includes('ola') || lower.includes('fuel')) {
    category = "Travel";
  } else if (lower.includes('electricity') || lower.includes('wifi') || lower.includes('bill') || lower.includes('water') || lower.includes('recharge') || lower.includes('phone') || lower.includes('broadband')) {
    category = "Utilities";
  } else if (lower.includes('spotify') || lower.includes('netflix') || lower.includes('youtube') || lower.includes('sub') || lower.includes('prime')) {
    category = "Subscriptions";
  }

  return { desc: text, category: category, amount: amount };
}

function addTableRow(t) {
  const tbody = document.getElementById('transaction-rows');
  const tr = document.createElement('tr');
  tr.setAttribute('data-cat', t.category);
  tr.classList.add('new-row-animate');
  
  let badgeClass = 'badge-shop';
  if (t.category === 'Food') badgeClass = 'badge-food';
  else if (t.category === 'Travel') badgeClass = 'badge-travel';
  else if (t.category === 'Utilities') badgeClass = 'badge-util';
  else if (t.category === 'Subscriptions') badgeClass = 'badge-sub';

  tr.innerHTML = `
    <td>${t.desc}</td>
    <td><span class="badge ${badgeClass}">${t.category}</span></td>
    <td>₹${t.amount.toLocaleString('en-IN')}</td>
  `;

  tbody.insertBefore(tr, tbody.firstChild);

  // Remove animation class after sequence completes so regular styles apply
  setTimeout(() => {
    tr.classList.remove('new-row-animate');
  }, 600);
}

// --- TABLE FILTERING ---
const filterBtns = document.querySelectorAll('.pill-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    const rows = document.querySelectorAll('#transaction-rows tr');
    
    rows.forEach(row => {
      const cat = row.getAttribute('data-cat');
      if (filter === 'all' || cat === filter) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
});

// --- CSV EXPORTER ---
document.getElementById('btn-export').addEventListener('click', () => {
  let csv = 'Description,Category,Amount\n';
  transactions.forEach(t => {
    csv += `"${t.desc.replace(/"/g, '""')}",${t.category},${t.amount}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "FinSight_Transactions_Report.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// --- 3D LIQUID GLASS TILT + RIPPLE + SHIMMER ---
function spawnRipple(el, e) {
  const rect = el.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top  - size / 2;
  ripple.style.cssText = `
    left:${x}px; top:${y}px;
    width:${size}px; height:${size}px;
  `;
  // Distinguish card ripple from button ripple
  ripple.classList.add(el.classList.contains('glass-card') ? 'card-ripple' : 'ripple');
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function initLiquidGlass() {
  // Inject shimmer lines into every glass-card
  document.querySelectorAll('.glass-card').forEach((card, i) => {
    if (!card.querySelector('.shimmer-line')) {
      const shimmer = document.createElement('div');
      shimmer.className = 'shimmer-line';
      shimmer.style.setProperty('--shimmer-delay', `${i * 0.9}s`);
      card.prepend(shimmer);
    }
  });

  // Card tilt + specular
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      card.classList.add('tilting');
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width  / 2;
      const yc = rect.height / 2;
      const MAX = 7;
      const aX = -((y - yc) / yc) * MAX;
      const aY =  ((x - xc) / xc) * MAX;
      card.style.transform =
        `perspective(900px) rotateX(${aX}deg) rotateY(${aY}deg) scale3d(1.012,1.012,1.012) translateY(-5px)`;
      // Cursor-tracked shine
      const sx = (x / rect.width)  * 100;
      const sy = (y / rect.height) * 100;
      card.style.setProperty('--shine-x', `${sx}%`);
      card.style.setProperty('--shine-y', `${sy}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilting');
      card.style.transform = '';
    });

    // Click ripple on cards
    card.addEventListener('click', (e) => spawnRipple(card, e));
  });

  // Button ripple
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => spawnRipple(btn, e));
  });
}

// Initializer runs on page load
window.onload = () => {
  updateMetrics();
  initCharts();
  initLiquidGlass();
};
