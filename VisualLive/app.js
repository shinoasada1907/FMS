// Global State Data for Simulation
const state = {
    units: {
        'U-101': { code: 'U-101', name: 'Unit 101', area: 120, usage: 'F&B', basePrice: 22, status: 'vacant', leaseId: null },
        'U-102': { code: 'U-102', name: 'Unit 102', area: 85, usage: 'Retail', basePrice: 25, status: 'vacant', leaseId: null },
        'U-103': { code: 'U-103', name: 'Unit 103', area: 210, usage: 'Office', basePrice: 18, status: 'leased', leaseId: 'L-001' },
        'U-104': { code: 'U-104', name: 'Unit 104', area: 150, usage: 'Retail', basePrice: 24, status: 'negotiating', leaseId: null },
        'U-105': { code: 'U-105', name: 'Unit 105', area: 180, usage: 'F&B', basePrice: 20, status: 'vacant', leaseId: null }
    },
    leads: [
        { id: 'LD-001', tenant: 'Starbucks Coffee', category: 'F&B', unitId: 'U-101', budget: 2640, stage: 'Prospect' },
        { id: 'LD-002', tenant: 'Zara Fashion', category: 'Retail', unitId: 'U-104', budget: 3600, stage: 'Negotiation' },
        { id: 'LD-003', tenant: 'Nike Store', category: 'Retail', unitId: 'U-102', budget: 2125, stage: 'HOA' },
        { id: 'LD-004', tenant: 'TechCorp Solutions', category: 'Office', unitId: 'U-103', budget: 3780, stage: 'Signed' }
    ],
    leases: {
        'L-001': {
            id: 'L-001',
            leadId: 'LD-004',
            tenant: 'TechCorp Solutions',
            unitId: 'U-103',
            durationYears: 3,
            baseRent: 3780, // 210m2 * $18
            freeMonths: 2,
            escalationType: 'percentage',
            escalationPct: 5,
            stepSchedule: [],
            guaranteeAmt: 11340, // 3 months deposit
            brokerName: 'Viet Nam Agents',
            brokerPct: 8,
            signedMonthsAgo: 6, // Active for 6 months
            rentRoll: [] // Will generate dynamically
        }
    },
    brokerageLedger: [
        { broker: 'Viet Nam Agents', unitCode: 'U-103', totalCommission: 10886, stage1: 5443, stage2: 5443, status: 'Stage 1 Paid' }
    ],
    invoices: [
        { id: 'INV-2026-06-001', tenant: 'TechCorp Solutions', unitId: 'U-103', month: 'June 2026', amount: 3930, serviceCharge: 150, utilityCharge: 0, status: 'Paid', qrCodeSeed: 'techcorp-jun26' }
    ],
    notificationsCount: 0,
    activeTab: 'dashboard',
    activeSelectUnit: null,
    
    // Architecture simulation state
    selectedArchFlow: 'crm-sync',
    isArchFlowPlaying: false
};

// Architecture Flows Definitions
const archFlows = {
    'crm-sync': {
        name: 'Flow A: CRM to Floor Plan Sync',
        steps: [
            { block: 'block-client-ui', title: '1. User Action in Browser', desc: 'Leasing staff moves a CRM Lead card into the Negotiation column.' },
            { block: 'block-web-api', title: '2. RESTful HTTPS Request', desc: 'Client API calls the HTTP PUT route to change state.' },
            { block: 'block-stateless', title: '3. C# Stateless Machine Guard', desc: 'Stateless C# library verifies state transition rules (Prospect -> Negotiation).' },
            { block: 'block-efcore', title: '4. Entity Framework Core Mapping', desc: 'EF Core updates the targeted Unit object status, tracking foreign key constraints.' },
            { block: 'block-postgresql', title: '5. PostgreSQL Persistent Lock', desc: 'Executes UPDATE statement setting space status to "negotiating" inside ACID transaction.' },
            { block: 'block-web-api', title: '6. Web API Controller response', desc: 'Confirms db write success to Web API layer.' },
            { block: 'block-signalr-hub', title: '7. SignalR Hub Notification broadcast', desc: 'Web API triggers SignalR Hub to broadcast WebSockets message to all clients.' },
            { block: 'block-client-ui', title: '8. Floor Plan Live Update', desc: 'Client browser receives WebSocket ping, immediately highlights Unit box to amber.' }
        ]
    },
    'batch-billing': {
        name: 'Flow B: Batch Invoicing (Hangfire Run)',
        steps: [
            { block: 'block-hangfire', title: '1. Hangfire Recurring trigger', desc: 'At 00:00 on Day 25, Hangfire scheduler initiates execution thread.' },
            { block: 'block-efcore', title: '2. EF Core database scan', desc: 'Queries PostgreSQL for all active contracts and leases.' },
            { block: 'block-postgresql', title: '3. PostgreSQL query output', desc: 'Returns active leases, escalation rent cards, and tenant logs.' },
            { block: 'block-iot-meters', title: '4. IoT meters API request', desc: 'Calls external microservices to query electricity and water sub-meter data.' },
            { block: 'block-rent-engine', title: '5. Core Rent Engine computation', desc: 'Calculates active rent + $150 Service Charge + IoT utility costs, factoring in incentives.' },
            { block: 'block-questpdf', title: '6. QuestPDF PDF generation', desc: 'QuestPDF library compiles data into a professional invoice layout and generates payment VietQR.' },
            { block: 'block-mailkit', title: '7. MailKit client initialization', desc: 'SMTP client opens connection and wraps the compiled PDF as file attachments.' },
            { block: 'block-mail-server', title: '8. SMTP Mail Server delivery', desc: 'External mail server dispatches invoices straight to the tenant billing inbox.' }
        ]
    },
    'bi-kpi': {
        name: 'Flow C: BI Dashboard Calculation',
        steps: [
            { block: 'block-postgresql', title: '1. Database event trigger', desc: 'New contract signed or space updated changes database values.' },
            { block: 'block-efcore', title: '2. LINQ Query collection', desc: 'Pulls unexpired terms, rent roll schedules, and total square meters.' },
            { block: 'block-bi-calc', title: '3. Advanced BI Logic operations', desc: 'Computes Occupancy Rate and runs WAULT calculation (Weighted Average Unexpired Lease Term).' },
            { block: 'block-web-api', title: '4. Web API JSON compile', desc: 'Web API compiles KPI metrics and sends clean JSON to dashboard client.' },
            { block: 'block-client-ui', title: '5. Dashboard UI render', desc: 'Chart.js redraws the 12-month projection line graph and updates numbers.' }
        ]
    }
};

