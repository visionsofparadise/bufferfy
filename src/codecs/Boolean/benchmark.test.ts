import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Boolean();

const boolean: CodecType<typeof codec> = true;

it("benchmarks for boolean", () => {
	benchmark("boolean", boolean, codec);

	expect(true).toStrictEqual(true);
});
