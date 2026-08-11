import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function VerificarEmail() {
    // Pega os parâmetros da URL (tudo que vem depois do ?)
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    // Estados: 'carregando', 'sucesso', 'erro'
    const [status, setStatus] = useState('carregando'); 
    const [mensagem, setMensagem] = useState('Validando o seu e-mail...');

    useEffect(() => {
        if (!token) {
            setStatus('erro');
            setMensagem('Nenhum token de verificação foi encontrado na URL.');
            return;
        }

        const confirmarEmailNoBackend = async () => {
            try {
                // ATENÇÃO: Ajuste a rota abaixo para bater exatamente com a do seu Spring Boot.
                // Pode ser /api/public/verificar
                await api.get(`/api/public/verificar?token=${token}`);
                
                setStatus('sucesso');
                setMensagem('Conta ativada com sucesso! Você já pode acessar as suas rotas.');
            } catch (error) {
                setStatus('erro');
                setMensagem(error.response?.data || 'Link inválido ou expirado. Tente solicitar um novo.');
            }
        };

        // Assim que a tela abre, dispara a requisição
        confirmarEmailNoBackend();
        
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-routriz-bg p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-routriz-blue text-center">
                
                <h2 className="text-3xl font-extrabold text-routriz-blue tracking-tight mb-6">
                    Routriz
                </h2>

                {/* ESTADO: CARREGANDO */}
                {status === 'carregando' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-routriz-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-routriz-dark font-medium">{mensagem}</p>
                    </div>
                )}

                {/* ESTADO: SUCESSO */}
                {status === 'sucesso' && (
                    <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">E-mail Confirmado!</h3>
                        <p className="text-gray-500 mb-8">{mensagem}</p>
                        
                        <Link to="/login" className="w-full bg-routriz-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-full shadow-md transition-all">
                            Ir para o Login
                        </Link>
                    </div>
                )}

                {/* ESTADO: ERRO */}
                {status === 'erro' && (
                    <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-routriz-red mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Ops, algo deu errado!</h3>
                        <p className="text-gray-500 mb-8">{mensagem}</p>
                        
                        <Link to="/cadastro" className="text-routriz-blue font-bold hover:underline">
                            Voltar para o Início
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}