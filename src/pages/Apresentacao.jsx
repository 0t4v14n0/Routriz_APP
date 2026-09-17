// src/pages/Apresentacao.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import routrizNAV from '/logoLetraAzul.png'; // Ajuste o caminho da logo se necessário

export default function Apresentacao() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* CABEÇALHO */}
            <header className="bg-blue-600 text-white p-5 rounded-b-3xl shadow-lg sticky top-0 z-50">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={routrizNAV} alt="Routriz Logo" className="h-10 w-auto brightness-0 invert" />
                        <span className="font-extrabold text-xl tracking-tight hidden sm:block border-l pl-3 border-blue-400">Guia Rápido</span>
                    </div>
                    <Link to="/" className="text-white text-sm font-bold bg-white/20 px-5 py-2 rounded-full hover:bg-white/30 transition-colors">
                        Voltar
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-5 mt-4 flex flex-col gap-12">
                
                {/* 🎥 VÍDEO 1: CONHECENDO O SISTEMA (VÍDEO NA ESQUERDA) */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                    
                    {/* Container do Vídeo Vertical (Esquerda) simulando celular */}
                    <div className="w-full max-w-[280px] shrink-0 aspect-[9/16] rounded-[2rem] shadow-2xl overflow-hidden bg-black border-[6px] border-gray-800 relative">
                        {/* "Notch" do celular */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
                        <iframe 
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/DWqJHH0fOiU" 
                            title="Conhecendo o sistema Routriz" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Textos (Direita) */}
                    <div className="flex-1 text-center md:text-left">
                        <span className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-3 inline-block">Tour Completo</span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                            Conhecendo o Routriz 🚀
                        </h1>
                        <p className="text-gray-600 font-medium text-lg">
                            Veja na prática como ler as etiquetas e traçar a rota mais rápida do dia em poucos segundos.
                        </p>
                    </div>
                </div>

                {/* 📱 VÍDEO 2: COMO INSTALAR (TEXTO NA ESQUERDA, VÍDEO NA DIREITA) */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                    
                    {/* Textos (Esquerda) */}
                    <div className="flex-1 text-center md:text-left">
                        <span className="bg-green-100 text-green-600 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-3 inline-block">Download</span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Como instalar o App?</h2>
                        <p className="text-gray-600 font-medium mb-4">
                            O Routriz não ocupa a memória do seu celular! Ele é um aplicativo leve que você instala direto pelo navegador (Google Chrome ou Safari).
                        </p>
                        <p className="text-sm text-gray-500">
                            Assista ao vídeo ao lado para ver como colocar o ícone do Routriz na tela inicial do seu aparelho em menos de 10 segundos.
                        </p>
                    </div>

                    {/* Container do Vídeo Vertical Shorts (Direita) simulando tela de celular */}
                    <div className="w-full max-w-[280px] shrink-0 aspect-[9/16] rounded-[2rem] shadow-2xl overflow-hidden bg-black border-[6px] border-gray-800 relative">
                        {/* "Notch" do celular */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
                        <iframe 
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/wmYkfugu3M4" 
                            title="Como instalar o Routriz" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Por que somos diferentes?</h2>
                    <p className="text-gray-500 font-medium">Os segredos que fazem você entregar muito mais rápido.</p>
                </div>

                {/* GRID DE FUNCIONALIDADES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* PASSO 1 */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 font-extrabold px-4 py-1 rounded-bl-2xl">Passo 1</div>
                        <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 mt-2">📷</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Leitura com IA</h2>
                        <p className="text-gray-600 text-sm flex-1">
                            Aponte a câmera para a etiqueta da Shopee ou Mercado Livre. A nossa Inteligência Artificial recorta a imagem e extrai o endereço instantaneamente, sem você precisar digitar nada.
                        </p>
                    </section>

                    {/* PASSO 2 */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 bg-green-100 text-green-600 font-extrabold px-4 py-1 rounded-bl-2xl">Passo 2</div>
                        <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 mt-2">🗺️</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Motor 100% Pernambuco</h2>
                        <p className="text-gray-600 text-sm flex-1">
                            Com todos os pacotes na tela, o sistema desenha a linha do trajeto. Nosso motor de rotas foi treinado especificamente com as ruas do interior e da capital de PE para não te mandar para becos sem saída.
                        </p>
                    </section>

                    {/* PASSO 3 (Google vs Mapbox) */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 font-extrabold px-4 py-1 rounded-bl-2xl">Passo 3</div>
                        <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 mt-2">📍</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Escolha seu GPS</h2>
                        <p className="text-gray-600 text-sm flex-1">
                            Você não fica preso a um mapa só. Use o nosso <strong>Mapbox 3D</strong> que exibe o contorno dos prédios e o modo noturno, ou alterne com um clique para o <strong>Google Maps</strong> clássico.
                        </p>
                    </section>

                    {/* PASSO 4 (Inteligência Coletiva) */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute top-0 right-0 bg-purple-100 text-purple-600 font-extrabold px-4 py-1 rounded-bl-2xl z-10">Passo 4</div>
                        
                        <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 mt-2 z-10">🧠</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 z-10">Inteligência Coletiva</h2>
                        <p className="text-gray-600 text-sm flex-1 z-10">
                            Ao confirmar a entrega, o Routriz grava a coordenada exata de onde você estava. Na próxima vez que tiver encomenda lá, o pino cai com <strong>100% de precisão na porta da casa</strong>, e não no meio da rua!
                        </p>
                    </section>
                </div>

                {/* BOTÃO FINAL */}
                <div className="text-center mt-6">
                    <Link 
                        to="/login"
                        className="inline-block w-full sm:w-auto px-12 bg-blue-600 text-white font-extrabold text-xl py-5 rounded-full shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-105 transition-all transform cursor-pointer"
                    >
                        Abrir o Aplicativo Agora
                    </Link>
                </div>

            </main>
        </div>
    );
}