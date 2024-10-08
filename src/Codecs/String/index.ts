import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { StringFixedCodec } from "./Fixed";
import { StringVariableCodec } from "./Variable";

export type StringCodec = StringFixedCodec | StringVariableCodec;

/**
 * Creates a codec for a variable length string.
 *
 * Serializes to ```[LENGTH][STRING]```
 *
 * Length is present only for variable length strings.
 *
 * @param	{BufferEncoding} [encoding="utf8"] - The strings encoding.
 * @param	{AbstractCodec<number>} [lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{StringCodec} StringCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/String/index.ts|Source}
 */
export function createStringCodec(encoding?: BufferEncoding, lengthCodec?: AbstractCodec<number>): StringVariableCodec;

/**
 * Creates a codec for a fixed length string.
 *
 * Serializes to ```[STRING]```
 *
 * Length is present only for variable length strings.
 *
 * @param	{BufferEncoding} [encoding="utf8"] - The strings encoding.
 * @param	{number} [byteLength] - Sets a fixed byte length.
 * @return	{StringCodec} StringCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/String/index.ts|Source}
 */
export function createStringCodec(encoding?: BufferEncoding, byteLength?: number): StringFixedCodec;

export function createStringCodec(encoding: BufferEncoding = "utf8", byteLengthOrCodec: number | AbstractCodec<number> = new VarInt60Codec()): StringCodec {
	if (typeof byteLengthOrCodec === "number") {
		return new StringFixedCodec(byteLengthOrCodec, encoding);
	}

	return new StringVariableCodec(encoding, byteLengthOrCodec);
}
