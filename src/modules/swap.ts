import {
  Asset,
  Chain,
  ChainNativeSymbols,
  DEXAsset,
  DEXQuote,
  EncodedTransaction,
} from "@yasp/models";
import {
  INCH_BASE_URL,
  INCH_PARTNER_ADDRESS,
  INCH_PARTNER_FEE_PERCENT,
  InchAPIModules,
} from "../constants";
import { BaseAPI } from "./base";
import {
  InchQuote,
  InchQuoteRequest,
  InchSwap,
  InchSwapRequest,
} from "../types";
import {
  adaptInchQuoteToDEXQuote,
  createAPIWretch,
  isNativeAssetAddress,
} from "../utils";
import { getGasPriceFeeData } from "@yasp/evm-lib";
import PQueue from "p-queue";

export type ForDEXQuoteParams = {
  fromAsset: DEXAsset;
  toAsset: DEXAsset;
  fromAssetAmount: string;
  slippage: number;
};

export class InchSwapAPI extends BaseAPI {
  constructor(apiKey: string, queue: PQueue, baseUrl?: string) {
    super(InchAPIModules.Swap, apiKey, queue, baseUrl);
  }

  async forDEXQuote(
    chain: ChainNativeSymbols,
    params: ForDEXQuoteParams
  ): Promise<{ dexQuote: DEXQuote; providerQuote: InchQuote }> {
    return this.queue.add(() => {
      return this.#forDEXQuote(chain, params);
    }) as Promise<{ dexQuote: DEXQuote; providerQuote: InchQuote }>;
  }
  async forSwapTx(
    chain: ChainNativeSymbols,
    fromTokenAddress: string,
    toTokenAddress: string,
    userAddress: string,
    amount: string,
    slippage: number
  ): Promise<EncodedTransaction> {
    return this.queue.add(() => {
      return this.#forSwapTx(
        chain,
        fromTokenAddress,
        toTokenAddress,
        userAddress,
        amount,
        slippage
      );
    }) as Promise<EncodedTransaction>;
  }

  async #forDEXQuote(
    chain: ChainNativeSymbols,
    params: ForDEXQuoteParams
  ): Promise<{ dexQuote: DEXQuote; providerQuote: InchQuote }> {
    const { gasPrice } = await getGasPriceFeeData(chain);
    const amount = Asset.toUnits(
      params.fromAssetAmount,
      DEXAsset.toMinimalVariant(params.fromAsset),
      chain
    );

    const inchQuoteRequest: InchQuoteRequest = {
      src: params.fromAsset.onChainAddress,
      dst: params.toAsset.onChainAddress,
      includeGas: true,
      includeTokensInfo: true,
      fee: INCH_PARTNER_FEE_PERCENT,
      amount,

      /// MAX RESULT PRESET
      complexityLevel: 2,
      mainRouteParts: 10,
      parts: 50,
      virtualParts: 50,

      /// LOWEST GAS PRESET
      // complexityLevel: 0,
      // mainRouteParts: 1,
      // parts: 1,
      // virtualParts: 1,
    };

    const chainId = Chain.mapNativeSymbolToId(chain);
    const wretch = createAPIWretch(
      `${this.baseUrl}/v5.2/${chainId}/quote`,
      this.apiKey
    );
    const providerQuote = await wretch
      .query(inchQuoteRequest)
      .get()
      .json<InchQuote>();

    const dexQuote = adaptInchQuoteToDEXQuote({
      fromAssetAmount: params.fromAssetAmount,
      slippage: params.slippage,
      quote: providerQuote,
      chain,
      gasPrice,
    });

    return {
      providerQuote,
      dexQuote,
    };
  }

  async #forSwapTx(
    chain: ChainNativeSymbols,
    fromTokenAddress: string,
    toTokenAddress: string,
    userAddress: string,
    amount: string,
    slippage: number
  ): Promise<EncodedTransaction> {
    const swapTxRequest: InchSwapRequest = {
      disableEstimate: true,
      allowPartialFill: false,
      includeTokensInfo: true,

      /// MAX RESULT PRESET
      complexityLevel: 2,
      mainRouteParts: 10,
      parts: 50,
      virtualParts: 50,

      /// LOWEST GAS PRESET
      // complexityLevel: 0,
      // mainRouteParts: 1,
      // parts: 1,
      // virtualParts: 1,

      from: userAddress,
      fee: INCH_PARTNER_FEE_PERCENT,
      referrerAddress: INCH_PARTNER_ADDRESS,
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount,
      slippage,
    };

    const chainId = Chain.mapNativeSymbolToId(chain);
    const wretch = createAPIWretch(
      `${this.baseUrl}/v5.2/${chainId}/swap`,
      this.apiKey
    );

    const resp = await wretch.query(swapTxRequest).get().json<InchSwap>();
    const { tx, toToken, fromToken, toAmount } = resp;

    return {
      transactionValue: isNativeAssetAddress(fromTokenAddress)
        ? amount
        : undefined,
      chain,
      // fee,
      transactionLabel: `Swap via 1Inch`,
      transactionType: "SWAP",
      payload: tx.data,
      address: {
        fromAddress: userAddress,
        toAddress: tx.to,
      },
      metadata: {}
    };
  }
}
