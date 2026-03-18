import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem("agro-cart");
        return guardado ? JSON.parse(guardado) : [];
    });

    useEffect(() => {
        localStorage.setItem("agro-cart", JSON.stringify(carrito));
    }, [carrito]);

    const agregarAlCarrito = (producto, cantidad = 1) => {
        setCarrito((prev) => {
            // Buscamos si el producto ya está en el carrito
            const existe = prev.find((item) => item.producto._id === producto._id);
            
            if (existe) {
                toast.success(`Incrementada la carga de ${producto.titulo || producto.nombre}`, {
                    style: { background: '#1a1a1a', color: '#2dd4bf', border: '1px solid #2dd4bf' }
                });
                return prev.map((item) =>
                    item.producto._id === producto._id
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            }

            // Si es nuevo, lo indexamos
            toast.success(`${producto.titulo || producto.nombre} indexado a la solicitud`, {
                style: { background: '#1a1a1a', color: '#2dd4bf', border: '1px solid #2dd4bf' }
            });
            
            return [...prev, { producto, cantidad }];
        });
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter((item) => item.producto._id !== id));
        toast.error("Activo removido de la solicitud", {
            style: { background: '#1a1a1a', color: '#ef4444', border: '1px solid #ef4444' }
        });
    };

    const modificarCantidad = (id, n) => {
        setCarrito((prev) => prev.map((item) => {
            if (item.producto._id === id) {
                const nuevaCantidad = item.cantidad + n;
                return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 };
            }
            return item;
        }));
    };

    const vaciarCarrito = () => {
        setCarrito([]);
        localStorage.removeItem("agro-cart");
    };

    const subtotal = carrito.reduce(
        (acc, item) => acc + (Number(item.producto.precio) || 0) * item.cantidad,
        0
    );

    // Calculamos el total de items para el badge del Navbar
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <CartContext.Provider
            value={{
                carrito,
                agregarAlCarrito,
                eliminarDelCarrito,
                modificarCantidad,
                vaciarCarrito,
                subtotal,
                totalItems, // <--- Agregamos esto para el Navbar
            }}
        >
            {children}
        </CartContext.Provider>
    );
}