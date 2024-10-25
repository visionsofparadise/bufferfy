import { Context } from "../../utilities/Context";
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
export const createTupleCodec = <Tuple extends [...any[]]>(
	codecs: [
		...{
			[Index in keyof Tuple]: AbstractCodec<Tuple[Index]>;
		}
	]
) => new TupleCodec(codecs);

export class TupleCodec<Tuple extends [...any[]]> extends AbstractCodec<Tuple> {
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

		for (let i = 0; i < this.codecs.length; i++) if (!this.codecs[i].isValid(value[i])) return false;

		return true;
	}

	byteLength(value: Tuple): number {
		let byteLength = 0;

		for (let i = 0; i < this.codecs.length; i++) byteLength += this.codecs[i].byteLength(value[i]);

		return byteLength;
	}

	_encode(value: Tuple, buffer: Buffer, c: Context): void {
		for (let i = 0; i < this.codecs.length; i++) this.codecs[i]._encode(value[i], buffer, c);
	}

	_decode(buffer: Buffer, c: Context): Tuple {
		const value: Array<AbstractCodec<Tuple[number]>> = new Array(this.codecs.length);

		for (let i = 0; i < this.codecs.length; i++) value[i] = this.codecs[i]._decode(buffer, c);

		return value as Tuple;
	}
}
