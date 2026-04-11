import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasService } from '../../services/ventas.services';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './informes.html',
  styleUrls: ['./informes.css'],
})
export class Informes implements OnInit {

  vista = 'dashboard';

  dashboard: any = {
    totalHoy: 0,
    ventasPorDia: [],
    topProductos: {},
    metodos: {}
  };

  ventas: any[] = [];
  ventaAbierta: number | null = null;

  fechaInicio: string = '';
  fechaFin: string = '';

  reporte: any = null;

  constructor(private ventasService: VentasService) {}

  ngOnInit() {
    this.cargarDashboard();
  }

  // 🔥 DASHBOARD
  cargarDashboard() {
    this.dashboard.totalHoy = this.ventasService.getTotalHoy();
    this.dashboard.ventasPorDia = this.ventasService.getVentasPorDia();
    this.dashboard.topProductos = this.ventasService.getTopProductos();
    this.dashboard.metodos = this.ventasService.getTotalesPorMetodo();
  }

  verDashboard() {
    this.vista = 'dashboard';
    this.cargarDashboard();
  }

  // 🧾 VENTAS
  cargarVentas() {
    this.ventas = this.ventasService.getVentas();
  }

  verVentas() {
    this.vista = 'ventas';
    this.cargarVentas();
  }

  toggleDetalle(i: number) {
    this.ventaAbierta = this.ventaAbierta === i ? null : i;
  }

  verCorte() {
    this.vista = 'corte';
  }

  filtrarPorFecha() {
    if (!this.fechaInicio || !this.fechaFin) {
      return alert('Selecciona ambas fechas');
    }

    this.ventas = this.ventasService.getVentasPorRango(
      this.fechaInicio,
      this.fechaFin
    );
  }

  limpiarFiltro() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarVentas();
  }

  generarReporte() {
  if (!this.fechaInicio || !this.fechaFin) {
    return alert('Selecciona fechas');
  }

  this.reporte = this.ventasService.getResumenRango(
      this.fechaInicio,
      this.fechaFin
    );
  }

  verReporte() {
    this.vista = 'reporte';
    this.reporte = null; // limpiar anterior
  }

  compartirReporte() {
    if (!this.reporte) return;

    let texto = `📊 REPORTE DE VENTAS\n`;
    texto += `📅 ${this.fechaInicio} - ${this.fechaFin}\n\n`;
    texto += `💰 Total: $${this.reporte.total}\n`;
    texto += `🧾 Ventas: ${this.reporte.cantidadVentas}\n\n`;

    texto += `💳 Métodos:\n`;
    for (let m in this.reporte.metodos) {
      texto += `- ${m}: $${this.reporte.metodos[m]}\n`;
    }

    texto += `\n🔥 Productos:\n`;
    for (let p in this.reporte.productos) {
      texto += `- ${p}: ${this.reporte.productos[p]}\n`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}