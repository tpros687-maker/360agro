import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem("agro-cart");
        const parsed = guardado ? JSON.parse(guardado) : [];
        // 🩹 AUTO-REPARACIÓN: Si hay datos en el formato viejo {producto, cantidad}, los aplanamos
        return parsed.map(item => item.producto ? { ...item.producto, cantidad: item.cantidad } : item);
    });

    useEffect(() => {
        localStorage.setItem("agro-cart", JSON.stringify(carrito));
    }, [carrito]);

    const agregarAlCarrito = (producto, cantidad = 1) => {
        // 🚀 MOVE TOAST OUTSIDE: Los efectos como 'toast' no deben dispararse dentro de un callback de estado (updater)
        const existePrev = carrito.find(item => item._id === producto._id);

        if (existePrev) {
            toast.success(`Incrementada la carga de ${producto.titulo || producto.nombre}`, {
                style: { background: '#1a2424', color: '#E8E0C8', border: '1px solid #3F6F76' }
            });
        } else {
            toast.success(`${producto.titulo || producto.nombre} indexado a la solicitud`, {
                style: { background: '#1a2424', color: '#E8E0C8', border: '1px solid #3F6F76' }
            });
        }

        setCarrito((prev) => {
            const existe = prev.find((item) => item._id === producto._id);
            if (existe) {
                return prev.map((item) =>
                    item._id === producto._id
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            }
            return [...prev, { ...producto, cantidad }];
        });
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter((item) => item._id !== id));
        toast.error("Activo removido de la solicitud", {
            style: { background: '#1a1a1a', color: '#ef4444', border: '1px solid #ef4444' }
        });
    };

    const modificarCantidad = (id, n) => {
        setCarrito((prev) => prev.map((item) => {
            if (item._id === id) {
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
        (acc, item) => acc + (Number(item.precio) || 0) * item.cantidad,
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