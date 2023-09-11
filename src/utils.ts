import { Asset, ChainNativeSymbols, DEXQuote } from '@yasp/models';
import {
  INCH_ROUGH_GAS_LIMIT_MULTIPLIER,
  KNOWN_STABLECOINS,
  NATIVE_ADDRESS,
} from './constants';
import { createSafeWretch } from '@yasp/requests';
import { AssetAmount } from '@yasp/asset-amount';
import { InchQuote } from './types';
import { v4 } from 'uuid';
import ms from 'ms';
import { adaptGasLimitToTransactionFee, formatEvmAddress } from '@yasp/evm-lib';

export const createAPIWretch = (url: string, apiKey: string) => {
  return createSafeWretch(url).headers({
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
  });
};

export const average = (arr: number[]) =>
  arr.reduce((p, c) => p + c, 0) / arr.length;

export const isNativeAssetAddress = (assetAddress: string) => {
  return assetAddress.toLowerCase() === NATIVE_ADDRESS;
};

export const estimateEtherUsdPrice = (
  ethPricesMap: Record<string, number>
): number => {
  const stablecoinWeiPrices = KNOWN_STABLECOINS.map(
    (stablecoin) => ethPricesMap[stablecoin]
  ).filter((i): i is number => !!i);

  const etherUSDPrices = stablecoinWeiPrices.map((item) => 1 / item);

  return average(etherUSDPrices);
};

export const inchSupportedChain = (chain: ChainNativeSymbols): boolean => {
  return true;
  // return SUPPORTED_CHAINS.includes(chain);
};

type AdaptInchQuoteToDEXQuoteParams = {
  fromAssetAmount: string;
  chain: ChainNativeSymbols;
  quote: InchQuote;
  slippage: number;
  gasPrice: string | bigint;
};

export function adaptInchQuoteToDEXQuote({
  fromAssetAmount,
  chain,
  quote,
  slippage,
  gasPrice,
}: AdaptInchQuoteToDEXQuoteParams): DEXQuote {
  const safeGasLimitAmount = Math.round(
    quote.gas * INCH_ROUGH_GAS_LIMIT_MULTIPLIER
  );

  const toAssetAmount = AssetAmount.fromChain(
    quote.toToken.decimals,
    quote.toAmount
  );
  const toAssetAmountWithSlippage = toAssetAmount.muln(1 - slippage / 100);

  const transactionFee = adaptGasLimitToTransactionFee({
    gasLimit: safeGasLimitAmount,
    gasPrice,
    chain,
  });

  return new DEXQuote({
    rateId: v4().toString(),
    fromAssetAddress: formatEvmAddress(quote.fromToken.address),
    toAssetAddress: formatEvmAddress(quote.toToken.address),
    toAssetSymbol: quote.toToken.symbol,
    fromAssetSymbol: quote.fromToken.symbol,
    transactionFee,
    fromAssetAmount,
    toAssetAmount: toAssetAmount.toExact(),
    fromAssetDecimals: quote.fromToken.decimals,
    toAssetDecimals: quote.toToken.decimals,
    toAssetAmountWithSlippage: toAssetAmountWithSlippage.toExact(),
    priceImpactPct: 0,
    slippage,
    chain,
    expiry: Date.now() + ms('1m'),
    providerSlug: `1inch-network`,
  });
}
