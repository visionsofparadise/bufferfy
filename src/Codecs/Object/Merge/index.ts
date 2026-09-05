import { ObjectCodec } from "..";
import type { AbstractCodec } from "../../Abstract";

export type UnionToIntersection<Union> = (Union extends unknown ? (distributedUnion: Union) => void : never) extends (
	mergedIntersection: infer Intersection,
) => void
	? Intersection & Union
	: never;

/**
 * Creates a new object codec from the merging of provided codecs.
 *
 * @param	{Array<ObjectCodec>} objectCodecs - Object codecs to merge.
 * @return	{ObjectCodec} ObjectCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Object/Merge/index.ts|Source}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mergeObjectCodecs = <const ObjectCodecs extends Array<ObjectCodec<any>>>(
	objectCodecs: ObjectCodecs,
): ObjectCodec<UnionToIntersection<ObjectCodecs[number]["properties"]>> => {
	const properties: Record<string, AbstractCodec> = {};

	for (const objectCodec of objectCodecs)
		for (const [key, codec] of objectCodec.entries) properties[key as string] = codec;

	return new ObjectCodec(properties as unknown as UnionToIntersection<ObjectCodecs[number]["properties"]>);
};
