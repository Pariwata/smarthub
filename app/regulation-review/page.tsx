'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, FileText, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Regulation {
  id: string
  title: string
  category: string
  description: string
  content: string
  generatedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

// Mock data - in production, this would come from Claude API
const mockRegulations: Regulation[] = [
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
    generatedAt: '2025-11-17T10:30:00Z',
    status: 'pending'
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
    generatedAt: '2025-11-17T10:35:00Z',
    status: 'pending'
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
    generatedAt: '2025-11-17T10:40:00Z',
    status: 'pending'
  }
]

export default function RegulationReviewPage() {
  const [regulations, setRegulations] = useState<Regulation[]>(mockRegulations)
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleApprove = (id: string) => {
    setRegulations(prev =>
      prev.map(reg =>
        reg.id === id ? { ...reg, status: 'approved' as const } : reg
      )
    )
  }

  const handleReject = (id: string) => {
    setRegulations(prev =>
      prev.map(reg =>
        reg.id === id ? { ...reg, status: 'rejected' as const } : reg
      )
    )
  }

  const handleConfirmAll = () => {
    const allReviewed = regulations.every(reg => reg.status !== 'pending')
    if (allReviewed) {
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 3000)
    }
  }

  const exportApprovedRegulations = () => {
    const approved = regulations.filter(reg => reg.status === 'approved')
    const exportData = JSON.stringify(approved, null, 2)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `approved-regulations-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const pendingCount = regulations.filter(r => r.status === 'pending').length
  const approvedCount = regulations.filter(r => r.status === 'approved').length
  const rejectedCount = regulations.filter(r => r.status === 'rejected').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Regulation Library Review
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Generated by Claude AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {approvedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {rejectedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Regulation List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Regulations ({regulations.length})
            </h2>
            {regulations.map(regulation => (
              <div
                key={regulation.id}
                onClick={() => setSelectedRegulation(regulation)}
                className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer transition-all hover:shadow-lg ${
                  selectedRegulation?.id === regulation.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {regulation.title}
                  </h3>
                  {regulation.status === 'approved' && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {regulation.status === 'rejected' && (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  {regulation.status === 'pending' && (
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {regulation.category}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {regulation.description}
                </p>
              </div>
            ))}
          </div>

          {/* Regulation Detail */}
          <div className="lg:col-span-2">
            {selectedRegulation ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedRegulation.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {selectedRegulation.category}
                        </span>
                        <span>
                          Generated: {new Date(selectedRegulation.generatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {selectedRegulation.description}
                  </p>
                </div>

                {/* Content */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Regulation Content
                    </h3>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {selectedRegulation.content}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedRegulation.id)}
                      disabled={selectedRegulation.status === 'approved'}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedRegulation.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{selectedRegulation.status === 'approved' ? 'Approved' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedRegulation.id)}
                      disabled={selectedRegulation.status === 'rejected'}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedRegulation.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>{selectedRegulation.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Regulation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a regulation from the list to review its details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Complete Review
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pendingCount > 0
                  ? `${pendingCount} regulation${pendingCount !== 1 ? 's' : ''} pending review`
                  : 'All regulations have been reviewed'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportApprovedRegulations}
                disabled={approvedCount === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Export Approved ({approvedCount})</span>
              </button>
              <button
                onClick={handleConfirmAll}
                disabled={pendingCount > 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Confirm All Decisions
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Toast */}
        {showConfirmation && (
          <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 animate-slide-up">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Regulation review completed successfully!</span>
          </div>
        )}
      </div>
    </div>
  )
}
