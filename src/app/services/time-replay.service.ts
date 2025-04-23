import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeReplayService {
  private timestamps: string[] = [];
  private currentIndexSubject = new BehaviorSubject<number>(0);
  private isReplayingSubject = new BehaviorSubject<boolean>(false);
  private replayInterval: any = null;
  private replayDuration = 300000; // 30 seconds for full replay

  readonly currentIndex$: Observable<number> = this.currentIndexSubject.asObservable();
  readonly isReplaying$: Observable<boolean> = this.isReplayingSubject.asObservable();

  constructor() {}

  setTimestamps(timestamps: string[]): void {
    this.timestamps = timestamps;
    this.currentIndexSubject.next(0);
  }

  getCurrentTimestamp(): string | null {
    const index = this.currentIndexSubject.value;
    return this.timestamps.length > 0 ? this.timestamps[index] : null;
  }

  goToPrevious(): void {
    const currentIndex = this.currentIndexSubject.value;
    if (currentIndex > 0) {
      this.currentIndexSubject.next(currentIndex - 1);
    }
  }

  goToNext(): void {
    const currentIndex = this.currentIndexSubject.value;
    if (currentIndex < this.timestamps.length - 1) {
      this.currentIndexSubject.next(currentIndex + 1);
    }
  }

  selectIndex(index: number): void {
    if (index >= 0 && index < this.timestamps.length) {
      this.currentIndexSubject.next(index);
    }
  }

  toggleReplay(): void {
    const isCurrentlyReplaying = this.isReplayingSubject.value;
    this.isReplayingSubject.next(!isCurrentlyReplaying);

    if (!isCurrentlyReplaying) {
      this.startReplay();
    } else {
      this.stopReplay();
    }
  }

  private startReplay(): void {
    this.currentIndexSubject.next(0);

    const timeDeltas = this.calculateTimeDeltas();
    const totalTime = timeDeltas.reduce((sum, delta) => sum + delta, 0);
    const scaleFactor = this.replayDuration / totalTime;

    let currentIndex = 0;

    this.replayInterval = setInterval(() => {
      if (currentIndex < this.timestamps.length - 1) {
        currentIndex++;
        this.currentIndexSubject.next(currentIndex);

        // If we've reached the end, stop replay
        if (currentIndex === this.timestamps.length - 1) {
          this.stopReplay();
        }
      } else {
        this.stopReplay();
      }
    }, timeDeltas[0] * scaleFactor); 
  }

  private stopReplay(): void {
    if (this.replayInterval) {
      clearInterval(this.replayInterval);
      this.replayInterval = null;
    }
    this.isReplayingSubject.next(false);
  }

  private calculateTimeDeltas(): number[] {
    const deltas: number[] = [];

    for (let i = 0; i < this.timestamps.length - 1; i++) {
      const current = new Date(`2023-01-01T${this.timestamps[i]}`);
      const next = new Date(`2023-01-01T${this.timestamps[i + 1]}`);
      deltas.push(next.getTime() - current.getTime());
    }

    if (deltas.length > 0) {
      const avgDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
      deltas.push(avgDelta);
    } else {
      deltas.push(1000); // Default 1 second if only one timestamp
    }

    return deltas;
  }
}