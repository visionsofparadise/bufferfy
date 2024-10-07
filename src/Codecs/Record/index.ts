import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { RecordFixedCodec } from "./Fixed";
import { RecordVariableCodec } from "./Variable";

export type RecordCodec<Key extends string, Value> = RecordFixedCodec<Key, Value> | RecordVariableCodec<Key, Value>;

/**
 * Creates a codec for a fixed size record or map of keys and values.
 *
 * Serializes to ```[...[[KEY][VALUE]]]```
 *
 * Length is present only for variable length records.
 *
 * @param	{AbstractCodec<string>} keyCodec - Codec for keys.
 * @param	{AbstractCodec} valueCodec - Codec for values.
 * @param	{number} length - Sets a fixed length.
 * @return	{RecordCodec} RecordCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Record/index.ts|Source}
 */
export function createRecordCodec<Key extends string, Value>(keyCodec: AbstractCodec<Key>, valueCodec: AbstractCodec<Value>, length: number): RecordFixedCodec<Key, Value>;

/**
 * Creates a codec for a variable size record or map of keys and values.
 *
 * Serializes to ```[LENGTH][...[[KEY][VALUE]]]```
 *
 * Length is present only for variable length records.
 *
 * @param	{AbstractCodec<string>} keyCodec - Codec for keys.
 * @param	{AbstractCodec} valueCodec - Codec for values.
 * @param	{AbstractCodec<number>} [options.lengthCodec="VarUInt()"] - Codec to specify how the length is encoded.
 * @return	{RecordCodec} RecordCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Record/index.ts|Source}
 */
export function createRecordCodec<Key extends string, Value>(keyCodec: AbstractCodec<Key>, valueCodec: AbstractCodec<Value>, lengthCodec?: AbstractCodec<number>): RecordVariableCodec<Key, Value>;

export function createRecordCodec<Key extends string, Value>(
	keyCodec: AbstractCodec<Key>,
	valueCodec: AbstractCodec<Value>,
	lengthOrCodec: number | AbstractCodec<number> = new VarInt60Codec()
): RecordCodec<Key, Value> {
	if (typeof lengthOrCodec === "number") return new RecordFixedCodec(lengthOrCodec, keyCodec, valueCodec);

	return new RecordVariableCodec(keyCodec, valueCodec, lengthOrCodec);
}