// System Initializer
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTabs();
    initCRM();
    initFloorPlan();
    initLeaseForm();
    initHangfire();
    initArchitectureHub();
    
    // Initial calculation of BI Metrics
    calculateBIMetrics();
    renderBrokerageLedger();
    
    // Draw initial empty charts
    initRentRollChart();
    
    // Auto-generate TechCorp Rent Roll schedule
    generateRentRollForLease('L-001');
    updateRentRollChart();
    
    // Listeners for closing modals
    document.getElementById('close-invoice-modal').addEventListener('click', hideInvoiceModal);
    document.getElementById('btn-close-invoice-modal-bottom').addEventListener('click', hideInvoiceModal);
    
    // Trigger icons
    lucide.createIcons();
});

// 1. Clock & Realtime Simulation Status
function initClock() {
    const clockEl = document.getElementById('live-clock');
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toTimeString().split(' ')[0];
    }, 1000);
}

// 2. Navigation Tab System
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            item.classList.add('active');
            const targetPane = document.getElementById(`tab-${tabId}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
            
            state.activeTab = tabId;
            
            // Recalculate and update charts if switching to dashboard
            if (tabId === 'dashboard') {
                calculateBIMetrics();
                updateRentRollChart();
            }
            
            // Re-render UI pieces
            if (tabId === 'floorplan') {
                syncFloorPlanVisuals();
            }
        });
    });
}

// 3. SignalR Toast Notification System
function showSignalRToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${message}</div>
        </div>
        <button class="btn-toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    
    // Increment header badge count
    state.notificationsCount++;
    const badge = document.getElementById('notif-count');
    badge.textContent = state.notificationsCount;
    badge.classList.add('pulse');
    setTimeout(() => badge.classList.remove('pulse'), 500);

    // Bind close action
    toast.querySelector('.btn-toast-close').addEventListener('click', () => {
        dismissToast(toast);
    });
    
    // Auto dismiss after 6 seconds
    setTimeout(() => {
        dismissToast(toast);
    }, 6000);
}

function dismissToast(toast) {
    toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// 4. BI Analytics Calculations (Occupancy, WAULT, Rent Roll)
let rentRollChart = null;

function initRentRollChart() {
    const ctx = document.getElementById('rentRollChart').getContext('2d');
    rentRollChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Projected Monthly Rent Roll Revenue ($)',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#818cf8',
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function calculateBIMetrics() {
    // 1. Occupancy Rate
    let totalArea = 0;
    let leasedArea = 0;
    
    Object.values(state.units).forEach(unit => {
        totalArea += unit.area;
        if (unit.status === 'leased') {
            leasedArea += unit.area;
        }
    });
    
    const occupancyRate = (leasedArea / totalArea) * 100;
    document.getElementById('kpi-occupancy').textContent = `${occupancyRate.toFixed(1)}%`;
    
    // 2. Current Month Rent Roll
    let currentRentRoll = 0;
    Object.values(state.leases).forEach(lease => {
        const elapsed = lease.signedMonthsAgo || 0;
        if (!lease.rentRoll || lease.rentRoll.length === 0) {
            generateRentRollForLease(lease.id);
        }
        const currentMonthData = lease.rentRoll[elapsed] || lease.rentRoll[lease.rentRoll.length - 1];
        if (currentMonthData) {
            currentRentRoll += currentMonthData.rent;
        }
    });
    document.getElementById('kpi-rentroll').textContent = `$${currentRentRoll.toLocaleString()}`;
    
    // 3. WAULT Calculation
    let revenueWeightedMonths = 0;
    let totalRevenue = 0;
    
    Object.values(state.leases).forEach(lease => {
        const totalMonths = lease.durationYears * 12;
        const elapsed = lease.signedMonthsAgo || 0;
        const unexpiredMonths = Math.max(0, totalMonths - elapsed);
        
        const currentMonthData = lease.rentRoll[elapsed] || lease.rentRoll[lease.rentRoll.length - 1];
        const monthlyWeight = currentMonthData ? currentMonthData.rent : lease.baseRent;
        
        revenueWeightedMonths += monthlyWeight * unexpiredMonths;
        totalRevenue += monthlyWeight;
    });
    
    const wault = totalRevenue > 0 ? (revenueWeightedMonths / totalRevenue) : 0;
    document.getElementById('kpi-wault').textContent = `${wault.toFixed(1)} mo`;
    
    // 4. Deposit alarms
    const activeLeaseCount = Object.keys(state.leases).length;
    document.getElementById('kpi-deposits').textContent = activeLeaseCount;
    
    const depositAlertEl = document.getElementById('deposit-alerts-text');
    if (activeLeaseCount > 0) {
        depositAlertEl.innerHTML = `<i data-lucide="shield-check" class="text-green"></i> <span>All active & secured</span>`;
        depositAlertEl.className = "kpi-footer text-green";
    } else {
        depositAlertEl.innerHTML = `<i data-lucide="alert-triangle"></i> <span>No guarantees tracked</span>`;
        depositAlertEl.className = "kpi-footer text-muted";
    }
    
    lucide.createIcons();
}

function updateRentRollChart() {
    if (!rentRollChart) return;
    
    const labels = [];
    const revenueData = [];
    
    const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let currMonth = new Date().getMonth();
    let currYear = new Date().getFullYear();
    
    for (let i = 1; i <= 12; i++) {
        let m = (currMonth + i) % 12;
        let y = currYear + Math.floor((currMonth + i) / 12);
        labels.push(`${monthsNames[m]} ${y}`);
        
        let projectedRev = 0;
        Object.values(state.leases).forEach(lease => {
            const currentElapsed = lease.signedMonthsAgo || 0;
            const targetMonthIndexInLease = currentElapsed + i;
            
            if (targetMonthIndexInLease < lease.durationYears * 12) {
                const rentVal = lease.rentRoll[targetMonthIndexInLease]?.rent || 0;
                projectedRev += rentVal;
            }
        });
        revenueData.push(projectedRev);
    }
    
    rentRollChart.data.labels = labels;
    rentRollChart.data.datasets[0].data = revenueData;
    rentRollChart.update();
}

function renderBrokerageLedger() {
    const tbody = document.getElementById('brokerage-ledger-rows');
    tbody.innerHTML = '';
    
    state.brokerageLedger.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.broker}</strong></td>
            <td><span class="badge">${row.unitCode}</span></td>
            <td>$${row.totalCommission.toLocaleString()}</td>
            <td>$${row.stage1.toLocaleString()}</td>
            <td>$${row.stage2.toLocaleString()}</td>
            <td><span class="status-tag ${row.status.toLowerCase().replace(/ /g, '-')}">${row.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. Floor Plan Interactive Hub
function initFloorPlan() {
    const units = document.querySelectorAll('.unit-space');
    
    units.forEach(unitEl => {
        const unitId = unitEl.getAttribute('data-unit-id');
        unitEl.addEventListener('click', () => {
            selectUnit(unitId);
        });
    });
    
    syncFloorPlanVisuals();
}

function syncFloorPlanVisuals() {
    Object.values(state.units).forEach(unit => {
        const unitEl = document.querySelector(`[data-unit-id="${unit.code}"]`);
        if (unitEl) {
            unitEl.classList.remove('vacant', 'negotiating', 'leased');
            unitEl.classList.add(unit.status);
            
            const statusEl = unitEl.querySelector('.unit-status');
            if (statusEl) {
                statusEl.textContent = unit.status;
            }
            
            if (state.activeSelectUnit === unit.code) {
                unitEl.classList.add('active-select');
            } else {
                unitEl.classList.remove('active-select');
            }
        }
    });
}

function selectUnit(unitId) {
    state.activeSelectUnit = unitId;
    syncFloorPlanVisuals();
    
    const specContainer = document.getElementById('unit-spec-content');
    const unit = state.units[unitId];
    
    if (!unit) return;
    
    let detailsHtml = '';
    
    if (unit.status === 'vacant') {
        detailsHtml = `
            <div class="spec-data">
                <div class="spec-title-group">
                    <h3>${unit.name}</h3>
                    <span class="spec-status-tag vacant">Vacant (Trống)</span>
                </div>
                
                <div class="spec-grid">
                    <div class="spec-item">
                        <div class="spec-label">Area (Diện tích)</div>
                        <div class="spec-val">${unit.area} m²</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Primary Usage</div>
                        <div class="spec-val">${unit.usage}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Base Target Rent</div>
                        <div class="spec-val">$${unit.basePrice}/m²/mo</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Est. Monthly Base</div>
                        <div class="spec-val">$${(unit.area * unit.basePrice).toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="spec-actions">
                    <button class="btn btn-primary" style="width:100%" onclick="quickInitiateCRM('${unitId}')">
                        <i data-lucide="plus-circle"></i> Create Prospect Lead
                    </button>
                </div>
            </div>
        `;
    } else if (unit.status === 'negotiating') {
        const associatedLead = state.leads.find(l => l.unitId === unitId && l.stage !== 'Signed');
        
        detailsHtml = `
            <div class="spec-data">
                <div class="spec-title-group">
                    <h3>${unit.name}</h3>
                    <span class="spec-status-tag negotiating">Negotiating (Đàm phán)</span>
                </div>
                
                <div class="spec-grid">
                    <div class="spec-item">
                        <div class="spec-label">Area (Diện tích)</div>
                        <div class="spec-val">${unit.area} m²</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Primary Usage</div>
                        <div class="spec-val">${unit.usage}</div>
                    </div>
                </div>
                
                <div class="spec-section-header">Active Negotiator</div>
                <div class="spec-item" style="margin-bottom: 1rem">
                    <div class="spec-label">Tenant Brand</div>
                    <div class="spec-val" style="color: var(--color-negotiating)">${associatedLead ? associatedLead.tenant : 'Unknown'}</div>
                </div>
                
                <div class="spec-grid" style="margin-bottom: 1rem">
                    <div class="spec-item">
                        <div class="spec-label">CRM Lead ID</div>
                        <div class="spec-val">${associatedLead ? associatedLead.id : 'N/A'}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Target Budget</div>
                        <div class="spec-val">$${associatedLead ? associatedLead.budget.toLocaleString() : 'N/A'}</div>
                    </div>
                </div>
                
                <div class="spec-actions" style="display:flex; gap:0.5rem">
                    <button class="btn btn-secondary" style="flex:1" onclick="navigateToTab('crm')">
                        Go CRM Pipeline
                    </button>
                    <button class="btn btn-primary" style="flex:1" onclick="openLeaseDrawer('${associatedLead?.id}')">
                        Configure Lease
                    </button>
                </div>
            </div>
        `;
    } else if (unit.status === 'leased') {
        const lease = Object.values(state.leases).find(l => l.unitId === unitId);
        
        if (!lease) {
            detailsHtml = `<p>Error loading lease data.</p>`;
        } else {
            let rentScheduleHtml = '';
            lease.rentRoll.slice(0, 5).forEach(monthData => {
                rentScheduleHtml += `
                    <tr>
                        <td>M${monthData.month}</td>
                        <td>Year ${Math.ceil(monthData.month/12)}</td>
                        <td>${monthData.desc}</td>
                        <td>$${monthData.rent.toLocaleString()}</td>
                    </tr>
                `;
            });
            
            detailsHtml = `
                <div class="spec-data">
                    <div class="spec-title-group">
                        <h3>${unit.name}</h3>
                        <span class="spec-status-tag leased">Leased (Đã thuê)</span>
                    </div>
                    
                    <div class="spec-grid">
                        <div class="spec-item">
                            <div class="spec-label">Tenant Brand</div>
                            <div class="spec-val" style="color: #ec4899">${lease.tenant}</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-label">Lease Duration</div>
                            <div class="spec-val">${lease.durationYears} Years</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-label">Active Period</div>
                            <div class="spec-val">Month ${lease.signedMonthsAgo} in progress</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-label">Guarantee Bond</div>
                            <div class="spec-val">$${lease.guaranteeAmt.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div class="spec-section-header">Rental Price escalation</div>
                    <div class="spec-item" style="margin-bottom:1rem">
                        <div class="spec-label">Escalation Mechanism</div>
                        <div class="spec-val">
                            ${lease.escalationType === 'percentage' ? `${lease.escalationPct}% Annual Increase` : 'Step-up Prices'}
                        </div>
                    </div>

                    <div class="spec-section-header">Lease Rent Schedule (First 5 Months)</div>
                    <table class="spec-rent-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Billing Type</th>
                                <th>Rent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rentScheduleHtml}
                            <tr>
                                <td colspan="4" class="text-center" style="color: var(--color-indigo); padding-top:0.5rem">
                                    <i>Showing top 5 of ${lease.rentRoll.length} months.</i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
    
    specContainer.className = "spec-active";
    specContainer.innerHTML = detailsHtml;
    lucide.createIcons();
}

// 6. CRM & Leases Management (Stateless state machine simulator)
function initCRM() {
    renderCRM();
}

function renderCRM() {
    const columns = {
        'Prospect': document.getElementById('list-prospect'),
        'Negotiation': document.getElementById('list-negotiation'),
        'LOI': document.getElementById('list-loi'),
        'HOA': document.getElementById('list-hoa'),
        'Signed': document.getElementById('list-signed')
    };
    
    Object.values(columns).forEach(col => col.innerHTML = '');
    const counts = { Prospect: 0, Negotiation: 0, LOI: 0, HOA: 0, Signed: 0 };
    
    state.leads.forEach(lead => {
        counts[lead.stage]++;
        
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.setAttribute('draggable', 'true');
        card.innerHTML = `
            <div class="lead-title-group">
                <div class="lead-name">${lead.tenant}</div>
                <div class="lead-category">${lead.category}</div>
            </div>
            <div class="lead-unit">
                <i data-lucide="layout"></i>
                <span>${state.units[lead.unitId]?.name || lead.unitId}</span>
            </div>
            <div class="lead-footer">
                <div class="lead-budget">$${lead.budget.toLocaleString()}/mo</div>
                <div class="lead-actions">
                    ${lead.stage !== 'Prospect' ? `
                        <button class="btn-card-action" onclick="moveLeadStage('${lead.id}', 'back')" title="Step Back">
                            <i data-lucide="chevron-left"></i>
                        </button>
                    ` : ''}
                    ${lead.stage !== 'Signed' ? `
                        <button class="btn-card-action" onclick="moveLeadStage('${lead.id}', 'next')" title="Advance Stage">
                            <i data-lucide="chevron-right"></i>
                        </button>
                    ` : `
                        <span class="status-tag paid" style="font-size:0.65rem">CONTRACTED</span>
                    `}
                </div>
            </div>
        `;
        
        columns[lead.stage].appendChild(card);
    });
    
    Object.keys(counts).forEach(stage => {
        document.getElementById(`count-${stage.toLowerCase()}`).textContent = counts[stage];
    });
    
    lucide.createIcons();
}

function moveLeadStage(leadId, direction) {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const stages = ['Prospect', 'Negotiation', 'LOI', 'HOA', 'Signed'];
    const currIndex = stages.indexOf(lead.stage);
    let nextIndex = direction === 'next' ? currIndex + 1 : currIndex - 1;
    
    if (nextIndex < 0 || nextIndex >= stages.length) return;
    
    const targetStage = stages[nextIndex];
    
    // C# State Machine transition validation rules
    if (targetStage === 'Negotiation') {
        const unit = state.units[lead.unitId];
        if (unit.status !== 'vacant' && unit.status !== 'negotiating') {
            showSignalRToast('❌ State Machine Guard', `Unit ${unit.code} is occupied! Cannot start negotiation.`, 'warning');
            return;
        }
        unit.status = 'negotiating';
        showSignalRToast('📡 SignalR Broadcast', `Unit ${unit.code} locked. State changed to [Negotiating].`, 'warning');
        
        // Auto trigger architecture sync visualizer if desired
        simulateArchSyncTrigger('crm-sync');
    }
    
    if (direction === 'back' && lead.stage === 'Negotiation' && targetStage === 'Prospect') {
        const unit = state.units[lead.unitId];
        unit.status = 'vacant';
        showSignalRToast('📡 SignalR Broadcast', `Unit ${unit.code} released. State changed to [Vacant].`, 'success');
        
        simulateArchSyncTrigger('crm-sync');
    }
    
    if (targetStage === 'Signed') {
        openLeaseDrawer(leadId);
        return;
    }
    
    lead.stage = targetStage;
    renderCRM();
    syncFloorPlanVisuals();
    
    if (state.activeSelectUnit === lead.unitId) {
        selectUnit(lead.unitId);
    }
}

function quickInitiateCRM(unitId) {
    const unit = state.units[unitId];
    if (!unit) return;
    
    const brands = ['Adidas Outlet', 'KFC Fastfood', 'Highlands Coffee', 'Samsung Experience', 'Lego Store'];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    
    const nextLeadId = `LD-00${state.leads.length + 1}`;
    const newLead = {
        id: nextLeadId,
        tenant: randomBrand,
        category: unit.usage,
        unitId: unitId,
        budget: unit.area * unit.basePrice,
        stage: 'Prospect'
    };
    
    state.leads.push(newLead);
    showSignalRToast('CRM Pipeline Hub', `Created prospect lead for ${randomBrand} targeting ${unit.name}.`, 'info');
    
    navigateToTab('crm');
    renderCRM();
}

// 7. Lease Lifecycle, Escalation Rent roll Generation
function initLeaseForm() {
    const form = document.getElementById('lease-form');
    const escalationTypeRadios = document.getElementsByName('escalation-type');
    const closeBtn = document.getElementById('close-drawer-btn');
    const previewBtn = document.getElementById('btn-preview-rentroll');
    const durationSelect = document.getElementById('lease-duration');
    
    escalationTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            toggleEscalationInputs(e.target.value);
        });
    });
    
    durationSelect.addEventListener('change', () => {
        if (document.querySelector('input[name="escalation-type"]:checked').value === 'stepup') {
            toggleEscalationInputs('stepup');
        }
    });
    
    closeBtn.addEventListener('click', closeLeaseDrawer);
    
    previewBtn.addEventListener('click', () => {
        const simulatedLease = parseLeaseForm();
        if (simulatedLease) {
            const rentRoll = generateRentRollSchedule(simulatedLease);
            renderRentRollPreview(rentRoll);
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLeaseContract();
    });
}

