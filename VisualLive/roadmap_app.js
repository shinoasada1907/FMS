// C# .NET Commercial PMS Roadmap Data
const roadmapData = {
    '1': {
        techTag: '.NET 8/9, EF Core, Stateless',
        taskTitle: 'Chi tiết Công việc: Tuần 1 - Thiết kế Database & State Machine CRM',
        tasks: [
            { title: 'Bước 1.1: Tạo Project API & ORM', desc: 'Khởi tạo Web API bằng .NET Core. Tích hợp DbContext cho PostgreSQL sử dụng Entity Framework Core.' },
            { title: 'Bước 1.2: Định nghĩa Model Entities', desc: 'Viết các thực thể Property, Unit, Lead, Contract liên kết chặt chẽ bằng Fluent API.' },
            { title: 'Bước 1.3: Cài đặt Stateless Machine', desc: 'Cấu hình Stateless FSM: Khi Lead chuyển từ Prospect -> Negotiation, tự động khóa Unit sang Negotiating.' },
            { title: 'Bước 1.4: Viết CRM API Controllers', desc: 'Xây dựng endpoints tiếp nhận yêu cầu đổi trạng thái đàm phán và kiểm tra tính đồng bộ của mặt bằng.' }
        ],
        activeBlocks: ['node-client-ui', 'node-web-api', 'node-stateless', 'node-efcore', 'node-postgresql'],
        activeSchemas: ['properties', 'units', 'leads']
    },
    '2': {
        techTag: 'LINQ, EF Core, Rent Roll Logic',
        taskTitle: 'Chi tiết Công việc: Tuần 2 - Động cơ tính giá thuê lũy tiến',
        tasks: [
            { title: 'Bước 2.1: Model hóa điều khoản giá (Escalation)', desc: 'Tạo bảng ContractRentTerm lưu lịch trình giá (Tăng % cố định hàng năm hoặc Step-up tăng bậc).' },
            { title: 'Bước 2.2: Thuật toán Sinh Lịch trình thu tiền', desc: 'Viết RentCalculationService sử dụng LINQ chạy tịnh tiến từng tháng, trừ thời gian khuyến mãi Free Rent.' },
            { title: 'Bước 2.3: Sinh dữ liệu Rent Roll mẫu', desc: 'Lưu toàn bộ lịch trình dự kiến vào bảng RentRollSchedules ngay khi hợp đồng ký kết thành công để đối soát tài chính.' }
        ],
        activeBlocks: ['node-client-ui', 'node-web-api', 'node-rent-engine', 'node-efcore', 'node-postgresql'],
        activeSchemas: ['properties', 'units', 'leads', 'contracts', 'contract_rent_terms', 'rent_roll_schedules']
    },
    '3': {
        techTag: 'Hangfire, QuestPDF, MailKit',
        taskTitle: 'Chi tiết Công việc: Tuần 3 - Tự động hóa Invoicing & Batch Jobs',
        tasks: [
            { title: 'Bước 3.1: Cấu hình Hangfire Dashboard', desc: 'Tích hợp Hangfire.AspNetCore vào route /hangfire bảo mật bằng quyền Admin để giám sát hàng đợi.' },
            { title: 'Bước 3.2: Viết Monthly Billing Job', desc: 'Cài đặt Recurring Job chạy vào 00:00 ngày 25 hàng tháng gộp Tiền thuê gốc + Phí dịch vụ + Phí điện nước tiêu thụ.' },
            { title: 'Bước 3.3: Render File Hóa đơn PDF', desc: 'Sử dụng QuestPDF kết xuất hóa đơn chuyên nghiệp, nhúng mã QR VietQR thanh toán tự động.' },
            { title: 'Bước 3.4: Async Email Service', desc: 'Sử dụng MailKit SMTP Client gửi email đính kèm hóa đơn PDF bất đồng bộ đến hòm thư khách hàng.' }
        ],
        activeBlocks: ['node-hangfire', 'node-questpdf', 'node-mailkit', 'node-hangfiredb', 'node-mail-server', 'node-email-client', 'node-client-ui', 'node-web-api', 'node-rent-engine', 'node-efcore', 'node-postgresql'],
        activeSchemas: ['properties', 'units', 'leads', 'contracts', 'contract_rent_terms', 'rent_roll_schedules', 'invoices']
    },
    '4': {
        techTag: 'SignalR Hub, WebSockets, Deposits',
        taskTitle: 'Chi tiết Công việc: Tuần 4 - Đặt cọc & Đồng bộ Sơ đồ tầng Real-time',
        tasks: [
            { title: 'Bước 4.1: Query Cảnh báo Bảo lãnh ngân hàng', desc: 'Viết Hangfire Job chạy hàng ngày quét bảng Deposits tìm các thư bảo lãnh ngân hàng sắp hết hạn trước 30/60 ngày.' },
            { title: 'Bước 4.2: Tích hợp SignalR Hub WebSockets', desc: 'Cấu hình SignalR Hub tạo đường truyền kết nối hai chiều liên tục giữa Server và Client UI.' },
            { title: 'Bước 4.3: Real-time Floor Plan Update', desc: 'Khi Lead đổi trạng thái, SignalR Hub phát tín hiệu cập nhật tức thì màu ô mặt bằng trên sơ đồ tầng mà không cần reload trang.' }
        ],
        activeBlocks: ['node-signalr', 'node-hangfire', 'node-questpdf', 'node-mailkit', 'node-hangfiredb', 'node-mail-server', 'node-email-client', 'node-client-ui', 'node-web-api', 'node-rent-engine', 'node-efcore', 'node-postgresql'],
        activeSchemas: ['properties', 'units', 'leads', 'contracts', 'contract_rent_terms', 'rent_roll_schedules', 'invoices', 'deposits']
    },
    '5': {
        techTag: 'LINQ Advanced, BI Service, Commission',
        taskTitle: 'Chi tiết Công việc: Tuần 5 - Đầu não Báo cáo KPI & Hoa hồng môi giới',
        tasks: [
            { title: 'Bước 5.1: Thuật toán tính chỉ số WAULT', desc: 'Viết Service tổng hợp sử dụng LINQ tính Thời hạn hợp đồng còn lại bình quân gia quyền theo dòng tiền doanh thu.' },
            { title: 'Bước 5.2: Công thức Rent Roll & Occupancy Rate', desc: 'Tính tỷ lệ lấp đầy Occupancy Rate = (Diện tích đã ký / Tổng diện tích tòa nhà) * 100.' },
            { title: 'Bước 5.3: Lịch trình trả Hoa hồng Môi giới', desc: 'Thiết kế Brokerage Ledger, viết logic chia chi trả làm 2 đợt (50% khi đóng cọc, 50% khi shop khai trương).' }
        ],
        activeBlocks: ['node-bi-calc', 'node-signalr', 'node-hangfire', 'node-questpdf', 'node-mailkit', 'node-hangfiredb', 'node-mail-server', 'node-email-client', 'node-client-ui', 'node-web-api', 'node-rent-engine', 'node-efcore', 'node-postgresql'],
        activeSchemas: ['properties', 'units', 'leads', 'contracts', 'contract_rent_terms', 'rent_roll_schedules', 'invoices', 'deposits', 'brokerage_ledgers']
    }
};

