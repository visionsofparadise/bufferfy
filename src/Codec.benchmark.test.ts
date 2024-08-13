import { benchmark } from "./utilities/benchmark";
import { CommonCodec, commonValue, SpreadCodec, spreadValue } from "./utilities/TestValues";

it("benchmarks for spread of all types", () => {
	benchmark("typeSpread", spreadValue, SpreadCodec);

	expect(true).toStrictEqual(true);
});

it("benchmarks for many common types", () => {
	benchmark("typeCommon", commonValue, CommonCodec);

	expect(true).toStrictEqual(true);
});
