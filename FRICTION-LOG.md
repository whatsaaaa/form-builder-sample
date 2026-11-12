# Friction log

Release-candidate trial of form-builder `1.0.0-rc.0`, built from public material only.

## Summary

**Could each app be built from the allowed sources alone?**

- **Vue event registration: yes.** Docs, npm packages and Formisch's public API were enough. No step needed anything else.
- **React checkout with a server: yes.** The same, plus Valibot's and Hono's public docs. Two parts of it, starting a form with given values and showing the server's errors, are not covered by the form-builder docs and were solved with Formisch's public API.

**Does any finding need a breaking change to the JSON format or the public API? No.** All ten suggested fixes are documentation changes, packaging changes or additions.

**The most important problems**, in the order I would fix them before 1.0.0 final:

1. **F-06** (major): switching the language the documented way remounts the form and loses what the user typed, and `useJsonForm` has no `initialInput`. The same gap blocks any "edit an existing record" form.
2. **F-07** (major): the server validation guide ends at the server. How to show its errors on the fields is undocumented, and the `as never` hint from the TypeScript guide does not compile for `setErrors`.
3. **F-01** (major on release day): with pnpm 11, `pnpm add @whatsaaaa/form-builder-affects@rc` resolves to a broken `0.0.0-stage` placeholder for the first day after a release.
4. **F-04** (minor, but a docs error): with the documented Next button, Enter in a text input does nothing, though two pages say it moves on.

| Id   | Finding                                                               | Type                         | Severity             | Breaking? |
| ---- | --------------------------------------------------------------------- | ---------------------------- | -------------------- | --------- |
| F-01 | `@rc` of the affects package installs a broken placeholder on pnpm 11 | bug (packaging)              | major on release day | No        |
| F-02 | No obvious way to set the message of an `email` field's own check     | docs gap                     | minor                | No        |
| F-03 | No example component for checkbox, radio, multiselect or textarea     | docs gap                     | minor                | No        |
| F-04 | The documented Next button makes "Enter moves on" unreachable         | docs error                   | minor                | No        |
| F-05 | A read-only review of the answers has to be written by hand           | docs gap                     | minor                | No        |
| F-06 | Language switch loses the input, `useJsonForm` takes no initial input | missing feature and docs gap | major                | No        |
| F-07 | Nothing says how to show the server's errors in the form              | docs gap                     | major                | No        |
| F-08 | A definition that passed `validate()` still needs a cast              | API ergonomics               | nit                  | No        |
| F-09 | The multi-step example leaves focus on the button                     | docs gap                     | nit                  | No        |
| F-10 | Choices the docs leave open: scaffold, server, language on the server | docs gap                     | nit                  | No        |

No finding is a blocker, none is an unhelpful error message from form-builder itself, and none is a bug in what the packages do at runtime.

**What worked without friction**, since that is a result too:

- Both definitions passed `validate()` on the first run, and both pass the JSON Schema the packages ship. One is a JSON file with `$schema`, the other is written with `defineForm()`.
- Steps, rows, sections, slots, groups, lists, form rules and conditions behaved exactly as the guides describe, including the edge cases I probed: a conditional step that disappears and clears, `goTo()` stopping at the first step with errors, a cleared field that comes back blank, list items that keep their inputs when one is removed.
- Server validation worked on the first try: same builder options, `v.safeParse`, conditions applied, unknown keys dropped, missing keys reported with the required message, as the guide says.
- Two languages worked as documented: keys in the definition, `resolveMessage` per builder, and `@valibot/i18n` for Valibot's own messages.
- The published types check under `strict` with TypeScript 6.0 (Vue, `vue-tsc`) and TypeScript 7.0 (React), the versions the Vite templates install today.
- Every end-to-end test of the happy paths passed the first time it ran.

**What the trial did not touch:** `file` fields, `"output": "date"`, custom field types, rules and extensions, `toJsonSchema()`, `<JsonField>` with `only` and `except`, server rendering, and the frameworks without an adapter.

## How this log was kept

- Sources used: the documentation site at <https://whatsaaaa.github.io/form-builder/>, the published npm packages and what ships inside them, and the public documentation of the third-party tools the docs lead to (Formisch, Valibot, Vue, React, Vite, Hono, pnpm, Playwright, GitHub Actions).
- Sources not used: the form-builder repository in any form, and any local copy of it.
- F-01 to F-07 were written at the moment the problem happened, in the order it happened. F-08 to F-10 were noticed during the work and written up once both apps ran.
- The source maps in the packages embed the original sources. I did not open them: the README, the type definitions and their JSDoc were enough.
- Severity: **blocker** stops the app from being built, **major** costs real time or leaves a wrong result that is easy to miss, **minor** costs minutes, **nit** is polish.
- "Breaking?" answers whether the suggested fix needs a breaking change to the JSON format or to the public API.

## Versions under test

