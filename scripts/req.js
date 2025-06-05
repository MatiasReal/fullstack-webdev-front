const API_URL = 'http://localhost:5000';

export async function getProductos() {
    try {
        const response = await axios.get(`${API_URL}/api/productos`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

export async function crearReserva(reservaData) {
  try {
    const response = await axios.post(`${API_URL}/api/reserva`, reservaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error.response?.data || error);
    alert(`Error al crear reserva: ${error.response?.data?.error || error.message}`);
    throw error;
  }
}

export async function cancelarReservaConToken(tokenReserva) {
  try {
    const res = await axios.delete(`${API_URL}/api/reserva/cancel`, {
      data: { tokenReserva } 
    });
    return res.data;
  } catch (err) {
    console.error('Error al cancelar reserva:', err.response?.data || err);
    throw err;
  }
}