// Database SQL Schema Blueprints
const schemaBlueprints = {
    'properties': {
        name: 'properties (Bảng tòa nhà)',
        icon: 'building',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'name', type: 'VARCHAR(150)' },
            { name: 'address', type: 'VARCHAR(250)' },
            { name: 'total_area', type: 'DECIMAL(12,2)' },
            { name: 'created_at', type: 'TIMESTAMP' }
        ]
    },
    'units': {
        name: 'units (Bảng mặt bằng)',
        icon: 'layout',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'property_id', type: 'UUID [FK]' },
            { name: 'code', type: 'VARCHAR(20) [UNIQUE]' },
            { name: 'area', type: 'DECIMAL(10,2)' },
            { name: 'usage_type', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(30) [Vacant/Leased]' },
            { name: 'base_price', type: 'DECIMAL(10,2)' },
            { name: 'lease_id', type: 'UUID [FK, NULL]' }
        ]
    },
    'leads': {
        name: 'leads (Khách tiềm năng)',
        icon: 'user-plus',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'tenant_name', type: 'VARCHAR(150)' },
            { name: 'category', type: 'VARCHAR(50)' },
            { name: 'target_unit_id', type: 'UUID [FK]' },
            { name: 'budget', type: 'DECIMAL(12,2)' },
            { name: 'stage', type: 'VARCHAR(50)' }
        ]
    },
    'contracts': {
        name: 'contracts (Hợp đồng thuê)',
        icon: 'file-text',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'lead_id', type: 'UUID [FK]' },
            { name: 'unit_id', type: 'UUID [FK]' },
            { name: 'tenant_name', type: 'VARCHAR(150)' },
            { name: 'duration_years', type: 'INTEGER' },
            { name: 'base_rent', type: 'DECIMAL(12,2)' },
            { name: 'free_months', type: 'INTEGER' },
            { name: 'escalation_type', type: 'VARCHAR(50)' },
            { name: 'guarantee_amt', type: 'DECIMAL(12,2)' },
            { name: 'broker_name', type: 'VARCHAR(150)' },
            { name: 'broker_pct', type: 'DECIMAL(5,2)' },
            { name: 'signed_at', type: 'TIMESTAMP' }
        ]
    },
    'contract_rent_terms': {
        name: 'contract_rent_terms (Lịch giá)',
        icon: 'calendar-range',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'contract_id', type: 'UUID [FK]' },
            { name: 'year_num', type: 'INTEGER' },
            { name: 'monthly_rent', type: 'DECIMAL(12,2)' }
        ]
    },
    'rent_roll_schedules': {
        name: 'rent_roll_schedules (Bảng dòng tiền)',
        icon: 'table-properties',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'contract_id', type: 'UUID [FK]' },
            { name: 'month_num', type: 'INTEGER' },
            { name: 'rent_amount', type: 'DECIMAL(12,2)' },
            { name: 'pricing_rule', type: 'VARCHAR(150)' }
        ]
    },
    'invoices': {
        name: 'invoices (Hóa đơn)',
        icon: 'receipt',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'contract_id', type: 'UUID [FK]' },
            { name: 'tenant_name', type: 'VARCHAR(150)' },
            { name: 'unit_id', type: 'UUID [FK]' },
            { name: 'billing_month', type: 'VARCHAR(30)' },
            { name: 'rent_amount', type: 'DECIMAL(12,2)' },
            { name: 'service_charge', type: 'DECIMAL(10,2)' },
            { name: 'utility_charge', type: 'DECIMAL(10,2)' },
            { name: 'total_amount', type: 'DECIMAL(12,2)' },
            { name: 'status', type: 'VARCHAR(50)' },
            { name: 'created_at', type: 'TIMESTAMP' }
        ]
    },
    'deposits': {
        name: 'deposits (Tiền cọc & Thư bảo lãnh)',
        icon: 'shield-alert',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'contract_id', type: 'UUID [FK]' },
            { name: 'tenant_name', type: 'VARCHAR(150)' },
            { name: 'deposit_amount', type: 'DECIMAL(12,2)' },
            { name: 'guarantee_bank', type: 'VARCHAR(150)' },
            { name: 'guarantee_expiry', type: 'DATE' },
            { name: 'status', type: 'VARCHAR(50)' }
        ]
    },
    'brokerage_ledgers': {
        name: 'brokerage_ledgers (Sổ hoa hồng)',
        icon: 'award',
        columns: [
            { name: 'id', type: 'UUID [PK]' },
            { name: 'contract_id', type: 'UUID [FK]' },
            { name: 'broker_name', type: 'VARCHAR(150)' },
            { name: 'total_commission', type: 'DECIMAL(12,2)' },
            { name: 'stage_1_amount', type: 'DECIMAL(12,2)' },
            { name: 'stage_2_amount', type: 'DECIMAL(12,2)' },
            { name: 'status', type: 'VARCHAR(50)' }
        ]
    }
};

