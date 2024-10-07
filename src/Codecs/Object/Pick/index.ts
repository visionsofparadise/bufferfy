import { ObjectCodec } from "..";
import { AbstractCodec } from "../../Abstract";

/**
 * Creates a new object codec with selected keys.
 *
 * @param	{ObjectCodec} objectCodec - Object codec.
 * @param	{Array<keyof Properties>} keys - Keys to pick.
 * @return	{ObjectCodec} ObjectCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/Pick/index.ts|Source}
 */
export const pickObjectCodec = <Properties extends Record<string, AbstractCodec>, Key extends keyof Properties>(
	objectCodec: ObjectCodec<Properties>,
	keys: Array<Key>
): ObjectCodec<Pick<Properties, Key>> => {
	const keySet = new Set<Key>(keys);

	const pickedProperties: Partial<Record<Key, AbstractCodec>> = {};

	for (const [key, codec] of objectCodec.entries) if (keySet.has(key as Key)) pickedProperties[key as Key] = codec;

	return new ObjectCodec(pickedProperties as Pick<Properties, Key>);
};
