import {
  ChainIds,
  ChainNativeSymbols,
  DEXAsset,
  DEXQuote,
  PriceQuote,
} from '@yasp/models';
import { OneInchAPI } from '../index';

const TEST_1INCH_API_KEY = process.env.TEST_1INCH_API_KEY!;
const api = new OneInchAPI(TEST_1INCH_API_KEY);

jest.setTimeout(90 * 1000);

test.concurrent('1Inch for dex assets', async () => {
  const dexAssets = await api.token.forDEXAssets(ChainNativeSymbols.Ethereum);
  expect(dexAssets.every((asset) => DEXAsset.isDexAsset(asset))).toBeTruthy();
});

// test('1Inch for balance', async () => {
//   const api = new OneInchAPI(TEST_1INCH_API_KEY);
// });

test.concurrent('1Inch for price quotes', async () => {
  const priceQuotes = await api.forPriceQuotes(ChainNativeSymbols.Ethereum);
  expect(
    priceQuotes.every((quote) => PriceQuote.isPriceQuote(quote))
  ).toBeTruthy();
});

test.concurrent('1Inch for quote', async () => {
  const { dexQuote } = await api.swap.forDEXQuote(ChainNativeSymbols.Ethereum, {
    fromAsset: new DEXAsset({
      symbol: `ETH`,
      name: `Ethereum`,
      decimals: 18,
      isNative: true,
      chain: ChainNativeSymbols.Ethereum,
      chainId: ChainIds.ETH,
      onChainAddress: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`,
    }),
    toAsset: new DEXAsset({
      symbol: `ARB`,
      name: `Arbitrum`,
      decimals: 18,
      isNative: false,
      chain: ChainNativeSymbols.Ethereum,
      chainId: ChainIds.ETH,
      onChainAddress: `0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1`,
    }),
    fromAssetAmount: (0.123).toString(),
    slippage: 1,
  });
  console.log(dexQuote)
  expect(DEXQuote.isDEXQuote(dexQuote)).toBeTruthy();
});

test('1Inch for swap', async () => {
  const { dexQuote } = await api.swap.forDEXQuote(ChainNativeSymbols.Ethereum, {
    fromAsset: new DEXAsset({
      symbol: `ETH`,
      name: `Ethereum`,
      decimals: 18,
      isNative: true,
      chain: ChainNativeSymbols.Ethereum,
      chainId: ChainIds.ETH,
      onChainAddress: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`,
    }),
    toAsset: new DEXAsset({
      symbol: `ARB`,
      name: `Arbitrum`,
      decimals: 18,
      isNative: false,
      chain: ChainNativeSymbols.Ethereum,
      chainId: ChainIds.ETH,
      onChainAddress: `0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1`,
    }),
    fromAssetAmount: (0.123).toString(),
    slippage: 1,
  });
});
