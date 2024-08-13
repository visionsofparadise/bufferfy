import { PointerCodec } from "../codecs/Pointer";
import { UIntCodec } from "../codecs/UInt";

export interface LengthOptions {
	length?: number;
	lengthPointer?: PointerCodec<number>;
	lengthCodec?: UIntCodec;
}
