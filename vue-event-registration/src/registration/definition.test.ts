import { checkComponents } from '@whatsaaaa/form-builder-schema'
import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { components } from '../ui/fields'
import { builder, InvalidDefinitionError, loadDefinition } from './builder'
import json from './definition.json'

const definition = loadDefinition(json)
const schema = builder.build(definition)

/** A registration that passes: a standard ticket with nothing optional. */
const valid = {
  firstName: 'Ana',
  lastName: 'Horvat',
  email: 'ana@example.com',
  ticketType: 'standard',
  arrival: '2027-05-10',
  departure: '2027-05-12',
  sessions: ['keynote'],
  needsAssistance: false,
  guests: [],
  company: {},
  billingAddress: {},
  acceptTerms: true,
  newsletter: false,
}

/** The messages of a failed parse, by the dot path of each field. */
function errorsOf(input: unknown) {
  const result = v.safeParse(schema, input)
  return result.success ? {} : v.flatten(result.issues).nested
}

describe('the registration definition', () => {
  it('has no issues', () => {
    expect(builder.validate(json)).toEqual({ success: true, issues: [] })
  })

  it('has a component for every field type it uses', () => {
    expect(() => {
      checkComponents(builder.getFieldTree(definition), components)
    }).not.toThrow()
  })

  it('is rejected with every problem when it is broken', () => {
    const broken = {
      ...json,
      fields: [...json.fields, { name: 'email', type: 'emial' }],
    }
    expect(() => loadDefinition(broken)).toThrow(InvalidDefinitionError)
  })

  it('starts with its defaults', () => {
    expect(builder.getInitialInput(definition)).toEqual({
      arrival: '2027-05-10',
      departure: '2027-05-12',
      needsAssistance: false,
      guests: [],
      company: {},
      billingAddress: {},
      newsletter: false,
    })
  })
})

describe('the schema of the registration', () => {
  it('accepts a standard ticket, trims text and leaves out what is empty', () => {
    const output = v.parse(schema, { ...valid, firstName: '  Ana ', phone: '' })
    expect(output).toEqual(valid)
  })

  it('reports the messages of the definition', () => {
    expect(
      errorsOf({ ...valid, email: 'ana@example', phone: 'call me' }),
    ).toEqual({
      email: ['Enter a valid email address'],
      phone: ['Use digits and spaces, like +385 91 234 5678'],
    })
  })

  it('only asks for the student ID with a student ticket', () => {
    expect(errorsOf({ ...valid, ticketType: 'student' })).toEqual({
      studentId: ['Enter your student ID'],
    })
    // Hidden and cleared: a student ID sent with another ticket never reaches the output.
    expect(v.parse(schema, { ...valid, studentId: 'ST-2027-01' })).toEqual(
      valid,
    )
  })

  it('only asks for the invoice step with a business ticket', () => {
    expect(errorsOf({ ...valid, ticketType: 'business' })).toEqual({
      'company.name': ['Enter the company name'],
      'billingAddress.street': ['Enter the street'],
      'billingAddress.city': ['Enter the city'],
      'billingAddress.zip': ['Enter the ZIP code'],
      'billingAddress.country': ['Choose a country'],
    })
  })

  it('keeps the workshop level only while the workshop is picked', () => {
    const withWorkshop = { ...valid, sessions: ['keynote', 'workshop'] }
    expect(errorsOf(withWorkshop)).toEqual({
      workshopLevel: ['Choose your level'],
    })
    expect(
      v.parse(schema, { ...withWorkshop, workshopLevel: 'advanced' }),
    ).toMatchObject({ workshopLevel: 'advanced' })
  })

  it('compares the departure with the arrival', () => {
    expect(
      errorsOf({ ...valid, arrival: '2027-05-12', departure: '2027-05-11' }),
    ).toEqual({ departure: ["Departure can't be before arrival"] })
  })

  it('checks each guest, and the size of the guest list', () => {
    const guest = { name: 'Ivo Horvat', meal: 'vegan' }
    expect(
      errorsOf({
        ...valid,
        guests: [
          guest,
          { name: ' ', meal: 'vegan' },
          { ...guest, email: valid.email },
        ],
      }),
    ).toEqual({
      'guests.1.name': ["Enter the guest's name"],
      'guests.2.email': ['A guest needs an email of their own'],
    })
    expect(
      errorsOf({ ...valid, guests: [guest, guest, guest, guest] }),
    ).toEqual({ guests: ['Up to three guests'] })
  })
})
