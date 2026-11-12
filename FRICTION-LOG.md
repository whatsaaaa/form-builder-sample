# Friction log

Release-candidate trial of form-builder `1.0.0-rc.0`, built from public material only.

<!-- SUMMARY: written last, once both apps are done -->

## How this log was kept

- Sources used: the documentation site at <https://whatsaaaa.github.io/form-builder/>, the published npm packages and what ships inside them, and the public documentation of the third-party tools the docs lead to (Formisch, Valibot, Vue, React, Vite, pnpm, Playwright).
- Sources not used: the form-builder repository in any form, and any local copy of it.
- Entries were written at the moment the problem happened, in the order it happened, not from memory at the end.
- Severity: **blocker** stops the app from being built, **major** costs real time or leaves a wrong result that is easy to miss, **minor** costs minutes, **nit** is polish.
- "Breaking?" answers whether the suggested fix needs a breaking change to the JSON format or to the public API.

## Versions under test

| Package | Version | Installed as |
| --- | --- | --- |
| `@whatsaaaa/form-builder-schema` | `1.0.0-rc.0` | `@rc` |
| `@whatsaaaa/form-builder-vue` | `1.0.0-rc.0` | `@rc` |
| `@whatsaaaa/form-builder-react` | `1.0.0-rc.0` | `@rc` |
| `@whatsaaaa/form-builder-affects` | `0.2.2-rc.0` | exact version, see F-01 |

Tooling: Node 26.12.0 locally, pnpm 11.27.0, macOS. Trial run on 2026-11-12, about 16 hours after the release candidates were published.

## Entries

### F-01 - `pnpm add @whatsaaaa/form-builder-affects@rc` installs a broken placeholder version

- **App and step:** Vue app, installing the packages.
- **Trying to:** install the four packages with the commands in the "Release candidate" callout.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/guide/installation>
- **What happened:** the schema and Vue commands worked. `pnpm add @whatsaaaa/form-builder-affects@rc` did not install `0.2.2-rc.0`. pnpm resolved the tag to `0.0.0-stage` and failed after two retries (about 70 seconds):

  ```
  [ERR_PNPM_TARBALL_EXTRACT] Failed to add tarball from
  "https://registry.npmjs.org/@whatsaaaa/form-builder-affects/-/form-builder-affects-0.0.0-stage.tgz"
  to store: Invalid checksum for TAR header at offset 2560. Expected 0, got NaN
  ```

- **Expected:** `0.2.2-rc.0`, which is what `npm view @whatsaaaa/form-builder-affects dist-tags` shows for `rc`.
- **Cause, as far as the allowed sources show:** pnpm 11 holds back versions younger than one day by default (`minimumReleaseAge`). `0.2.2-rc.0` was 16 hours old. For the schema, Vue and React packages pnpm found no older candidate, took the release candidate anyway and wrote it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. For affects it found an older prerelease, `0.0.0-stage`, and picked that. Every package has such a `0.0.0-stage` version on npm: a 378-byte placeholder with only a `package.json` and a README, whose tarball pnpm 11 cannot unpack.
- **Got past it:** yes. `pnpm add @whatsaaaa/form-builder-affects@0.2.2-rc.0` installs the right version. The problem also goes away on its own once the release candidate is a day old, and comes back for a day after each new release candidate.
- **Type:** bug (packaging).
- **Severity:** major on release day for pnpm 11 users, since the documented command fails with an error that says nothing about the cause. Minor afterwards.
- **Suggested fix:** deprecate or unpublish the `0.0.0-stage` placeholder versions of all four packages, so no resolver can ever fall back to them. In the callout, name the exact versions next to the `@rc` tag, or add one line that pnpm 11 users may need the exact version during the first day.
- **Breaking?** No.

### F-02 - No obvious way to give an `email` field a friendly "not an email" message