| Package                           | Version      | Installed as            |
| --------------------------------- | ------------ | ----------------------- |
| `@whatsaaaa/form-builder-schema`  | `1.0.0-rc.0` | `@rc`                   |
| `@whatsaaaa/form-builder-vue`     | `1.0.0-rc.0` | `@rc`                   |
| `@whatsaaaa/form-builder-react`   | `1.0.0-rc.0` | `@rc`                   |
| `@whatsaaaa/form-builder-affects` | `0.2.2-rc.0` | exact version, see F-01 |

Peers as installed: `valibot` 1.5.0, `@formisch/vue` 1.2.0 with Vue 3.5.45, `@formisch/react` 1.2.0 with React 19.3.1, `@valibot/i18n` 1.3.0.

Tooling: Node 26.12.0 locally and Node 24 in CI, pnpm 11.27.0, Vite 8.3.8, TypeScript 6.0.3 (Vue app) and 7.0.2 (React app), macOS. Trial run on 2026-11-12, about 16 hours after the release candidates were published.

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
- **Cause, as far as the allowed sources show:** pnpm 11 holds back versions younger than one day by default (`minimumReleaseAge`), and `0.2.2-rc.0` was 16 hours old. For the schema, Vue and React packages pnpm took the release candidate anyway and wrote it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. For affects it fell back to an older version instead, and picked `0.0.0-stage`. I can't tell from the outside why only affects fell back. The visible difference is that its release candidate is not a new major: `0.2.2-rc.0`, against `1.0.0-rc.0` for the others. Every one of the four packages has a `0.0.0-stage` version on npm: a 378-byte placeholder with only a `package.json` and a README, whose tarball pnpm 11 refuses to unpack. The same happened again when I installed the React app an hour later.
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

### F-06 - Switching the language the documented way throws away what the user typed, and `useJsonForm` takes no initial input

- **App and step:** React app, the language switch.
- **Trying to:** let the user switch between English and German in the middle of the checkout.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/guide/messages#translating-your-messages>, <https://whatsaaaa.github.io/form-builder/frameworks/react#usage>, <https://whatsaaaa.github.io/form-builder/api/react/useJsonForm>, <https://whatsaaaa.github.io/form-builder/api/react/UseJsonFormOptions>
- **What happened:** the messages page says to build one builder per language and to "build the form again when the language changes". The React page says the builder is read on the first render, and to give the component a new `key` for another definition. I did both: `<CheckoutForm key={locale} />` with `builders[locale]`. It works, and every message and label changes language. It also remounts the form, so the email, the items and everything else the user typed are gone. Nothing on either page warns about that, and `useJsonForm` has no option to start with given values: its options are `builder`, `components`, `layoutComponents`, `validate` and `revalidate`. Formisch's own `useForm` has `initialInput`, but the adapter creates the form and does not pass one through.
- **Expected:** a way to give `useJsonForm` the values to start with. The same is needed for any form that edits an existing record, which the docs never show.
- **Got past it:** yes, with Formisch's public API. The parent reads the old form's input through a ref (`getInput(form)`) just before it changes the language, and the new form calls `reset(form, { initialInput })` in a layout effect right after its first render. That needs a ref handle, an effect, an `as never` cast, and the knowledge that Formisch's `reset` takes a new initial input, none of which the form-builder docs mention. Errors that were on show are gone after the switch.
- **Type:** missing feature, and a docs gap around it.
- **Severity:** major. Editing existing data and switching languages are everyday needs, and the documented path loses user input without saying so.
- **Suggested fix:** add an `initialInput` option to `useJsonForm` in both adapters, merged over the definition's defaults, and say on the messages page that the rebuilt form starts empty unless it is passed. Until then, document the `reset(form, { initialInput })` workaround. Longer term, a way to change the language without a new form would be better still, for example messages resolved when an issue is reported instead of when the schema is built.
- **Breaking?** No. An option is an addition. Resolving messages at parse time could be done behind the same `resolveMessage` option.

### F-07 - The server validation guide stops at the server: nothing says how to show its errors in the form

- **App and step:** React app, showing a rejected order.
- **Trying to:** put the messages of the server's 422 answer on the fields they belong to.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/guide/server-validation>, <https://whatsaaaa.github.io/form-builder/guide/typescript#typing-the-form>, <https://whatsaaaa.github.io/form-builder/frameworks/react>, <https://whatsaaaa.github.io/form-builder/api/schema/toFieldPath>
- **What happened:** the server half was easy and worked first time: same builder options, `v.safeParse`, a 422 with the messages. The guide ends there. For the browser half I had to find three things on my own:
  1. The guide's answer is `v.flatten(result.issues).nested`, keyed by dot path (`lines.0.quantity`). Formisch wants a path array (`['lines', 0, 'quantity']`), and nothing turns one into the other. `toFieldPath()` takes a `dataPath` and indexes, not a dot path. I changed the server to send each issue's path as an array instead, from `issue.path.map((item) => item.key)`.
  2. Formisch's `setErrors(form, { path, errors })` and `focus(form, { path })` are the functions to call. No form-builder page names them.
  3. The TypeScript guide says paths that come from data "still need `as never` for Formisch". That compiles for `focus`, but not for `setErrors`: `setErrors(form, { path: path as never, errors })` fails with `Argument of type '{ path: never; errors: ... }' is not assignable to parameter of type 'never'`, because Formisch picks the config type from the path type. The cast has to go on the whole config: `setErrors(form, { path, errors } as never)`. A search afterwards found that exact form once on the site, inside the step code of <https://whatsaaaa.github.io/form-builder/frameworks/formisch>, a page for people who write their own renderer.
