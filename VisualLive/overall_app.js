// Completed System Architecture Hub Simulation Engine
const state = {
    selectedFlow: 'crm-sync',
    isRunningSim: false
};

// Flow Database with C# Code snippets and architectural route mapping
const flowDatabase = {
    'crm-sync': {
        name: 'CRM Transaction Sync Flow',
        color: 'orange',
        steps: [
            {
                node: 'node-client-ui',
                code: `// Client UI React Card Drag-Drop Handler
const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (destination.droppableId === 'Negotiation') {
        // Gửi lệnh PUT đổi trạng thái đàm phán lên Web API
        api.put(\`/api/leads/\${draggableId}/stage\`, { 
            stage: 'Negotiation' 
        });
    }
};`,
                desc: 'Client browser UI triggers lead state update action.'
            },
            {
                node: 'node-web-api',
                code: `// Presentation Web API Layer - Controller Endpoint
[HttpPut("{id}/stage")]
public async Task<IActionResult> UpdateLeadStage(Guid id, [FromBody] UpdateStageDto dto) 
{
    // Tạo Command và gửi qua MediatR đi vào Core Domain layer
    var command = new UpdateLeadStageCommand(id, dto.Stage);
    var result = await _mediator.Send(command);
    return Ok(result);
}`,
                desc: 'Web API Controller receives PUT request and dispatches MediatR Command.'
            },
            {
                node: 'node-stateless',
                code: `// Core Domain Layer - C# Stateless State Machine Configuration
public class LeadWorkflow
{
    private readonly StateMachine<LeadState, LeadTrigger> _machine;
    
    public LeadWorkflow(LeadState initialState) {
        _machine = new StateMachine<LeadState, LeadTrigger>(initialState);
        
        // Cấu hình ràng buộc chuyển đổi trạng thái chặt chẽ
        _machine.Configure(LeadState.Prospect)
            .Permit(LeadTrigger.StartNegotiation, LeadState.Negotiation);
            
        _machine.OnTransitioned(t => {
            // Khi đàm phán bắt đầu, kích hoạt Service khóa căn hộ tương ứng
            if (t.Destination == LeadState.Negotiation) {
                _unitDomainService.LockUnitForNegotiation(lead.TargetUnitId);
            }
        });
    }
}`,
                desc: 'Core Domain layer uses C# Stateless library to validate and execute transition triggers.'
            },
            {
                node: 'node-efcore',
                code: `// Infrastructure Data Layer - Entity Framework Core DbContext
public async Task LockUnitForNegotiation(Guid unitId)
{
    // Nạp thực thể Unit từ database, cập nhật trạng thái
    var unit = await _context.Units.FirstOrDefaultAsync(u => u.Id == unitId);
    if (unit != null) {
        unit.Status = UnitStatus.Negotiating;
        
        // EF Core tự động sinh câu lệnh SQL UPDATE khi SaveChangesAsync
        await _context.SaveChangesAsync();
    }
}`,
                desc: 'DbContext queries PostgreSQL database and maps unit entity changes.'
            },
            {
                node: 'node-postgresql',
                code: `-- Database Storage - PostgreSQL Transaction Commits
START TRANSACTION;
UPDATE units 
SET status = 'negotiating', 
    updated_at = NOW() 
WHERE id = '9a8b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4';
COMMIT;`,
                desc: 'PostgreSQL Database locks the selected Unit status inside atomic ACID transaction.'
            },
            {
                node: 'node-web-api',
                code: `// Presentation Layer - Controller responds and triggers Real-time broadcast
public async Task<IActionResult> HandleUpdateResult(UpdateLeadStageResult result)
{
    // Sau khi ghi DB thành công, gọi SignalR để đồng bộ giao diện toàn bộ nhân viên
    await _signalrHub.Clients.All.SendAsync("ReceiveSpaceStatusUpdate", new {
        UnitId = result.UnitId,
        Status = "Negotiating"
    });
    return Ok(new { success = true });
}`,
                desc: 'Web API Controller validates database persistence and triggers SignalR Socket broadcasts.'
            },
            {
                node: 'node-signalr',
                code: `// Presentation WebSockets - SignalR Hub Connection
public class FloorPlanHub : Hub
{
    // SignalR duy trì kết nối WebSocket liên tục giữa server và client
    public async Task BroadcastStatusUpdate(Guid unitId, string status)
    {
        await Clients.All.SendAsync("ReceiveSpaceStatusUpdate", new {
            UnitId = unitId,
            Status = status
        });
    }
}`,
                desc: 'SignalR Hub pushes a real-time status update to all connected WebSocket clients.'
            },
            {
                node: 'node-client-ui',
                code: `// Client UI React - WebSocket event listener
connection.on("ReceiveSpaceStatusUpdate", (update) => {
    // UI cập nhật màu căn hộ thành Vàng hổ phách (Negotiating) ngay lập tức
    updateFloorPlanState(update.UnitId, update.Status);
    showToastNotification("📡 Căn hộ " + update.UnitId + " đã chuyển sang đàm phán!");
});`,
                desc: 'Client UI catches WebSocket message, redrawing Floor Plan cell colors instantly.'
            }
        ]
    },
    'batch-billing': {
        name: 'Monthly Billing Batch Flow',
        color: 'indigo',
        steps: [
            {
                node: 'node-hangfire',
                code: `// Infrastructure background tasks - Hangfire Recurring Job Setup
public class BillingScheduler
{
    public void ConfigureJobs()
    {
        // Đăng ký job tự động quét xuất hóa đơn vào 00:00 ngày 25 hàng tháng
        RecurringJob.AddOrUpdate<MonthlyBillingJob>(
            "monthly-invoicing-batch-job",
            job => job.ExecuteMonthlyBillingAsync(null),
            "0 0 25 * *" // Cron Expression
        );
    }
}`,
                desc: 'Hangfire Server fires the recurring background invoicing thread at 00:00 on Day 25.'
            },
            {
                node: 'node-efcore',
                code: `// Infrastructure Data Access - EF Core LINQ Lease scanner
public async Task<List<Contract>> GetActiveContractsAsync()
{
    // Sử dụng LINQ nạp dữ liệu liên kết Hợp đồng + Lịch giá lũy tiến
    return await _context.Contracts
        .Include(c => c.RentTerms)
        .Where(c => c.Status == ContractStatus.Active)
        .ToListAsync();
}`,
                desc: 'EF Core DbContext reads active contracts and escalation schedules.'
            },
            {
                node: 'node-postgresql',
                code: `-- Database Storage - PostgreSQL SELECT execution
SELECT c.*, t.* 
FROM contracts c 
LEFT JOIN contract_rent_terms t ON c.id = t.contract_id 
WHERE c.status = 'active';`,
                desc: 'PostgreSQL returns compiled contracts, target base rents, and escalations.'
            },
            {
                node: 'node-iot-meters',
                code: `// External Peripherals - IoT Sub-meter reading query API
[HttpGet("meters/{unitCode}/consumption")]
public async Task<ActionResult<MeterReadingDto>> GetUsage(string unitCode, string month)
{
    // Gọi API của hệ thống đồng hồ thông minh để lấy chỉ số điện nước tiêu thụ
    var reading = await _iotGateway.GetReadingAsync(unitCode, month);
    return Ok(new MeterReadingDto {
        KwhUsage = reading.KwhDelta,
        WaterUsage = reading.M3Delta
    });
}`,
                desc: 'Infrastructure fetches sub-meter water and electricity readings via external IoT gateway.'
            },
            {
                node: 'node-rent-engine',
                code: `// Core Domain Layer - Rent Engine escalation rentroll logic
public decimal CalculateBillingAmount(Contract contract, int currentMonthNum, decimal utilityCharge)
{
    decimal baseRent = 0;
    
    if (currentMonthNum <= contract.FreeMonths) {
        baseRent = 0; // Áp dụng chính sách khuyến mãi miễn phí tiền thuê thi công
    } else {
        // Tính lũy tiến tăng giá trị hợp đồng theo năm
        int currentYear = (int)Math.Ceiling(currentMonthNum / 12.0);
        baseRent = contract.BaseRent * (decimal)Math.Pow(1 + (contract.EscalationPct / 100.0), currentYear - 1);
    }
    
    // Tổng tiền = Tiền thuê gốc lũy tiến + Phí dịch vụ cố định + Phí điện nước IoT
    return baseRent + contract.ServiceCharge + utilityCharge;
}`,
                desc: 'Core Rent Engine computes final billing amount factoring in free rent and compounded index escalations.'
            },
            {
                node: 'node-questpdf',
                code: `// Infrastructure Document Generation - QuestPDF Layout Compilation
public void ComposeInvoicePdf(string filePath, InvoiceModel model)
{
    // QuestPDF thiết kế bố cục in ấn hóa đơn dạng Fluent API kết xuất PDF
    Document.Create(container => {
        container.Page(page => {
            page.Header().Element(header => ComposeHeader(header, model));
            page.Content().Element(content => ComposeTable(content, model));
            page.Footer().Element(footer => ComposePaymentQR(footer, model.VietQrPayload));
        });
    }).GeneratePdf(filePath);
}`,
                desc: 'QuestPDF library compiles invoice layout, embedding a dynamic payment VietQR vector.'
            },
            {
                node: 'node-mailkit',
                code: `// Infrastructure Service - MailKit SMTP Client dispatcher
public async Task SendInvoiceEmailAsync(string clientEmail, string pdfAttachmentPath)
{
    var message = new MimeMessage();
    message.From.Add(new MailboxAddress("Commercial PMS", "billing@pms.corp"));
    message.To.Add(new MailboxAddress("Client Finance", clientEmail));
    
    var builder = new BodyBuilder { TextBody = "Dear Tenant, please find attached your monthly invoice." };
    builder.Attachments.Add(pdfAttachmentPath); // Đính kèm file PDF hóa đơn QuestPDF vừa xuất
    message.Body = builder.ToMessageBody();

    using var client = new MailKit.Net.Smtp.SmtpClient();
    await client.ConnectAsync("smtp.office365.com", 587, SecureSocketOptions.StartTls);
    await client.SendAsync(message);
}`,
                desc: 'MailKit client wraps PDF attachment, opening a secure SMTP pipeline.'
            },
            {
                node: 'node-mail-server',
                code: `// SMTP Server Transfer Protocol logs
220 smtp.office365.com ESMTP Postfix
EHLO mail.pms.corp
250-STARTTLS
MAIL FROM:<billing@pms.corp>
250 Ok
RCPT TO:<finance@nike.com>
250 Ok
DATA
354 End data with <CR><LF>.<CR><LF>
.
250 Message accepted for delivery`,
                desc: 'External SMTP mail server dispatches packets to client mail exchange.'
            },
            {
                node: 'node-email-client',
                code: `// Client Inbox Mail reader
// Client IMAP listener checks inbox
var inbox = imapClient.Inbox;
inbox.Open(FolderAccess.ReadOnly);
var newMail = inbox.GetMessage(inbox.Count - 1);
Console.WriteLine($"[Email] Hóa đơn tháng mới đã được gửi tới Nike Store!");`,
                desc: 'Tenant receives invoice directly in email client inbox.'
            }
        ]
    },
    'bi-kpi': {
        name: 'BI KPI Dashboard Computation',
        color: 'emerald',
        steps: [
            {
                node: 'node-postgresql',
                code: `-- Database Event - PostgreSQL updates lease database values
INSERT INTO contracts (id, tenant_name, base_rent, status, signed_at) 
VALUES ('L-002-id', 'Nike Store', 2125, 'active', NOW());`,
                desc: 'PostgreSQL commits database additions (new signed leases).'
            },
            {
                node: 'node-efcore',
                code: `// Infrastructure Data Access - EF Core LINQ BI data fetch
public async Task<List<LeaseBiModel>> GetActiveLeasesSummaryAsync()
{
    // LINQ truy vấn nạp dữ liệu tối giản phục vụ việc tính toán BI
    return await _context.Contracts
        .Where(c => c.Status == ContractStatus.Active)
        .Select(c => new LeaseBiModel {
            BaseRent = c.BaseRent,
            DurationYears = c.DurationYears,
            SignedAt = c.SignedAt
        })
        .ToListAsync();
}`,
                desc: 'EF Core runs LINQ queries compiling lease financial parameters.'
            },
            {
                node: 'node-bi-calc',
                code: `// Core Domain Layer - BI WAULT Calculation logic
public decimal CalculateWault(List<LeaseBiModel> leases)
{
    // Công thức tính WAULT: Sum(BaseRent * UnexpiredMonths) / Sum(BaseRent)
    decimal totalRentWeight = leases.Sum(l => l.BaseRent);
    decimal weightedMonthsSum = leases.Sum(l => {
        int totalLeaseMonths = l.DurationYears * 12;
        int elapsedMonths = GetElapsedMonths(l.SignedAt);
        int unexpiredMonths = Math.Max(0, totalLeaseMonths - elapsedMonths);
        return l.BaseRent * unexpiredMonths;
    });

    return totalRentWeight > 0 ? (weightedMonthsSum / totalRentWeight) : 0;
}`,
                desc: 'Core BI Analytics computes WAULT and Occupancy Rate values using unexpired metrics.'
            },
            {
                node: 'node-web-api',
                code: `// Presentation Web API Layer - Controller publishes clean JSON data
[HttpGet("dashboard/metrics")]
public async Task<ActionResult<DashboardKpisDto>> GetDashboardKpiMetrics()
{
    var leases = await _biService.GetActiveLeasesSummaryAsync();
    var wault = _biService.CalculateWault(leases);
    var occupancy = _biService.CalculateOccupancyRate(leases);
    
    return Ok(new DashboardKpisDto {
        WaultMonths = wault,
        OccupancyRate = occupancy
    });
}`,
                desc: 'Web API compiles KPI metrics JSON and sends HTTP response to client.'
            },
            {
                node: 'node-client-ui',
                code: `// Client UI React - Chart.js dynamic redraw handler
const refreshDashboardKPIs = (kpis) => {
    // Redraw lines graph on Chart.js canvas instance
    rentRollChart.data.datasets[0].data = kpis.projectedCashflow;
    rentRollChart.update();
    
    // Update KPI widgets text content
    document.getElementById("kpi-wault-widget").textContent = kpis.waultMonths.toFixed(1) + " mo";
};`,
                desc: 'Client UI Chart.js redraws the 12-month projections cashflow graph.'
            }
        ]
    },
    'guarantee-alarm': {
        name: 'Bank Guarantee Expiry Check Flow',
        color: 'red',
        steps: [
            {
                node: 'node-hangfire',
                code: `// Infrastructure background jobs - Hangfire Daily check setup
public class BankGuaranteeAlarmScheduler
{
    public void ScheduleGuaranteeExpiryCheck()
    {
        // Chạy ngầm quét hạn thư bảo lãnh ngân hàng vào 01:00 AM mỗi ngày
        RecurringJob.AddOrUpdate<GuaranteeExpiryCheckJob>(
            "daily-guarantee-expiry-check",
            job => job.CheckExpiryDatesAsync(null),
            Cron.Daily
        );
    }
}`,
                desc: 'Hangfire background task server triggers Daily Alarm checker job.'
            },
            {
                node: 'node-efcore',
                code: `// Infrastructure Data Access - EF Core select guarantee records
public async Task<List<Deposit>> GetExpiringGuaranteesAsync()
{
    // Tìm các bảo lãnh ngân hàng sắp hết hạn trong vòng 60 ngày tới
    var warningDateThreshold = DateTime.UtcNow.AddDays(60);
    return await _context.Deposits
        .Where(d => d.Status == DepositStatus.Secured 
            && d.GuaranteeExpiryDate <= warningDateThreshold)
        .ToListAsync();
}`,
                desc: 'DbContext maps LINQ query checks to verify Deposit/Guarantee expiry dates.'
            },
            {
                node: 'node-postgresql',
                code: `-- Database Storage - PostgreSQL check expiry dates SELECT
SELECT * 
FROM deposits 
WHERE status = 'secured' 
  AND guarantee_expiry <= NOW() + INTERVAL '60 days';`,
                desc: 'PostgreSQL returns list of expiring bank guarantees.'
            },
            {
                node: 'node-web-api',
                code: `// Presentation Web API Layer - Controller publishes alert message
public async Task HandleExpiryWarnings(List<Deposit> expiringList)
{
    foreach (var guarantee in expiringList) {
        // Gửi thông báo WebSocket tới Web UI của Admin
        await _hubContext.Clients.All.SendAsync("ReceiveGuaranteeAlert", new {
            Tenant = guarantee.TenantName,
            DaysLeft = (guarantee.GuaranteeExpiryDate - DateTime.UtcNow).Days
        });
    }
}`,
                desc: 'Web API Controller catches alerts, pushing WebSocket alarms to Web UI client.'
            },
            {
                node: 'node-client-ui',
                code: `// Client UI React - WebSocket event listener
connection.on("ReceiveGuaranteeAlert", (alert) => {
    // Show warning banner alert to Administrator
    showDangerToast(
        "⚠️ BẢO LÃNH SẮP HẾT HẠN", 
        \`Thư bảo lãnh của khách \${alert.Tenant} sẽ hết hạn trong \${alert.DaysLeft} ngày!\`
    );
});`,
                desc: 'Client UI receives WebSocket warnings, flashing danger toast alert.'
            }
        ]
    },
    'broker-commission': {
        name: 'Broker Commission Payout Flow',
        color: 'amber',
        steps: [
            {
                node: 'node-web-api',
                code: `// Presentation Web API - Hook on lease contract creation success
public async Task<IActionResult> SignLeaseContract(CreateContractDto dto)
{
    var contract = await _leaseService.SignNewLeaseAsync(dto);
    
    // Phát Event MediatR để tính toán hoa hồng môi giới
    await _mediator.Publish(new ContractSignedEvent(contract.Id));
    return Ok(contract);
}`,
                desc: 'Web API receives signed lease details, triggering Contract Signed Events.'
            },
            {
                node: 'node-bi-calc',
                code: `// Core Domain Layer - Brokerage payout split calculations
public BrokerageLedger CalculateCommissionSplits(Contract contract)
{
    // Công thức tính hoa hồng: Doanh thu năm 1 * Tỷ lệ hoa hồng môi giới
    decimal totalCommission = contract.Year1RentTotal * (contract.BrokerPct / 100.0m);
    
    // Chia làm 2 đợt thanh toán: 50% khi đóng cọc, 50% khi shop khai trương
    decimal stage1Amount = totalCommission * 0.50m;
    decimal stage2Amount = totalCommission * 0.50m;
    
    return new BrokerageLedger(contract.Id, totalCommission, stage1Amount, stage2Amount);
}`,
                desc: 'Core Business logic schedules commission ledgers split into two 50% payouts.'
            },
            {
                node: 'node-efcore',
                code: `// Infrastructure Data Layer - EF Core save ledger record
public async Task SaveCommissionLedger(BrokerageLedger ledger)
{
    // Thêm bản ghi phân rã hoa hồng vào DB DbContext
    _context.BrokerageLedgers.Add(ledger);
    await _context.SaveChangesAsync();
}`,
                desc: 'EF Core DbContext maps BrokerageLedger insertion queries.'
            },
            {
                node: 'node-postgresql',
                code: `-- Database Storage - PostgreSQL INSERT ledger statement
INSERT INTO brokerage_ledgers 
  (id, contract_id, total_commission, stage_1, stage_2, status) 
VALUES 
  ('ledger-id-uuid', 'contract-id-uuid', 10886.00, 5443.00, 5443.00, 'Stage 1 Pending');`,
                desc: 'PostgreSQL commits commission ledger payouts records.'
            },
            {
                node: 'node-web-api',
                code: `// Presentation Web API - Payout ledger endpoint fetch
[HttpGet("commissions")]
public async Task<ActionResult<List<CommissionDto>>> GetLedger()
{
    // Trả về dữ liệu để hiển thị bảng hoa hồng cho kế toán đối soát
    var list = await _context.BrokerageLedgers.ProjectTo<CommissionDto>().ToListAsync();
    return Ok(list);
}`,
                desc: 'Web API Controller queries DB, serving ledger tables content.'
            },
            {
                node: 'node-client-ui',
                code: `// Client UI React - Render Brokerage ledger table rows
const renderLedgerRows = (rows) => {
    // Render rows with detailed status tag
    const html = rows.map(r => \`
        <tr>
            <td>\${r.broker}</td>
            <td>$ \${r.totalCommission}</td>
            <td><span class="tag">\${r.status}</span></td>
        </tr>
    \`).join('');
    document.getElementById("commission-table-body").innerHTML = html;
};`,
                desc: 'Client UI displays the multi-stage brokerage ledger table.'
            }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initFlowSelection();
    
    // Initial draw
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

// Flow Selector Cards click triggers
function initFlowSelection() {
    const flowCards = document.querySelectorAll('.flow-card');
    const triggerBtn = document.getElementById('btn-trigger-flow');
    
    flowCards.forEach(card => {
        card.addEventListener('click', () => {
            if (state.isRunningSim) return; // Prevent flow selection during running simulation
            
            flowCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const flowId = card.getAttribute('data-flow');
            state.selectedFlow = flowId;
            
            resetDiagramGlows();
        });
    });
    
    triggerBtn.addEventListener('click', () => {
        runOverallSimulation();
    });
    
    resetDiagramGlows();
}

function resetDiagramGlows() {
    // Clear glowing cards & lines
    document.querySelectorAll('.block-card').forEach(c => {
        c.classList.remove('active-glow');
        c.removeAttribute('data-glow-color');
    });
    
    document.querySelectorAll('.svg-connections path').forEach(path => {
        path.classList.remove('active-glow', 'path-orange', 'path-indigo', 'path-emerald', 'path-red', 'path-amber');
    });
    
    // Hide data packet
    const packet = document.getElementById('overall-data-packet');
    packet.style.opacity = '0';
    
    // Reset Terminal screen
    const terminal = document.getElementById('code-terminal-display');
    terminal.innerHTML = `
        <div class="code-line system">// Chọn một luồng hoạt động phía trên và nhấn "Play Flow Simulation" để theo dõi mã nguồn C# thực thi ở backend.</div>
    `;
}

// Draw Orthogonal Connections (UML/System connection style)
function drawSVGConnections() {
    const svg = document.getElementById('overall-svg-connections');
    if (!svg) return;
    
    const wrapperRect = document.getElementById('diagram-container').getBoundingClientRect();
    
    function getConnectorCoords(srcId, destId) {
        const srcEl = document.getElementById(srcId);
        const destEl = document.getElementById(destId);
        if (!srcEl || !destEl) return null;
        
        const srcRect = srcEl.getBoundingClientRect();
        const destRect = destEl.getBoundingClientRect();
        
        const x1 = (srcRect.left + srcRect.width / 2) - wrapperRect.left;
        const y1 = (srcRect.top + srcRect.height / 2) - wrapperRect.top;
        
        const x2 = (destRect.left + destRect.width / 2) - wrapperRect.left;
        const y2 = (destRect.top + destRect.height / 2) - wrapperRect.top;
        
        return { x1, y1, x2, y2 };
    }
    
    function setLinePath(pathId, srcId, destId, orientation = 'horizontal') {
        const path = document.getElementById(pathId);
        if (!path) return;
        
        const pts = getConnectorCoords(srcId, destId);
        if (!pts) {
            path.setAttribute('d', '');
            path.classList.remove('active-glow');
            return;
        }
        
        const { x1, y1, x2, y2 } = pts;
        let d = '';
        
        if (orientation === 'horizontal') {
            const x_mid = x1 + (x2 - x1) * 0.45;
            d = `M ${x1} ${y1} L ${x_mid} ${y1} L ${x_mid} ${y2} L ${x2} ${y2}`;
        } else {
            const y_mid = y1 + (y2 - y1) * 0.5;
            d = `M ${x1} ${y1} L ${x1} ${y_mid} L ${x2} ${y_mid} L ${x2} ${y2}`;
        }
        
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#242f41'); // Static line color
    }
    
    // Draw paths
    setLinePath('p-ui-api', 'node-client-ui', 'node-web-api');
    setLinePath('p-api-stateless', 'node-web-api', 'node-stateless');
    setLinePath('p-stateless-ef', 'node-stateless', 'node-efcore');
    setLinePath('p-ef-pg', 'node-efcore', 'node-postgresql');
    
    setLinePath('p-api-signalr', 'node-web-api', 'node-signalr');
    setLinePath('p-signalr-ui', 'node-signalr', 'node-client-ui');
    
    setLinePath('p-hangfire-rent', 'node-hangfire', 'node-rent-engine');
    setLinePath('p-rent-ef', 'node-rent-engine', 'node-efcore');
    setLinePath('p-hangfire-hgb', 'node-hangfire', 'node-hangfiredb');
    setLinePath('p-questpdf-ui', 'node-questpdf', 'node-email-client');
    setLinePath('p-mailkit-smtp', 'node-mailkit', 'node-mail-server');
    
    setLinePath('p-api-bi', 'node-web-api', 'node-bi-calc');
    setLinePath('p-bi-ef', 'node-bi-calc', 'node-efcore');
    
    setLinePath('p-iot-api', 'node-iot-meters', 'node-web-api');
    setLinePath('p-hangfire-ef', 'node-hangfire', 'node-efcore');
}

// C# Code Syntax Highlighting Parser Helper
function highlightCSharpSyntax(code) {
    if (!code) return '';
    
    let html = code;
    
    // Escape HTML symbols first
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // 1. Comments: // ...
    html = html.replace(/(\/\/.*)/g, '<span class="code-line comment">$1</span>');
    
    // 2. Keywords: public, class, async, Task, await, return, new, var, using, int, Guid, decimal, Guid, guid
    const keywords = ['public', 'class', 'async', 'await', 'return', 'new', 'var', 'using', 'private', 'readonly', 'Guid', 'decimal', 'int', 'Guid', 'guid', 'foreach', 'if', 'null', 'string', 'void'];
    keywords.forEach(keyword => {
        const regex = new RegExp('\\b' + keyword + '\\b', 'g');
        html = html.replace(regex, `<span class="code-line keyword">${keyword}</span>`);
    });
    
    // 3. Types/Classes (words starting with capital letters, after new or inside angle brackets)
    const types = ['Task', 'IActionResult', 'LeadState', 'LeadTrigger', 'UpdateStageDto', 'UpdateLeadStageCommand', 'LeadWorkflow', 'StateMachine', 'DbContext', 'Units', 'RentCalculationService', 'Document', 'MimeMessage', 'BodyBuilder', 'SmtpClient', 'BrokerageLedger', 'Contract', 'KpiDashboardDto', 'Deposit', 'BankGuaranteeExpiringEvent', 'UpdateLeadStageResult'];
    types.forEach(type => {
        const regex = new RegExp('\\b' + type + '\\b', 'g');
        html = html.replace(regex, `<span class="code-line type">${type}</span>`);
    });

    // 4. Strings: "..." or `...`
    html = html.replace(/("[^"]*")/g, '<span class="code-line string">$1</span>');
    html = html.replace(/(`[^`]*`)/g, '<span class="code-line string">$1</span>');
    
    return html;
}

// Sequence simulation runner for completed architecture view
function runOverallSimulation() {
    if (state.isRunningSim) return;
    
    const flow = flowDatabase[state.selectedFlow];
    if (!flow) return;
    
    state.isRunningSim = true;
    const playBtn = document.getElementById('btn-trigger-flow');
    const flowCards = document.querySelectorAll('.flow-card');
    
    playBtn.disabled = true;
    playBtn.querySelector('span').textContent = 'Simulation Running...';
    
    resetDiagramGlows();
    
    const terminal = document.getElementById('code-terminal-display');
    terminal.innerHTML = ''; // Clear logs
    
    const packet = document.getElementById('overall-data-packet');
    const diagramContainer = document.getElementById('diagram-container');
    const wrapperRect = diagramContainer.getBoundingClientRect();
    
    // Set packet class color
    packet.className = 'data-packet';
    packet.classList.add(`${flow.color}-packet`);
    
    let currentIdx = 0;
    const hopDuration = 1800; // ms per block hop
    
    function animateHop() {
        if (currentIdx >= flow.steps.length) {
            // Flow finished
            setTimeout(() => {
                packet.style.opacity = '0';
                document.querySelectorAll('.block-card').forEach(b => b.classList.remove('active-glow'));
                document.querySelectorAll('.svg-connections path').forEach(p => p.classList.remove('active-glow'));
                
                state.isRunningSim = false;
                playBtn.disabled = false;
                playBtn.querySelector('span').textContent = 'Play Flow Simulation';
                
                showToast('🔍 Execution Trace Complete', `Successfully simulated data travel and C# backend execution for: ${flow.name}.`, 'success');
            }, 800);
            return;
        }
        
        const step = flow.steps[currentIdx];
        const blockNode = document.getElementById(step.node);
        
        if (blockNode) {
            // 1. Light up target block
            document.querySelectorAll('.block-card').forEach(b => b.classList.remove('active-glow'));
            blockNode.classList.add('active-glow');
            blockNode.setAttribute('data-glow-color', flow.color);
            
            // 2. Light up active connection line
            if (currentIdx > 0) {
                const prevNodeId = flow.steps[currentIdx - 1].node;
                const pathEl = findPathElement(prevNodeId, step.node);
                
                document.querySelectorAll('.svg-connections path').forEach(p => p.classList.remove('active-glow'));
                if (pathEl) {
                    pathEl.classList.add('active-glow', `path-${flow.color}`);
                }
            }
            
            // 3. Move data packet neon particle
            const blockRect = blockNode.getBoundingClientRect();
            const posX = (blockRect.left + blockRect.width / 2) - wrapperRect.left;
            const posY = (blockRect.top + blockRect.height / 2) - wrapperRect.top;
            
            if (currentIdx === 0) {
                packet.style.transition = 'none';
                packet.style.left = `${posX}px`;
                packet.style.top = `${posY}px`;
                packet.style.opacity = '1';
            } else {
                packet.style.transition = 'all 1.0s cubic-bezier(0.25, 0.8, 0.25, 1)';
                packet.style.left = `${posX}px`;
                packet.style.top = `${posY}px`;
            }
            
            // 4. Inject syntax-highlighted C# code into terminal
            const stepTitleLine = document.createElement('div');
            stepTitleLine.className = 'code-line comment';
            stepTitleLine.textContent = `// STEP ${currentIdx + 1}: ${step.desc}`;
            terminal.appendChild(stepTitleLine);
            
            const codeBlock = document.createElement('div');
            codeBlock.style.margin = '0.25rem 0 0.75rem 0';
            codeBlock.innerHTML = highlightCSharpSyntax(step.code);
            terminal.appendChild(codeBlock);
            
            // Scroll terminal to end
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        currentIdx++;
        setTimeout(animateHop, hopDuration);
    }
    
    // Run loop
    animateHop();
}

// Find path connector element mapping helper
function findPathElement(src, dest) {
    if (src === 'node-client-ui' && dest === 'node-web-api') return document.getElementById('p-ui-api');
    if (src === 'node-web-api' && dest === 'node-stateless') return document.getElementById('p-api-stateless');
    if (src === 'node-stateless' && dest === 'node-efcore') return document.getElementById('p-stateless-ef');
    if (src === 'node-efcore' && dest === 'node-postgresql') return document.getElementById('p-ef-pg');
    
    if (src === 'node-web-api' && dest === 'node-signalr') return document.getElementById('p-api-signalr');
    if (src === 'node-signalr' && dest === 'node-client-ui') return document.getElementById('p-signalr-ui');
    
    if (src === 'node-hangfire' && dest === 'node-rent-engine') return document.getElementById('p-hangfire-rent');
    if (src === 'node-rent-engine' && dest === 'node-efcore') return document.getElementById('p-rent-ef');
    if (src === 'node-hangfire' && dest === 'node-hangfiredb') return document.getElementById('p-hangfire-hgb');
    if (src === 'node-questpdf' && dest === 'node-email-client') return document.getElementById('p-questpdf-ui');
    if (src === 'node-mailkit' && dest === 'node-mail-server') return document.getElementById('p-mailkit-smtp');
    
    if (src === 'node-web-api' && dest === 'node-bi-calc') return document.getElementById('p-api-bi');
    if (src === 'node-bi-calc' && dest === 'node-efcore') return document.getElementById('p-bi-ef');
    
    if (src === 'node-iot-meters' && dest === 'node-web-api') return document.getElementById('p-iot-api');
    if (src === 'node-hangfire' && dest === 'node-efcore') return document.getElementById('p-hangfire-ef');
    return null;
}

// Toast messaging popup
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
