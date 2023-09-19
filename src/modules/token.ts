import { Chain, ChainNativeSymbols, DEXAsset } from "@yasp/models";
import { InchAPIModules } from "../constants";
import { BaseAPI } from "./base";
import { InchToken } from "../types";
import PQueue from "p-queue";
import { createSafeWretch } from "@yasp/requests";
import { createAPIWretch } from "../utils";

export class InchTokenAPI extends BaseAPI {
  cachedAssets: Partial<Record<ChainNativeSymbols, DEXAsset[]>> = {};

  constructor(apiKey: string, queue: PQueue, baseUrl?: string) {
    super(InchAPIModules.Token, apiKey, queue, baseUrl);
  }

  async forAllowance(
    chain: ChainNativeSymbols,
    tokenAddress: string,
    walletAddress: string
  ): Promise<string> {
    const chainId = Chain.mapNativeSymbolToId(chain);
    const wretch = createSafeWretch(
      `${this.baseUrl}/v5.2/${chainId}/approve/allowance`
    );
    const { allowance } = await wretch
      .query({
        tokenAddress,
        walletAddress,
      })
      .get()
      .json<{ allowance: string }>()
      .catch(() => ({ allowance: `0` }));

    return allowance;
  }

  async forDEXAssets(chain: ChainNativeSymbols): Promise<DEXAsset[]> {
    if (Array.isArray(this.cachedAssets[chain])) {
      return this.cachedAssets[chain]!;
    }
    const chainId = Chain.mapNativeSymbolToId(chain);
    const wretch = createAPIWretch(
      `${this.baseUrl}/v5.2/${chainId}/tokens`,
      this.apiKey
    );
    const { tokens } = await wretch
      .get()
      .json<{ tokens: Record<string, InchToken> }>();

    const assets: DEXAsset[] = Object.entries(tokens).map(
      ([address, token]) => {
        return {
          chain: chain,
          chainId: Chain.mapNativeSymbolToId(chain),
          isNative: token.tags.includes("native"),
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          onChainAddress: address,
          imageURL: token.logoURI,
        };
      }
    );

    this.cachedAssets[chain] = assets;
    return assets;
  }
}
