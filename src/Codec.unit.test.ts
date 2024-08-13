import { Context } from "./utilities/Context";
import { CommonCodec, commonValue, SpreadCodec, spreadValue } from "./utilities/TestValues";

describe("encodes and decodes spread of types", () => {
	const context = new Context();

	const length = SpreadCodec.encodingLength(spreadValue, context);

	let buffer: Buffer | undefined;

	it("encodes all types", () => {
		buffer = SpreadCodec.encode(spreadValue);

		expect(buffer.byteLength).toBe(length);
		expect(buffer.byteLength).toBe(51);
	});

	it("decodes all types", () => {
		const resultValue = SpreadCodec.decode(buffer!);

		expect(resultValue).toStrictEqual(spreadValue);
	});
});

describe("encodes and decodes common types", () => {
	const context = new Context();

	const length = CommonCodec.encodingLength(commonValue, context);

	let buffer: Buffer | undefined;

	it("encodes all types", () => {
		buffer = CommonCodec.encode(commonValue);

		expect(buffer.byteLength).toBe(length);
		expect(buffer.byteLength).toBe(1056);
	});

	it("decodes all types", () => {
		const resultValue = CommonCodec.decode(buffer!);

		expect(resultValue).toStrictEqual(commonValue);
	});
});
