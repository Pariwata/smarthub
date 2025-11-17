export type RegulationStatus = 'pending' | 'approved' | 'rejected'

export interface Regulation {
  id: string
  title: string
  category: string
  description: string
  content: string
  generatedAt: string
  status: RegulationStatus
  metadata?: {
    generatedBy: string
    version: string
    tags?: string[]
  }
}

export interface RegulationGenerationRequest {
  industry?: string
  region?: string
  specificRequirements?: string[]
  customPrompt?: string
}

export interface RegulationGenerationResponse {
  regulations: Regulation[]
  generatedAt: string
  requestId: string
}
