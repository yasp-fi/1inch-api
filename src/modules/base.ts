import { Chain, ChainNativeSymbols } from "@yasp/models";
import { INCH_BASE_URL, InchAPIModules } from "../constants";
import { inchSupportedChain } from "../utils";
import PQueue from "p-queue";

export class BaseAPI {
  constructor(
    readonly name: InchAPIModules,
    readonly apiKey: string,
    readonly queue: PQueue,
    readonly baseUrl = INCH_BASE_URL
  ) {}

  isChainSupported(chain: ChainNativeSymbols) {
    return inchSupportedChain(chain);
  }

  getAPIEndpoint(chain: ChainNativeSymbols) {
    if (!this.isChainSupported(chain)) {
      throw new Error(`Inch API doesn't support ${chain} network`);
    }
    return `${this.baseUrl}/${this.name}/${Chain.mapNativeSymbolToId(chain)}`;
  }
}
