export class ValidatonError extends Error {
  constructor(issues) {
    super(issues[0]?.message ?? "Invalid request payload")
    this.name = "ValidatonError"
    this.issues = issues
  }
}

export function createSchema(validator) {
  return {
    parse(input) {
      const result = validator(input)

      if (result.issues.length) {
        throw new ValidatonError(result.issues)
      }

      return result.data
    },
    safeParse(input) {
      try {
        return {
          data: this.parse(input),
          success: true
        }
      } catch (error) {
        if (error instanceof ValidatonError) {
          return {
            error,
            success: false
          }
        }

        throw error
      }
    }
  }
}

export function issue(path, message) {
  return {
    message,
    path: Array.isArray(path) ? path : [path]
  }
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function isValidationError(error) {
  return error instanceof ValidatonError
}