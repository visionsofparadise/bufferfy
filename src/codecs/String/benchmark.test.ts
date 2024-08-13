import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.String({ lengthCodec: Codec.UInt(8) });

const string: CodecType<typeof codec> = "test";

it("benchmarks for string", () => {
	benchmark("string", string, codec);

	expect(true).toStrictEqual(true);
});
