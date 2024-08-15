import { PointerCodec } from "../codecs/Pointer";
import { UIntCodec } from "../codecs/UInt";
import { VarUIntCodec } from "../codecs/VarUInt";

export interface LengthOptions {
	length?: number;
	lengthPointer?: PointerCodec<number>;
	lengthCodec?: UIntCodec | VarUIntCodec;
}
