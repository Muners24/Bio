import { createContext, useState, useEffect } from "react";

// Crear el contexto
export const AppContext = createContext();

// Proveedor del contexto
export const AppProvider = ({ children }) => {
    // Estado de ejemplo
    const [state, setState] = useState(null);

    // Efecto de ejemplo (puedes agregar la lógica que necesites aquí)
    useEffect(() => {
        // Lógica del useEffect si es necesario
    }, []);

    return (
        <AppContext.Provider value={{ state, setState }}>
            {children}
        </AppContext.Provider>
    );
};
