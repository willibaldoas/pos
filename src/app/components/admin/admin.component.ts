import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';
import { VentasService } from '../../services/ventas.services';

import { ProductoFormComponent } from './producto-form/producto-form.component';
import { ProductoListComponent } from './producto-list/producto-list.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ProductoFormComponent, ProductoListComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {

  inventario: any[] = [];

  nombre = '';
  precio: number = 0;
  costo: number = 0;
  stock: number = 0;
  ilimitado = false;

  busquedaInventario = '';
  inventarioFiltrado: any[] = [];

  editando: number | null = null;
  backupProducto: any = null;

  historial: any[] = [];

  vista = 'crear';

  

  constructor(private inv: InventarioService, private ventasService: VentasService) {
    this.inventario = this.inv.get();
  }

  ngOnInit() {
    this.inventario = this.inv.get();
    this.inventarioFiltrado = [...this.inventario];
  }

  agregar() {
    if (!this.nombre || !this.precio) {
      alert('Completa los datos');
      return;
    }

    this.inventario.push({
      id: Date.now(),
      nombre: this.nombre,
      precio: this.precio,
      costo: this.costo,
      stock: this.ilimitado ? 0 : this.stock,
      ilimitado: this.ilimitado
    });

    this.inv.save(this.inventario);

    // limpiar
    this.nombre = '';
    this.precio = 0;
    this.costo = 0;
    this.stock = 0;
    this.ilimitado = false;

    this.busquedaInventario = '';
    this.filtrarInventario();
  }

  limpiar() {
    this.nombre = '';
    this.precio = 0;
    this.costo = 0;
    this.stock = 0;
  }

  filtrarInventario() {
    const texto = this.busquedaInventario.toLowerCase();

    this.inventarioFiltrado = this.inventario.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.precio.toString().includes(texto)
    );
  }

  editar(p: any) {
    this.editando = p.id;
    this.backupProducto = JSON.parse(JSON.stringify(p));
  }

  guardar() {
    this.inv.save(this.inventario);
    this.editando = null;
  }

  cancelar() {
    if (!this.backupProducto) return;

    const index = this.inventario.findIndex(p => p.id === this.backupProducto.id);

    if (index !== -1) {
      this.inventario[index] = this.backupProducto;
    }

    this.filtrarInventario();
    this.editando = null;
  }

  eliminar(p: any) {

    if (!confirm('¿Eliminar producto?')) return;

    this.inventario = this.inventario.filter(x => x.id !== p.id);

    this.filtrarInventario();
    this.inv.save(this.inventario);
  }


  crearProductos() {
    this.vista = 'crear';
  }

  editarProductos() {
    this.vista = 'ver';
  }

  agregarInventario() {
    this.vista = 'inventario';
  }




  cambiarStock(p: any, cantidad: number) {

    if (p.ilimitado) return;

    let nuevoStock = p.stock + cantidad;

    if (nuevoStock < 0) {
      alert('No puedes tener stock negativo');
      return;
    }

    // guardar historial
    this.historial.push({
      producto: p.nombre,
      cambio: cantidad,
      fecha: new Date()
    });

    p.stock = nuevoStock;

    this.inv.save(this.inventario);
  }

  // input manual
  aplicarCantidad(p: any, cantidad: number) {

    if (!cantidad || p.ilimitado) return;

    this.cambiarStock(p, cantidad);
  }

  // alerta stock bajo
  esStockBajo(p: any) {
    return !p.ilimitado && p.stock <= 5;
  }

  agregarDesdeForm(producto: any) {
  this.inventario.push(producto);
  this.inv.save(this.inventario);

  this.filtrarInventario();
}
}