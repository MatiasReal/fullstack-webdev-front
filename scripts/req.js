//const axios = require('axios');//libreria para hacer peticiones http


//Estructura de la peticion a implementar en el proyecto
axios.get('http://localhost:5000/api/productos')
    .then (function (response) {
        // handle success
        console.log(response.data);
    })
    .catch (function (error) {
        // handle error
        console.log(error);
    })
    .finally (function () {
        // always executed
    });

    async function getProductos() {
        try {
            const response = await axios.get('/productos');
            console.log('Productos fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching productos:', error);
            throw error;
        }
    }