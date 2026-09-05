import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import type { AbstractCodec } from "../Abstract";

export const areItemsValid = (items: Array<unknown>, itemCodec: AbstractCodec): boolean => {
	for (let index = 0; index < items.length; index++) if (!itemCodec.isValid(items[index])) return false;

	return true;
};

export const itemsByteLength = <Item>(items: Array<Item>, itemCodec: AbstractCodec<Item>): number => {
	let byteLength = 0;

	for (let index = 0; index < items.length; index++) byteLength += itemCodec.byteLength(items[index]);

	return byteLength;
};

export const encodeItems = <Item>(items: Array<Item>, itemCodec: AbstractCodec<Item>, writer: Writer): void => {
	for (let index = 0; index < items.length; index++) itemCodec._encode(items[index], writer);
};

export const decodeItems = <Item>(length: number, itemCodec: AbstractCodec<Item>, reader: Reader): Array<Item> => {
	const items = new Array<Item>(length);

	for (let index = 0; index < length; index++) items[index] = itemCodec._decode(reader);

	return items;
};
