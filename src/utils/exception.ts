export interface AppException {
	code: number;
	message: string;
	stacktrace?: any;
}

export class PokemonException extends Error implements AppException {
	code: number;
	stacktrace?: any;

	constructor(exception: AppException) {
		super(exception.message);
		this.code = exception.code;
		this.stacktrace = exception.stacktrace;

		// Capture stack trace, excluding constructor call from it
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, PokemonException);
		}
	}
}

export class Exception {
	static mandatory(parameter?: string): AppException {
		let message = "The input object parameter is mandatory";

		if (parameter) {
			message = `The parameter ${parameter} is mandatory`;
		}

		return new PokemonException({
			code: 400,
			message,
			stacktrace: undefined,
		});
	}

	static generic(stacktrace?: any, message?: string): AppException {
		return new PokemonException({
			code: 500,
			message: message || "Generic error",
			stacktrace,
		});
	}

	static notFound(objectName: string): AppException {
		return new PokemonException({
			code: 404,
			message: `The ${objectName} was not found`,
		});
	}
}
