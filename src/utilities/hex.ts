const BYTE_TO_HEX: Array<string> = [];

for (let byte = 0; byte < 256; byte++) {
	BYTE_TO_HEX.push(byte.toString(16).padStart(2, "0"));
}

const CHAR_TO_NIBBLE = new Int8Array(128).fill(-1);

for (let digit = 0; digit < 10; digit++) {
	CHAR_TO_NIBBLE[0x30 + digit] = digit;
}

for (let letter = 0; letter < 6; letter++) {
	CHAR_TO_NIBBLE[0x61 + letter] = 10 + letter;
	CHAR_TO_NIBBLE[0x41 + letter] = 10 + letter;
}

export function encodeHex(bytes: Uint8Array): string {
	let result = "";

	for (let index = 0; index < bytes.length; index++) {
		result += BYTE_TO_HEX[bytes[index]];
	}

	return result;
}

export function decodeHex(value: string): Uint8Array {
	if (value.length % 2 !== 0) throw new Error(`hex string expected, got unpadded hex of length ${value.length}`);

	const bytes = new Uint8Array(value.length / 2);

	for (let index = 0; index < bytes.length; index++) {
		const high = value.charCodeAt(index * 2);
		const low = value.charCodeAt(index * 2 + 1);
		const highNibble = high < 128 ? CHAR_TO_NIBBLE[high] : -1;
		const lowNibble = low < 128 ? CHAR_TO_NIBBLE[low] : -1;

		if (highNibble === -1 || lowNibble === -1) throw new Error(`hex string expected, got non-hex character at index ${highNibble === -1 ? index * 2 : index * 2 + 1}`);

		bytes[index] = (highNibble << 4) | lowNibble;
	}

	return bytes;
}

export function hexByteLength(value: string): number {
	return value.length / 2;
}
