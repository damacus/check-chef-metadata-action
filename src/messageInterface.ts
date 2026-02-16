export interface ValidationError {
  field: string
  expected: string
  actual: string
  line?: number
  path?: string
}

export interface Message {
  conclusion: Conclusion
  name: string
  message: string
  summary: string[]
  title: string
  errors?: ValidationError[]
  rawMetadata?: Record<string, string | string[]>
}

export type Conclusion =
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'skipped'
  | 'timed_out'
  | 'action_required'
  | 'stale'
  | undefined
