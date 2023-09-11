export type InchToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  tags: string[];
};

export type InchTokensByAddressResponse = {
  tokens: {
    [key: string]: InchToken;
  };
};

export type ApproveTransactionRequest = {
  tokenAddress: string;
  amount: string;
};

export type ApproveTransactionResponse = {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
};

export type InchQuoteRequest = {
  src: string;
  dst: string;
  amount: string;
  gasPrice?: string;
  includeGas?: boolean;
  includeTokensInfo?: boolean;
  fee?: string;
  complexityLevel?: number;
  mainRouteParts?: number;
  parts?: number;
  virtualParts?: number;
};

export type InchSwapRequest = {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
  disableEstimate?: boolean;
  includeTokensInfo?: boolean;
  fee?: string;
  allowPartialFill?: boolean;
  gasPrice?: string;
  gasLimit?: number;
  referrerAddress?: string;
  complexityLevel?: number;
  mainRouteParts?: number;
  parts?: number;
  virtualParts?: number;
};

export type InchNewSwapRequest = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  // user address
  fromAddress: string;
  slippage: number;
  disableEstimate?: boolean;
  fee?: string;
  allowPartialFill?: boolean;
  gasPrice?: string;
  gasLimit?: number;
  referrerAddress?: string;
};

export type InchProtocolDetail = {
  id: string;
  title: string;
  img: string;
  img_color: string;
};

export type InchProtocolsResponse = {
  protocols: InchProtocolDetail[];
};

export type InchProtocol = {
  name: string;
  parts: number;
  fromTokenAddress: string;
  toTokenAddress: string;
};

export type InchQuote = {
  fromToken: InchToken;
  toToken: InchToken;
  toAmount: string;
  protocols?: InchProtocol[][][];
  gas: number;
};

export type InchCalculatedTxFee = {
  gasLimit: number;
  effectiveGasPrice: string;
  maxGasPrice: string;
  feeAmount: string;
  maxFeeAmount: string;
};

export type InchSwap = {
  fromToken: InchToken;
  toToken: InchToken;
  toAmount: string;
  protocols: InchProtocol[][][];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
};

export type InchEventOrder = {
  hash: string;
  caller: string;
  fromToken: string;
  toToken: string;
  toAddress: string;
  amount: string;
  returnAmount: string;
};

export type InchHealth = {
  status: 'OK';
};
