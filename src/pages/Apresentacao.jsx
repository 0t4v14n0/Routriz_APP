// src/pages/Apresentacao.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Apresentacao() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            
            {/* CABEÇALHO */}
            <header className="bg-routriz-blue text-white p-5 rounded-b-3xl shadow-lg sticky top-0 z-50">
                <div className="max-w-xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white text-routriz-blue font-extrabold text-xl px-3 py-1 rounded-lg">R</div>
                        <span className="font-extrabold text-xl tracking-tight">Guia Rápido</span>
                    </div>
                    <Link to="/" className="text-white text-sm font-bold bg-white/20 px-4 py-1.5 rounded-full hover:bg-white/30">
                        Voltar
                    </Link>
                </div>
            </header>

            <main className="max-w-xl mx-auto p-5 mt-4 flex flex-col gap-10">
                
                {/* INTRODUÇÃO */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                        Bem-vindo ao Routriz 🚀
                    </h1>
                    <p className="text-gray-600 font-medium text-lg">
                        O aplicativo que transforma horas de trabalho em minutos. Veja como é fácil usar:
                    </p>
                </div>

                {/* PASSO 1: Adicionar Pacotes */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 font-extrabold px-4 py-1 rounded-bl-2xl">Passo 1</div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Bipe ou Cole os Endereços</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Chega de digitar rua por rua no Waze. Você tem duas opções mágicas para colocar os pacotes no aplicativo:
                    </p>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-2xl">📷</div>
                            <div>
                                <h3 className="font-bold text-gray-800">Câmera com IA</h3>
                                <p className="text-sm text-gray-500">Aponte a câmera para a etiqueta da Shopee ou Mercado Livre. A nossa Inteligência Artificial lê o endereço na hora.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-full text-2xl">📋</div>
                            <div>
                                <h3 className="font-bold text-gray-800">Colar Lote</h3>
                                <p className="text-sm text-gray-500">Recebeu uma lista no WhatsApp? Copie tudo e cole de uma vez só no sistema.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* TROQUE ESTE SRC PELA SUA FOTO DO APP DEPOIS */}
                    <div className="mt-6 bg-gray-200 rounded-xl h-48 w-full flex items-center justify-center overflow-hidden border border-gray-200 shadow-inner">
                        <span className="text-gray-400 font-bold text-sm">📸 Coloque um Print da Tela da Câmera aqui</span>
                        {/* Exemplo real: <img src="/print-camera.png" className="w-full h-full object-cover" /> */}
                    </div>
                </section>

                {/* PASSO 2: Rota Mágica */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-100 text-green-600 font-extrabold px-4 py-1 rounded-bl-2xl">Passo 2</div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Calcule a Rota Mágica</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Com todos os pacotes na tela, o aplicativo faz a matemática pesada por você.
                    </p>

                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 mb-6 font-medium">
                        <li>Clique no botão azul gigante <span className="font-bold text-routriz-blue">"Calcular Rota Otimizada"</span>.</li>
                        <li>O sistema desenha uma linha azul nas ruas.</li>
                        <li>As bolinhas cinzas viram números azuis (<span className="bg-routriz-blue text-white px-1.5 py-0.5 rounded-full text-xs mx-1">1</span>, <span className="bg-routriz-blue text-white px-1.5 py-0.5 rounded-full text-xs mx-1">2</span>, <span className="bg-routriz-blue text-white px-1.5 py-0.5 rounded-full text-xs mx-1">3</span>) mostrando a ordem exata para economizar gasolina.</li>
                    </ul>

                    {/* TROQUE ESTE SRC PELA SUA FOTO DO APP DEPOIS */}
                    <div className="mt-4 bg-gray-200 rounded-xl h-64 w-full flex items-center justify-center overflow-hidden border border-gray-200 shadow-inner">
                        <span className="text-gray-400 font-bold text-sm px-4 text-center">🗺️ Coloque um Print do Mapa com a Linha Azul aqui</span>
                    </div>
                </section>

                {/* PASSO 3: Confirmar Entrega */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-600 font-extrabold px-4 py-1 rounded-bl-2xl">Passo 3</div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Entregue e Ensine o Mapa</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        Chegou na casa do cliente? Clique no número do pino no mapa e aperte <span className="font-bold text-green-500">"Confirmar Entrega"</span>.
                    </p>
                    
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm mb-4">
                        <p className="text-sm text-amber-800 font-bold">🧠 Inteligência Geográfica</p>
                        <p className="text-xs text-amber-700 mt-1">
                            Ao confirmar a entrega na porta do cliente, o Routriz memoriza o seu GPS exato. Na próxima vez, o pino vai cair direto na porta, e não no meio da rua!
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 font-medium">
                        Ao confirmar, o pacote some, a rota é recalculada rapidinho para os pacotes que sobraram, e você segue para o próximo!
                    </p>
                </section>

                {/* BOTÃO FINAL */}
                <div className="text-center mt-4">
                    <Link 
                        to="/login"
                        className="inline-block w-full bg-routriz-blue text-white font-extrabold text-xl py-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
                    >
                        Abrir o Aplicativo Agora
                    </Link>
                </div>

            </main>
        </div>
    );
}