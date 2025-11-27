// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Utility Functions
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Load data for the tab
    if (tabName === 'matrix') {
        loadRiskMatrix();
    } else if (tabName === 'assessments') {
        loadAssessments();
    } else if (tabName === 'statistics') {
        loadStatistics();
    } else if (tabName === 'create') {
        loadRiskAreas();
    }
}

function getRiskClass(riskLevel) {
    const classes = {
        1: 'risk-low',
        2: 'risk-medium',
        3: 'risk-quite-high',
        4: 'risk-high'
    };
    return classes[riskLevel] || '';
}

function getRiskLabel(riskLevel) {
    const labels = {
        1: 'ต่ำ (Low)',
        2: 'ปานกลาง (Medium)',
        3: 'ค่อนข้างสูง (Quite High)',
        4: 'สูง (High)'
    };
    return labels[riskLevel] || '';
}

function getQRMClass(qrmLevel) {
    const classes = {
        1: 'qrm-weak',
        2: 'qrm-somewhat-weak',
        3: 'qrm-fair',
        4: 'qrm-good',
        5: 'qrm-excellent'
    };
    return classes[qrmLevel] || '';
}

function getQRMLabel(qrmLevel) {
    const labels = {
        1: 'อ่อน (Weak)',
        2: 'ค่อนข้างอ่อน (Somewhat Weak)',
        3: 'พอใช้ (Fair)',
        4: 'ค่อนข้างดี (Good)',
        5: 'ดี (Excellent)'
    };
    return labels[qrmLevel] || '';
}