- **Expected:** a "show the errors in the form" section in the server validation guide, since that is the reason to send them back.
- **Got past it:** yes, in about 40 minutes. The end-to-end test `shows the server rejecting an order that got past the browser` covers it.
- **Type:** docs gap.
- **Severity:** major. Server validation is a headline feature, and half of the round trip is undocumented.
- **Suggested fix:** extend the guide with the browser half: return `issues.map((issue) => ({ path: issue.path?.map((item) => item.key) ?? [], message: issue.message }))` from the server, and set them with `setErrors(form, { path, errors } as never)`, then `focus`. Say where the `as never` goes. A small helper in the adapters, like `setIssues(jsonForm, issues)`, would remove the cast from user code.
- **Breaking?** No.

### F-08 - A definition that passed `validate()` still needs a cast to `JsonForm`

- **App and step:** both apps, loading a definition from outside the code (a JSON file in the Vue app, the server's answer in the React app).
- **Trying to:** go from `unknown` to a `JsonForm` that `useJsonForm` takes, without a type assertion.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/guide/getting-started#check-it>, <https://whatsaaaa.github.io/form-builder/guide/checking-definitions>
- **What happened:** `validate(json)` returns `{ success, issues }`. A successful result does not narrow `json` and carries no typed definition, so the documented pattern ends with `return json as JsonForm`. It is the docs' own example, so it is clearly intended, but the one place where the library has proven the shape is the place where user code has to assert it.
- **Expected:** the checked definition, typed, on a successful result.
- **Got past it:** yes, with the cast from the docs.
- **Type:** API ergonomics.
- **Severity:** nit.
- **Suggested fix:** add `definition: JsonForm` to the successful result, or make `validate` a type guard overload. Strict lint setups that forbid assertions would then pass without an exception.
- **Breaking?** No. A new property on the result is an addition.

### F-09 - The multi-step example leaves the keyboard focus on the button when the step changes

- **App and step:** Vue app, moving between steps.
- **Trying to:** make a step change noticeable for keyboard and screen reader users.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/frameworks/multi-step-forms>
- **What happened:** the adapter focuses the first field with an error when Next fails, which is good. When Next succeeds, the fields are swapped under an unchanged button, focus stays on that button, and nothing tells assistive technology that a new step is on show. The page does not mention it. I added a watcher on `jsonForm.steps.current` that focuses the step's heading.
- **Expected:** a sentence and three lines of code in the example, since every multi-step form needs it.
- **Got past it:** yes.
- **Type:** docs gap.
- **Severity:** nit.
- **Suggested fix:** show the focus move in the multi-step example of both frameworks, or mention it under "Rendering steps".
- **Breaking?** No.

### F-10 - Choices the docs leave open

- **App and step:** both apps, project setup.
- **Trying to:** start a project the way the docs intend.
- **Docs consulted:** <https://whatsaaaa.github.io/form-builder/guide/installation>, <https://whatsaaaa.github.io/form-builder/guide/getting-started>, <https://whatsaaaa.github.io/form-builder/frameworks/vue>, <https://whatsaaaa.github.io/form-builder/frameworks/react>, <https://whatsaaaa.github.io/form-builder/guide/server-validation>
- **What happened:** the docs start at "install the packages" and assume a project exists. They name no scaffold or bundler, no server framework and no test setup. That is a fair scope for a library, and nothing went wrong, but each choice was mine. I took the mainstream option every time:
  - **Project and bundler:** `pnpm create vite` with the `vue-ts` and `react-ts` templates (Vite 8). The React template installs TypeScript 7.0, the Vue one 6.0. Both worked.
  - **Server:** the guide shows a bare `handleSignup(body)` function. I used Hono on Node, because the guide's file upload example already speaks `Request` and `FormData`.
  - **Where the definition lives:** the guide says "use the same definition" and suggests an id the form sends along, without an example. I let the server serve the definition with an id, and refuse an order made with another id (409).
  - **Where the language comes from on the server:** not covered. I read `Accept-Language` and pass `{ lang }` to `v.safeParse` for Valibot's own messages, since `setGlobalConfig` is one setting for the whole process.
- **Expected:** nothing more, strictly. A pointer would have saved the thinking.
- **Got past it:** yes.
- **Type:** docs gap.
- **Severity:** nit.
- **Suggested fix:** one line in getting started ("any Vite project works, for example `pnpm create vite`"), and in the server guide a note that a server with several languages passes `lang` per parse instead of setting it globally.
- **Breaking?** No.