// Simulation Paths Definitions
const pathsRoutes = {
    'crm-sync': {
        color: '#f97316',
        name: 'CRM Transaction Sync',
        steps: [
            { node: 'node-client-ui', pct: 0, text: 'Staff triggers CRM State change on Web UI.' },
            { node: 'node-web-api', pct: 15, text: 'Web API Controller receives POST request.' },
            { node: 'node-stateless', pct: 30, text: 'Stateless engine transitions Lead stage (Prospect -> Negotiation).' },
            { node: 'node-efcore', pct: 45, text: 'EF Core maps the entity changes to DB queries.' },
            { node: 'node-postgresql', pct: 60, text: 'PostgreSQL commits transaction to lock space status.' },
            { node: 'node-web-api', pct: 75, text: 'Web API Controller registers successful persistence.' },
            { node: 'node-signalr', pct: 85, text: 'SignalR Hub broadcasts state sync via WebSockets.' },
            { node: 'node-client-ui', pct: 100, text: 'Client UI receives ping & locks Floor Plan Unit to amber.' }
        ]
    },
    'batch-billing': {
        color: '#6366f1',
        name: 'Batch Billing Job',
        steps: [
            { node: 'node-hangfire', pct: 0, text: 'Hangfire triggers Recurring Job at 00:00 on Day 25.' },
            { node: 'node-efcore', pct: 15, text: 'DbContext queries PostgreSQL database for active leases.' },
            { node: 'node-postgresql', pct: 30, text: 'PostgreSQL returns rent prices and tenant contacts.' },
            { node: 'node-iot-meters', pct: 45, text: 'IoT Service queries sub-meter API for power usage.' },
            { node: 'node-rent-engine', pct: 60, text: 'Rent Engine calculates rent, service charges, and water/power.' },
            { node: 'node-questpdf', pct: 75, text: 'QuestPDF compiles data, embeds QR payment vector in invoice.' },
            { node: 'node-mailkit', pct: 88, text: 'MailKit loads files and dispatches async emails via SMTP.' },
            { node: 'node-mail-server', pct: 95, text: 'Mail Server delivers invoice directly to Client.' },
            { node: 'node-email-client', pct: 100, text: 'Client receives PDF billing invoice copy.' }
        ]
    },
    'bi-kpi': {
        color: '#10b981',
        name: 'BI KPI Recalculation',
        steps: [
            { node: 'node-postgresql', pct: 0, text: 'New lease written triggers database modification.' },
            { node: 'node-efcore', pct: 25, text: 'EF Core runs LINQ aggregation queries to fetch unexpired terms.' },
            { node: 'node-bi-calc', pct: 55, text: 'Core WAULT & Occupancy Calculator computes real-time math.' },
            { node: 'node-web-api', pct: 78, text: 'Web API publishes updated metric structures.' },
            { node: 'node-client-ui', pct: 100, text: 'Client UI chart and KPI widgets redraw instantly.' }
        ]
    }
};