// Load Risk Matrix
async function loadRiskMatrix() {
    try {
        const response = await fetch(`${API_BASE_URL}/risk-assessments/matrix`);
        const result = await response.json();

        if (result.success) {
            renderRiskMatrix(result.data);
        } else {
            document.getElementById('risk-matrix-container').innerHTML =
                `<div class="error">Error loading risk matrix</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('risk-matrix-container').innerHTML =
            `<div class="error">Error loading risk matrix: ${error.message}</div>`;
    }
}

function renderRiskMatrix(data) {
    const likelihoodLabels = ['รุนแรงที่สุด<br>(Very High)<br>>20%',
                              'ค่อนข้างสูง<br>(High)<br>10-20%',
                              'ปานกลาง<br>(Medium)<br>5-10%',
                              'น้อย<br>(Low)<br>2-5%',
                              'น้อยมาก<br>(Very Low)<br>≤2%'];
    const impactLabels = ['น้อยมาก<br>(Very Low)',
                          'น้อย<br>(Low)',
                          'ปานกลาง<br>(Medium)',
                          'ค่อนข้างสูง<br>(High)',
                          'สูงมาก<br>(Very High)'];

    let html = '<table class="matrix-table">';

    // Header row
    html += '<tr><th>Likelihood ↓<br>Impact →</th>';
    for (let i = 0; i < 5; i++) {
        html += `<th>${impactLabels[i]}</th>`;
    }
    html += '</tr>';

    // Data rows
    data.matrix.forEach((row, idx) => {
        html += '<tr>';
        html += `<th>${likelihoodLabels[idx]}</th>`;
        row.forEach(cell => {
            const riskClass = getRiskClass(cell.inherentRisk);
            const riskLabel = getRiskLabel(cell.inherentRisk);
            html += `<td class="${riskClass}" title="Inherent Risk: ${riskLabel}">
                        <strong>${riskLabel}</strong><br>
                        <small>L:${cell.likelihood} × I:${cell.impact}</small>
                     </td>`;
        });
        html += '</tr>';
    });

    html += '</table>';
    document.getElementById('risk-matrix-container').innerHTML = html;
}

// Load Assessments
async function loadAssessments() {
    try {
        const response = await fetch(`${API_BASE_URL}/risk-assessments`);
        const result = await response.json();

        if (result.success) {
            renderAssessments(result.data);
        } else {
            document.getElementById('assessments-list').innerHTML =
                `<div class="error">Error loading assessments</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('assessments-list').innerHTML =
            `<div class="error">Error loading assessments: ${error.message}</div>`;
    }
}

function renderAssessments(assessments) {
    if (assessments.length === 0) {
        document.getElementById('assessments-list').innerHTML =
            '<p>No assessments found. Create your first assessment!</p>';
        return;
    }

    let html = '';
    assessments.forEach(assessment => {
        const riskArea = assessment.riskArea || {};
        const regulationGroup = riskArea.regulationGroup || {};

        // Build risk indicators text
        const riskIndicators = [];
        if (assessment.hasIncompleteActionPlanForNewRegulation) {
            riskIndicators.push('ยังมี action plan สำหรับกฎเกณฑ์ออกใหม่/เปลี่ยนแปลงที่ยังดำเนินการไม่ครบถ้วน');
        }
        if (assessment.hasIncompleteCorrectiveActionPlan) {
            riskIndicators.push('ยังมี Action plan สำหรับประเด็น Non-compliance ที่พบที่ยังดำเนินการไม่แล้วเสร็จ');
        }
        if (assessment.hasNewOrComplexRegulation) {
            riskIndicators.push('มีกฎเกณฑ์ที่เพิ่งออกใหม่ หรือมีความซับซ้อน');
        }
        if (assessment.riskDescriptionOther) {
            riskIndicators.push(`อื่นๆ: ${assessment.riskDescriptionOther}`);
        }

        html += `
            <div class="assessment-item">
                <h4>${riskArea.nameTh || 'N/A'} (${riskArea.nameEn || 'N/A'})</h4>
                <p><strong>Regulation Group:</strong> ${regulationGroup.nameTh || 'N/A'}</p>
                <p><strong>Period:</strong> ${assessment.assessmentPeriod}</p>
                <p><strong>Likelihood:</strong> ${assessment.likelihoodLevel}/5 |
                   <strong>Impact:</strong> ${assessment.impactLevel}/5</p>
                <p><strong>Inherent Risk:</strong> <span class="${getRiskClass(assessment.inherentRisk)}" style="padding: 5px 10px; border-radius: 3px;">${getRiskLabel(assessment.inherentRisk)}</span></p>
                <p><strong>QRM Level:</strong> <span class="${getQRMClass(assessment.qrmLevel)}" style="padding: 5px 10px; border-radius: 3px;">${getQRMLabel(assessment.qrmLevel)}</span></p>
                <p><strong>Net Risk:</strong> <span class="${getRiskClass(assessment.netRisk)}" style="padding: 5px 10px; border-radius: 3px;">${getRiskLabel(assessment.netRisk)}</span></p>
                ${riskIndicators.length > 0 ? `
                    <p><strong>Risk Indicators:</strong></p>
                    <ul style="margin-left: 20px; color: #666;">
                        ${riskIndicators.map(indicator => `<li>${indicator}</li>`).join('')}
                    </ul>
                ` : ''}
                <p><strong>Status:</strong> ${assessment.status}</p>
                ${assessment.assessedBy ? `<p><strong>Assessed By:</strong> ${assessment.assessedBy}</p>` : ''}
            </div>
        `;
    });

    document.getElementById('assessments-list').innerHTML = html;
}

// Load Statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/risk-assessments/statistics`);
        const result = await response.json();

        if (result.success) {
            renderStatistics(result.data);
        } else {
            document.getElementById('statistics-container').innerHTML =
                `<div class="error">Error loading statistics</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('statistics-container').innerHTML =
            `<div class="error">Error loading statistics: ${error.message}</div>`;
    }
}

function renderStatistics(stats) {
    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${stats.total}</h3>
                <p>Total Assessments</p>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);">
                <h3>${stats.byNetRisk.low}</h3>
                <p>Low Risk</p>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #ffeb3b 0%, #fdd835 100%);">
                <h3>${stats.byNetRisk.medium}</h3>
                <p>Medium Risk</p>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #ff9800 0%, #fb8c00 100%);">
                <h3>${stats.byNetRisk.quiteHigh}</h3>
                <p>Quite High Risk</p>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f44336 0%, #e53935 100%);">
                <h3>${stats.byNetRisk.high}</h3>
                <p>High Risk</p>
            </div>
        </div>

        <h3 style="margin-top: 30px;">Quality of Risk Management Distribution</h3>
        <div class="stats-grid">
            <div class="stat-card qrm-excellent">
                <h3>${stats.byQRM.excellent}</h3>
                <p>Excellent QRM</p>
            </div>
            <div class="stat-card qrm-good">
                <h3>${stats.byQRM.good}</h3>
                <p>Good QRM</p>
            </div>
            <div class="stat-card qrm-fair">
                <h3>${stats.byQRM.fair}</h3>
                <p>Fair QRM</p>
            </div>
            <div class="stat-card qrm-somewhat-weak">
                <h3>${stats.byQRM.somewhatWeak}</h3>
                <p>Somewhat Weak QRM</p>
            </div>
            <div class="stat-card qrm-weak">
                <h3>${stats.byQRM.weak}</h3>
                <p>Weak QRM</p>
            </div>
        </div>

        <h3 style="margin-top: 30px;">High Risk Areas (Net Risk ≥ Quite High)</h3>
    `;

    if (stats.highRiskAreas.length > 0) {
        stats.highRiskAreas.forEach(area => {
            html += `
                <div class="assessment-item">
                    <h4>${area.riskArea || 'N/A'}</h4>
                    <p><strong>Net Risk:</strong> <span class="${getRiskClass(area.netRisk)}" style="padding: 5px 10px; border-radius: 3px;">${getRiskLabel(area.netRisk)}</span></p>
                    <p><strong>Period:</strong> ${area.assessmentPeriod}</p>
                </div>
            `;
        });
    } else {
        html += '<p>No high risk areas found.</p>';
    }

    document.getElementById('statistics-container').innerHTML = html;
}

// Load Risk Areas for form
async function loadRiskAreas() {
    try {
        const response = await fetch(`${API_BASE_URL}/compliance-risk-areas`);
        const result = await response.json();

        if (result.success) {
            const select = document.getElementById('riskAreaId');
            select.innerHTML = '<option value="">Select Risk Area</option>';

            result.data.forEach(area => {
                const option = document.createElement('option');
                option.value = area.id;
                option.textContent = `${area.nameTh} (${area.regulationGroup?.nameTh || ''})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading risk areas:', error);
    }
}

// Handle form submission
document.getElementById('assessment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        riskAreaId: parseInt(document.getElementById('riskAreaId').value),
        assessmentPeriod: document.getElementById('assessmentPeriod').value,
        likelihoodLevel: parseInt(document.getElementById('likelihoodLevel').value),
        impactLevel: parseInt(document.getElementById('impactLevel').value),
        qrmLevel: parseInt(document.getElementById('qrmLevel').value),
        // Risk Description Indicators
        hasIncompleteActionPlanForNewRegulation: document.getElementById('hasIncompleteActionPlanForNewRegulation').checked,
        hasIncompleteCorrectiveActionPlan: document.getElementById('hasIncompleteCorrectiveActionPlan').checked,
        hasNewOrComplexRegulation: document.getElementById('hasNewOrComplexRegulation').checked,
        riskDescriptionOther: document.getElementById('riskDescriptionOther').value,
        likelihoodJustification: document.getElementById('likelihoodJustification').value,
        impactJustification: document.getElementById('impactJustification').value,
        qrmJustification: document.getElementById('qrmJustification').value,
        mitigationActions: document.getElementById('mitigationActions').value,
        assessedBy: document.getElementById('assessedBy').value,
        assessedDate: new Date().toISOString(),
        status: 'draft'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/risk-assessments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('form-message').innerHTML =
                '<div class="success">Risk assessment created successfully!</div>';
            document.getElementById('assessment-form').reset();

            // Switch to assessments tab after 2 seconds
            setTimeout(() => {
                document.querySelector('.tab:nth-child(2)').click();
            }, 2000);
        } else {
            document.getElementById('form-message').innerHTML =
                `<div class="error">Error: ${result.message}</div>`;
        }
    } catch (error) {
        document.getElementById('form-message').innerHTML =
            `<div class="error">Error: ${error.message}</div>`;
    }
});

// Load initial data
window.addEventListener('DOMContentLoaded', () => {
    loadRiskMatrix();
});
