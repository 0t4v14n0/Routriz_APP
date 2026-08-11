import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token'); // 1. Pega o token salvo no navegador

        if (token) {
            // 2. Configura o token no Axios GLOBALMENTE antes de chamar a API
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // 3. Agora sim, faz a requisição com o crachá colado!
            api.get('/api/entregadores/me')
                .then((response) => {
                    setUsuario(response.data); // Logado com sucesso!
                })
                .catch(() => {
                    localStorage.removeItem('token'); // Se o token expirou/falhou, limpa
                    setUsuario(null);
                })
                .finally(() => {
                    setCarregando(false); // Esconde a tela de Splash
                });
        } else {
            // Se não tem token salvo nem tenta requisição
            setCarregando(false);
        }
    }, []);

    if (carregando) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2563EB', color: 'white' }}>
                <h1>Roteiriza...</h1>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ usuario, setUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}