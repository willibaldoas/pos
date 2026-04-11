import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VentasService {

  guardarVenta(items: any[], metodo: string = 'Efectivo') {
    let ventas = JSON.parse(localStorage.getItem('ventasDia') || '[]');

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    ventas.push({
      fecha: new Date(),
      total,
      metodo,
      items,
      folio: Date.now()
    });

    localStorage.setItem('ventasDia', JSON.stringify(ventas));
  }

  getVentasProductos() {
    return JSON.parse(localStorage.getItem('ventasProductos') || '{}');
  }

  actualizarProducto(nombre: string) {
    let data = this.getVentasProductos();
    data[nombre] = (data[nombre] || 0) + 1;
    localStorage.setItem('ventasProductos', JSON.stringify(data));
  }

  getTotalHoy() {
    let ventas = JSON.parse(localStorage.getItem('ventasDia') || '[]');
    let hoy = new Date().toDateString();

    return ventas
      .filter((v: any) => new Date(v.fecha).toDateString() === hoy)
      .reduce((a: number, b: any) => a + b.total, 0);
  }

  getVentasPorDia() {
    let ventas = JSON.parse(localStorage.getItem('ventasDia') || '[]');

    const agrupado: any = {};

    ventas.forEach((v: any) => {
      const fecha = new Date(v.fecha).toLocaleDateString('es-MX');

      if (!agrupado[fecha]) {
        agrupado[fecha] = 0;
      }

      agrupado[fecha] += v.total;
    });

    return Object.keys(agrupado)
      .map(fecha => ({
        fecha,
        total: agrupado[fecha]
      }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  getVentas() {
    return JSON.parse(localStorage.getItem('ventasDia') || '[]')
      .sort((a: any, b: any) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
  }

  getVentaPorFolio(folio: number) {
    let ventas = this.getVentas();
    return ventas.find((v: any) => v.folio === folio);
  }

  getTotalesPorMetodo() {
    let ventas = this.getVentas();

    const resumen: any = {};

    ventas.forEach((v: any) => {
      if (!resumen[v.metodo]) {
        resumen[v.metodo] = 0;
      }
      resumen[v.metodo] += v.total;
    });

    return resumen;
  }

  getTopProductos() {
    return this.getVentasProductos();
  }

  getVentasPorRango(desde: string, hasta: string) {
    let ventas = this.getVentas();

    const inicio = new Date(desde);
    const fin = new Date(hasta);

    // incluir todo el día final
    fin.setHours(23, 59, 59, 999);

    return ventas.filter((v: any) => {
      const fecha = new Date(v.fecha);
      return fecha >= inicio && fecha <= fin;
    });
  }

  getResumenRango(desde: string, hasta: string) {
    const ventas = this.getVentasPorRango(desde, hasta);

    let total = 0;
    const metodos: any = {};
    const productos: any = {};

    ventas.forEach((v: any) => {
      total += v.total;

      // métodos de pago
      if (!metodos[v.metodo]) metodos[v.metodo] = 0;
      metodos[v.metodo] += v.total;

      // productos
      v.items.forEach((item: any) => {
        if (!productos[item.nombre]) productos[item.nombre] = 0;
        productos[item.nombre] += item.cantidad;
      });
    });

    return {
      total,
      metodos,
      productos,
      cantidadVentas: ventas.length
    };
  }
    

}