let activeWeek = '1';
let activeFlowType = 'crm-sync';
let isRunningSim = false;

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initWeekSelection();
    initFlowTabs();
    
    // Draw initial view
    switchWeek('1');
    renderSimulatorControls();
    
    // SVG Connection lines auto-draw
    setTimeout(drawSVGConnections, 200);
    window.onresize = drawSVGConnections;
    
    // Trigger icons
    lucide.createIcons();
});

// Live clock
function initClock() {
    setInterval(() => {
        const timeEl = document.querySelector('.server-time');
        if (timeEl) {
            const now = new Date();
            timeEl.textContent = now.toTimeString().split(' ')[0];
        }
    }, 1000);
}

// 5-Week Selection click handler
function initWeekSelection() {
    const weekCards = document.querySelectorAll('.week-card');
    weekCards.forEach(card => {
        card.addEventListener('click', () => {
            if (isRunningSim) return; // Prevent week change during running animation
            
            weekCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const week = card.getAttribute('data-week');
            switchWeek(week);
        });
    });
}

function switchWeek(week) {
    activeWeek = week;
    const data = roadmapData[week];
    if (!data) return;
    
    // 1. Update Technical Tasks Details (Left Bottom panel)
    document.getElementById('task-panel-title').textContent = data.taskTitle;
    document.getElementById('task-tech-tag').textContent = data.techTag;
    
    const taskContent = document.getElementById('task-panel-content');
    taskContent.innerHTML = '';
    
    const list = document.createElement('div');
    list.className = 'task-step-list';
    data.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-step-item';
        item.innerHTML = `
            <strong>${task.title}</strong>
            <span>${task.desc}</span>
        `;
        list.appendChild(item);
    });
    taskContent.appendChild(list);
    
    // 2. Update DB Schema Tree highlighting (Left panel)
    const treeContainer = document.getElementById('db-schema-tree');
    treeContainer.innerHTML = '';
    
    Object.keys(schemaBlueprints).forEach(tableName => {
        const table = schemaBlueprints[tableName];
        const isFaded = !data.activeSchemas.includes(tableName);
        
        const tableDiv = document.createElement('div');
        tableDiv.className = `schema-table ${isFaded ? 'faded-table' : ''}`;
        
        let colsHtml = '';
        table.columns.forEach(col => {
            let colClass = '';
            let keyIcon = '';
            if (col.type.includes('[PK]')) { colClass = 'pk'; keyIcon = '<i data-lucide="key" style="color:#fde047"></i> '; }
            else if (col.type.includes('[FK]')) { colClass = 'fk'; keyIcon = '<i data-lucide="link-2" style="color:#38bdf8"></i> '; }
            
            colsHtml += `
                <div class="schema-col-row">
                    <span class="col-name-group ${colClass}">${keyIcon}${col.name}</span>
                    <span class="schema-col-type">${col.type.split(' ')[0]}</span>
                </div>
            `;
        });
        
        tableDiv.innerHTML = `
            <div class="schema-table-name">
                <i data-lucide="${table.icon === 'building' ? 'building' : table.icon === 'layout' ? 'layout' : table.icon === 'user-plus' ? 'user-plus' : 'table-2'}"></i>
                <span>${table.name}</span>
            </div>
            <div class="schema-columns">
                ${colsHtml}
            </div>
        `;
        
        treeContainer.appendChild(tableDiv);
    });
    
    // 3. Highlight/Fade Architecture Node Cards
    document.querySelectorAll('.arch-block-card').forEach(card => {
        const id = card.id;
        if (data.activeBlocks.includes(id)) {
            card.classList.remove('faded');
        } else {
            card.classList.add('faded');
            card.classList.remove('active-glow');
        }
    });
    
    lucide.createIcons();
    drawSVGConnections();
}

