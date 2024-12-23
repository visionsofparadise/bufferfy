import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { BytesFixedCodec } from "./Fixed";
import { BytesVariableCodec } from "./Variable";

export type BytesCodec = BytesFixedCodec | BytesVariableCodec;

/**
 * Creates a codec for a variable length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * Length is present only for variable length buffers.
 *
 * @param	{AbstractCodec<number>} [lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{BytesCodec} BytesCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Bytes/index.ts|Source}
 */
export function createBytesCodec(lengthCodec?: AbstractCodec<number>): BytesVariableCodec;

/**
 * Creates a codec for a fixed length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * Length is present only for variable length buffers.
 *
 * @param	{number} length - Sets a fixed length.
 * @return	{BytesCodec} BytesCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Bytes/index.ts|Source}
 */
export function createBytesCodec(length: number): BytesFixedCodec;

export function createBytesCodec(lengthOrCodec: number | AbstractCodec<number> = new VarInt60Codec()): BytesCodec {
	if (typeof lengthOrCodec === "number") return new BytesFixedCodec(lengthOrCodec);

	return new BytesVariableCodec(lengthOrCodec);
}
