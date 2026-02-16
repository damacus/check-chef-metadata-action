export interface ValidationError {
  field: string
  expected: string
  actual: string
  line?: number
}

export interface Message {
  conclusion: Conclusion
  name: string
  message: string
  summary: string[]
  title: string
  errors?: ValidationError[]
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
