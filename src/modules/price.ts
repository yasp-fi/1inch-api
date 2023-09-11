import { ChainNativeSymbols } from '@yasp/models';
import { InchAPIModules } from '../constants';
import { createAPIWretch, estimateEtherUsdPrice } from '../utils';
import { BaseAPI } from './base';
import PQueue from 'p-queue';

export class InchPriceAPI extends BaseAPI {
  constructor(apiKey: string, queue: PQueue, baseUrl?: string) {
    super(InchAPIModules.Prices, apiKey, queue, baseUrl);
  }

  async forEthPrices(
    chain: ChainNativeSymbols
  ): Promise<Record<string, number>> {
    return this.queue.add(() => {
      return this.#forEthPrices(chain);
    }) as Promise<Record<string, number>>;
  }

  async #forEthPrices(
    chain: ChainNativeSymbols
  ): Promise<Record<string, number>> {
    const apiURL = this.getAPIEndpoint(chain);
    const wretch = createAPIWretch(apiURL, this.apiKey);
    const prices = await wretch.get().json<Record<string, string>>();

    const ethPrices = Object.entries(prices).map(([address, weiPrice]) => {
      return [address, Number(weiPrice) / 1e18];
    });
    return Object.fromEntries(ethPrices);
  }

  async forUsdPrices(
    chain: ChainNativeSymbols
  ): Promise<Record<string, number>> {
    const ethPricesMap = await this.forEthPrices(chain);
    const etherUsdPrice = estimateEtherUsdPrice(ethPricesMap);

    const usdPrices = Object.entries(ethPricesMap).map(
      ([address, ethPrice]) => {
        return [address, ethPrice * etherUsdPrice];
      }
    );
    return Object.fromEntries(usdPrices);
  }
}
