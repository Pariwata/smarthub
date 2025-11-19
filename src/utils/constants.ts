import { RegulationCategory, ComplianceFramework } from '../types/regulation';

export const REGULATION_CATEGORIES: RegulationCategory[] = [
  { id: 'financial', name: 'Financial Services', description: 'Banking, securities, and financial regulations' },
  { id: 'healthcare', name: 'Healthcare & Medical', description: 'HIPAA, medical device, and healthcare compliance' },
  { id: 'data-privacy', name: 'Data Privacy', description: 'GDPR, CCPA, and data protection regulations' },
  { id: 'environmental', name: 'Environmental', description: 'EPA, environmental protection regulations' },
  { id: 'labor', name: 'Labor & Employment', description: 'Workplace safety, employment laws' },
  { id: 'consumer', name: 'Consumer Protection', description: 'Consumer rights and protection regulations' },
  { id: 'technology', name: 'Technology & Cybersecurity', description: 'IT security, software compliance' },
  { id: 'other', name: 'Other', description: 'Other regulatory requirements' },
];

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  { id: 'sox', name: 'Sarbanes-Oxley Act', abbreviation: 'SOX' },
  { id: 'gdpr', name: 'General Data Protection Regulation', abbreviation: 'GDPR' },
  { id: 'hipaa', name: 'Health Insurance Portability and Accountability Act', abbreviation: 'HIPAA' },
  { id: 'pci-dss', name: 'Payment Card Industry Data Security Standard', abbreviation: 'PCI-DSS' },
  { id: 'iso-27001', name: 'ISO/IEC 27001', abbreviation: 'ISO 27001' },
  { id: 'nist', name: 'NIST Cybersecurity Framework', abbreviation: 'NIST CSF' },
  { id: 'ccpa', name: 'California Consumer Privacy Act', abbreviation: 'CCPA' },
  { id: 'ferc', name: 'Federal Energy Regulatory Commission', abbreviation: 'FERC' },
];

export const REQUEST_TYPES = [
  { value: 'generate', label: 'Generate New Regulation' },
  { value: 'update', label: 'Update Existing Regulation' },
  { value: 'review', label: 'Review & Compliance Check' },
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
];

export const TARGET_AUDIENCES = [
  'Internal Compliance Team',
  'Legal Department',
  'Executive Leadership',
  'Department Managers',
  'All Employees',
  'External Auditors',
  'Regulatory Bodies',
  'Board of Directors',
];