// Draw Orthogonal Connector Lines dynamically based on elements positioning
function drawSVGConnections() {
    const svg = document.getElementById('arch-svg-connections');
    if (!svg) return;
    
    const wrapperRect = document.getElementById('arch-diagram-wrapper').getBoundingClientRect();
    
    // Coordinates computation helper
    function getConnectorPoints(sourceId, destId) {
        const srcEl = document.getElementById(sourceId);
        const destEl = document.getElementById(destId);
        
        if (!srcEl || !destEl || srcEl.classList.contains('faded') || destEl.classList.contains('faded')) {
            return null;
        }
        
        const srcRect = srcEl.getBoundingClientRect();
        const destRect = destEl.getBoundingClientRect();
        
        // Relative center points to wrapper
        const x1 = (srcRect.left + srcRect.width / 2) - wrapperRect.left;
        const y1 = (srcRect.top + srcRect.height / 2) - wrapperRect.top;
        
        const x2 = (destRect.left + destRect.width / 2) - wrapperRect.left;
        const y2 = (destRect.top + destRect.height / 2) - wrapperRect.top;
        
        return { x1, y1, x2, y2 };
    }
    
    // Set Path helper
    function setOrthogonalPath(pathId, sourceId, destId, orientation = 'horizontal') {
        const path = document.getElementById(pathId);
        if (!path) return;
        
        const pts = getConnectorPoints(sourceId, destId);
        if (!pts) {
            path.setAttribute('d', '');
            path.classList.remove('active-glow');
            return;
        }
        
        const { x1, y1, x2, y2 } = pts;
        let d = '';
        
        // Draw Orthogonal line (折线)
        if (orientation === 'horizontal') {
            const x_mid = x1 + (x2 - x1) * 0.45;
            d = `M ${x1} ${y1} L ${x_mid} ${y1} L ${x_mid} ${y2} L ${x2} ${y2}`;
        } else {
            const y_mid = y1 + (y2 - y1) * 0.5;
            d = `M ${x1} ${y1} L ${x1} ${y_mid} L ${x2} ${y_mid} L ${x2} ${y2}`;
        }
        
        path.setAttribute('d', d);
        
        // Highlight active connections based on week selection
        const weekData = roadmapData[activeWeek];
        if (weekData.activeBlocks.includes(sourceId) && weekData.activeBlocks.includes(destId)) {
            path.setAttribute('stroke', '#6366f1');
        } else {
            path.setAttribute('stroke', '#273549');
        }
    }
    
    // Define lines
    setOrthogonalPath('path-ui-to-api', 'node-client-ui', 'node-web-api');
    setOrthogonalPath('path-api-to-stateless', 'node-web-api', 'node-stateless');
    setOrthogonalPath('path-stateless-to-ef', 'node-stateless', 'node-efcore');
    setOrthogonalPath('path-ef-to-pg', 'node-efcore', 'node-postgresql');
    
    setOrthogonalPath('path-hangfire-to-rent', 'node-hangfire', 'node-rent-engine');
    setOrthogonalPath('path-rent-to-ef', 'node-rent-engine', 'node-efcore');
    setOrthogonalPath('path-hangfire-to-hgb', 'node-hangfire', 'node-hangfiredb');
    
    setOrthogonalPath('path-api-to-bi', 'node-web-api', 'node-bi-calc');
    setOrthogonalPath('path-bi-to-ef', 'node-bi-calc', 'node-efcore');
    
    setOrthogonalPath('path-questpdf-to-email', 'node-questpdf', 'node-email-client');
    setOrthogonalPath('path-mailkit-to-smtp', 'node-mailkit', 'node-mail-server');
    setOrthogonalPath('path-iot-to-api', 'node-iot-meters', 'node-web-api');
    setOrthogonalPath('path-api-to-signalr', 'node-web-api', 'node-signalr');
    setOrthogonalPath('path-signalr-to-ui', 'node-signalr', 'node-client-ui');
}

