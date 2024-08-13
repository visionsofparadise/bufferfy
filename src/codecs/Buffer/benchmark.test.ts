import { Codec } from "../..";
import { benchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";

const codec = Codec.Buffer({ lengthCodec: Codec.UInt(8) });

const buffer: CodecType<typeof codec> = Buffer.from([1, 2, 3, 4]);

it("benchmarks for buffer", () => {
	benchmark("buffer", buffer, codec);

	expect(true).toStrictEqual(true);
});
