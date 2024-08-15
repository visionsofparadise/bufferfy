import { Context } from "../../utilities/Context";
import { LengthOptions } from "../../utilities/Length";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { PointerCodec } from "../Pointer";
import { UIntCodec } from "../UInt";
import { VarUIntCodec } from "../VarUInt";

export interface ArrayCodecOptions extends LengthOptions, PointableOptions {}

export class ArrayCodec<Item extends any> extends AbstractCodec<Array<Item>> {
	private readonly _itemCodec: AbstractCodec<Item>;
	private readonly _length?: number;
	private readonly _lengthPointer?: PointerCodec<number>;
	private readonly _lengthCodec: UIntCodec | VarUIntCodec;

	constructor(itemCodec: AbstractCodec<Item>, options?: ArrayCodecOptions) {
		super();

		this._itemCodec = itemCodec;
		this._id = options?.id;
		this._length = options?.length;
		this._lengthPointer = options?.lengthPointer;
		this._lengthCodec = options?.lengthCodec || new VarUIntCodec();
	}

	match(value: any, context: Context): value is Array<Item> {
		const isMatch = Array.isArray(value) && value.every((value) => this._itemCodec.match(value, context));

		if (isMatch) this.setContext(value, context);

		return isMatch;
	}

	encodingLength(value: Array<Item>, context: Context = new Context()): number {
		this.setContext(value, context);

		let length = 0;
		let index = value.length;

		while (index--) length += this._itemCodec.encodingLength(value[index], context);

		if (this._length || this._lengthPointer) return length;

		return this._lengthCodec.encodingLength(length, context) + length;
	}

	write(value: Array<Item>, stream: Stream, context: Context): void {
		this.setContext(value, context);

		if (!this._length && !this._lengthPointer) this._lengthCodec.write(value.length, stream, context);

		let index = value.length;

		while (index--) this._itemCodec.write(value[value.length - (index + 1)], stream, context);
	}

	read(stream: Stream, context: Context): Array<Item> {
		const value: Array<Item> = [];

		const length = this._length || this._lengthPointer?.getValue(context) || this._lengthCodec.read(stream, context);

		let index = length;

		while (index--) value[length - (index + 1)] = this._itemCodec.read(stream, context);

		this.setContext(value, context);

		return value;
	}
}

export function createArrayCodec<Item>(...parameters: ConstructorParameters<typeof ArrayCodec<Item>>) {
	return new ArrayCodec<Item>(...parameters);
}
