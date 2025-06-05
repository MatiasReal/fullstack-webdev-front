import { getProductos, crearReserva, cancelarReservaConToken } from './req.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productos = await getProductos();
    const productosContainer = document.querySelector('.product-list');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    actualizarCarritoUI();

    productosContainer.innerHTML = '';

    if (productos.length === 0) {
        productosContainer.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
        return;
    }

    productos
        .filter(p => p.estadoUso !== 'RESERVADO')
        .forEach((producto, index) => {

            const nombre = producto.nombre || 'Producto no disponible';
            const precio = producto.precioPorTurno || 'precio no disponible';
            const imagen = producto.imagen || 'img/default.jpg';

            const productoFinal = {
                ...producto,
                nombre,
                precioPorTurno: precio,
                imagen
            };

            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = nombre;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarPopup(productoFinal);
            });

            const img = document.createElement('img');
            img.src = imagen;
            img.alt = nombre;
            img.width = 300;
            img.height = 200;

            li.appendChild(link);
            li.appendChild(img);
            productosContainer.appendChild(li);
        });

    function mostrarPopup(producto) {
        const popup = document.createElement('div');
        popup.style = estiloPopup();
        popup.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precioPorTurno}</p>
            <button id="comprar">Agregar al carrito</button>
            <button id="cerrar">Cerrar</button>
        `;
        document.body.appendChild(popup);

        document.getElementById('comprar').addEventListener('click', () => {
            agregarAlCarrito(producto);
            popup.remove();
        });
        document.getElementById('cerrar').addEventListener('click', () => popup.remove());
    }

    function agregarAlCarrito(producto) {
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarritoUI();
    }

    function actualizarCarritoUI() {
        const nav = document.querySelector('.navbar');
        let carritoBtn = document.querySelector('#carrito-btn');
        if (!carritoBtn) {
            carritoBtn = document.createElement('button');
            carritoBtn.id = 'carrito-btn';
            nav.appendChild(carritoBtn);
            carritoBtn.addEventListener('click', mostrarCarrito);
        }
        carritoBtn.textContent = `🛒 (${carrito.length})`;
    }

    function mostrarCarrito() {
        if (carrito.length === 0) return alert('El carrito está vacío');

        const popup = document.createElement('div');
        popup.style = estiloPopup();
        popup.innerHTML = `
            <h3>Carrito</h3>
            <ul id="carrito-lista">
                ${carrito.map((p, i) => `
                    <li>${p.nombre} - $${p.precioPorTurno} 
                        <button data-index="${i}">❌</button>
                    </li>`).join('')}
            </ul>
            <hr>
            <button id="pagar">Pagar</button>
            <button id="pagarLocal">Pagar en el lugar</button>
            <button id="cerrarCarrito">Cerrar</button>
        `;
        document.body.appendChild(popup);

        document.querySelectorAll('#carrito-lista button').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                carrito.splice(index, 1);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                popup.remove();
                actualizarCarritoUI();
                mostrarCarrito();
            });
        });

        document.getElementById('pagar').addEventListener('click', () => {
            popup.remove();
            mostrarFormularioReserva('TARJETA', 'Se ha pagado exitosamente');
        });

        document.getElementById('pagarLocal').addEventListener('click', () => {
            popup.remove();
            mostrarFormularioReserva('EFECTIVO', '¡Lo/a esperamos!');
        });

        document.getElementById('cerrarCarrito').addEventListener('click', () => popup.remove());
    }

    function mostrarFormularioReserva(metodoPago, mensaje) {
    const popup = document.createElement('div');
    popup.style = estiloPopup();
    const fechaMin = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

    popup.innerHTML = `
        <h3>Datos de la reserva</h3>
        <label>Nombre:<br><input type="text" id="nombreCliente"></label><br><br>
        <label>Fecha:<br><input type="date" id="fecha" min="${fechaMin}"></label><br><br>
        <label>Hora:<br><input type="time" id="hora"></label><br><br>
        <label>Turnos:<br><input type="number" id="turnos" min="1" max="3"></label><br><br>
        <label>Moneda:<br>
            <select id="moneda">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
            </select></label><br><br>
        <label><input type="checkbox" id="seguro"> Incluir seguro por tormenta</label><br><br>

        <hr><strong>Resumen:</strong>
        <div id="resumenReserva" style="font-size:14px; margin-top:10px;"></div><br>

        <button id="confirmarReserva">Confirmar reserva</button>
        <button id="cancelarReserva">Cancelar</button>
    `;

    document.body.appendChild(popup);

    const campos = ['nombreCliente', 'fecha', 'hora', 'turnos', 'moneda', 'seguro'];
    campos.forEach(id => {
        document.getElementById(id).addEventListener('input', actualizarResumen);
    });

    function actualizarResumen() {
        const cliente = document.getElementById('nombreCliente').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const turnos = parseInt(document.getElementById('turnos').value);
        const moneda = document.getElementById('moneda').value;
        const seguroTormenta = document.getElementById('seguro').checked;

        if (!cliente || !fecha || !hora || isNaN(turnos)) {
            document.getElementById('resumenReserva').innerText = 'Completá los campos...';
            return;
        }

        const base = carrito.reduce((a, p) => a + (p.precioPorTurno || 0), 0);
        let subtotal = base * turnos;
        if (carrito.length > 1) subtotal *= 0.9;
        const total = seguroTormenta ? subtotal * 1.5 : subtotal;

        document.getElementById('resumenReserva').innerHTML = `
            Cliente: ${cliente}<br>
            Fecha: ${fecha} ${hora}<br>
            Turnos: ${turnos}<br>
            Moneda: ${moneda}<br>
            Productos: ${carrito.map(p => p.nombre).join(', ')}<br>
            Total estimado: $${total.toFixed(2)}
        `;
    }

    document.getElementById('cancelarReserva').addEventListener('click', () => popup.remove());

    document.getElementById('confirmarReserva').addEventListener('click', async () => {
        const cliente = document.getElementById('nombreCliente').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const turnos = parseInt(document.getElementById('turnos').value);
        const moneda = document.getElementById('moneda').value;
        const seguroTormenta = document.getElementById('seguro').checked;

        if (!cliente || !fecha || !hora || isNaN(turnos)) {
            alert('Completá todos los campos');
            return;
        }

        const tiempoInicio = new Date(`${fecha}T${hora}`).toISOString();
        const productosId = carrito.map(p => p._id).filter(Boolean);

        if (productosId.length === 0) {
            alert('Productos inválidos.');
            return;
        }

        const tokenReserva = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        try {
            const reserva = await crearReserva({
                cliente,
                productos: productosId,
                tiempoInicio,
                turnos,
                moneda,
                metodoDePago: metodoPago, 
                seguroTormenta,
                tokenReserva
            });

            // Opcional: copiar token
            await navigator.clipboard.writeText(tokenReserva);
            alert(`${mensaje}\nCódigo para cancelar: ${tokenReserva}\n(Se copió al portapapeles)`);

            carrito = [];
            localStorage.removeItem('carrito');
            actualizarCarritoUI();
            popup.remove();
        } catch (err) {
            // error ya manejado en req.js
        }
    });
}


    // Cancelación de reserva por código/token
    const btnCancelar = document.getElementById('btnCancelarReserva');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', async () => {
            const token = document.getElementById('codigoCancelar').value.trim();
            if (!token) return alert('Ingresá un código válido');
            try {
                await cancelarReservaConToken(token);
                alert('Reserva cancelada con éxito');
            } catch (err) {
                alert('Error al cancelar reserva: código inválido o vencido');
            }
        });
    }

    function estiloPopup() {
        return `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            z-index: 9999;
            color: black;
            max-width: 400px;
        `;
    }
});
