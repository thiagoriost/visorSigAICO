// device.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeviceService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private isMobileSubject = new BehaviorSubject<boolean>(false);

  isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize(): void {
    // Consideramos móvil si el ancho es menor a 768px
    const isMobile = window.innerWidth < 768;
    this.isMobileSubject.next(isMobile);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
