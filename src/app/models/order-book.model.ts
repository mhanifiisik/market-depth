export interface OrderBookSnapshot {
  time: string;
  bids?: OrderLevel[];
  asks?: OrderLevel[];
  [key: string]: string | number | OrderLevel[] | undefined;
}

export interface OrderLevel {
  price: number;
  size: number;
}

export function convertLegacyToOrderBookSnapshot(legacy: OrderBookSnapshot): OrderBookSnapshot {
  const bids: OrderLevel[] = [];
  const asks: OrderLevel[] = [];

  for (let i = 1; i <= 10; i++) {
    const price = legacy[`Bid${i}`] as number;
    const size = legacy[`Bid${i}Size`] as number;
    
    if (price !== undefined && size !== undefined) {
      bids.push({ price, size });
    }
  }

  for (let i = 1; i <= 10; i++) {
    const price = legacy[`Ask${i}`] as number;
    const size = legacy[`Ask${i}Size`] as number;
    
    if (price !== undefined && size !== undefined) {
      asks.push({ price, size });
    }
  }

  bids.sort((a, b) => b.price - a.price);

  asks.sort((a, b) => a.price - b.price);

  return {
    ...legacy,
    Bids: bids,
    Asks: asks
  };
}