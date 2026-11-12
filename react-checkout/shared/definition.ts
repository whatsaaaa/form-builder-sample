import { deliveries, products } from './catalog'
import { builders } from './builder'

/**
 * The checkout form. The server owns it: it serves it to the browser, which renders it, and
 * validates every order against it again. Every text is a key of `i18n.ts`.
 *
 * `defineForm()` checks the types, rules and keys as it is written. `validate()` checks the rest.
 */
export const checkoutDefinition = builders.en.defineForm({
  version: '1',
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'checkout.email.label',
      description: 'checkout.email.hint',
      required: { message: 'checkout.email.required' },
      rules: [{ rule: 'email', message: 'checkout.email.invalid' }],
      ui: { autocomplete: 'email' },
    },
    {
      name: 'lines',
      type: 'array',
      label: 'checkout.lines.label',
      required: { message: 'checkout.lines.required' },
      rules: [{ rule: 'maxLength', value: 5, message: 'checkout.lines.max' }],
      ui: { itemLabel: 'checkout.lines.item', addLabel: 'checkout.lines.add' },
      fields: [
        {
          name: 'product',
          type: 'select',
          label: 'checkout.product.label',
          required: { message: 'checkout.product.required' },
          options: products.map(({ id, label }) => ({ value: id, label })),
        },
        {
          name: 'quantity',
          type: 'number',
          label: 'checkout.quantity.label',
          required: { message: 'checkout.quantity.required' },
          default: 1,
          rules: [
            { rule: 'integer', message: 'checkout.quantity.integer' },
            { rule: 'minValue', value: 1, message: 'checkout.quantity.min' },
            { rule: 'maxValue', value: 10, message: 'checkout.quantity.max' },
          ],
          ui: { min: 1, max: 10 },
        },
      ],
    },
    {
      name: 'delivery',
      type: 'radio',
      label: 'checkout.delivery.label',
      required: { message: 'checkout.delivery.required' },
      options: deliveries.map(({ id, label }) => ({ value: id, label })),
    },
    {
      name: 'shipping',
      type: 'group',
      label: 'checkout.shipping.label',
      // Nothing to ship to when the order is picked up.
      affects: [
        {
          effect: 'hideAndClear',
          when: { field: 'delivery', equals: 'pickup' },
        },
      ],
      fields: [
        {
          name: 'fullName',
          type: 'text',
          label: 'checkout.fullName.label',
          required: { message: 'checkout.fullName.required' },
          rules: [{ rule: 'trim' }, { rule: 'maxLength', value: 120 }],
          ui: { autocomplete: 'name' },
        },
        {
          name: 'street',
          type: 'text',
          label: 'checkout.street.label',
          required: { message: 'checkout.street.required' },
          rules: [{ rule: 'trim' }, { rule: 'maxLength', value: 120 }],
          ui: { autocomplete: 'street-address' },
        },
        {
          name: 'zip',
          type: 'text',
          label: 'checkout.zip.label',
          required: { message: 'checkout.zip.required' },
          rules: [
            { rule: 'trim' },
            {
              rule: 'regex',
              pattern: '^[0-9]{4,5}$',
              message: 'checkout.zip.invalid',
            },
          ],
          ui: { autocomplete: 'postal-code', inputmode: 'numeric' },
        },
        {
          name: 'city',
          type: 'text',
          label: 'checkout.city.label',
          required: { message: 'checkout.city.required' },
          rules: [{ rule: 'trim' }, { rule: 'maxLength', value: 120 }],
          ui: { autocomplete: 'address-level2' },
        },
        {
          name: 'country',
          type: 'select',
          label: 'checkout.country.label',
          required: { message: 'checkout.country.required' },
          options: [
            { value: 'AT', label: 'checkout.country.AT' },
            { value: 'HR', label: 'checkout.country.HR' },
            { value: 'DE', label: 'checkout.country.DE' },
          ],
          ui: { autocomplete: 'country' },
        },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'radio',
      label: 'checkout.payment.label',
      required: { message: 'checkout.payment.required' },
      default: 'card',
      options: [
        { value: 'card', label: 'checkout.payment.card' },
        { value: 'invoice', label: 'checkout.payment.invoice' },
      ],
    },
    {
      name: 'company',
      type: 'text',
      label: 'checkout.company.label',
      description: 'checkout.company.hint',
      required: { message: 'checkout.company.required' },
      rules: [{ rule: 'trim' }, { rule: 'maxLength', value: 120 }],
      ui: { autocomplete: 'organization' },
      affects: [
        {
          effect: 'hideAndClear',
          when: { field: 'paymentMethod', notEquals: 'invoice' },
        },
      ],
    },
    {
      name: 'coupon',
      type: 'text',
      label: 'checkout.coupon.label',
      description: 'checkout.coupon.hint',
      rules: [
        { rule: 'trim' },
        { rule: 'toUpperCase' },
        {
          rule: 'regex',
          pattern: '^[A-Z0-9]{6}$',
          message: 'checkout.coupon.invalid',
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'checkout.note.label',
      rules: [
        { rule: 'trim' },
        { rule: 'maxLength', value: 200, message: 'checkout.note.max' },
      ],
    },
    {
      name: 'acceptTerms',
      type: 'checkbox',
      label: 'checkout.terms.label',
      required: { message: 'checkout.terms.required' },
    },
  ],
  layout: {
    items: [
      {
        type: 'row',
        items: [
          {
            type: 'section',
            id: 'details',
            span: 7,
            ui: { variant: 'plain' },
            items: [
              {
                type: 'section',
                id: 'contact',
                label: 'checkout.section.contact',
                items: ['email'],
              },
              {
                type: 'section',
                id: 'order',
                label: 'checkout.section.order',
                items: [
                  {
                    field: 'lines',
                    items: [
                      {
                        type: 'row',
                        items: [{ field: 'product', span: 8 }, 'quantity'],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'section',
                id: 'delivery',
                label: 'checkout.section.delivery',
                items: [
                  'delivery',
                  {
                    field: 'shipping',
                    items: [
                      'fullName',
                      'street',
                      {
                        type: 'row',
                        items: ['zip', { field: 'city', span: 8 }],
                      },
                      'country',
                    ],
                  },
                ],
              },
              {
                type: 'section',
                id: 'payment',
                label: 'checkout.section.payment',
                items: ['paymentMethod', 'company'],
              },
            ],
          },
          {
            type: 'section',
            id: 'summary',
            label: 'checkout.section.summary',
            items: [
              { type: 'slot', name: 'summary' },
              '*',
              { type: 'slot', name: 'submit' },
            ],
          },
        ],
      },
    ],
  },
})

/**
 * Names this version of the definition. The browser sends it back with an order, so the server
 * validates against the definition the form showed, and can tell when it has changed since.
 */
export const checkoutDefinitionId = 'checkout-2027-05'
