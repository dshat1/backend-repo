document.addEventListener('DOMContentLoaded', () => {
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      const newQuantity = e.target.value;
      const cartId = e.target.dataset.cartId;
      const productId = e.target.dataset.productId;
      const url = `/api/carts/${cartId}/products/${productId}/update-quantity`;

      if (newQuantity < 1) {
        e.target.value = 1;
        return;
      }
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (response.ok) {
          window.location.reload(); 
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
          window.location.reload(); // Recargar para restaurar la cantidad
        }
      } catch (error) {
        console.error('Error al actualizar la cantidad:', error);
        alert('Hubo un error al actualizar la cantidad.');
        window.location.reload(); 
      }
    });
  });
});