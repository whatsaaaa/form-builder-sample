import { describe, expect, it } from 'vitest'
import { builder, loadDefinition } from './builder'
import json from './definition.json'
import { summarize } from './summary'

const definition = loadDefinition(json)
const { steps } = builder.getLayout(definition)
const visibility = builder.getVisibility(definition)

function summaryOf(input: Record<string, unknown>) {
  return summarize(steps, visibility.of(input), input)
}

const input = {
  firstName: 'Marko',
  lastName: 'Petrović',
  email: 'marko@example.com',
  ticketType: 'business',
  arrival: '2027-05-10',
  departure: '2027-05-12',
  sessions: ['keynote', 'workshop'],
  workshopLevel: 'advanced',
  needsAssistance: false,
  guests: [
    { name: 'Nikola Petrović', email: 'nikola@example.com', meal: 'vegan' },
    { name: 'Milica Nikolić', meal: 'standard' },
  ],
  company: { name: 'Petrović d.o.o.' },
  billingAddress: {
    street: 'Knez Mihailova 1',
    city: 'Belgrade',
    zip: '11000',
    country: 'RS',
  },
  newsletter: false,
}

describe('summarize', () => {
  it('tells each step back as text, with the labels of the options', () => {
    expect(summaryOf(input)).toEqual([
      {
        id: 'you',
        label: 'About you',
        rows: [
          { label: 'First name', value: 'Marko' },
          { label: 'Last name', value: 'Petrović' },
          { label: 'Email', value: 'marko@example.com' },
          { label: 'Ticket', value: 'Business - 490 EUR, with an invoice' },
        ],
      },
      {
        id: 'visit',
        label: 'Your visit',
        rows: [
          { label: 'Arrival', value: '10 May 2027' },
          { label: 'Departure', value: '12 May 2027' },
          {
            label: 'Sessions',
            value: 'Opening keynote, Hands-on forms workshop',
          },
          { label: 'Workshop level', value: 'Advanced' },
          { label: 'I have access or dietary needs', value: 'No' },
        ],
      },
      {
        id: 'guests',
        label: 'Guests',
        rows: [
          {
            label: 'Guest 1',
            value: 'Nikola Petrović, nikola@example.com, Vegan',
          },
          { label: 'Guest 2', value: 'Milica Nikolić, Standard' },
        ],
      },
      {
        id: 'invoice',
        label: 'Invoice',
        rows: [
          { label: 'Company name', value: 'Petrović d.o.o.' },
          { label: 'Street and number', value: 'Knez Mihailova 1' },
          { label: 'City', value: 'Belgrade' },
          { label: 'ZIP code', value: '11000' },
          { label: 'Country', value: 'Serbia' },
        ],
      },
      {
        id: 'confirm',
        label: 'Confirm',
        rows: [{ label: "Tell me about next year's event", value: 'No' }],
      },
    ])
  })

  it('leaves out what conditions hide, even when it still has a value', () => {
    const summary = summaryOf({
      ...input,
      ticketType: 'standard',
      sessions: ['keynote'],
      guests: [],
    })
    expect(summary.map((section) => section.id)).toEqual([
      'you',
      'visit',
      'confirm',
    ])
    const labels = summary.flatMap((section) =>
      section.rows.map((row) => row.label),
    )
    expect(labels).not.toContain('Workshop level')
    expect(labels).not.toContain('Company name')
  })
})
