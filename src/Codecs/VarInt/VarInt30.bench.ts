import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { VarInt30Codec } from "./VarInt30";

const codec = new VarInt30Codec();
const value: CodecType<typeof codec> = 2 ** 30 - 1;

createBenchmark("VarInt30", value, codec);
