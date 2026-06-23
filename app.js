// Initialize Icons
lucide.createIcons();

// Real-time Clock Sync
function updateClock() {
    const now = new Date();
    
    // Time format: 11:24:38 AM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 hour to 12
    
    document.getElementById('live-time').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    
    // Date format: May 16, 2025
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('live-date').textContent = now.toLocaleDateString('en-US', options);
}
setInterval(updateClock, 1000);
updateClock();

// Mock Array of Recent Alarms Data matching original design
const initialAlarms = [
    { time: '11:20:15 AM', type: 'CRITICAL', msg: 'Vision AI – Camera Offline', severity: 'crit' },
    { time: '11:18:42 AM', type: 'WARNING', msg: 'Rolling Sizer – Temperature High', severity: 'warn' },
    { time: '11:16:10 AM', type: 'WARNING', msg: 'Large Conveyor – Vibration Warning', severity: 'warn' }
];

function renderAlarms(alarms) {
    const container = document.getElementById('alarm-list-container');
    container.innerHTML = '';
    
    alarms.forEach(alarm => {
        const row = document.createElement('div');
        row.className = 'alarm-row';
        row.innerHTML = `
            <span class="alarm-time">${alarm.time}</span>
            <span class="alarm-msg">
                <span class="dot dot-${alarm.severity === 'crit' ? 'red' : 'yellow'}"></span>
                ${alarm.msg}
            </span>
            <span class="tag-badge ${alarm.severity}">${alarm.type}</span>
        `;
        container.appendChild(row);
    });
}
renderAlarms(initialAlarms);

// --- INTERACTIVE SYSTEM & HOOKS FOR YOUR IOT WORK ---
// Call this function with payload items arriving from fetch/WebSockets/MQTT
function updateIoTData(payload) {
    if (payload.health) document.getElementById('kpi-health').textContent = payload.health + '%';
    if (payload.oee) document.getElementById('kpi-oee').textContent = payload.oee + '%';
    if (payload.energy) document.getElementById('kpi-energy').innerHTML = `${payload.energy} <span class="unit">kW</span>`;
    if (payload.throughput) document.getElementById('kpi-throughput').innerHTML = `${payload.throughput} <span class="unit">pears/min</span>`;
    
    // Node Status updates dynamically
    if (payload.nodes) {
        Object.keys(payload.nodes).forEach(nodeId => {
            const nodeElement = document.getElementById(`node-${nodeId}`);
            if (nodeElement) {
                const statusSpan = nodeElement.querySelector('.node-status');
                const status = payload.nodes[nodeId].toLowerCase(); // running, warning, alarm, offline
                
                statusSpan.className = `node-status ${status}`;
                statusSpan.textContent = status.toUpperCase();
                
                // Adjust node border accent coloring
                if (status === 'running') nodeElement.style.borderColor = 'var(--color-green)';
                else if (status === 'warning') nodeElement.style.borderColor = 'var(--color-yellow)';
                else if (status === 'alarm') nodeElement.style.borderColor = 'var(--color-red)';
                else nodeElement.style.borderColor = 'var(--color-gray)';
            }
        });
    }
}

// Action Button Listeners
document.getElementById('btn-ack').addEventListener('click', () => {
    alert('All Active Alarms have been Acknowledged.');
    document.getElementById('count-critical').textContent = '0';
    document.getElementById('count-warning').textContent = '0';
    document.getElementById('count-total').textContent = '0';
});

document.getElementById('btn-pause').addEventListener('click', function() {
    this.classList.toggle('active');
    alert('Factory line pause signal transmitted.');
});

document.getElementById('btn-reports').addEventListener('click', () => {
    alert('Navigating to compiled analytics export view...');
});

// Inject structure fixes for Split Layout Arrows smoothly
const mergeContainer = document.querySelector('.merge-arrow-down');
if (mergeContainer) {
    mergeContainer.innerHTML = `
        <div></div>
        <div class="final-drop"></div>
        <div class="final-drop-arrow"></div>
    `;
}
// --- OPERATOR SIGN-IN ROUTINE (MULTIPLE OPERATORS) ---

// 1. Define an array of authorized operator usernames
const ALLOWED_OPERATORS = ["menna", "youssef"]; 
const OPERATOR_PASS = "1234";

const loginGate = document.getElementById('login-gate');
const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('login-error');

// Check if a user has already authenticated during this browser session
if (sessionStorage.getItem('isOperatorAuthenticated') === 'true') {
    loginGate.classList.add('hidden');
}

// Handle login submissions
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop default page refresh trigger
    
    // .toLowerCase() ensures it works even if they type "Menna" or "Youssef" with capitals
    const inputUser = document.getElementById('username').value.trim().toLowerCase();
    const inputPass = document.getElementById('password').value;
    
    // 2. Check if the username exists in our array AND the password matches
    if (ALLOWED_OPERATORS.includes(inputUser) && inputPass === OPERATOR_PASS) {
        // Correct combination -> Hide gate and store session token
        sessionStorage.setItem('isOperatorAuthenticated', 'true');
        loginGate.classList.add('hidden');
        errorMsg.style.display = 'none';
    } else {
        // Wrong combination -> Flash notification alert
        errorMsg.style.display = 'block';
        document.getElementById('password').value = ''; // Clear password field
    }
});