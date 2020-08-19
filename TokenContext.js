import React from 'react';

const TokenContext = React.createContext();

export const TokenProvider = TokenContext.Provider;
export const TokenConsumer = TokenContext.TokenConsumer;

export default TokenContext;
