// Lista de productos
const productos = [
    {
        id: 'jetsky',
        nombre: 'JetSky',
        precio: 50,
        imagen: 'img/jetsky.jpg'
    },
    {
        id: 'cuatriciclo',
        nombre: 'Cuatriciclos',
        precio: 30,
        imagen: 'img/Cuatriciclo.jpg'
    },
    {
        id: 'buceo',
        nombre: 'Equipo de buceo',
        precio: 35,
        imagen: 'img/buceo.jpg'
    },
    {
        id: 'surf',
        nombre: 'Tablas de surf',
        precio: 20,
        imagen: 'img/surf.jpg'
    }
];

// Función de alerta al hacer clic en producto
function mostrarmensaje(productoId) {
    let producto = document.getElementById(productoId).textContent;
    alert('Usted ha reservado: ' + producto);
}

//Función para ordenar un producto
function ordenarProducto(elment) {
    console.log(id);

    productos_storage = localStorage.getItem('productos');// Obtenemos el localStorage

    if (productos_storage != null) {
        productos = JSON.parse(productos_storage);// Si existe el localStorage, lo convertimos a JSON
    }else {
        productos = [];// Si no existe el localStorage, inicializamos el array
    }

    productos.push(element);
    localStorage.setItem('productos', JSON.stringify(productos));// Guardamos en el localStorage y convertimos a JSON
}

function mostrarCarrito() {
    let productos = JSON.parse(localStorage.getItem('productos'));
    console.log(productos);
}

// Carga dinámica de productos
function cargarProductos(productos) {

    const contenedor = document.getElementById('products'); // <div id="products">
    const ul = contenedor.querySelector('.product-list');   // <ul class="product-list">

    // Limpiamos por si hay contenido anterior
    ul.innerHTML = '';

    for (let i = 0; i < productos.length; i++) {
        let producto = productos[i];

        // Creamos elementos HTML
        let li = document.createElement('li');

        let nombre = document.createElement('a');
        nombre.id = producto.id;
        nombre.href = '#';
        nombre.textContent = producto.nombre;
        nombre.onclick = function () {
            mostrarmensaje(producto.id);
            return false;
        };

        let img = document.createElement('img');
        img.src = producto.imagen;
        img.alt = producto.nombre;
        img.width = 300;
        img.height = 200;

        // Armamos la estructura
        li.appendChild(nombre);
        li.appendChild(img);
        ul.appendChild(li);
    }
}

// Ejecutar al cargar la página
window.onload = function () {
    cargarProductos(productos);
};