- **App and step:** Vue app, writing the definition.
- **Trying to:** show "Enter a valid email address" instead of Valibot's `Invalid email: Received "nope"`, which is what an end user sees on an `email` field out of the box.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/guide/field-types#text>, <https://whatsaaaa.github.io/form-builder/guide/rules>, <https://whatsaaaa.github.io/form-builder/guide/messages>, <https://whatsaaaa.github.io/form-builder/guide/define-your-form>, <https://whatsaaaa.github.io/form-builder/api/schema/field-types>
- **What happened:** none of those pages says how to set the message of the check that the `email` or `url` type runs on its own. The rules guide says the type's own rules run first, "then the field's rules", which reads as if adding my own `email` rule would report a second message after Valibot's. I tried a `message` key on the field (`unknown_key`), then tried the extra `email` rule anyway, and it worked: only my message is reported.
- **Expected:** the field types guide or the messages guide to say it in one line.
- **Got past it:** yes, by experiment. Afterwards a full-text search of the site found the sentence that explains it, in the guide for writing your own field types: "A rule of the field with the same name replaces one" (<https://whatsaaaa.github.io/form-builder/guide/custom-field-types>). Nobody writing a plain email field reads that page.
- **Type:** docs gap.
- **Severity:** minor. Every real form with an email field hits it.
- **Suggested fix:** in the field types guide under "Text", and in "Where messages come from" on the messages page, add: to change the message of an `email` or `url` field, add the rule again with a `message`, `{ "rule": "email", "message": "..." }`, and it replaces the type's own. Show it in the getting started example too, since that is the first email field a reader writes.
- **Breaking?** No.

### F-03 - The field components page has no component for a checkbox, a radio, a multiselect or a textarea

- **App and step:** Vue app, writing the field components.
- **Trying to:** write one component per built-in type the definition uses.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/frameworks/field-components>, <https://whatsaaaa.github.io/form-builder/guide/getting-started#add-field-components>
- **What happened:** the page shows a text input, a select, a file input, a group, a list and a heading. `CheckboxInput` is imported in the getting started and field components examples, but its code is on neither page. A radio and a multiselect get one sentence each under "Choices", and a textarea is not mentioned. I wrote all four from those sentences and from the text input example. Two things were left to guess:
  - whether `inputProps` may be bound to every radio or checkbox of one field. It works, and Formisch's own docs show it, but the page only says "bind them to the input element", singular.
  - the Vue text input's `:value="input ?? ''"` only type-checks because Vue types the `value` of an `<input>` as `any`. The same line on a `<textarea>` fails `vue-tsc` with `Type '{}' is not assignable to type 'string | number | readonly string[] | null | undefined'`, since `input` is `unknown`. `String(input ?? '')`, as the React example has it, fixes it.
- **Expected:** a copyable component for every built-in type, as the page's intro promises ("how to write one for every built-in type").
- **Got past it:** yes, in about 20 minutes.
- **Type:** docs gap.
- **Severity:** minor.
- **Suggested fix:** add the checkbox, radio, multiselect (as checkboxes) and textarea components to the page, in both frameworks, and use `String(input ?? '')` in the Vue text input so the pattern carries over to other elements. The Preact, Solid and Svelte renderer pages seem to have a control for every type already, so the code exists.
- **Breaking?** No.

### F-04 - With the documented Next button, Enter in a text input does nothing, though the docs say it moves on

- **App and step:** Vue app, multi-step form.
- **Trying to:** build the step buttons from the multi-step example, and rely on "Enter moves on like Next".
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/frameworks/multi-step-forms>, <https://whatsaaaa.github.io/form-builder/guide/steps#one-form-one-schema>
- **What happened:** both pages say that a submit before the last step, "like Enter in a text input", moves on like Next. The example they give renders `<button type="button" @click="jsonForm.steps.next()">Next</button>` on every step but the last, and the submit button only on the last. I copied that. On a step with four text inputs, Enter did nothing at all: a browser only submits a form on Enter when the form has a submit button, or a single text input. So with the example as written, the documented behavior can't be reached.
- **Expected:** Enter to move to the next step, as both pages say.
- **Got past it:** yes. I made Next a `type="submit"` button with no click handler. A submit before the last step is then a Next, by the adapter's own rule, and Enter works. `steps.next()` is no longer needed for the button.
- **Type:** docs error (the example contradicts the text next to it).
- **Severity:** minor. Nothing breaks, but keyboard users lose Enter, and it took an end-to-end test to notice.
- **Suggested fix:** in the multi-step example for both frameworks, render one submit button whose label changes: `<button type="submit">{{ jsonForm.steps.isLast ? 'Sign up' : 'Next' }}</button>`. Keep `steps.next()` in the table for buttons outside the form, and add one sentence that Enter only works when the step has a submit button.
- **Breaking?** No.

### F-05 - A read-only review of the answers has to be written by hand

- **App and step:** Vue app, the last step ("Confirm").
- **Trying to:** show what the user entered, as text, before they submit.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/frameworks/multi-step-forms#a-review-page>, <https://whatsaaaa.github.io/form-builder/api/vue/JsonFormInstance>, <https://whatsaaaa.github.io/form-builder/api/schema/FieldNode>, <https://whatsaaaa.github.io/form-builder/api/schema/Visibility>
- **What happened:** "A review page" says `<JsonFields>` takes a `step` to render a given step, "like on a review page that shows every step". That renders the editable inputs again, not the answers as text, and it is one sentence with no example. For a text summary I walked `jsonForm.steps.list[n].fields`, skipped nodes whose `dataPath` has `*`, asked `jsonForm.visibility.isHidden(node, [])`, read each value from Formisch's `getInput(form)` by `dataPath`, and mapped option values back to their labels. It works and follows the definition, but it is about 100 lines (`src/registration/summary.ts`), and every piece came from the JSDoc in the type definitions, not from a guide.
- **Expected:** either a small example of a text review in the guide, or a helper that gives the shown fields of a step with their paths and current values.
- **Got past it:** yes.
- **Type:** docs gap, bordering on a missing feature.
- **Severity:** minor.
- **Suggested fix:** add a "review as text" recipe to the multi-step page that uses `steps.list`, `step.fields`, `visibility.isHidden()` and `getInput()`. If it turns out to be common, a helper could come in a 1.x minor.
- **Breaking?** No. A helper would be an addition.
