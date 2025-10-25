import { AbstractCodec } from "../Abstract";

const isDeepStrictEqual = (a: unknown, b: unknown): boolean => {
	if (a === b) return true;
	if (a === null || b === null) return false;
	if (typeof a !== "object" || typeof b !== "object") return false;

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (!keysB.includes(key)) return false;
		if (!isDeepStrictEqual((a as any)[key], (b as any)[key])) return false;
	}

	return true;
};

/**
 * Creates a codec for a constant.
 *
 * Serializes to ```N/A```
 *
 * No bytes are serialized.
 *
 * @param	{any} value - Value of the constant.
 * @return	{ConstantCodec} ConstantCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Constant/index.ts|Source}
 */
export const createConstantCodec = <const Value>(value: Value) => {
	if (typeof value === "object" && value !== null) return new DeepConstantCodec(value);

	return new ConstantCodec(value);
};

export class ConstantCodec<const Value> extends AbstractCodec<Value> {
	constructor(public readonly value: Value) {
		super();
	}

	isValid(value: unknown): value is Value {
		return value === this.value;
	}

	byteLength(): number {
		return 0;
	}

	_encode(): void {
		return;
	}

	_decode(): Value {
		return this.value;
	}
}

export class DeepConstantCodec<Value> extends ConstantCodec<Value> {
	constructor(public readonly value: Value) {
		super(value);
	}

	isValid(value: unknown): value is Value {
		return isDeepStrictEqual(value, this.value);
	}
}
