import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Pagamento() {
    const { usuario, setUsuario } = useContext(AuthContext);

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) {}
        setUsuario(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Cabeçalho de Alerta */}
                <div className="bg-routriz-red p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white mx-auto mb-2">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-2xl font-extrabold text-white">Tempo Esgotado</h2>
                </div>

                <div className="p-8 text-center">
                    <p className="text-gray-600 font-medium mb-6">
                        Fala, <span className="font-bold text-routriz-dark">{usuario?.nome || 'Entregador'}</span>! 
                        Seu período <strong className="text-routriz-blue">Free Tier</strong> chegou ao fim.
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-8">
                        Para continuar roteirizando suas entregas sem limites e economizando combustível, escolha seu plano abaixo:
                    </p>

                    <button className="w-full bg-routriz-blue hover:bg-opacity-90 text-white font-bold py-4 rounded-full shadow-lg transition-all mb-4 text-lg">
                        Assinar o Routriz Pro
                    </button>

                    <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-routriz-red font-medium transition-colors">
                        Sair da conta
                    </button>
                </div>
            </div>
        </div>
    );
}