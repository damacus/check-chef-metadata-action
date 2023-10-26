export interface Message {
  conclusion: Conclusion
  name: string
  message: string
  summary: string[]
  title: string
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
