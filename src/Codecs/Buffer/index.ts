import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { BufferFixedCodec } from "./Fixed";
import { BufferVariableCodec } from "./Variable";

export type BufferCodec = BufferFixedCodec | BufferVariableCodec;

/**
 * Creates a codec for a variable length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * Length is present only for variable length buffers.
 *
 * @param	{AbstractCodec<number>} [lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{BufferCodec} BufferCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Buffer/index.ts|Source}
 */
export function createBufferCodec(lengthCodec?: AbstractCodec<number>): BufferVariableCodec;

/**
 * Creates a codec for a fixed length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * Length is present only for variable length buffers.
 *
 * @param	{number} length - Sets a fixed length.
 * @return	{BufferCodec} BufferCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Buffer/index.ts|Source}
 */
export function createBufferCodec(length: number): BufferFixedCodec;

export function createBufferCodec(lengthOrCodec: number | AbstractCodec<number> = new VarInt60Codec()): BufferCodec {
	if (typeof lengthOrCodec === "number") return new BufferFixedCodec(lengthOrCodec);

	return new BufferVariableCodec(lengthOrCodec);
}
