// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado para controlar o olhinho
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const { setUsuario } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            // 1. Faz o login e CAPTURA a resposta do Spring Boot
            const responseLogin = await api.post('/api/public/login', { 
                identificador: email,
                senha: senha 
            });
            
            // Pega o token, considerando o "T" maiúsculo que seu backend devolve
            const token = responseLogin.data.Token || responseLogin.data.token || responseLogin.data;

            if (token) {
                // 2. Salva o token no navegador para manter a sessão
                localStorage.setItem('token', token);

                // 3. Coloca o token no cabeçalho do Axios para as PRÓXIMAS requisições
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            // 4. Busca os dados do usuário usando a nova rota /me que criamos
            const responseMe = await api.get('/api/entregadores/me');
            
            // 5. Salva no contexto global e vai para o Dashboard sem precisar de F5
            setUsuario(responseMe.data);
            navigate('/dashboard', { replace: true });
            
        } catch (error) {
            // Tratamento de erros de senha errada ou usuário não confirmado (401/403)
            if (error.response && (error.response.status === 403 || error.response.status === 401)) {
                setErro('E-mail, senha incorretos ou e-mail não confirmado.');
            } else {
                setErro('Erro ao tentar conectar com o servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4">
            
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border-t-4 border-routriz-blue">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-routriz-blue tracking-tight">
                        Routriz
                    </h2>
                    <p className="text-routriz-dark font-medium mt-2">
                        Sua rota inteligente, sua entrega perfeita
                    </p>
                </div>

                {erro && (
                    <div className="bg-routriz-red text-white p-3 rounded-md mb-4 text-sm text-center font-bold shadow-sm">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Campo de E-mail */}
                    <div>
                        <label className="block text-sm font-bold text-routriz-dark mb-1">E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 p-3 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none transition-colors bg-gray-50"
                            placeholder="entregador@routriz.com"
                        />
                    </div>

                    {/* Campo de Senha com o Olhinho e "Esqueceu a senha?" */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-routriz-dark">Senha</label>
                            <Link to="/esqueci-senha" className="text-sm text-routriz-blue hover:underline font-medium">
                                Esqueceu a senha?
                            </Link>
                        </div>
                        
                        <div className="relative">
                            <input
                                // Alterna entre text e password baseado no estado
                                type={mostrarSenha ? "text" : "password"} 
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 p-3 pr-12 focus:border-routriz-blue focus:ring-1 focus:ring-routriz-blue outline-none transition-colors bg-gray-50"
                                placeholder="••••••••"
                            />
                            {/* Botão do Olhinho */}
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-routriz-blue focus:outline-none"
                            >
                                {mostrarSenha ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Botão de Login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 rounded-full shadow-md text-sm font-bold text-white transition-all mt-4 ${
                            loading ? 'bg-opacity-70 bg-routriz-blue cursor-not-allowed' : 'bg-routriz-blue hover:bg-opacity-90 hover:shadow-lg'
                        }`}
                    >
                        {loading ? 'Acessando sistema...' : 'Entrar nas Rotas'}
                    </button>
                </form>

                {/* Link de Cadastro */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    Ainda não é entregador?{' '}
                    <Link to="/cadastro" className="text-routriz-red font-bold hover:underline transition-all">
                        Cadastre-se aqui
                    </Link>
                </div>

            </div>
        </div>
    );
}