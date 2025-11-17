import { NextResponse } from 'next/server'

// Mock data for demonstration
const mockRegulations = [
  {
    id: '1',
    title: 'Data Privacy and Protection',
    category: 'Privacy',
    description: 'Regulations governing the collection, storage, and processing of personal data',
    content: `1. Purpose and Scope
This regulation establishes requirements for the protection of personal data within the organization.

2. Data Collection
- Personal data shall only be collected for specified, explicit, and legitimate purposes
- Data subjects must be informed of the purposes of data collection
- Consent must be obtained where required by law

3. Data Storage
- Personal data must be stored securely using encryption
- Access to personal data must be logged and monitored
- Data retention periods must be clearly defined and enforced

4. Data Processing
- Personal data must be processed lawfully, fairly, and transparently
- Data minimization principles must be applied
- Data accuracy must be maintained

5. Individual Rights
- Data subjects have the right to access their personal data
- Data subjects have the right to request correction or deletion
- Data subjects have the right to data portability where applicable`,
    generatedAt: new Date().toISOString(),
    status: 'pending',
    metadata: {
      generatedBy: 'claude-sonnet-4-5',
      version: '1.0',
    },
  },
  {
    id: '2',
    title: 'Information Security Controls',
    category: 'Security',
    description: 'Technical and organizational measures for information security',
    content: `1. Access Control
- Implement role-based access control (RBAC) for all systems
- Enforce multi-factor authentication for privileged accounts
- Conduct regular access reviews

2. Network Security
- Deploy firewalls at network boundaries
- Implement intrusion detection and prevention systems
- Segment networks based on security zones

3. Encryption
- Encrypt data in transit using TLS 1.3 or higher
- Encrypt sensitive data at rest using AES-256
- Implement key management procedures

4. Incident Response
- Maintain an incident response plan
- Establish incident response team and procedures
- Conduct regular incident response drills

5. Security Monitoring
- Implement continuous security monitoring
- Collect and analyze security logs
- Deploy security information and event management (SIEM) systems`,
    generatedAt: new Date().toISOString(),
    status: 'pending',
    metadata: {
      generatedBy: 'claude-sonnet-4-5',
      version: '1.0',
    },
  },
  {
    id: '3',
    title: 'Change Management',
    category: 'Operations',
    description: 'Procedures for managing changes to IT systems and infrastructure',
    content: `1. Change Request Process
- All changes must be formally requested and documented
- Change requests must include business justification
- Emergency changes must be documented retroactively

2. Change Assessment
- Assess impact and risk of proposed changes
- Identify affected systems and stakeholders
- Develop rollback procedures

3. Change Approval
- Standard changes may be pre-approved
- Normal changes require CAB approval
- Emergency changes require expedited approval process

4. Change Implementation
- Schedule changes during approved maintenance windows
- Follow approved implementation procedures
- Maintain communication with stakeholders

5. Post-Implementation Review
- Verify successful implementation
- Document any issues encountered
- Update change records with final status`,
    generatedAt: new Date().toISOString(),
    status: 'pending',
    metadata: {
      generatedBy: 'claude-sonnet-4-5',
      version: '1.0',
    },
  },
]

export async function GET() {
  return NextResponse.json({
    regulations: mockRegulations,
    generatedAt: new Date().toISOString(),
  })
}
