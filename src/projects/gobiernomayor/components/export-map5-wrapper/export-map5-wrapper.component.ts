import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectOverlayWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { ExportMap5Component } from '@app/widget/export-map5/components/export-map5/export-map5.component';

@Component({
  selector: 'app-export-map5-wrapper',
  standalone: true,
  imports: [CommonModule, ExportMap5Component],
  templateUrl: './export-map5-wrapper.component.html',
  styleUrl: './export-map5-wrapper.component.scss',
})
export class ExportMap5WrapperComponent implements OnInit, OnDestroy {
  isExportMapVisible = false;
  isDialogVisible = false;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectOverlayWidgetStatus('ExportarMapa5'))
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible: boolean | undefined) => {
        this.isExportMapVisible = !!isVisible;
        if (this.isExportMapVisible) {
          this.isDialogVisible = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
