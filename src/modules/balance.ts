import { ChainNativeSymbols, MinimalAsset } from '@yasp/models';
import { InchAPIModules } from '../constants';
import { BaseAPI } from './base';
import { createAPIWretch } from '../utils';
import PQueue from 'p-queue';

export class InchBalanceAPI extends BaseAPI {
  constructor(apiKey: string, queue: PQueue, baseUrl?: string) {
    super(InchAPIModules.Balance, apiKey, queue, baseUrl);
  }

  async forBalances(
    walletAddress: string,
    chain: ChainNativeSymbols
  ): Promise<Record<string, string>> {
    return this.queue.add(() => {
      return this.#forBalances(walletAddress, chain);
    }) as Promise<Record<string, string>>;
  }

  async forAllowances(
    spender: string,
    walletAddress: string,
    chain: ChainNativeSymbols
  ): Promise<Record<string, string>> {
    return this.queue.add(() => {
      return this.#forAllowances(spender, walletAddress, chain);
    }) as Promise<Record<string, string>>;
  }

  async #forBalances(
    walletAddress: string,
    chain: ChainNativeSymbols
  ): Promise<Record<string, string>> {
    const apiURL = this.getAPIEndpoint(chain);
    const wretch = createAPIWretch(
      `${apiURL}/balances/${walletAddress}`,
      this.apiKey
    );

    return wretch.get().json<Record<string, string>>();
  }

  async #forAllowances(
    spender: string,
    walletAddress: string,
    chain: ChainNativeSymbols
  ): Promise<Record<string, string>> {
    const apiURL = this.getAPIEndpoint(chain);
    const wretch = createAPIWretch(
      `${apiURL}/allowances/${spender}/${walletAddress}`,
      this.apiKey
    );

    return wretch.get().json<Record<string, string>>();
  }
}