// Flow Simulator tabs
function initFlowTabs() {
    const tabs = document.querySelectorAll('.flow-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (isRunningSim) return;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            activeFlowType = tab.getAttribute('data-flow-type');
            renderSimulatorControls();
        });
    });
}

function renderSimulatorControls() {
    const deck = document.getElementById('sim-controls');
    const intro = document.getElementById('sim-intro');
    deck.innerHTML = '';
    
    if (activeFlowType === 'crm-sync') {
        intro.textContent = 'Mô phỏng quy trình thay đổi trạng thái CRM của Lead, Stateless State Machine khóa căn và phát SignalR real-time đổi màu sàn.';
        
        deck.innerHTML = `
            <div class="sim-form-group">
                <label>Khách thuê / Brand</label>
                <select class="sim-select" id="sim-tenant-select">
                    <option value="Starbucks Coffee">Highlands Coffee</option>
                    <option value="Zara Fashion">Zara Fashion</option>
                    <option value="Adidas Store">Adidas Outlet</option>
                </select>
            </div>
            <div class="sim-form-group">
                <label>Target Unit</label>
                <select class="sim-select" id="sim-unit-select">
                    <option value="U-101">Unit 101 (120 m²)</option>
                    <option value="U-104" selected>Unit 104 (150 m²)</option>
                    <option value="U-105">Unit 105 (180 m²)</option>
                </select>
            </div>
            <div class="sim-form-group">
                <label>Hành động Machine</label>
                <select class="sim-select" id="sim-stage-select">
                    <option value="Negotiation">Prospect -> Negotiation</option>
                </select>
            </div>
            <button class="btn-trigger-action" id="btn-run-sim-flow">
                <i data-lucide="zap"></i> Kích hoạt State Machine
            </button>
        `;
    } else if (activeFlowType === 'batch-billing') {
        intro.textContent = 'Mô phỏng tác vụ Hangfire Recurring Job quét hợp đồng hoạt động, gọi Rent Engine tính lũy tiến, xuất QuestPDF invoice kèm QR và gửi mail SMTP.';
        
        deck.innerHTML = `
            <div class="sim-form-group">
                <label>Hợp đồng quét</label>
                <select class="sim-select" id="sim-contract-select">
                    <option value="TechCorp Solutions">TechCorp Solutions (L-001)</option>
                    <option value="Highlands Coffee">Highlands Coffee (L-002)</option>
                </select>
            </div>
            <div class="sim-form-group">
                <label>Kỳ thanh toán</label>
                <input type="text" class="sim-input" value="Tháng 07/2026" readonly>
            </div>
            <button class="btn-trigger-action" id="btn-run-sim-flow" style="background: linear-gradient(135deg, var(--color-indigo), #4f46e5)">
                <i data-lucide="play-circle"></i> Chạy Hangfire Billing Job
            </button>
        `;
    } else if (activeFlowType === 'bi-kpi') {
        intro.textContent = 'Mô phỏng truy vấn EF Core nạp dữ liệu lịch thanh toán và thời hạn, chạy thuật toán tính WAULT và Occupancy, cập nhật UI Dashboard.';
        
        deck.innerHTML = `
            <div class="sim-form-group">
                <label>Công thức tính</label>
                <select class="sim-select">
                    <option>WAULT Weighted by Monthly Revenue</option>
                    <option>Occupancy Rate % by total Area</option>
                </select>
            </div>
            <button class="btn-trigger-action" id="btn-run-sim-flow" style="background: linear-gradient(135deg, var(--color-emerald), #059669)">
                <i data-lucide="calculator"></i> EF Core LINQ Queries
            </button>
        `;
    }
    
    lucide.createIcons();
    
    // Bind trigger button click
    const runBtn = document.getElementById('btn-run-sim-flow');
    if (runBtn) {
        runBtn.addEventListener('click', executeSimulatorFlow);
    }
}

