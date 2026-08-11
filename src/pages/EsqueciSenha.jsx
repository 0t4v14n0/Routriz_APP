import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function EsqueciSenha() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ tipo: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ tipo: '', msg: '' });

        try {
            // Chama a rota de envio do Spring Boot (passando como query param)
            const response = await api.post(`/api/public/senha/recuperar/enviar?email=${email}`);
            setStatus({ tipo: 'sucesso', msg: response.data || 'Se o e-mail estiver cadastrado, enviaremos as instruções.' });
            setEmail(''); // Limpa o campo
        } catch (error) {
            setStatus({ tipo: 'erro', msg: error.response?.data || 'Ocorreu um erro ao tentar enviar o e-mail.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-routriz-blue">
                
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-routriz-blue tracking-tight">Recuperar Senha</h2>
                    <p className="text-gray-500 font-medium mt-2 text-sm">
                        Digite seu e-mail de cadastro e enviaremos um link para você redefinir sua senha.
                    </p>
                </div>

                {/* MENSAGEM DE ALERTA */}
                {status.msg && (
                    <div className={`p-4 rounded-md mb-6 text-sm text-center font-semibold border ${status.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">E-mail</label>
                        <input
                            type="email" required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="entregador@email.com"
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading || status.tipo === 'sucesso'}
                        className="w-full flex justify-center py-3 px-4 rounded-full shadow-md text-sm font-bold text-white transition-all mt-6 bg-routriz-blue hover:bg-opacity-90 hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium">
                    Lembrou a senha? <Link to="/login" className="text-routriz-blue hover:underline">Voltar para o Login</Link>
                </div>
            </div>
        </div>
    );
}