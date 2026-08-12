// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import routrizNAV from '/logoLetraAzul.png';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            
            {/* CABEÇALHO (NAVBAR) */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src={routrizNAV} alt="Roteiriza Logo" className="h-12 w-auto" />
                    </div>
                    <nav>
                        <Link 
                            to="/login" 
                            className="text-blue-600 font-bold hover:text-blue-800 transition-colors px-4 py-2"
                        >
                            Já tenho conta
                        </Link>

                    </nav>
                </div>
            </header>

            {/* HERO SECTION (Com fundo de mapa) */}
            {/* 👇 1. Adicionamos bg-cover e bg-center, e inserimos a imagem via style */}
            <section 
                className="relative text-white py-20 px-5 text-center overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('/paraFundo.png')" }}
            >
                {/* 👇 2. Camada semitransparente azul (Overlay) para dar contraste no texto */}
                <div className="absolute inset-0 bg-blue-900/85"></div>

                <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center gap-6">
                    <span className="bg-blue-500 bg-opacity-30 text-blue-100 px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-2 backdrop-blur-sm">
                        O Segredo dos Entregadores Ágeis
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-md">
                        Entregue mais rápido. <br className="hidden md:block" /> Gaste menos gasolina.
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl drop-shadow">
                        Leia etiquetas com a câmera do celular, calcule a melhor rota em segundos e termine o seu dia de trabalho até 2 horas mais cedo.
                    </p>
                    
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                        <Link 
                            to="/login" 
                            className="bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg py-4 px-8 rounded-full shadow-xl hover:scale-105 transition-all transform w-full sm:w-auto"
                        >
                            Testar 7 Dias Grátis
                        </Link>

                        <Link 
                            to="/apresentacao" 
                            className="bg-white/20 hover:bg-white/30 border border-white/50 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-all transform w-full sm:w-auto backdrop-blur-sm"
                        >
                            Como Funciona?
                        </Link>
                    </div>
                    <p className="text-sm text-blue-200 mt-2 font-medium drop-shadow">Sem compromisso. Cancele quando quiser.</p>
                </div>
            </section>

            {/* FEATURES (Por que assinar?) */}
            <section className="py-20 px-5 bg-white">
                <div className="max-w-6xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900">Tudo que você precisa em um só App</h2>
                    <p className="text-gray-500 mt-3 font-medium">Chega de digitar endereços no Waze um por um.</p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Câmera com IA</h3>
                        <p className="text-gray-600 text-sm">Escaneie a etiqueta do Mercado Livre ou Shopee. Nossa inteligência extrai o endereço na hora.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-5">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Rota Mágica</h3>
                        <p className="text-gray-600 text-sm">Com um clique, o sistema organiza suas paradas para você não dar voltas desnecessárias pelo bairro.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">GPS com Memória</h3>
                        <p className="text-gray-600 text-sm">O mapa aprende o local exato da porta do cliente. Nunca mais se perca em condomínios gigantes.</p>
                    </div>
                </div>
            </section>

            {/* PREÇO (Transparente e Direto) */}
            <section className="py-20 px-5 bg-blue-50">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-blue-500 relative transform hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-400"></div>
                    <div className="p-8 text-center">
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Acesso Ilimitado</h3>
                        <p className="text-gray-500 text-sm mb-6">Pague menos de R$ 1 por dia para ter paz.</p>
                        
                        <div className="flex justify-center items-baseline mb-6">
                            <span className="text-4xl font-extrabold text-gray-900">R$ 29,90</span>
                            <span className="text-gray-500 font-medium ml-1">/mês</span>
                        </div>
                        
                        <ul className="text-left flex flex-col gap-3 mb-8">
                            <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                <span className="text-green-500">✓</span> Rotas otimizadas infinitas
                            </li>
                            <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                <span className="text-green-500">✓</span> Leitura de etiquetas com IA
                            </li>
                            <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                <span className="text-green-500">✓</span> Modo App de celular (PWA)
                            </li>
                            <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                <span className="text-green-500">✓</span> Suporte técnico direto
                            </li>
                        </ul>
                        
                        <Link 
                            to="/login" 
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors"
                        >
                            Começar Meus 7 Dias Grátis
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-auto">
                <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} Roteiriza. Todos os direitos reservados.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}