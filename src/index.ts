import { ChainNativeSymbols, PriceQuote, ProviderSlug } from '@yasp/models';
import {
  InchPriceAPI,
  InchSwapAPI,
  InchTokenAPI,
  InchBalanceAPI,
} from './modules';
import PQueue from 'p-queue';
import { INCH_BASE_URL } from './constants';

export * from './types';

export class OneInchAPI {
  private readonly apiKey: string;
  
  readonly baseUrl: string;
  readonly providerSlug: ProviderSlug = `1inch-network`;

  readonly queue: PQueue;
  readonly price: InchPriceAPI;
  readonly swap: InchSwapAPI;
  readonly token: InchTokenAPI;
  readonly balance: InchBalanceAPI;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;

    this.queue = new PQueue({
      concurrency: 1,
      interval: 2200,
      intervalCap: 1,
    });

    this.price = new InchPriceAPI(apiKey, this.queue, this.baseUrl);
    this.swap = new InchSwapAPI(apiKey, this.queue, this.baseUrl);
    this.token = new InchTokenAPI(apiKey, this.queue, this.baseUrl);
    this.balance = new InchBalanceAPI(apiKey, this.queue, this.baseUrl);
  }

  async forPriceQuotes(chain: ChainNativeSymbols): Promise<PriceQuote[]> {
    const dexAssets = await this.token.forDEXAssets(chain);
    const usdPriceMap = await this.price.forUsdPrices(chain);

    return Object.entries(usdPriceMap)
      .map(([contractAddress, usdPrice]) => {
        const asset = dexAssets.find(
          (asset) => asset.onChainAddress === contractAddress
        );

        if (!asset) {
          return null;
        }

        return new PriceQuote({
          symbol: asset.symbol,
          contractAddress,
          priceQuoteType: 'crypto',
          value: usdPrice.toFixed(4),
          providerSlug: this.providerSlug,
        });
      })
      .filter((item): item is PriceQuote => !!item);
  }
}
