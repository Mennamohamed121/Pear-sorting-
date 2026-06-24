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
    if (!container) return;
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
const ALLOWED_OPERATORS = ["menna", "youssef"]; 
const OPERATOR_PASS = "1234";

const loginGate = document.getElementById('login-gate');
const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('login-error');

if (sessionStorage.getItem('isOperatorAuthenticated') === 'true') {
    if (loginGate) loginGate.classList.add('hidden');
}

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const inputUser = document.getElementById('username').value.trim().toLowerCase();
        const inputPass = document.getElementById('password').value;
        
        if (ALLOWED_OPERATORS.includes(inputUser) && inputPass === OPERATOR_PASS) {
            sessionStorage.setItem('isOperatorAuthenticated', 'true');
            if (loginGate) loginGate.classList.add('hidden');
            if (errorMsg) errorMsg.style.display = 'none';
        } else {
            if (errorMsg) errorMsg.style.display = 'block';
            document.getElementById('password').value = ''; 
        }
    });
}

// =================================================================
// --- EDIT HAPPENED HERE: CHANGED LOCALHOST TO DYNAMIC SERVER IP --
// =================================================================

// =================================================================
// --- SAFE MULTI-STATION HTTP FETCH LOGIC ---
// =================================================================

// 1. Put your Node-RED computer's IP address here (or 'localhost' if testing locally)
const serverIP = '192.168.1.154'; 

const stations = [
    { id: 'node-loading',     endpoint: 'loading' },
    { id: 'node-vision',      endpoint: 'vision' },
    { id: 'node-aftervision', endpoint: 'aftervision' },
    { id: 'node-sizer',       endpoint: 'sizer' },
    { id: 'node-small',       endpoint: 'small_conveyor' },
    { id: 'node-large',       endpoint: 'large_conveyor' },
    { id: 'node-gripper',     endpoint: 'gripper' }
];

// 2. Safely bind click listeners
stations.forEach(station => {
    try {
        const element = document.getElementById(station.id);
        
        // Only attach if the element actually exists in your HTML layout!
        if (element) {
            element.style.cursor = 'pointer'; 
            
            element.addEventListener('click', () => {
                console.log(`Connecting to network endpoint: http://${serverIP}:1880/api/${station.endpoint}`);
                
                fetch(`http://${serverIP}:1880/api/${station.endpoint}`)
                    .then(response => {
                        if (!response.ok) throw new Error(`Network response error on ${station.endpoint}`);
                        return response.json(); 
                    })
                    .then(data => {
                        openPopupModal(data);
                    })
                    .catch(error => {
                        console.error('Error fetching PLC details:', error);
                    });
            });
        } else {
            console.warn(`Station element with ID "${station.id}" was not found in index.html layout.`);
        }
    } catch (err) {
        console.error(`Failed to initialize station ${station.id}:`, err);
    }
});

// 3. Function to open the pop-up modal panel view
function openPopupModal(plcData) {
    try {
        const modal = document.getElementById('station-modal');
        if (!modal) return;

        const titleEl = document.getElementById('modal-station-title');
        const statusEl = document.getElementById('modal-status');
        const speedEl = document.getElementById('modal-speed');
        const tempEl = document.getElementById('modal-temp');
        const currentEl = document.getElementById('modal-current');

        if (titleEl) titleEl.innerText = `${plcData.station || 'STATION'} DETAILS`;
        if (statusEl) {
            statusEl.innerText = (plcData.status || 'UNKNOWN').toUpperCase();
            statusEl.className = 'modal-value'; 
            if (plcData.status?.toLowerCase() === 'running') {
                statusEl.classList.add('status-running');
            } else {
                statusEl.style.color = '#ffd600'; 
            }
        }
        if (speedEl) speedEl.innerText = `${plcData.speed || 0} RPM`;
        if (tempEl) tempEl.innerText = `${plcData.temperature || 0.0} °C`;
        if (currentEl) currentEl.innerText = `${plcData.current || 0.0} A`;

        modal.classList.add('show-modal');
    } catch (err) {
        console.error("Error displaying modal view window:", err);
    }
}

// 4. Global function to dismiss the modal view
window.closePopupModal = function() {
    const modal = document.getElementById('station-modal');
    if (modal) {
        modal.classList.remove('show-modal');
    }
};
