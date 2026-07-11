const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Above this string length (UTF-16 code units) native encodeInto beats the manual loop; below it the loop avoids TextEncoder's fixed per-call overhead. Tuned from Codec.bench short-string fields.
export const SHORT_STRING_THRESHOLD = 48;
// Above this span length native TextDecoder beats the fromCharCode ASCII accumulation.
const DECODE_THRESHOLD = 48;

export function utf8ByteLength(value: string): number {
	const length = value.length;

	let byteLength = 0;

	for (let index = 0; index < length; index++) {
		const code = value.charCodeAt(index);

		if (code < 0x80) {
			byteLength += 1;
		} else if (code < 0x800) {
			byteLength += 2;
		} else if (code >= 0xd800 && code <= 0xdbff) {
			const next = value.charCodeAt(index + 1);

			if (next >= 0xdc00 && next <= 0xdfff) {
				byteLength += 4;
				index++;
			} else {
				// Lone high surrogate encodes as U+FFFD (3 bytes), matching TextEncoder.
				byteLength += 3;
			}
		} else if (code >= 0xdc00 && code <= 0xdfff) {
			// Lone low surrogate encodes as U+FFFD (3 bytes), matching TextEncoder.
			byteLength += 3;
		} else {
			byteLength += 3;
		}
	}

	return byteLength;
}

export function encodeUtf8Into(value: string, buffer: Uint8Array, offset: number): number {
	const length = value.length;

	if (length > SHORT_STRING_THRESHOLD) {
		return textEncoder.encodeInto(value, buffer.subarray(offset)).written;
	}

	let position = offset;

	for (let index = 0; index < length; index++) {
		let code = value.charCodeAt(index);

		if (code < 0x80) {
			buffer[position++] = code;
		} else if (code < 0x800) {
			buffer[position++] = 0xc0 | (code >> 6);
			buffer[position++] = 0x80 | (code & 0x3f);
		} else if (code >= 0xd800 && code <= 0xdbff) {
			const next = value.charCodeAt(index + 1);

			if (next >= 0xdc00 && next <= 0xdfff) {
				code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
				index++;

				buffer[position++] = 0xf0 | (code >> 18);
				buffer[position++] = 0x80 | ((code >> 12) & 0x3f);
				buffer[position++] = 0x80 | ((code >> 6) & 0x3f);
				buffer[position++] = 0x80 | (code & 0x3f);
			} else {
				// Lone high surrogate → U+FFFD, matching TextEncoder.
				buffer[position++] = 0xef;
				buffer[position++] = 0xbf;
				buffer[position++] = 0xbd;
			}
		} else if (code >= 0xdc00 && code <= 0xdfff) {
			// Lone low surrogate → U+FFFD, matching TextEncoder.
			buffer[position++] = 0xef;
			buffer[position++] = 0xbf;
			buffer[position++] = 0xbd;
		} else {
			buffer[position++] = 0xe0 | (code >> 12);
			buffer[position++] = 0x80 | ((code >> 6) & 0x3f);
			buffer[position++] = 0x80 | (code & 0x3f);
		}
	}

	return position - offset;
}

export function decodeUtf8(buffer: Uint8Array, start: number, end: number): string {
	if (end - start > DECODE_THRESHOLD) {
		return textDecoder.decode(buffer.subarray(start, end));
	}

	for (let index = start; index < end; index++) {
		if (buffer[index] >= 0x80) {
			// Non-ASCII byte: defer the whole span to TextDecoder so multibyte and invalid sequences match its replacement behavior exactly.
			return textDecoder.decode(buffer.subarray(start, end));
		}
	}

	let result = "";

	for (let index = start; index < end; index++) {
		result += String.fromCharCode(buffer[index]);
	}

	return result;
}
