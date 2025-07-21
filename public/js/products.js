const socket = io();

const productForm = document.getElementById('productForm');
const deleteProductForm = document.getElementById('deleteProductForm');
const productList = document.getElementById('productList');

const renderProducts = (products) => {
    productList.innerHTML = '';
    if (products.length === 0) {
        productList.innerHTML = '<li>No hay productos disponibles.</li>';
        return;
    }
    products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${product.title}</strong> - $${product.price}
            <p>${product.description}</p>
            <p>Categoría: ${product.category}</p>
            <p>Stock: ${product.stock}</p>
            <p>ID: ${product.id}</p>
        `;
        productList.appendChild(li);
    });
};

socket.on('productsUpdated', (products) => {
    console.log('Productos actualizados recibidos:', products);
    renderProducts(products);
});

socket.on('error', (message) => {
    alert('Error del servidor: ' + message);
});

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        stock: parseInt(document.getElementById('stock').value),
    };
    socket.emit('addProduct', newProduct);
    productForm.reset();
});

deleteProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const productIdToDelete = document.getElementById('productIdToDelete').value;
    if (productIdToDelete) {
        socket.emit('deleteProduct', productIdToDelete);
        deleteProductForm.reset();
    } else {
        alert('Por favor, ingresa el ID del producto a eliminar.');
    }
});

socket.on('connect', () => {
    console.log('Conectado al servidor de WebSockets');
});