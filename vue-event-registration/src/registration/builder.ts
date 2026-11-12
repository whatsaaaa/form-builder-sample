import { affects } from '@whatsaaaa/form-builder-affects'
import {
  createSchemaBuilder,
  formatPath,
  type JsonForm,
} from '@whatsaaaa/form-builder-schema'

/** The one builder of the app: the built-in types and rules, plus conditions. */
export const builder = createSchemaBuilder({ extensions: [affects()] })

/** A definition that failed `validate()`, with every problem found in it. */
export class InvalidDefinitionError extends Error {
  readonly problems: readonly string[]

  constructor(problems: readonly string[]) {
    super(`The form definition has ${problems.length} problem(s)`)
    this.name = 'InvalidDefinitionError'
    this.problems = problems
  }
}

/**
 * Checks a definition that comes from outside the code, like this app's JSON file, before it is
 * rendered. Throws an `InvalidDefinitionError` that lists every problem.
 */
export function loadDefinition(json: unknown): JsonForm {
  const result = builder.validate(json)
  if (!result.success) {
    throw new InvalidDefinitionError(
      result.issues.map(
        (issue) => `${formatPath(issue.path)}: ${issue.message}`,
      ),
    )
  }
  return json as JsonForm
}
