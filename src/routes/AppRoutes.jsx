import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Importação de todas as telas
import Login from '../pages/Login'; 
import Dashboard from '../pages/Dashboard';
import Cadastro from '../pages/Cadastro';
import Pagamento from '../pages/Pagamento';
import VerificarEmail from '../pages/VerificarEmail'; // <-- IMPORTAÇÃO AQUI
import EsqueciSenha from '../pages/EsqueciSenha';
import RedefinirSenha from '../pages/RedefinirSenha';

export function AppRoutes() {
    const { usuario } = useContext(AuthContext);

    // Regras de Proteção (O Guarda de Trânsito)
    const PrivateRoute = ({ children }) => {
        if (!usuario) return <Navigate to="/login" />;
        if (usuario.statusAssinatura === 'EXPIRADO') return <Navigate to="/pagamento" />;
        return children;
    };

    return (
        <Routes>
            {/* ======================= */}
            {/* ROTAS PÚBLICAS (LIVRES) */}
            {/* ======================= */}
            <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/cadastro" element={usuario ? <Navigate to="/dashboard" /> : <Cadastro />} />
            <Route path="/esqueci-senha" element={usuario ? <Navigate to="/dashboard" /> : <EsqueciSenha />} />
            <Route path="/recuperar-senha" element={usuario ? <Navigate to="/dashboard" /> : <RedefinirSenha />} />
            
            {/* A ROTA DE CONFIRMAÇÃO DE E-MAIL FICA AQUI, ACESSÍVEL PARA TODOS! */}
            <Route path="/publico/verificar-email" element={<VerificarEmail />} />
            
            {/* ======================= */}
            {/* ROTAS PRIVADAS (TRAVADAS) */}
            {/* ======================= */}
            <Route path="/pagamento" element={usuario ? <Pagamento /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            
            {/* ROTA CORINGA (Se digitar URL que não existe, vai pro Dashboard) */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}