function toggleEscalationInputs(type) {
    const pctContainer = document.getElementById('escalation-pct-container');
    const stepContainer = document.getElementById('escalation-step-container');
    const stepInputsList = document.getElementById('step-inputs-list');
    
    if (type === 'percentage') {
        pctContainer.classList.remove('hidden');
        stepContainer.classList.add('hidden');
    } else {
        pctContainer.classList.add('hidden');
        stepContainer.classList.remove('hidden');
        
        const years = parseInt(document.getElementById('lease-duration').value);
        const baseRent = parseFloat(document.getElementById('lease-base-rent').value) || 2000;
        
        stepInputsList.innerHTML = '';
        for (let y = 1; y <= years; y++) {
            const row = document.createElement('div');
            row.className = 'step-input-row';
            const value = baseRent + (y - 1) * 200;
            row.innerHTML = `
                <span>Year ${y} Rent</span>
                <input type="number" class="step-rent-year" data-year="${y}" value="${value}" required>
            `;
            stepInputsList.appendChild(row);
        }
    }
}

function openLeaseDrawer(leadId) {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const unit = state.units[lead.unitId];
    
    document.getElementById('form-lead-id').value = leadId;
    document.getElementById('form-unit-id').value = lead.unitId;
    document.getElementById('lease-tenant').value = lead.tenant;
    document.getElementById('lease-unit-code').value = unit.name;
    document.getElementById('lease-base-rent').value = lead.budget;
    document.getElementById('lease-guarantee-amt').value = lead.budget * 3;
    
    document.getElementById('rentroll-preview-box').classList.add('hidden');
    
    document.querySelector('input[name="escalation-type"][value="percentage"]').checked = true;
    toggleEscalationInputs('percentage');
    
    document.getElementById('lease-drawer').classList.add('open');
}

