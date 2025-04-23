// time-controls.component.ts

import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { TimeReplayService } from "../../services/time-replay.service";

@Component({
  selector: "app-time-controls",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex justify-end">
        <button 
          (click)="onPrevious()" 
          [disabled]="currentIndex === 0 || isReplaying"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        
        <div class="flex-grow">
          <input 
            type="range" 
            [min]="0" 
            [max]="timestamps.length - 1" 
            [value]="currentIndex"
            (input)="onSelectIndex($any($event.target).value)"
            [disabled]="isReplaying"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
        </div>
        
        <button 
          (click)="onNext()" 
          [disabled]="currentIndex === timestamps.length - 1 || isReplaying"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
      
        <div class="text-sm text-gray-600">
          {{ timestamps[currentIndex] || 'No data' }}
          <span class="ml-2">
            ({{ currentIndex + 1 }} of {{ timestamps.length }})
          </span>
        
        <button 
          (click)="onToggleReplay()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {{ isReplaying ? 'Stop Replay' : 'Start Replay' }}
        </button>
    </div>
  `,
})


export class TimeControlsComponent implements OnInit, OnDestroy {
  @Input() timestamps: string[] = [];
  
  currentIndex = 0;
  isReplaying = false;
  
  private subscriptions = new Subscription();

  constructor(private timeReplayService: TimeReplayService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.timeReplayService.currentIndex$.subscribe(index => {
        this.currentIndex = index;
      })
    );
    
    this.subscriptions.add(
      this.timeReplayService.isReplaying$.subscribe(isReplaying => {
        this.isReplaying = isReplaying;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPrevious(): void {
    this.timeReplayService.goToPrevious();
  }

  onNext(): void {
    this.timeReplayService.goToNext();
  }

  onSelectIndex(indexValue: string): void {
    const index = parseInt(indexValue, 10);
    this.timeReplayService.selectIndex(index);
  }

  onToggleReplay(): void {
    this.timeReplayService.toggleReplay();
  }
}