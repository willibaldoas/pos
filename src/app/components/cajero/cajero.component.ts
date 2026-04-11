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
  styleUrls: ['./cajero.component.css'],
})
export class CajeroComponent {

  inventario: any[] = [];
  items: any[] = [];
  total = 0;

  busqueda = '';
  sugerencias: any[] = [];

  editandoIndex: number | null = null;

  mostrarTicket = false;
  ultimoEstado: any = null;
  metodo: string = 'Efectivo';

  constructor(
    private inv: InventarioService,
    private ventas: VentasService
  ) { }

  ngOnInit() {
    this.inventario = this.inv.get();
  }

  agregar(i: number) {
    this.guardarEstado();
    this.mostrarTicket = true;
    let prod = this.inventario[i];
    if (!prod.ilimitado && prod.stock <= 0) {
      return alert('Sin stock');
    }

    let item = this.items.find(p => p.nombre === prod.nombre);

    if (item) item.cantidad++;
    else this.items.push({ ...prod, cantidad: 1, _cantidadAnterior: 1 });

    if (!prod.ilimitado) {
      prod.stock--;
    }

    this.ventas.actualizarProducto(prod.nombre);
    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  calcularTotal() {
    this.total = this.items.reduce((a, b) =>
      a + (b.precio * b.cantidad), 0);
  }

  cobrar() {

    if (this.items.length === 0) {
      return alert('No hay productos');
    }

    const detalle = this.items.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.precio * item.cantidad
    }));

  
    this.ventas.guardarVenta(detalle, this.metodo);

    alert('Total: $' + this.total);

    // limpiar
    this.items = [];
    this.total = 0;
  }


  autocompletar() {
    if (!this.busqueda) {
      this.sugerencias = [];
      return;
    }

    const texto = this.busqueda.toLowerCase();

    this.sugerencias = this.inventario.filter(p => {
      return (
        p.nombre.toLowerCase().includes(texto) ||
        p.precio.toString().includes(texto)
      );
    }).slice(0, 5);
  }

  seleccionar(p: any) {
    let index = this.inventario.indexOf(p);
    this.agregar(index);
    this.busqueda = '';
    this.sugerencias = [];
  }

    tecla(valor: string) {

    // 👉 EDITANDO CANTIDAD
    if (this.editandoIndex !== null) {

      let item = this.items[this.editandoIndex];
      let actual = item.cantidad.toString();

      let nueva = parseInt(actual + valor);

      if (isNaN(nueva)) return;

      this.actualizarCantidad(this.editandoIndex, nueva);
      return;
    }

  // 👉 BUSQUEDA
  this.busqueda += valor;
  this.autocompletar();
}

actualizarCantidad(i: number, nuevaCantidad: number) {
  const item = this.items[i];
  const prod = this.inventario.find(p => p.nombre === item.nombre);

  if (!prod) return;

  let diferencia = nuevaCantidad - item.cantidad;

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

  borrar() {

    if (this.editandoIndex !== null) {

      let item = this.items[this.editandoIndex];
      let nueva = Math.floor(item.cantidad / 10);

      if (nueva <= 0) {
        this.eliminarLinea(this.editandoIndex);
        this.editandoIndex = null;
        return;
      }

      this.actualizarCantidad(this.editandoIndex, nueva);
      return;
    }

    this.busqueda = this.busqueda.slice(0, -1);
    this.autocompletar();
  }

  editarCantidad(i: number) {
    this.editandoIndex = i;
  }

  sumar(i: number) {
    this.guardarEstado();

    let prod = this.inventario.find(p => p.nombre === this.items[i].nombre);

    if (!prod) return;

    if (!prod.ilimitado) {
      if (prod.stock <= 0) return;
      prod.stock--;
    }

    this.items[i].cantidad++;

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  restar(i: number) {
    this.guardarEstado();

    let prod = this.inventario.find(p => p.nombre === this.items[i].nombre);

    this.items[i].cantidad--;
    if (!prod.ilimitado) {
      prod.stock++;
    }

    if (this.items[i].cantidad <= 0) {
      this.items.splice(i, 1);
    }

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  eliminarLinea(i: number) {
    this.guardarEstado();

    const item = this.items[i];

    // regresar stock al inventario
    let prod = this.inventario.find(p => p.nombre === item.nombre);
    if (prod && !prod.ilimitado) {
      prod.stock += item.cantidad;
    }

    // eliminar del ticket
    this.items.splice(i, 1);

    this.calcularTotal();
    this.inv.save(this.inventario);
  }

  vaciarTicket() {
    if (!confirm('¿Cancelar toda la venta?')) return;

    // regresar todo el stock
    this.items.forEach(item => {
      let prod = this.inventario.find(p => p.nombre === item.nombre);
      if (prod && !prod.ilimitado) {
        prod.stock += item.cantidad;
      }
    });

    // guardar respaldo para deshacer
    this.ultimoEstado = JSON.stringify({
      items: this.items,
      inventario: this.inventario,
      total: this.total
    });

    this.items = [];
    this.total = 0;

    this.inv.save(this.inventario);
  }

  deshacer() {
    if (!this.ultimoEstado) return alert('Nada que deshacer');

    const data = JSON.parse(this.ultimoEstado);

    this.items = data.items;
    this.inventario = data.inventario;
    this.total = data.total;

    this.inv.save(this.inventario);
  }

  guardarEstado() {
    this.ultimoEstado = JSON.stringify({
      items: this.items,
      inventario: this.inventario,
      total: this.total
    });
  }
cambiarCantidad(i: number) {
  const item = this.items[i];
  const prod = this.inventario.find(p => p.nombre === item.nombre);

  if (!prod) return;

  if (!prod.ilimitado) {

    let cantidadAnterior = item._cantidadAnterior || item.cantidad;
    let diferencia = item.cantidad - cantidadAnterior;

    if (diferencia > 0) {
      if (prod.stock < diferencia) {
        alert('No hay suficiente stock');
        item.cantidad = cantidadAnterior;
        return;
      }
      prod.stock -= diferencia;
    }

    if (diferencia < 0) {
      prod.stock += Math.abs(diferencia);
    }

    item._cantidadAnterior = item.cantidad;
  }

  // 👇 SIEMPRE recalcula (ilimitado o no)
  this.calcularTotal();
  this.inv.save(this.inventario);
}

activarEdicion(i: number) {
  this.editandoIndex = i;
}

  toggleTicket() {
    this.mostrarTicket = !this.mostrarTicket;
  }

  
}