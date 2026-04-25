import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte.component.html'
})
export class ReporteComponent {

  @Input() reporte: any = null;
  @Input() fechaInicio: string = '';
  @Input() fechaFin: string = '';

  @Output() compartir = new EventEmitter<void>();

  getKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}