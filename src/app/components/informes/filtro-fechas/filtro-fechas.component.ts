import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filtro-fechas',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './filtro-fechas.component.html',
  styleUrls: ['./filtro-fechas.component.css']
})
export class FiltroFechasComponent {

  fechaInicio: string = '';
  fechaFin: string = '';

  @Output() filtrar = new EventEmitter<{
    inicio: string;
    fin: string;
  }>();

  @Output() reset = new EventEmitter<void>();

  aplicarFiltro(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Selecciona ambas fechas');
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      alert('La fecha inicial no puede ser mayor a la fecha final');
      return;
    }

    this.filtrar.emit({
      inicio: this.fechaInicio,
      fin: this.fechaFin
    });
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';

    this.reset.emit();
  }
}