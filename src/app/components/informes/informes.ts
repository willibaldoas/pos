import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VentasService } from '../../services/ventas.services';

import { FiltroFechasComponent } from './filtro-fechas/filtro-fechas.component';
import { VentasListComponent } from './ventas-list/ventas-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReporteComponent } from './reporte/reporte.component';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FiltroFechasComponent,
    VentasListComponent,
    DashboardComponent,
    ReporteComponent
  ],
  templateUrl: './informes.html',
  styleUrls: ['./informes.css']
})
export class Informes implements OnInit {

  // Vista actual
  vista: string = 'dashboard';

  // Dashboard
  dashboard: any = {
    totalHoy: 0,
    ventasPorDia: [],
    topProductos: {},
    metodos: {}
  };

  // Ventas
  ventas: any[] = [];
  ventaAbierta: number | null = null;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  // Reporte
  reporte: any = null;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  // ==========================
  // DASHBOARD
  // ==========================
  cargarDashboard(): void {
    this.dashboard.totalHoy = this.ventasService.getTotalHoy();
    this.dashboard.ventasPorDia = this.ventasService.getVentasPorDia();
    this.dashboard.topProductos = this.ventasService.getTopProductos();
    this.dashboard.metodos = this.ventasService.getTotalesPorMetodo();
  }

  verDashboard(): void {
    this.vista = 'dashboard';
    this.cargarDashboard();
  }

  // ==========================
  // VENTAS
  // ==========================
  cargarVentas(): void {
    this.ventas = this.ventasService.getVentas();
  }

  verVentas(): void {
    this.vista = 'ventas';
    this.cargarVentas();
  }

  toggleDetalle(index: number): void {
    this.ventaAbierta = this.ventaAbierta === index ? null : index;
  }

  // ==========================
  // REPORTE
  // ==========================
  verReporte(): void {
    this.vista = 'reporte';
    this.reporte = null;
  }

  // ==========================
  // FILTRO GENERAL
  // ==========================
  onFiltrar(event: any): void {
    this.fechaInicio = event.inicio;
    this.fechaFin = event.fin;

    // Si está en ventas → filtra ventas
    if (this.vista === 'ventas') {
      this.ventas = this.ventasService.getVentasPorRango(
        this.fechaInicio,
        this.fechaFin
      );
    }

    // Si está en reporte → genera reporte
    if (this.vista === 'reporte') {
      this.reporte = this.ventasService.getResumenRango(
        this.fechaInicio,
        this.fechaFin
      );
    }
  }

  resetFiltro(): void {
    this.fechaInicio = '';
    this.fechaFin = '';

    if (this.vista === 'ventas') {
      this.cargarVentas();
    }

    if (this.vista === 'reporte') {
      this.reporte = null;
    }
  }

  // ==========================
  // COMPARTIR REPORTE
  // ==========================
  compartirReporte(): void {
    if (!this.reporte) return;

    let texto = `📊 REPORTE DE VENTAS\n`;
    texto += `📅 ${this.fechaInicio} - ${this.fechaFin}\n\n`;
    texto += `💰 Total: $${this.reporte.total}\n`;
    texto += `🧾 Ventas: ${this.reporte.cantidadVentas}\n\n`;

    texto += `💳 Métodos de pago:\n`;
    for (const metodo in this.reporte.metodos) {
      texto += `• ${metodo}: $${this.reporte.metodos[metodo]}\n`;
    }

    texto += `\n🔥 Productos vendidos:\n`;
    for (const producto in this.reporte.productos) {
      texto += `• ${producto}: ${this.reporte.productos[producto]}\n`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}