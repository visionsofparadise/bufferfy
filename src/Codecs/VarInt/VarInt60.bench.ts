import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { VarInt60Codec } from "./VarInt60";

const codec = new VarInt60Codec();
const value: CodecType<typeof codec> = 2 ** 48 - 1;

createBenchmark("VarInt60", value, codec);
