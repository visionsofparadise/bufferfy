import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Float(32);

const float: CodecType<typeof codec> = 85.32127;

it("benchmarks for float", () => {
	benchmark("float", float, codec);

	expect(true).toStrictEqual(true);
});
