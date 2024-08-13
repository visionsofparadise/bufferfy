import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.UInt(8);

const uInt: CodecType<typeof codec> = 27;

it("benchmarks for uInt", () => {
	benchmark("uInt", uInt, codec);

	expect(true).toStrictEqual(true);
});
