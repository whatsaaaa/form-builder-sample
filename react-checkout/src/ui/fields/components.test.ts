import { checkComponents } from '@whatsaaaa/form-builder-schema'
import { expect, it } from 'vitest'
import { builders } from '../../../shared/builder'
import { checkoutDefinition } from '../../../shared/definition'
import { components } from '.'

it('has a component for every field type the checkout uses', () => {
  expect(() => {
    checkComponents(builders.en.getFieldTree(checkoutDefinition), components)
  }).not.toThrow()
})