function closeLeaseDrawer() {
    document.getElementById('lease-drawer').classList.remove('open');
}

function parseLeaseForm() {
    const leadId = document.getElementById('form-lead-id').value;
    const unitId = document.getElementById('form-unit-id').value;
    const tenant = document.getElementById('lease-tenant').value;
    const durationYears = parseInt(document.getElementById('lease-duration').value);
    const baseRent = parseFloat(document.getElementById('lease-base-rent').value);
    const freeMonths = parseInt(document.getElementById('lease-free-months').value) || 0;
    const escalationType = document.querySelector('input[name="escalation-type"]:checked').value;
    const guaranteeAmt = parseFloat(document.getElementById('lease-guarantee-amt').value) || 0;
    const brokerName = document.getElementById('lease-broker-name').value || 'Internal';
    const brokerPct = parseFloat(document.getElementById('lease-broker-pct').value) || 0;
    
    let escalationPct = 0;
    let stepSchedule = [];
    
    if (escalationType === 'percentage') {
        escalationPct = parseFloat(document.getElementById('lease-escalation-pct').value) || 0;
    } else {
        const stepInputs = document.querySelectorAll('.step-rent-year');
        stepInputs.forEach(input => {
            stepSchedule.push({
                year: parseInt(input.getAttribute('data-year')),
                rent: parseFloat(input.value)
            });
        });
    }
    
    return {
        leadId,
        unitId,
        tenant,
        durationYears,
        baseRent,
        freeMonths,
        escalationType,
        escalationPct,
        stepSchedule,
        guaranteeAmt,
        brokerName,
        brokerPct
    };
}

