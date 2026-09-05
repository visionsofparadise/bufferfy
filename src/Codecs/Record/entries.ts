import type { Reader } from "../../utilities/Reader";
import type { AbstractCodec } from "../Abstract";

export const decodeEntries = <Key extends string, Value>(
	length: number,
	keyCodec: AbstractCodec<Key>,
	valueCodec: AbstractCodec<Value>,
	reader: Reader,
): Record<Key, Value> => {
	const value: Partial<Record<Key, Value>> = {};

	let index = length;

	while (index--) value[keyCodec._decode(reader)] = valueCodec._decode(reader);

	return value as Record<Key, Value>;
};
