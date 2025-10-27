/**
 * Base error class for all bufferfy errors.
 * Contains optional context about where and why the error occurred.
 */
export class BufferfyError extends Error {
	constructor(
		message: string,
		public readonly codecName?: string,
		public readonly offset?: number,
		public readonly context?: unknown,
	) {
		super(message);
		this.name = "BufferfyError";
	}
}

/**
 * Thrown when buffer doesn't have enough bytes remaining for decode operation.
 */
export class BufferfyByteLengthError extends BufferfyError {
	constructor(required?: number, available?: number, offset?: number) {
		const message =
			required !== undefined && available !== undefined
				? `Buffer too short: need ${required} bytes, have ${available} at offset ${offset ?? 0}`
				: "Buffer is not of sufficient byteLength to decode.";

		super(message, undefined, offset);
		this.name = "BufferfyByteLengthError";
	}
}

/**
 * Thrown when a value doesn't pass codec validation.
 */
export class BufferfyValidationError extends BufferfyError {
	constructor(codecName: string, value: unknown) {
		super(`Value does not match codec ${codecName}`, codecName, undefined, { value });
		this.name = "BufferfyValidationError";
	}
}

/**
 * Thrown when no codec in a union matches the value.
 */
export class BufferfyUnionError extends BufferfyError {
	constructor(value: unknown, attemptedCodecs: string[]) {
		super(
			`Value does not match any codec in union: tried [${attemptedCodecs.join(", ")}]`,
			"UnionCodec",
			undefined,
			{ value, attempted: attemptedCodecs },
		);
		this.name = "BufferfyUnionError";
	}
}

/**
 * Thrown when a value or index is out of allowed range.
 */
export class BufferfyRangeError extends BufferfyError {
	constructor(message: string, codecName: string, value: unknown, limit?: number, offset?: number) {
		super(message, codecName, offset, { value, limit });
		this.name = "BufferfyRangeError";
	}
}
