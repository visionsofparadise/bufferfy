import { ObjectCodec } from "..";
import { AbstractCodec } from "../../Abstract";

/**
 * Creates a new object codec omitted selected keys.
 *
 * @param	{ObjectCodec} objectCodec - Object codec.
 * @param	{Array<keyof Properties>} keys - Keys to omit.
 * @return	{ObjectCodec} ObjectCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/Omit/index.ts|Source}
 */
export const omitObjectCodec = <Properties extends Record<string, AbstractCodec>, Key extends keyof Properties>(
	objectCodec: ObjectCodec<Properties>,
	keys: Array<Key>
): ObjectCodec<Omit<Properties, Key>> => {
	const keySet = new Set<Key>(keys);

	const pickedProperties: Partial<Record<Exclude<keyof Properties, Key>, AbstractCodec>> = {};

	for (const [key, codec] of objectCodec.entries) if (!keySet.has(key as Key)) pickedProperties[key as Exclude<keyof Properties, Key>] = codec;

	return new ObjectCodec(pickedProperties as Omit<Properties, Key>);
};
