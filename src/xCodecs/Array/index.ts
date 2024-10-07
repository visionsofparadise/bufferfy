import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { ArrayFixedCodec } from "./Fixed";
import { ArrayVariableCodec } from "./Variable";

export type ArrayCodec<Item> = ArrayFixedCodec<Item> | ArrayVariableCodec<Item>;

/**
 * Creates a codec for a fixed length array.
 *
 * Serializes to ```[LENGTH?][...ITEMS]```
 *
 * Length is present only for variable length arrays.
 *
 * @param	{AbstractCodec} itemCodec - The codec for each item in the array.
 * @param	{number} [length] - Sets a fixed length.
 * @return	{ArrayCodec} ArrayCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Array/index.ts|Source}
 */
export function createArrayCodec<Item>(itemCodec: AbstractCodec<Item>, length?: number): ArrayFixedCodec<Item>;

/**
 * Creates a codec for a variable length array.
 *
 * Serializes to ```[LENGTH?][...ITEMS]```
 *
 * Length is present only for variable length arrays.
 *
 * @param	{AbstractCodec} itemCodec - The codec for each item in the array.
 * @param	{AbstractCodec<number>} [lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{ArrayCodec} ArrayCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Array/index.ts|Source}
 */
export function createArrayCodec<Item>(itemCodec: AbstractCodec<Item>, lengthCodec?: AbstractCodec<number>): ArrayVariableCodec<Item>;

export function createArrayCodec<Item>(itemCodec: AbstractCodec<Item>, lengthOrCodec: number | AbstractCodec<number> = new VarInt60Codec()): ArrayCodec<Item> {
	if (typeof lengthOrCodec === "number") return new ArrayFixedCodec(lengthOrCodec, itemCodec);

	return new ArrayVariableCodec(itemCodec, lengthOrCodec);
}
