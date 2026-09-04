import { ARRAY_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

/**
 * Creates a codec for a tuple of values.
 *
 * Serializes to ```[...ITEMS]```
 *
 * @param	{Array<AbstractCodec>}	codecs - A series of codecs for each value of the tuple.
 * @return	{TupleCodec} TupleCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Tuple/index.ts|Source}
 */
export const createTupleCodec = <Tuple extends [...Array<any>]>(
	codecs: [
		...{
			[Index in keyof Tuple]: AbstractCodec<Tuple[Index]>;
		}
	]
) => new TupleCodec(codecs);

export class TupleCodec<Tuple extends [...Array<any>]> extends AbstractCodec<Tuple> {
	constructor(
		public readonly codecs: [
			...{
				[Index in keyof Tuple]: AbstractCodec<Tuple[Index]>;
			}
		]
	) {
		super();
	}

	isValid(value: unknown): value is Tuple {
		if (!Array.isArray(value) || value.length !== this.codecs.length) return false;

		for (let index = 0; index < this.codecs.length; index++) if (!this.codecs[index].isValid(value[index])) return false;

		return true;
	}

	override get matcher(): CodecMatcher {
		return ARRAY_MATCHER;
	}

	byteLength(value: Tuple): number {
		let byteLength = 0;

		for (let index = 0; index < this.codecs.length; index++) byteLength += this.codecs[index].byteLength(value[index]);

		return byteLength;
	}

	_encode(value: Tuple, writer: Writer): void {
		for (let index = 0; index < this.codecs.length; index++) this.codecs[index]._encode(value[index], writer);
	}

	_decode(reader: Reader): Tuple {
		const value = new Array<AbstractCodec<Tuple[number]>>(this.codecs.length);

		for (let index = 0; index < this.codecs.length; index++) value[index] = this.codecs[index]._decode(reader);

		return value as Tuple;
	}
}
