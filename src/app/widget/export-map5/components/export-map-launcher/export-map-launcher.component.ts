import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ExportMap5Component } from '../export-map5/export-map5.component';

@Component({
  selector: 'app-export-map-launcher',
  standalone: true,
  imports: [CommonModule, ButtonModule, ExportMap5Component],
  templateUrl: './export-map-launcher.component.html',
  styleUrl: './export-map-launcher.component.scss',
})
export class ExportMapLauncherComponent {
  isDialogVisible = false;

  showExportDialog(): void {
    this.isDialogVisible = true;
  }
}
