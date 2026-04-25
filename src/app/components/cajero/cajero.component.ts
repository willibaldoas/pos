import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { VentasService } from '../../services/ventas.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cajero',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cajero.component.html',
  styleUrls: ['./cajero.component.css']
})
export class CajeroComponent implements OnInit {

  inventario: any[] = [];
  items: any[] = [];
  total: number = 0;

  busqueda: string = '';
  sugerencias: any[] = [];

  editandoIndex: number | null = null;
  mostrarTicket: boolean = false;

  ultimoEstado: any = null;
  metodo: string = 'Efectivo';

  constructor(
    private inv: InventarioService,
    private ventas: VentasService
  ) {}

  ngOnInit(): void {
    this.inventario = this.inv.get();
  }

  agregar(index: number): void {
    const prod = this.inventario[index];

    if (!prod.ilimitado && prod.stock <= 0) {
      alert('Sin stock');
      return;
    }

    this.guardarEstado();
    this.mostrarTicket = true;

    const item = this.items.find(i => i.nombre === prod.nombre);

    if (item) {
      item.cantidad++;
    } else {
      this.items.push({
        ...prod,
        cantidad: 1
      });
    }

    if (!prod.ilimitado) {
      prod.stock--;
    }

    this.ventas.actualizarProducto(prod.nombre);

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  calcularTotal(): void {
    this.total = this.items.reduce(
      (acc, item) => acc + (item.precio * item.cantidad),
      0
    );
  }

  cobrar(): void {
    if (this.items.length === 0) {
      alert('No hay productos');
      return;
    }

    const detalle = this.items.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.precio * item.cantidad
    }));

    this.ventas.guardarVenta(detalle, this.metodo);

    alert(`Total: $${this.total}`);

    this.items = [];
    this.total = 0;
    this.busqueda = '';
    this.sugerencias = [];
    this.editandoIndex = null;
    this.mostrarTicket = false;
  }

  autocompletar(): void {
    if (!this.busqueda.trim()) {
      this.sugerencias = [];
      return;
    }

    const texto = this.busqueda.toLowerCase();

    this.sugerencias = this.inventario
      .filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.precio.toString().includes(texto)
      )
      .slice(0, 5);
  }

  seleccionar(producto: any): void {
    const index = this.inventario.indexOf(producto);

    this.agregar(index);

    this.busqueda = '';
    this.sugerencias = [];
  }

  tecla(valor: string): void {
    if (this.editandoIndex !== null) {
      const item = this.items[this.editandoIndex];

      const nuevaCantidad = Number(
        item.cantidad.toString() + valor
      );

      if (isNaN(nuevaCantidad)) return;

      this.actualizarCantidad(this.editandoIndex, nuevaCantidad);
      return;
    }

    if (valor === '.') return;

    this.busqueda += valor;
    this.autocompletar();
  }

  borrar(): void {
    if (this.editandoIndex !== null) {
      const item = this.items[this.editandoIndex];
      const nuevaCantidad = Math.floor(item.cantidad / 10);

      if (nuevaCantidad <= 0) {
        this.eliminarLinea(this.editandoIndex);
        this.editandoIndex = null;
        return;
      }

      this.actualizarCantidad(this.editandoIndex, nuevaCantidad);
      return;
    }

    this.busqueda = this.busqueda.slice(0, -1);
    this.autocompletar();
  }

  actualizarCantidad(index: number, nuevaCantidad: number): void {
    const item = this.items[index];
    const prod = this.inventario.find(
      p => p.nombre === item.nombre
    );

    if (!prod) return;

    const diferencia = nuevaCantidad - item.cantidad;

    if (!prod.ilimitado) {
      if (diferencia > 0) {
        if (prod.stock < diferencia) {
          alert('Sin stock');
          return;
        }

        prod.stock -= diferencia;
      }

      if (diferencia < 0) {
        prod.stock += Math.abs(diferencia);
      }
    }

    item.cantidad = nuevaCantidad;

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  sumar(index: number): void {
    const prod = this.inventario.find(
      p => p.nombre === this.items[index].nombre
    );

    if (!prod) return;

    if (!prod.ilimitado && prod.stock <= 0) {
      alert('Sin stock');
      return;
    }

    this.guardarEstado();

    this.items[index].cantidad++;

    if (!prod.ilimitado) {
      prod.stock--;
    }

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  restar(index: number): void {
    const prod = this.inventario.find(
      p => p.nombre === this.items[index].nombre
    );

    if (!prod) return;

    this.guardarEstado();

    this.items[index].cantidad--;

    if (!prod.ilimitado) {
      prod.stock++;
    }

    if (this.items[index].cantidad <= 0) {
      this.items.splice(index, 1);
    }

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  eliminarLinea(index: number): void {
    const item = this.items[index];

    const prod = this.inventario.find(
      p => p.nombre === item.nombre
    );

    if (prod && !prod.ilimitado) {
      prod.stock += item.cantidad;
    }

    this.guardarEstado();

    this.items.splice(index, 1);

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  vaciarTicket(): void {
    if (!confirm('¿Cancelar venta?')) return;

    this.guardarEstado();

    this.items.forEach(item => {
      const prod = this.inventario.find(
        p => p.nombre === item.nombre
      );

      if (prod && !prod.ilimitado) {
        prod.stock += item.cantidad;
      }
    });

    this.items = [];
    this.total = 0;

    this.inv.save(this.inventario);
  }

  deshacer(): void {
    if (!this.ultimoEstado) {
      alert('Nada que deshacer');
      return;
    }

    this.items = [...this.ultimoEstado.items];
    this.inventario = [...this.ultimoEstado.inventario];
    this.total = this.ultimoEstado.total;

    this.inv.save(this.inventario);
  }

  guardarEstado(): void {
    this.ultimoEstado = {
      items: structuredClone(this.items),
      inventario: structuredClone(this.inventario),
      total: this.total
    };
  }

  activarEdicion(index: number): void {
    this.editandoIndex = index;
  }

  toggleTicket(): void {
    if (this.items.length === 0) return;

    this.mostrarTicket = !this.mostrarTicket;
  }
}