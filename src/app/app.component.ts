import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription, switchMap } from "rxjs";
import { OrderBookService } from "./services/order-book.service";
import { TimeReplayService } from "./services/time-replay.service";
import { OrderBookVisualizationComponent } from "./components/order-book-visualization/order-book-visualization.component";
import { TimeControlsComponent } from "./components/time-controls/time-controls.component";
import { OrderBookSnapshot } from "./models/order-book.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, OrderBookVisualizationComponent, TimeControlsComponent],
  template: `
    <div class="min-h-screen w-full bg-gray-50 p-4 flex items-center">
      <main class="w-6xl mx-auto h-[600px] border shadow p-4 rounded-md">
          <div *ngIf="error" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {{ error }}
            <button 
              (click)="loadData()" 
              class="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Retry
            </button>
          </div>

          <app-time-controls
            [timestamps]="timestamps">
          </app-time-controls>

          <app-order-book-visualization 
            [currentSnapshot]="currentSnapshot"
            [isLoading]="isLoading">
          </app-order-book-visualization>
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  timestamps: string[] = [];
  currentSnapshot: OrderBookSnapshot | null = null;
  isLoading = true;
  error: string | null = null;
  
  private subscriptions = new Subscription();

  constructor(
    private orderBookService: OrderBookService,
    private timeReplayService: TimeReplayService
  ) {}

  ngOnInit() {
    this.loadData();
    
    this.subscriptions.add(
      this.timeReplayService.currentIndex$.pipe(
        switchMap(index => {
          const timestamp = this.timestamps[index];
          return timestamp ? this.orderBookService.getSnapshotByTimestamp(timestamp) : [];
        })
      ).subscribe(snapshot => {
        this.currentSnapshot = snapshot;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.isLoading = true;
    this.error = null;

    this.orderBookService.getOrderBookData().subscribe({
      next: (data) => {
        this.timestamps = data.map(item => item.time);
        
        this.timeReplayService.setTimestamps(this.timestamps);
        
        this.isLoading = false;
      },
      error: () => {
        this.error = "Failed to load order book data. Please try again.";
        this.isLoading = false;
      },
    });
  }
}