import { Context } from "../../utilities/Context";
import { LengthOptions } from "../../utilities/Length";
import { PointableOptions } from "../../utilities/Pointable";
import { Simplify } from "../../utilities/Simplify";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { PointerCodec } from "../Pointer";
import { UIntCodec } from "../UInt";
import { VarUIntCodec } from "../VarUInt";

export interface RecordCodecOptions extends LengthOptions, PointableOptions {}

export class RecordCodec<Key extends string | number, Value extends any> extends AbstractCodec<Record<Key, Simplify<Value>>> {
	private readonly _length?: number;
	private readonly _lengthPointer?: PointerCodec<number>;
	private readonly _lengthCodec: UIntCodec | VarUIntCodec;

	constructor(public readonly keyCodec: AbstractCodec<Key>, public readonly valueCodec: AbstractCodec<Value>, options?: RecordCodecOptions) {
		super();

		this._id = options?.id;
		this._length = options?.length;
		this._lengthPointer = options?.lengthPointer;
		this._lengthCodec = options?.lengthCodec || new VarUIntCodec();
	}

	match(value: any, context: Context = new Context()): value is Record<Key, Value> {
		if (!value || typeof value !== "object") return false;

		const keys = Object.keys(value);

		let index = keys.length;

		while (index--) {
			const key = keys[index] as Key;

			if (!this.keyCodec.match(key, context)) return false;
			if (!this.valueCodec.match(value[key], context)) return false;
		}

		this.setContext(value, context);

		return true;
	}

	encodingLength(value: Record<Key, Value>, context: Context = new Context()): number {
		this.setContext(value, context);

		const keys = Object.keys(value);

		let length = 0;
		let index = keys.length;

		while (index--) {
			const key = keys[index] as Key;

			length += this.keyCodec.encodingLength(key, context) + this.valueCodec.encodingLength(value[key], context);
		}

		if (this._length || this._lengthPointer) return length;

		return this._lengthCodec.encodingLength(length, context) + length;
	}

	write(value: Record<Key, Value>, stream: Stream, context: Context = new Context()): void {
		this.setContext(value, context);

		const keys = Object.keys(value);

		if (!this._length && !this._lengthPointer) this._lengthCodec.write(keys.length, stream, context);

		let index = keys.length;

		while (index--) {
			const key = keys[index] as Key;

			this.keyCodec.write(key, stream, context);
			this.valueCodec.write(value[key], stream, context);
		}
	}

	read(stream: Stream, context: Context = new Context()): Record<Key, Value> {
		const value: Partial<Record<Key, Value>> = {};

		let index = this._length || this._lengthPointer?.getValue(context) || this._lengthCodec.read(stream, context);

		while (index--) {
			const propertyKey = this.keyCodec.read(stream, context);
			const propertyValue = this.valueCodec.read(stream, context);

			value[propertyKey] = propertyValue;
		}

		this.setContext(value as Record<Key, Value>, context);

		return value as Record<Key, Value>;
	}
}

export function createRecordCodec<Key extends string | number, Value>(...parameters: ConstructorParameters<typeof RecordCodec<Key, Value>>): RecordCodec<Key, Value> {
	return new RecordCodec<Key, Value>(...parameters);
}
