import { createBenchmark } from "../../utilities/benchmark";
import { CodecType } from "../Abstract";
import { VarInt15Codec } from "./VarInt15";

const codec = new VarInt15Codec();
const value: CodecType<typeof codec> = 2 ** 15 - 1;

createBenchmark("VarInt15", value, codec);
