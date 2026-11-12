/**
 * The value of the registration form. Nothing checks it against `definition.json`, so keep the
 * two in step. A field that conditions can hide is optional: it submits nothing while hidden.
 */
export interface Registration {
  firstName: string
  lastName: string
  email: string
  phone?: string
  ticketType: 'standard' | 'student' | 'business'
  studentId?: string
  arrival: string
  departure: string
  sessions: string[]
  workshopLevel?: 'beginner' | 'intermediate' | 'advanced'
  needsAssistance: boolean
  assistanceDetails?: string
  guests: {
    name: string
    email?: string
    meal: 'standard' | 'vegetarian' | 'vegan'
  }[]
  company: { name?: string; vatId?: string }
  billingAddress: {
    street?: string
    city?: string
    zip?: string
    country?: 'AT' | 'HR' | 'DE' | 'SI'
  }
  acceptTerms: boolean
  newsletter: boolean
}
