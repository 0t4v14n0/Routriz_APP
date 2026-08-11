import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function RedefinirSenha() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [senhas, setSenhas] = useState({ nova: '', confirmar: '' });
    const [status, setStatus] = useState({ tipo: '', msg: '' });
    const [loading, setLoading] = useState(false);

    // Proteção caso abram a tela sem o token
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4 font-sans text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-routriz-red">
                    <h2 className="text-2xl font-bold text-routriz-red mb-2">Acesso Inválido</h2>
                    <p className="text-gray-600 mb-6">Nenhum token de recuperação encontrado na URL.</p>
                    <Link to="/esqueci-senha" className="text-routriz-blue font-bold hover:underline">Solicitar novo link</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validação Frontend simples
        if (senhas.nova !== senhas.confirmar) {
            setStatus({ tipo: 'erro', msg: 'As senhas não coincidem. Digite novamente.' });
            return;
        }
        if (senhas.nova.length < 6) {
            setStatus({ tipo: 'erro', msg: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        setStatus({ tipo: '', msg: '' });

        try {
            // Bate na rota passando o token na URL e a senha no corpo (Record DTO)
            await api.post(`/api/public/senha/recuperar/${token}`, { senha: senhas.nova });
            
            setStatus({ tipo: 'sucesso', msg: 'Senha alterada com sucesso! Redirecionando...' });
            
            // Joga pro login depois de 2.5 segundos
            setTimeout(() => navigate('/login'), 2500);
            
        } catch (error) {
            setStatus({ tipo: 'erro', msg: error.response?.data || 'Link expirado ou inválido. Solicite novamente.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-routriz-blue">
                
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-routriz-blue tracking-tight">Criar Nova Senha</h2>
                    <p className="text-gray-500 font-medium mt-2 text-sm">
                        Digite sua nova senha de acesso ao Routriz abaixo.
                    </p>
                </div>

                {status.msg && (
                    <div className={`p-4 rounded-md mb-6 text-sm text-center font-semibold border ${status.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">Nova Senha</label>
                        <input
                            type="password" required
                            value={senhas.nova}
                            onChange={(e) => setSenhas({...senhas, nova: e.target.value})}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">Confirmar Nova Senha</label>
                        <input
                            type="password" required
                            value={senhas.confirmar}
                            onChange={(e) => setSenhas({...senhas, confirmar: e.target.value})}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading || status.tipo === 'sucesso'}
                        className="w-full flex justify-center py-3 px-4 rounded-full shadow-md text-sm font-bold text-white transition-all mt-6 bg-routriz-blue hover:bg-opacity-90 hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}