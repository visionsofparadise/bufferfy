import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

/**
 * Creates a recursive codec.
 *
 * Serializes to ```N/A```
 *
 * Uses the input codec serialization.
 *
 * @param	{(DeferredCodec<Value>) => AbstractCodec} recursion - Function that provides a deferred codec that resolves to the returned codec.
 * @return	{RecursiveCodec} RecursiveCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Recursive/index.ts|Source}
 */
export const createRecursiveCodec = <const Value>(recursion: (self: DeferredCodec<Value>) => AbstractCodec<Value>) => {
	return new RecursiveCodec(recursion);
};

export class RecursiveCodec<const Value> extends AbstractCodec<Value> {
	public readonly codec: AbstractCodec<Value>;

	constructor(public readonly recursion: (self: DeferredCodec<Value>) => AbstractCodec<Value>) {
		super();

		this.codec = recursion(new DeferredCodec(this));
	}

	isValid(value: unknown): value is Value {
		return this.codec.isValid(value);
	}

	byteLength(value: Value): number {
		return this.codec.byteLength(value);
	}

	_encode(value: Value, writer: Writer): void {
		return this.codec._encode(value, writer);
	}

	_decode(reader: Reader): Value {
		return this.codec._decode(reader);
	}
}

export class DeferredCodec<const Value> extends AbstractCodec<Value> {
	constructor(public readonly recursiveCodec: RecursiveCodec<Value>) {
		super();
	}

	isValid(value: unknown): value is Value {
		return this.recursiveCodec.codec.isValid(value);
	}

	byteLength(value: Value): number {
		return this.recursiveCodec.codec.byteLength(value);
	}

	_encode(value: Value, writer: Writer): void {
		return this.recursiveCodec.codec._encode(value, writer);
	}

	_decode(reader: Reader): Value {
		return this.recursiveCodec.codec._decode(reader);
	}
}
