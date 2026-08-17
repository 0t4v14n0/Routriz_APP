import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Cadastro() {
    const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', senha: '' });
    const [status, setStatus] = useState({ tipo: '', msg: '' });
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ tipo: '', msg: '' });

        try {
            // Ajuste a rota '/api/public/cadastrar' conforme o seu Spring Boot
            await api.post('/api/public/cadastrar', formData);
            
            setStatus({ tipo: 'sucesso', msg: 'Conta criada! Você ganhou o acesso Free Tier.' });
            
            // Aguarda 2 segundos e joga o cara pro login automaticamente
            setTimeout(() => navigate('/login'), 2000);
            
        } catch (error) {
            setStatus({ tipo: 'erro', msg: error.response?.data || 'Erro ao criar conta.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border-t-4 border-routriz-blue">
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-routriz-blue tracking-tight">Criar Conta</h2>
                    <p className="text-routriz-dark font-medium mt-1 text-sm">
                        Cadastre-se e inicie seu período <span className="font-bold text-routriz-red">GRÁTIS</span>
                    </p>
                </div>

                {status.msg && (
                    <div className={`p-3 rounded-md mb-4 text-sm text-center font-semibold border ${status.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-routriz-red bg-opacity-10 text-routriz-red border-routriz-red'}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">Nome Completo</label>
                        <input
                            type="text" required
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">E-mail</label>
                        <input
                            type="email" required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">Telefone (WhatsApp)</label>
                        <input
                            type="tel" required
                            value={formData.telefone}
                            onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">Senha</label>
                        <input
                            type="password" required minLength="6"
                            value={formData.senha}
                            onChange={(e) => setFormData({...formData, senha: e.target.value})}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none bg-gray-50"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full flex justify-center py-3 px-4 rounded-full shadow-md text-sm font-bold text-white transition-all mt-6 bg-routriz-blue hover:bg-opacity-90 hover:shadow-lg"
                    >
                        {loading ? 'Criando conta...' : 'Começar Agora'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta? <Link to="/login" className="text-routriz-blue font-bold hover:underline">Faça login</Link>
                </div>
            </div>
        </div>
    );
}