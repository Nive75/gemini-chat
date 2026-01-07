import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loading {
  isLoading = signal<boolean>(false);

  setLoading(value: boolean): void {
    this.isLoading.set(value);
  }

  start(): void {
    this.isLoading.set(true);
  }

  stop(): void {
    this.isLoading.set(false);
  }
}
