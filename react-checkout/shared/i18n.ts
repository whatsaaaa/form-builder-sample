/** The languages of the shop. The first one is the fallback. */
export const locales = ['en', 'de'] as const

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
}

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale)
}

/**
 * Every text of the checkout, by key. The definition and the app only hold keys: the schema
 * builder resolves the keys of messages, and the components those of labels and other text.
 */
const messages = {
  en: {
    'app.title': 'Checkout',
    'app.lead': 'Paper goods, shipped from Zagreb.',
    'app.language': 'Language',
    'app.loading': 'Loading the checkout...',
    'app.loadFailed': "The checkout can't be loaded",
    'app.loadFailed.hint': 'Please try again in a moment.',
    'app.retry': 'Try again',
    'form.required': 'This field is required',
    'form.optional': 'optional',
    'form.choose': 'Choose...',
    'form.remove': 'Remove',
    'form.empty': 'Nothing added yet.',
    'catalog.mug': 'Ceramic mug',
    'catalog.tote': 'Canvas tote bag',
    'catalog.notebook': 'Dot grid notebook',
    'catalog.poster': 'Letterpress poster',
    'checkout.section.contact': 'Contact',
    'checkout.section.order': 'Your order',
    'checkout.section.delivery': 'Delivery',
    'checkout.section.payment': 'Payment',
    'checkout.section.summary': 'Summary',
    'checkout.email.label': 'Email',
    'checkout.email.hint': 'For the order confirmation.',
    'checkout.email.required': 'Enter your email',
    'checkout.email.invalid': 'Enter a valid email address',
    'checkout.lines.label': 'Items',
    'checkout.lines.item': 'Item',
    'checkout.lines.add': 'Add an item',
    'checkout.lines.required': 'Add at least one item',
    'checkout.lines.max': 'One order takes up to five items',
    'checkout.product.label': 'Product',
    'checkout.product.required': 'Choose a product',
    'checkout.quantity.label': 'Quantity',
    'checkout.quantity.required': 'Enter a quantity',
    'checkout.quantity.integer': 'Enter a whole number',
    'checkout.quantity.min': 'Order at least one',
    'checkout.quantity.max': 'Order up to ten of one product',
    'checkout.delivery.label': 'Delivery method',
    'checkout.delivery.required': 'Choose how to get your order',
    'checkout.delivery.standard': 'Standard, 3 to 5 working days',
    'checkout.delivery.express': 'Express, next working day',
    'checkout.delivery.pickup': 'Pick up at the shop',
    'checkout.shipping.label': 'Shipping address',
    'checkout.fullName.label': 'Full name',
    'checkout.fullName.required': 'Enter the name of the recipient',
    'checkout.street.label': 'Street and number',
    'checkout.street.required': 'Enter the street and number',
    'checkout.zip.label': 'Postal code',
    'checkout.zip.required': 'Enter the postal code',
    'checkout.zip.invalid': 'Use 4 or 5 digits',
    'checkout.city.label': 'City',
    'checkout.city.required': 'Enter the city',
    'checkout.country.label': 'Country',
    'checkout.country.required': 'Choose a country',
    'checkout.country.AT': 'Austria',
    'checkout.country.HR': 'Croatia',
    'checkout.country.DE': 'Germany',
    'checkout.payment.label': 'Payment method',
    'checkout.payment.required': 'Choose how to pay',
    'checkout.payment.card': 'Card, on delivery',
    'checkout.payment.invoice': 'Invoice, for companies',
    'checkout.company.label': 'Company name',
    'checkout.company.hint': 'As it should appear on the invoice.',
    'checkout.company.required': 'Enter the company name',
    'checkout.coupon.label': 'Coupon code',
    'checkout.coupon.hint': 'Six letters or digits.',
    'checkout.coupon.invalid': 'A coupon code has six letters or digits',
    'checkout.note.label': 'Note for the courier',
    'checkout.note.max': 'Keep the note under 200 characters',
    'checkout.terms.label': 'I accept the terms of sale',
    'checkout.terms.required': 'Please accept the terms of sale',
    'checkout.submit': 'Place order',
    'checkout.submitting': 'Placing your order...',
    'checkout.rejected':
      'We could not take your order. Please check the marked fields.',
    'checkout.failed':
      'Something went wrong on our side. Your order was not placed.',
    'checkout.outdated':
      'The checkout has changed. Reload the page and try again.',
    'summary.empty': 'No items yet.',
    'summary.delivery': 'Delivery',
    'summary.total': 'Total',
    'done.title': 'Thank you for your order',
    'done.lead':
      'Order {orderId} is confirmed. We sent the details to {email}.',
    'done.total': 'Total paid',
    'done.again': 'Place another order',
    'server.invalidBody': 'The request is not a valid order.',
  },
  de: {
    'app.title': 'Kasse',
    'app.lead': 'Papierwaren, verschickt aus Zagreb.',
    'app.language': 'Sprache',
    'app.loading': 'Die Kasse wird geladen...',
    'app.loadFailed': 'Die Kasse kann nicht geladen werden',
    'app.loadFailed.hint': 'Bitte versuchen Sie es gleich noch einmal.',
    'app.retry': 'Erneut versuchen',
    'form.required': 'Dieses Feld ist erforderlich',
    'form.optional': 'optional',
    'form.choose': 'Bitte wählen...',
    'form.remove': 'Entfernen',
    'form.empty': 'Noch nichts hinzugefügt.',
    'catalog.mug': 'Keramiktasse',
    'catalog.tote': 'Stofftasche',
    'catalog.notebook': 'Notizbuch, gepunktet',
    'catalog.poster': 'Buchdruck-Poster',
    'checkout.section.contact': 'Kontakt',
    'checkout.section.order': 'Ihre Bestellung',
    'checkout.section.delivery': 'Lieferung',
    'checkout.section.payment': 'Zahlung',
    'checkout.section.summary': 'Übersicht',
    'checkout.email.label': 'E-Mail',
    'checkout.email.hint': 'Für die Bestellbestätigung.',
    'checkout.email.required': 'Geben Sie Ihre E-Mail-Adresse ein',
    'checkout.email.invalid': 'Geben Sie eine gültige E-Mail-Adresse ein',
    'checkout.lines.label': 'Artikel',
    'checkout.lines.item': 'Artikel',
    'checkout.lines.add': 'Artikel hinzufügen',
    'checkout.lines.required': 'Fügen Sie mindestens einen Artikel hinzu',
    'checkout.lines.max': 'Eine Bestellung fasst bis zu fünf Artikel',
    'checkout.product.label': 'Produkt',
    'checkout.product.required': 'Wählen Sie ein Produkt',
    'checkout.quantity.label': 'Menge',
    'checkout.quantity.required': 'Geben Sie eine Menge ein',
    'checkout.quantity.integer': 'Geben Sie eine ganze Zahl ein',
    'checkout.quantity.min': 'Bestellen Sie mindestens ein Stück',
    'checkout.quantity.max':
      'Bestellen Sie höchstens zehn Stück eines Produkts',
    'checkout.delivery.label': 'Lieferart',
    'checkout.delivery.required': 'Wählen Sie eine Lieferart',
    'checkout.delivery.standard': 'Standard, 3 bis 5 Werktage',
    'checkout.delivery.express': 'Express, am nächsten Werktag',
    'checkout.delivery.pickup': 'Abholung im Laden',
    'checkout.shipping.label': 'Lieferadresse',
    'checkout.fullName.label': 'Vollständiger Name',
    'checkout.fullName.required': 'Geben Sie den Namen des Empfängers ein',
    'checkout.street.label': 'Straße und Hausnummer',
    'checkout.street.required': 'Geben Sie Straße und Hausnummer ein',
    'checkout.zip.label': 'Postleitzahl',
    'checkout.zip.required': 'Geben Sie die Postleitzahl ein',
    'checkout.zip.invalid': 'Verwenden Sie 4 oder 5 Ziffern',
    'checkout.city.label': 'Ort',
    'checkout.city.required': 'Geben Sie den Ort ein',
    'checkout.country.label': 'Land',
    'checkout.country.required': 'Wählen Sie ein Land',
    'checkout.country.AT': 'Österreich',
    'checkout.country.HR': 'Kroatien',
    'checkout.country.DE': 'Deutschland',
    'checkout.payment.label': 'Zahlungsart',
    'checkout.payment.required': 'Wählen Sie eine Zahlungsart',
    'checkout.payment.card': 'Karte, bei Lieferung',
    'checkout.payment.invoice': 'Rechnung, für Unternehmen',
    'checkout.company.label': 'Firmenname',
    'checkout.company.hint': 'So, wie er auf der Rechnung stehen soll.',
    'checkout.company.required': 'Geben Sie den Firmennamen ein',
    'checkout.coupon.label': 'Gutscheincode',
    'checkout.coupon.hint': 'Sechs Buchstaben oder Ziffern.',
    'checkout.coupon.invalid':
      'Ein Gutscheincode hat sechs Buchstaben oder Ziffern',
    'checkout.note.label': 'Hinweis für den Kurier',
    'checkout.note.max': 'Der Hinweis darf höchstens 200 Zeichen lang sein',
    'checkout.terms.label': 'Ich akzeptiere die Verkaufsbedingungen',
    'checkout.terms.required': 'Bitte akzeptieren Sie die Verkaufsbedingungen',
    'checkout.submit': 'Bestellung aufgeben',
    'checkout.submitting': 'Ihre Bestellung wird aufgegeben...',
    'checkout.rejected':
      'Wir konnten Ihre Bestellung nicht annehmen. Bitte prüfen Sie die markierten Felder.',
    'checkout.failed':
      'Bei uns ist etwas schiefgelaufen. Ihre Bestellung wurde nicht aufgegeben.',
    'checkout.outdated':
      'Die Kasse hat sich geändert. Laden Sie die Seite neu und versuchen Sie es noch einmal.',
    'summary.empty': 'Noch keine Artikel.',
    'summary.delivery': 'Lieferung',
    'summary.total': 'Gesamt',
    'done.title': 'Vielen Dank für Ihre Bestellung',
    'done.lead':
      'Die Bestellung {orderId} ist bestätigt. Die Einzelheiten haben wir an {email} geschickt.',
    'done.total': 'Bezahlter Betrag',
    'done.again': 'Weitere Bestellung aufgeben',
    'server.invalidBody': 'Die Anfrage ist keine gültige Bestellung.',
  },
} as const satisfies Record<Locale, Record<string, string>>

/**
 * The text of a key in a language, or `undefined` for a key the language doesn't have, which is
 * what the schema builder's `resolveMessage` takes to keep a text as written.
 */
export function lookup(locale: Locale, key: string): string | undefined {
  const texts: Record<string, string> = messages[locale]
  return Object.hasOwn(texts, key) ? texts[key] : undefined
}

/** The text of a key in a language, with `{name}` placeholders filled in. An unknown key stays. */
export function translate(
  locale: Locale,
  key: string,
  values: Record<string, string> = {},
): string {
  return (lookup(locale, key) ?? key).replace(
    /\{(\w+)\}/g,
    (placeholder, name: string) => values[name] ?? placeholder,
  )
}

/** An amount in euro cents, the way the language writes money. */
export function formatMoney(locale: Locale, cents: number): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

/** Every key of every language, for the tests that keep the languages in step. */
export const messageKeys: Record<Locale, string[]> = {
  en: Object.keys(messages.en),
  de: Object.keys(messages.de),
}
