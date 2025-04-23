import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map, catchError, shareReplay } from "rxjs";
import { OrderBookSnapshot, OrderLevel, convertLegacyToOrderBookSnapshot } from "../models/order-book.model";

@Injectable({
  providedIn: "root",
})
export class OrderBookService {
  private dataUrl = "";
  private orderBookData: OrderBookSnapshot[] = [];
  private cachedData$: Observable<OrderBookSnapshot[]> | null = null;

  constructor(private http: HttpClient) {}

  getOrderBookData(): Observable<OrderBookSnapshot[]> {
    if (this.cachedData$) {
      return this.cachedData$;
    }

    if (this.orderBookData.length > 0) {
      return of(this.orderBookData);
    }

    if (!this.dataUrl) {
      const mockData = Array.from({ length: 100}, () => this.generateMockOrderBook());
      this.orderBookData = mockData;
      return of(mockData);
    }

    this.cachedData$ = this.http.get(this.dataUrl, { responseType: "text" }).pipe(
      map((text) => {
        const lines = text.trim().split("\n");
        const parsedData: OrderBookSnapshot[] = lines.map((line) => JSON.parse(line));
        this.orderBookData = parsedData;
        return parsedData;
      }),
      catchError((error) => {
        console.error("Error fetching order book data:", error);
        this.cachedData$ = null;
        throw error;
      }),
      shareReplay(1)
    );

    return this.cachedData$;
  }

  getSnapshotByTimestamp(timestamp: string): Observable<OrderBookSnapshot | null> {
    return this.getOrderBookData().pipe(
      map((data) => {
        const snapshot = data.find((snapshot) => snapshot.time === timestamp);
        return snapshot ? convertLegacyToOrderBookSnapshot(snapshot) : null;
      })
    );
  }



  private generateMockOrderBook(): OrderBookSnapshot {
    const generateLevels = (): OrderLevel[] =>
      Array.from({ length: 10 }, () => ({
        price: +(Math.random() * 100).toFixed(2),
        size: +(Math.random() * 10).toFixed(2),
      }));
  
    return {
      time: new Date(Date.now() - Math.floor(Math.random() * 5000)).toISOString(),
      bids: generateLevels(),
      asks: generateLevels(),
    };
  }
  
  
}