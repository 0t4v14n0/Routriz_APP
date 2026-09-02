import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import routrizNAV from '/logoLetraAzul.png';
import { api } from '../services/api'; // Importando sua API configurada

export default function LandingPage() {
    // 1. Criamos os estados para controlar a saúde do backend e os planos
    const [isBackendOnline, setIsBackendOnline] = useState(true);
    const [planos, setPlanos] = useState([]);

    // 2. Configuração do botão do WhatsApp (Coloque seu DDD 81 e número aqui)
    const numeroWhatsApp = "5581993335045"; 
    const msgWhatsApp = encodeURI("Olá! Gostaria de testar o Routriz.");
    const linkWhats = `https://wa.me/${numeroWhatsApp}?text=${msgWhatsApp}`;

    // 3. Ao abrir a página, o React tenta bater no endpoint de planos
    useEffect(() => {
        const verificarBackend = async () => {
            try {
                const response = await api.get('/api/public/planos');
                setPlanos(response.data);
                setIsBackendOnline(true); // Se respondeu 200 OK, mantém os botões do sistema
            } catch (error) {
                console.error("Backend offline ou erro de conexão:", error);
                setIsBackendOnline(false); // Se deu BAD/Erro, muda a tela para o modo WhatsApp
            }
        };
        verificarBackend();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            
            {/* CABEÇALHO (NAVBAR) */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src={routrizNAV} alt="Routriz Logo" className="h-12 w-auto" />
                    </div>
                    <nav>
                        {/* Oculta o botão de Login se o backend estiver fora */}
                        {isBackendOnline && (
                            <Link
                                to="/login"
                                className="text-blue-600 font-bold hover:text-blue-800 transition-colors px-4 py-2"
                            >
                                Já tenho conta
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* HERO SECTION */}
            <section
                className="relative text-white py-20 px-5 text-center overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('/paraFundo.png')" }}
            >
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
                    
                    {/* 👇 RENDERIZAÇÃO CONDICIONAL DOS BOTÕES PRINCIPAIS */}
                    {isBackendOnline ? (
                        <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                            <Link
                                to="/cadastro"
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
                    ) : (
                        <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                            <a
                                href={linkWhats}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg py-4 px-8 rounded-full shadow-xl hover:scale-105 transition-all transform w-full sm:w-auto flex items-center justify-center gap-3"
                            >
                                {/* Ícone do WhatsApp */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                                Solicitar Acesso pelo WhatsApp
                            </a>
                        </div>
                    )}
                    <p className="text-sm text-blue-200 mt-2 font-medium drop-shadow">Sem compromisso. Cancele quando quiser.</p>
                </div>
            </section>

            {/* FEATURES (Mantido inalterado pois não depende de API) */}
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

            {/* PREÇO (Gerado dinamicamente ou Fallback para WhatsApp) */}
            <section className="py-20 px-5 bg-blue-50">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center gap-6 flex-wrap">
                    
                    {!isBackendOnline ? (
                        // MODO FALLBACK (BACKEND OFF)
                        <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-green-500 relative transform hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                            <div className="p-8 text-center">
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Acesso Antecipado VIP</h3>
                                <p className="text-gray-500 text-sm mb-8">Estamos com vagas abertas para os primeiros testadores. Entre em contato para garantir a sua.</p>
                                
                                <a
                                    href={linkWhats}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                    </svg>
                                    Consultar Condições no WhatsApp
                                </a>
                            </div>
                        </div>
                    ) : planos.length === 0 ? (
                        // MODO CARREGANDO (BACKEND ON, MAS ESPERANDO O FETCH)
                        <p className="text-center text-gray-500">Carregando planos disponíveis...</p>
                    ) : (
                        // MODO NORMAL (API RETORNOU OS PLANOS)
                        planos.map(p => (
                            <div key={p.id} className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-blue-500 relative transform hover:-translate-y-1 transition-transform">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-400"></div>
                                <div className="p-8 text-center flex flex-col h-full">
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{p.nome}</h3>
                                    <p className="text-gray-500 text-sm mb-6">{p.descricao}</p>
                                    
                                    <div className="flex justify-center items-baseline mb-6">
                                            <span className="text-4xl font-extrabold text-gray-900">
                                                R$ {p.valor.toFixed(2).replace('.', ',')}
                                            </span>
                                            {/* Se o nome do plano tiver "Anual", ele mostra "/ano". Caso contrário, mostra "/mês" */}
                                            <span className="text-gray-500 font-medium ml-1">
                                                {p.nome.toLowerCase().includes('anual') ? '/ano' : '/mês'}
                                            </span>
                                    </div>
                                    
                                    <ul className="text-left flex flex-col gap-3 mb-8 flex-1">
                                        <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                            <span className="text-green-500">✓</span> Rotas otimizadas infinitas
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                            <span className="text-green-500">✓</span> Leitura de etiquetas com IA
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                            <span className="text-green-500">✓</span> Modo App de celular (PWA)
                                        </li>
                                    </ul>
                                    
                                    <Link
                                        to="/login"
                                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors mt-auto"
                                    >
                                        Assinar {p.nome}
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm mt-auto">
                <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    <p>&copy; {new Date().getFullYear()} Routriz. Todos os direitos reservados.</p>
                    
                    <div className="flex items-center gap-6">
                        <a
                            href="https://www.otaviano.dev.br/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            title="Desenvolvido por Otaviano"
                        >
                            <img src="/icoja.png" alt="Ícone do Desenvolvedor" className="h-5 w-auto" />
                            <span className="hidden sm:inline">otaviano.dev.br</span>
                        </a>

                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}