// Animate Data Packet running along coordinates of blocks path
function executeSimulatorFlow() {
    if (isRunningSim) return;
    
    const flow = pathsRoutes[activeFlowType];
    if (!flow) return;
    
    // Guard: check if all nodes in path are active in current week view
    const data = roadmapData[activeWeek];
    let isBlockMissing = false;
    let missingBlockName = '';
    
    flow.steps.forEach(step => {
        if (!data.activeBlocks.includes(step.node)) {
            isBlockMissing = true;
            missingBlockName = document.getElementById(step.node)?.querySelector('h4')?.textContent || step.node;
        }
    });
    
    if (isBlockMissing) {
        showToast('❌ Kiến trúc chưa được phát triển', `Không thể chạy mô phỏng. Node "${missingBlockName}" chưa được phát triển trong Tuần ${activeWeek}.`, 'warning');
        return;
    }
    
    isRunningSim = true;
    const runBtn = document.getElementById('btn-run-sim-flow');
    const selectElements = document.querySelectorAll('.sim-select');
    const progressContainer = document.getElementById('flow-runner-progress');
    const progressFill = document.getElementById('runner-progress-fill');
    const progressTitle = document.getElementById('runner-step-title');
    const progressPct = document.getElementById('runner-step-pct');
    
    runBtn.disabled = true;
    selectElements.forEach(s => s.disabled = true);
    
    progressContainer.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressTitle.textContent = 'Initializing...';
    progressPct.textContent = '0%';
    
    const packet = document.getElementById('arch-data-packet');
    const diagramWrapper = document.getElementById('arch-diagram-wrapper');
    const wrapperRect = diagramWrapper.getBoundingClientRect();
    
    // Reset packet type classes
    packet.className = 'data-packet';
    if (activeFlowType === 'batch-billing') packet.classList.add('billing-packet');
    if (activeFlowType === 'bi-kpi') packet.classList.add('bi-packet');
    
    let stepIndex = 0;
    const stepInterval = 1400; // ms per hop
    
    // Highlight lines helper
    function clearHighlightLines() {
        document.querySelectorAll('.arch-svg-connections path').forEach(path => {
            path.classList.remove('active-glow');
        });
    }
    
    function runSimStep() {
        if (stepIndex >= flow.steps.length) {
            // Flow completed
            setTimeout(() => {
                packet.style.opacity = '0';
                document.querySelectorAll('.arch-block-card').forEach(c => c.classList.remove('active-glow'));
                clearHighlightLines();
                
                isRunningSim = false;
                runBtn.disabled = false;
                selectElements.forEach(s => s.disabled = false);
                progressContainer.classList.add('hidden');
                
                // Show completion toast
                if (activeFlowType === 'crm-sync') {
                    const tenant = document.getElementById('sim-tenant-select')?.value || 'Lead';
                    showToast('📡 SignalR Broadcast', `Cập nhật sơ đồ tầng thành công! Căn hộ U-104 đã khóa ở trạng thái: Negotiating.`, 'success');
                } else if (activeFlowType === 'batch-billing') {
                    showToast('💼 Hangfire Scheduler', `Batch Billing hoàn tất! Đã lập hóa đơn gửi email cho khách thuê.`, 'success');
                } else {
                    showToast('📊 BI Analytics Core', `Tính toán KPI Rent Roll hoàn tất! WAULT cập nhật thành 30.5 tháng.`, 'success');
                }
            }, 800);
            return;
        }
        
        const step = flow.steps[stepIndex];
        const blockEl = document.getElementById(step.node);
        
        if (blockEl) {
            // Glow active block card
            document.querySelectorAll('.arch-block-card').forEach(c => c.classList.remove('active-glow'));
            blockEl.classList.add('active-glow');
            
            // Glow active SVG connector path leading to this block
            clearHighlightLines();
            if (stepIndex > 0) {
                const prevNodeId = flow.steps[stepIndex - 1].node;
                // Find matching connector path
                const matchingPath = document.querySelector(`[source-id="${prevNodeId}"][dest-id="${step.node}"]`) || 
                                     findConnectorPathId(prevNodeId, step.node);
                if (matchingPath) {
                    matchingPath.classList.add('active-glow');
                }
            }
            
            // Move data packet
            const blockRect = blockEl.getBoundingClientRect();
            const posX = (blockRect.left + blockRect.width / 2) - wrapperRect.left;
            const posY = (blockRect.top + blockRect.height / 2) - wrapperRect.top;
            
            if (stepIndex === 0) {
                packet.style.transition = 'none';
                packet.style.left = `${posX}px`;
                packet.style.top = `${posY}px`;
                packet.style.opacity = '1';
            } else {
                packet.style.transition = 'all 0.9s cubic-bezier(0.25, 0.8, 0.25, 1)';
                packet.style.left = `${posX}px`;
                packet.style.top = `${posY}px`;
            }
            
            // Update Progress UI
            progressTitle.textContent = step.text;
            progressPct.textContent = `${step.pct}%`;
            progressFill.style.width = `${step.pct}%`;
        }
        
        stepIndex++;
        setTimeout(runSimStep, stepInterval);
    }
    
    // Start loop
    runSimStep();
}