function generateRentRollSchedule(lease) {
    const rentRoll = [];
    const totalMonths = lease.durationYears * 12;
    
    for (let m = 1; m <= totalMonths; m++) {
        let monthlyRent = 0;
        let pricingRule = '';
        
        if (m <= lease.freeMonths) {
            monthlyRent = 0;
            pricingRule = 'Incentive: Free Rent (Fit-out)';
        } else {
            const currentYear = Math.ceil(m / 12);
            
            if (lease.escalationType === 'percentage') {
                const compoundingYears = currentYear - 1;
                monthlyRent = lease.baseRent * Math.pow(1 + (lease.escalationPct / 100), compoundingYears);
                pricingRule = compoundingYears > 0 
                    ? `Escalation (+${lease.escalationPct}% compounded)` 
                    : `Base Rent`;
            } else {
                const yearData = lease.stepSchedule.find(s => s.year === currentYear);
                monthlyRent = yearData ? yearData.rent : lease.baseRent;
                pricingRule = `Step-up Schedule (Year ${currentYear})`;
            }
        }
        
        rentRoll.push({
            month: m,
            rent: Math.round(monthlyRent),
            desc: pricingRule
        });
    }
    
    return rentRoll;
}

function generateRentRollForLease(leaseId) {
    const lease = state.leases[leaseId];
    if (lease) {
        lease.rentRoll = generateRentRollSchedule(lease);
    }
}

