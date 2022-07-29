export interface ValidationError {
  field: string
  rule: string
  message: string
  details?: any
}