// Find connecting path element ID mapping
function findConnectorPathId(src, dest) {
    if (src === 'node-client-ui' && dest === 'node-web-api') return document.getElementById('path-ui-to-api');
    if (src === 'node-web-api' && dest === 'node-stateless') return document.getElementById('path-api-to-stateless');
    if (src === 'node-stateless' && dest === 'node-efcore') return document.getElementById('path-stateless-to-ef');
    if (src === 'node-efcore' && dest === 'node-postgresql') return document.getElementById('path-ef-to-pg');
    
    if (src === 'node-hangfire' && dest === 'node-rent-engine') return document.getElementById('path-hangfire-to-rent');
    if (src === 'node-rent-engine' && dest === 'node-efcore') return document.getElementById('path-rent-to-ef');
    if (src === 'node-hangfire' && dest === 'node-hangfiredb') return document.getElementById('path-hangfire-to-hgb');
    
    if (src === 'node-web-api' && dest === 'node-bi-calc') return document.getElementById('path-api-to-bi');
    if (src === 'node-bi-calc' && dest === 'node-efcore') return document.getElementById('path-bi-to-ef');
    
    if (src === 'node-questpdf' && dest === 'node-email-client') return document.getElementById('path-questpdf-to-email');
    if (src === 'node-mailkit' && dest === 'node-mail-server') return document.getElementById('path-mailkit-to-smtp');
    if (src === 'node-iot-meters' && dest === 'node-web-api') return document.getElementById('path-iot-to-api');
    if (src === 'node-web-api' && dest === 'node-signalr') return document.getElementById('path-api-to-signalr');
    if (src === 'node-signalr' && dest === 'node-client-ui') return document.getElementById('path-signalr-to-ui');
    return null;
}

// SignalR Toast Notifications Mock
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'alert-triangle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i data-lucide="${icon}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${message}</div>
        </div>
        <button class="btn-toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    toast.querySelector('.btn-toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.parentNode.removeChild(toast), 300);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }
    }, 5500);
}