function renderRentRollPreview(rentRoll) {
    const container = document.getElementById('rentroll-preview-box');
    const tbody = document.getElementById('rentroll-preview-rows');
    tbody.innerHTML = '';
    
    rentRoll.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Month ${row.month}</td>
            <td>Year ${Math.ceil(row.month / 12)}</td>
            <td><span class="pricing-rule">${row.desc}</span></td>
            <td><strong>$${row.rent.toLocaleString()}</strong></td>
        `;
        tbody.appendChild(tr);
    });
    
    container.classList.remove('hidden');
}

function saveLeaseContract() {
    const formLeaseData = parseLeaseForm();
    if (!formLeaseData) return;
    
    const lead = state.leads.find(l => l.id === formLeaseData.leadId);
    if (!lead) return;
    
    lead.stage = 'Signed';
    const unit = state.units[formLeaseData.unitId];
    unit.status = 'leased';
    
    const newLeaseId = `L-00${Object.keys(state.leases).length + 1}`;
    formLeaseData.id = newLeaseId;
    formLeaseData.signedMonthsAgo = 0;
    formLeaseData.rentRoll = generateRentRollSchedule(formLeaseData);
    
    state.leases[newLeaseId] = formLeaseData;
    unit.leaseId = newLeaseId;
    
    if (formLeaseData.brokerPct > 0) {
        const year1Rent = formLeaseData.rentRoll.slice(0, 12).reduce((sum, item) => sum + item.rent, 0);
        const commissionTotal = Math.round(year1Rent * (formLeaseData.brokerPct / 100));
        const stageCommission = Math.round(commissionTotal / 2);
        
        state.brokerageLedger.push({
            broker: formLeaseData.brokerName,
            unitCode: unit.code,
            totalCommission: commissionTotal,
            stage1: stageCommission,
            stage2: stageCommission,
            status: 'Stage 1 Pending'
        });
    }
    
    closeLeaseDrawer();
    renderCRM();
    syncFloorPlanVisuals();
    renderBrokerageLedger();
    calculateBIMetrics();
    updateRentRollChart();
    
    showSignalRToast('📡 SignalR Web Broadcast', `Lease contract successfully configured and signed for brand: "${formLeaseData.tenant}". Unit ${unit.code} status set to [Leased].`, 'success');
    selectUnit(unit.code);
    
    // Trigger Flow C Visualizer to show KPI recalculations
    simulateArchSyncTrigger('bi-kpi');
}

// Helper to trigger architectural tab auto-jump
function simulateArchSyncTrigger(flowType) {
    state.selectedArchFlow = flowType;
    
    // Select correct flow radio card in Arch view
    document.querySelectorAll('.flow-option-card').forEach(card => {
        card.classList.remove('active');
        if (card.getAttribute('data-flow') === flowType) {
            card.classList.add('active');
        }
    });
}

// 8. Hangfire Billing Automation Engine Sim
function initHangfire() {
    const triggerBtn = document.getElementById('btn-trigger-billing');
    triggerBtn.addEventListener('click', runBillingBatchJob);
}

function runBillingBatchJob() {
    const triggerBtn = document.getElementById('btn-trigger-billing');
    const progressContainer = document.getElementById('job-progress-container');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressPct = document.getElementById('progress-pct');
    const logConsole = document.getElementById('billing-log-console');
    const statusVal = document.getElementById('h-current-status');
    const badgeBadge = document.getElementById('job-count-badge');
    
    triggerBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressPct.textContent = '0%';
    statusVal.textContent = 'Processing...';
    statusVal.style.color = 'var(--color-negotiating)';
    badgeBadge.textContent = 'Active';
    badgeBadge.className = 'badge badge-pulse';
    
    appendLog(logConsole, '[Hangfire] Job "MonthlyBillingBatchFlow" activated by administrator manual trigger.', 'info');
    appendLog(logConsole, '[Hangfire] Recurring job execution thread spawned.', 'system');
    
    let progress = 0;
    const totalLeasesCount = Object.keys(state.leases).length;
    let leasesInvoiced = 0;
    
    appendLog(logConsole, `[LINQ Query] Scanning active leasing databases... Found ${totalLeasesCount} contracts in active directories.`, 'system');
    
    const interval = setInterval(() => {
        progress += 4;
        progressBar.style.width = `${progress}%`;
        progressPct.textContent = `${progress}%`;
        
        if (progress === 12) {
            appendLog(logConsole, '[Stateless Engine] Fetching contract schedule schemas...', 'system');
        }
        
        if (progress === 24) {
            const leaseKeys = Object.keys(state.leases);
            if (leaseKeys.length > 0) {
                const firstLease = state.leases[leaseKeys[0]];
                appendLog(logConsole, `[Billing Engine] Calculating billing elements for Tenant: "${firstLease.tenant}" (Unit ${firstLease.unitId}).`, 'info');
                appendLog(logConsole, `[Rent Engine] Scheduled Base Rent: $${firstLease.rentRoll[firstLease.signedMonthsAgo]?.rent || firstLease.baseRent}. Fixed Service Charge: $150.00.`, 'system');
            }
        }
        
        if (progress === 44) {
            appendLog(logConsole, '[Utility Broker] Querying smart IoT power/water meter database via API client...', 'info');
            appendLog(logConsole, '[Utility Broker] Meter readings fetched: U-103 = 1040kWh / U-104 = 0kWh (under construction).', 'system');
        }
        
        if (progress === 60) {
            Object.values(state.leases).forEach(lease => {
                const currentMonthName = "July 2026";
                const exists = state.invoices.some(inv => inv.tenant === lease.tenant && inv.month === currentMonthName);
                
                if (!exists) {
                    const currentMonthRent = lease.rentRoll[lease.signedMonthsAgo]?.rent || lease.baseRent;
                    const utilityVal = lease.unitId === 'U-103' ? 260 : 0; 
                    const totalAmt = currentMonthRent + 150 + utilityVal;
                    
                    const newInvId = `INV-2026-07-00${state.invoices.length + 1}`;
                    state.invoices.push({
                        id: newInvId,
                        tenant: lease.tenant,
                        unitId: lease.unitId,
                        month: currentMonthName,
                        amount: totalAmt,
                        serviceCharge: 150,
                        utilityCharge: utilityVal,
                        status: 'Pending Payment',
                        qrCodeSeed: `inv-${newInvId.toLowerCase()}`
                    });
                    
                    appendLog(logConsole, `[QuestPDF Engine] Rendered layout blueprint for Invoice ${newInvId} -> Compiled PDF file format correctly.`, 'success');
                    leasesInvoiced++;
                }
            });
        }
        
        if (progress === 80) {
            appendLog(logConsole, '[MailKit Service] Initializing SMTP secure link to email servers (office365.pms.corp)...', 'system');
            appendLog(logConsole, `[MailKit Service] Dispatching PDF billing copies to registered contact emails... Delivered.`, 'success');
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            triggerBtn.disabled = false;
            progressContainer.classList.add('hidden');
            statusVal.textContent = 'Idle';
            statusVal.style.color = '#94a3b8';
            badgeBadge.textContent = 'Idle';
            badgeBadge.className = 'badge';
            
            appendLog(logConsole, '[Hangfire] Job "MonthlyBillingBatchFlow" completed successfully. Output saved to disk structures.', 'success');
            
            renderInvoiceTable();
            const succeededCount = document.getElementById('h-succeeded-count');
            succeededCount.textContent = parseInt(succeededCount.textContent) + 1;
            
            showSignalRToast('💼 Hangfire Job Runner', `Billing batch job finished. Compiled ${leasesInvoiced} invoices and dispatched client notifications.`, 'success');
            
            // Auto trigger architecture visualizer
            simulateArchSyncTrigger('batch-billing');
        }
    }, 150);
}

function appendLog(consoleEl, msg, type = 'system') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    line.textContent = `[${timestamp}] ${msg}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function renderInvoiceTable() {
    const tbody = document.getElementById('invoice-rows');
    tbody.innerHTML = '';
    
    state.invoices.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${inv.id}</strong></td>
            <td>${inv.tenant}</td>
            <td><span class="badge">${inv.unitId}</span></td>
            <td>${inv.month}</td>
            <td><strong>$${inv.amount.toLocaleString()}</strong></td>
            <td>
                <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size:0.75rem" onclick="viewInvoiceDetails('${inv.id}')">
                    <i data-lucide="eye" style="width:12px; height:12px"></i> View Invoice
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

// 9. QuestPDF PDF Invoicing Viewer Modal
function viewInvoiceDetails(invId) {
    const inv = state.invoices.find(i => i.id === invId);
    if (!inv) return;
    
    const unit = state.units[inv.unitId];
    const lease = Object.values(state.leases).find(l => l.unitId === inv.unitId);
    const rentAmount = inv.amount - inv.serviceCharge - inv.utilityCharge;
    
    const pdfHtml = `
        <div class="inv-header">
            <div class="inv-brand">
                <span class="inv-brand-name">Commercial PMS Corp</span>
                <span class="inv-brand-sub">Premium Property Management Systems Ltd.</span>
            </div>
            <div class="inv-title">
                <h2>VAT Invoice</h2>
                <div class="inv-meta-row">Invoice No: <strong>${inv.id}</strong></div>
                <div class="inv-meta-row">Billing Period: <strong>${inv.month}</strong></div>
            </div>
        </div>
        
        <div class="inv-details">
            <div>
                <div class="inv-to-header">Property Manager</div>
                <div class="inv-to-name">Commercial PMS Office Plaza</div>
                <div>100 Ton Duc Thang, Dist 1</div>
                <div>Ho Chi Minh City, Viet Nam</div>
            </div>
            <div>
                <div class="inv-to-header">Tenant Bill To</div>
                <div class="inv-to-name">${inv.tenant}</div>
                <div>Office Area: Unit ${inv.unitId} (${unit ? unit.area : '0'} m²)</div>
                <div>Contract Reference: ${lease ? lease.id : 'N/A'}</div>
            </div>
        </div>
        
        <table class="inv-table">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th>Billing Mode</th>
                    <th class="num-col">Base Rate ($)</th>
                    <th class="num-col">Amount ($)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Base Office Rental Fee</strong><br><small>As configured in Lease Schedule Escalation Rules</small></td>
                    <td>Contract Rent Schedule</td>
                    <td class="num-col">$${rentAmount.toLocaleString()}</td>
                    <td class="num-col">$${rentAmount.toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>Fixed Common Area Service Charge (S/C)</strong><br><small>Security, elevator maintenance, janitorial, standard lighting</small></td>
                    <td>Fixed Monthly</td>
                    <td class="num-col">$150.00</td>
                    <td class="num-col">$150.00</td>
                </tr>
                <tr>
                    <td><strong>Sub-metered Utility Power & Water Costs</strong><br><small>Consumption billed separately from IoT smart meters</small></td>
                    <td>IoT Billed Usage</td>
                    <td class="num-col">$${inv.utilityCharge.toLocaleString()}</td>
                    <td class="num-col">$${inv.utilityCharge.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="inv-summary-container">
            <div class="inv-payment-instruction">
                <div class="qr-code-box">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="100" height="100" fill="none" stroke="#6366f1" stroke-width="2"/>
                        <rect x="5" y="5" width="25" height="25" fill="#0f172a"/>
                        <rect x="10" y="10" width="15" height="15" fill="white"/>
                        <rect x="13" y="13" width="9" height="9" fill="#0f172a"/>
                        
                        <rect x="70" y="5" width="25" height="25" fill="#0f172a"/>
                        <rect x="75" y="10" width="15" height="15" fill="white"/>
                        <rect x="78" y="13" width="9" height="9" fill="#0f172a"/>
                        
                        <rect x="5" y="70" width="25" height="25" fill="#0f172a"/>
                        <rect x="10" y="75" width="15" height="15" fill="white"/>
                        <rect x="13" y="78" width="9" height="9" fill="#0f172a"/>
                        
                        <rect x="35" y="10" width="5" height="5" fill="#0f172a"/>
                        <rect x="45" y="15" width="10" height="5" fill="#0f172a"/>
                        <rect x="55" y="5" width="5" height="15" fill="#0f172a"/>
                        <rect x="35" y="30" width="20" height="5" fill="#0f172a"/>
                        
                        <rect x="10" y="45" width="10" height="5" fill="#0f172a"/>
                        <rect x="25" y="35" width="5" height="25" fill="#0f172a"/>
                        <rect x="5" y="60" width="15" height="5" fill="#0f172a"/>
                        
                        <rect x="75" y="35" width="5" height="15" fill="#0f172a"/>
                        <rect x="85" y="45" width="10" height="5" fill="#0f172a"/>
                        <rect x="70" y="60" width="15" height="5" fill="#0f172a"/>
                        <rect x="80" y="75" width="5" height="15" fill="#0f172a"/>
                        
                        <rect x="40" y="45" width="15" height="15" fill="#6366f1"/>
                        <text x="44" y="55" font-size="8" font-weight="900" fill="white" font-family="sans-serif">PMS</text>
                    </svg>
                </div>
                <div class="payment-text">
                    <h4>Automatic Bank Payment QR Code</h4>
                    <p>Scan this VietQR code using your standard banking application. Transaction details are pre-filled securely to direct bank transfer lines.</p>
                </div>
            </div>
            
            <div class="inv-totals">
                <div class="inv-total-row">
                    <span>Subtotal</span>
                    <span>$${inv.amount.toLocaleString()}</span>
                </div>
                <div class="inv-total-row">
                    <span>VAT Tax (0% Commercial Special Incentive)</span>
                    <span>$0.00</span>
                </div>
                <div class="inv-total-row grand-total">
                    <span>Grand Total Due</span>
                    <span>$${inv.amount.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <div class="inv-footer">
            Thank you for being our premium business partner. Commercial PMS Corp.
        </div>
    `;
    
    document.getElementById('invoice-pdf-content').innerHTML = pdfHtml;
    document.getElementById('invoice-modal').classList.remove('hidden');
    lucide.createIcons();
}

function hideInvoiceModal() {
    document.getElementById('invoice-modal').classList.add('hidden');
}

// Utility Navigation
function navigateToTab(tabId) {
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navItem) {
        navItem.click();
    }
}

// 10. Architecture Visualizer Hub Logic
function initArchitectureHub() {
    const flowCards = document.querySelectorAll('.flow-option-card');
    const playBtn = document.getElementById('btn-play-arch-flow');
    
    flowCards.forEach(card => {
        card.addEventListener('click', () => {
            if (state.isArchFlowPlaying) return; // Lock during simulation run
            
            flowCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const flowId = card.getAttribute('data-flow');
            state.selectedArchFlow = flowId;
            
            // Clear previous simulation steps
            resetArchitectureVisuals();
        });
    });
    
    playBtn.addEventListener('click', () => {
        playArchitectureSimulation();
    });
    
    resetArchitectureVisuals();
}

function resetArchitectureVisuals() {
    // Clear active glow classes on all blocks
    document.querySelectorAll('.arch-block').forEach(b => b.classList.remove('active-glow'));
    document.querySelectorAll('.arch-layer').forEach(l => l.classList.remove('active-glow'));
    
    // Hide data packet
    const packet = document.getElementById('arch-data-packet');
    packet.style.opacity = '0';
    
    // Reset steps explanation
    const logBox = document.getElementById('arch-step-logs');
    logBox.innerHTML = `
        <div class="arch-log-empty">
            <i data-lucide="info"></i>
            <p>Click "Play Simulation Flow" to analyze real-time code execution trace.</p>
        </div>
    `;
    lucide.createIcons();
}

function playArchitectureSimulation() {
    if (state.isArchFlowPlaying) return;
    
    state.isArchFlowPlaying = true;
    const playBtn = document.getElementById('btn-play-arch-flow');
    playBtn.disabled = true;
    playBtn.querySelector('span').textContent = 'Simulation Running...';
    
    resetArchitectureVisuals();
    
    const flow = archFlows[state.selectedArchFlow];
    if (!flow) {
        state.isArchFlowPlaying = false;
        playBtn.disabled = false;
        playBtn.querySelector('span').textContent = 'Play Simulation Flow';
        return;
    }
    
    const logBox = document.getElementById('arch-step-logs');
    logBox.innerHTML = ''; // Clear empty block
    
    // Add all log rows collapsed
    flow.steps.forEach((step, idx) => {
        const item = document.createElement('div');
        item.className = 'arch-step-item';
        item.id = `step-log-${idx}`;
        item.innerHTML = `
            <div class="arch-step-num">${idx + 1}</div>
            <div class="arch-step-meta">
                <strong>${step.title}</strong>
                <span>${step.desc}</span>
            </div>
        `;
        logBox.appendChild(item);
    });
    
    const packet = document.getElementById('arch-data-packet');
    
    // Sequencer variables
    let currentStepIdx = 0;
    const stepDuration = 1600; // time in ms per step hop
    
    function runNextStep() {
        if (currentStepIdx >= flow.steps.length) {
            // Flow completed
            setTimeout(() => {
                packet.style.opacity = '0';
                // Remove glows
                document.querySelectorAll('.arch-block').forEach(b => b.classList.remove('active-glow'));
                document.querySelectorAll('.arch-layer').forEach(l => l.classList.remove('active-glow'));
                
                state.isArchFlowPlaying = false;
                playBtn.disabled = false;
                playBtn.querySelector('span').textContent = 'Play Simulation Flow';
                
                showSignalRToast('🔍 Architecture Sync Complete', `Finished running trace simulation for: ${flow.name}.`, 'success');
            }, 800);
            return;
        }
        
        const step = flow.steps[currentStepIdx];
        const blockEl = document.getElementById(step.block);
        const logItem = document.getElementById(`step-log-${currentStepIdx}`);
        
        if (blockEl) {
            // 1. Clear previous block glow, keep current block glowing
            document.querySelectorAll('.arch-block').forEach(b => b.classList.remove('active-glow'));
            blockEl.classList.add('active-glow');
            
            // Highlight containing parent layer
            const parentLayer = blockEl.closest('.arch-layer');
            document.querySelectorAll('.arch-layer').forEach(l => l.classList.remove('active-glow'));
            if (parentLayer) {
                parentLayer.classList.add('active-glow');
            }
            
            // 2. Active log line scroll to view
            document.querySelectorAll('.arch-step-item').forEach(item => item.classList.remove('active'));
            if (logItem) {
                logItem.classList.add('active');
                logItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            // 3. Move absolute neon particle packet
            const wrapperRect = document.querySelector('.arch-diagram-wrapper').getBoundingClientRect();
            const blockRect = blockEl.getBoundingClientRect();
            
            // Center of block relative to diagram wrapper
            const destX = (blockRect.left + blockRect.width / 2) - wrapperRect.left;
            const destY = (blockRect.top + blockRect.height / 2) - wrapperRect.top;
            
            if (currentStepIdx === 0) {
                // Instantly teleport packet to starting block, make visible
                packet.style.transition = 'none';
                packet.style.left = `${destX}px`;
                packet.style.top = `${destY}px`;
                packet.style.opacity = '1';
            } else {
                // Glide to next node
                packet.style.transition = 'all 1.0s cubic-bezier(0.25, 1, 0.5, 1)';
                packet.style.left = `${destX}px`;
                packet.style.top = `${destY}px`;
            }
        }
        
        currentStepIdx++;
        setTimeout(runNextStep, stepDuration);
    }
    
    // Start sequence loop
    runNextStep();
}
