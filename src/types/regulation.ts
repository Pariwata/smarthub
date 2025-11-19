export interface RegulationRequest {
  id?: string;
  title: string;
  description: string;
  requestType: 'generate' | 'update' | 'review';
  regulationCategory: string;
  targetAudience: string;
  complianceFramework?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  additionalNotes?: string;
  template?: File | null;
  createdAt?: string;
  status?: 'draft' | 'submitted' | 'processing' | 'completed';
}

export interface RegulationCategory {
  id: string;
  name: string;
  description: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  abbreviation: string;
}
