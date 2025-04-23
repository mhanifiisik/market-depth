import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OrderBookSnapshot, OrderLevel } from "../../models/order-book.model";

@Component({
  selector: "app-order-book-visualization",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Order Book Snapshot</h2>
      <p *ngIf="currentSnapshot" class="text-sm text-gray-600 mb-4">
        Timestamp: {{ currentSnapshot.time }}
      </p>
      
      <div *ngIf="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div *ngIf="!isLoading && currentSnapshot" class="grid grid-cols-2 gap-4">
        <div>
          <h3 class="text-center font-medium text-green-700 mb-2">Bids (Buy Orders)</h3>
          <div class="space-y-1">
            <div *ngFor="let level of bidLevels" class="flex items-center">
              <div class="w-16 text-right pr-2">{{ level.price.toFixed(4) }}</div>
              <div class="flex-grow h-6 bg-gray-100 relative">
                <div 
                  class="absolute top-0 right-0 h-full bg-green-500 opacity-70"
                  [style.width.%]="(level.size / maxBidSize) * 100">
                </div>
                <div class="absolute top-0 right-2 h-full flex items-center text-xs text-gray-800">
                  {{ level.size }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-center font-medium text-red-700 mb-2">Asks (Sell Orders)</h3>
          <div class="space-y-1">
            <div *ngFor="let level of askLevels" class="flex items-center">
              <div class="flex-grow h-6 bg-gray-100 relative">
                <div 
                  class="absolute top-0 left-0 h-full bg-red-500 opacity-70"
                  [style.width.%]="(level.size / maxAskSize) * 100">
                </div>
                <div class="absolute top-0 left-2 h-full flex items-center text-xs text-gray-800">
                  {{ level.size }}
                </div>
              </div>
              <div class="w-16 text-left pl-2">{{ level.price.toFixed(4) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!isLoading && !currentSnapshot" class="text-center py-8 text-gray-500">
        No data available and heres the snapshot
      </div>
    </div>
  `,
})
export class OrderBookVisualizationComponent implements OnInit, OnChanges {
  @Input() currentSnapshot: OrderBookSnapshot | null = null;
  @Input() isLoading = true;

  bidLevels: OrderLevel[] = [];
  askLevels: OrderLevel[] = [];
  maxBidSize = 0;
  maxAskSize = 0;

  ngOnInit(): void {
    this.processOrderBookData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentSnapshot"]) {
      this.processOrderBookData();
    }
  }

  private processOrderBookData(): void {
    if (!this.currentSnapshot) return;

    if ('Bids' in this.currentSnapshot && 'Asks' in this.currentSnapshot) {
      this.bidLevels = this.currentSnapshot.bids || [];
      this.askLevels = this.currentSnapshot.asks || [];
    } else {
      this.bidLevels = [];
      this.askLevels = [];
      
      for (let i = 1; i <= 10; i++) {
        const price = this.currentSnapshot[`Bid${i}` as keyof OrderBookSnapshot] as number;
        const size = this.currentSnapshot[`Bid${i}Size` as keyof OrderBookSnapshot] as number;

        if (price !== undefined && size !== undefined) {
          this.bidLevels.push({ price, size });
        }
      }

      for (let i = 1; i <= 10; i++) {
        const price = this.currentSnapshot[`Ask${i}` as keyof OrderBookSnapshot] as number;
        const size = this.currentSnapshot[`Ask${i}Size` as keyof OrderBookSnapshot] as number;

        if (price !== undefined && size !== undefined) {
          this.askLevels.push({ price, size });
        }
      }

      this.bidLevels.sort((a, b) => b.price - a.price);

      this.askLevels.sort((a, b) => a.price - b.price);
    }

    this.maxBidSize = this.bidLevels.reduce(
      (max, level) => Math.max(max, level.size), 
      0
    );
    
    this.maxAskSize = this.askLevels.reduce(
      (max, level) => Math.max(max, level.size), 
      0
    );
  }
}