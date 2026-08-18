// src/pages/Dashboard.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

// Importações do Mapa
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';

// Corrigindo o ícone padrão do Leaflet no React (Usando um ícone externo bonitinho)
const iconePinoMapeado = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png', // Ícone de pino azul
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

// Criador Dinâmico de Ícones (Gera bolinhas com números)
const criarIconeNumerado = (numeroDaRota) => {
    // Se tiver número, fica azul. Se não tiver (pendente), fica cinza com uma caixa.
    const texto = numeroDaRota ? numeroDaRota : '📦';
    const corFundo = numeroDaRota ? '#2563EB' : '#6B7280'; // Azul ou Cinza

    return new L.divIcon({
        className: 'custom-pin', // Remove os estilos padrão do Leaflet
        html: `<div style="
            background-color: ${corFundo};
            color: white;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: 900;
            font-family: sans-serif;
            font-size: 15px;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.4);
        ">
            ${texto}
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16], // Fica exatamente centralizado na rua
        popupAnchor: [0, -16] // Balãozinho abre um pouco acima da bolinha
    });
};

const iconeEntregador = new L.Icon({
    iconUrl: '/RoutrizICO.ico', 
    iconSize: [32, 32],      // Tamanho da imagem na tela [largura, altura]
    iconAnchor: [16, 32],    // A "ponta" do ícone que vai tocar exatamente na rua
    popupAnchor: [0, -32]    // Distância para o balãozinho "Você está aqui!" não cobrir a imagem
});

export default function Dashboard() {
    const { usuario, setUsuario } = useContext(AuthContext);
    const navigate = useNavigate();

    const [gpsAoVivo, setGpsAoVivo] = useState(null);
    const [menuAberto, setMenuAberto] = useState(false);
    const [entregas, setEntregas] = useState([]);
    const [modalLoteAberto, setModalLoteAberto] = useState(false);
    const [textoLote, setTextoLote] = useState('');
    const [carregandoLote, setCarregandoLote] = useState(false);
    const [modalCameraAberto, setModalCameraAberto] = useState(false);
    const [carregandoCamera, setCarregandoCamera] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [modalEntregasAberto, setModalEntregasAberto] = useState(false);

    const [rotaGeoJson, setRotaGeoJson] = useState(() => {
        const rotaSalva = localStorage.getItem('rota_cache');
        return rotaSalva ? JSON.parse(rotaSalva) : null;
    });    
    const [carregandoRota, setCarregandoRota] = useState(false);

    // =========================================================================
    // 🚨 VARIÁVEIS MOVIDAS PARA O TOPO (Antes dos useEffects!)
    // =========================================================================
    const assinatura = usuario?.dataAssinatura;
    const diasRestantes = assinatura?.dataVencimento;
    const isTrial = assinatura?.status === 'TRIAL';

    const isBloqueado = !assinatura || 
                        assinatura.status === 'INATIVA' || 
                        assinatura.status === 'PENDENTE' || 
                        assinatura.status === 'VENCIDA' || 
                        assinatura.status === 'EXPIRADO';
    // =========================================================================

    // Função para Buscar as entregas ativas no Backend
    const carregarEntregas = async () => {
        try {
            const response = await api.get('/api/entregador/encomendas/minhas-ativas');
            setEntregas(response.data);
        } catch (error) {
            console.error("Erro ao carregar entregas:", error);
        }
    };

    // Buscar entregas assim que a página carregar (SE NÃO ESTIVER BLOQUEADO)
    useEffect(() => {
        if (!isBloqueado) {
            carregarEntregas();
        }
    }, [isBloqueado]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUsuario(null);
        navigate('/login', { replace: true });
    };

    // Enviar Lote
    const handleCadastrarLote = async (e) => {
        e.preventDefault();
        setCarregandoLote(true);
        try {
            const response = await api.post('/api/entregador/encomendas/lote', { textoBruto: textoLote });
            alert(`Sucesso! ${response.data.length} pacotes processados.`);
            setTextoLote('');
            setModalLoteAberto(false);
            carregarEntregas(); // Atualiza o mapa na hora
        } catch (error) {
            alert('Erro ao processar lote. Verifique o formato.');
        } finally {
            setCarregandoLote(false);
        }
    };

    // Função para Confirmar a Entrega
    const finalizarEntrega = (idPacote) => {
        const confirmar = window.confirm("Confirmar a entrega deste pacote?");
        if (!confirmar) return;

        if (!navigator.geolocation) {
            alert("Seu navegador não suporta GPS.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            try {
                await api.patch(`/api/entregador/encomendas/${idPacote}/entregar`, {
                    latitudeExata: lat,
                    longitudeExata: lng
                });

                alert("Entrega confirmada! A Rota será recalculada.");
                await carregarEntregas(); 
                calcularRotaOtimizada(); 
                setModalEntregasAberto(false); 
                
            } catch (error) {
                console.error("Erro ao finalizar entrega:", error);
                alert("Erro ao confirmar entrega.");
            }
        }, (err) => {
            alert("Você precisa permitir o GPS para registrar a entrega exata.");
        });
    };

    // Ligar o GPS em tempo real (SE NÃO ESTIVER BLOQUEADO)
    useEffect(() => {
        if (!navigator.geolocation || isBloqueado) return;

        const radar = navigator.geolocation.watchPosition(
            (pos) => {
                setGpsAoVivo([pos.coords.latitude, pos.coords.longitude]);
            },
            (erro) => console.error("Erro no GPS ao vivo:", erro),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(radar);
    }, [isBloqueado]);

    // Função para remover um pacote
    const removerPacote = async (idPacote) => {
        const confirmar = window.confirm("Tem certeza que deseja remover este pacote da sua rota?");
        if (!confirmar) return;

        try {
            await api.delete(`/api/entregador/encomendas/${idPacote}`);
            carregarEntregas(); 
        } catch (error) {
            alert("Erro ao remover pacote.");
            console.error(error);
        }
    };

    // Função para chamar o OSRM e desenhar a rota
    const calcularRotaOtimizada = () => {
        if (!navigator.geolocation) {
            alert("Seu navegador não suporta GPS.");
            return;
        }

        setCarregandoRota(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            try {
                const response = await api.post(`/api/entregador/rotas/otimizar?latitudeAtual=${lat}&longitudeAtual=${lng}`)
                    .then((response) => {
                        const geoJsonObj = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        setRotaGeoJson(geoJsonObj);
                        localStorage.setItem('rota_cache', JSON.stringify(geoJsonObj)); 
                        carregarEntregas(); 
                        alert("Rota calculada com sucesso!");
                    })
            } catch (error) {
                console.error("Erro ao otimizar:", error);
                alert(error.response?.data?.message || "Erro ao calcular a rota. Você tem pacotes pendentes?");
            } finally {
                setCarregandoRota(false);
            }
        }, (err) => {
            alert("Você precisa permitir o acesso à localização para traçar a rota.");
            setCarregandoRota(false);
        });
    };

    // Iniciar Câmera
    const iniciarCamera = async () => {
        setModalCameraAberto(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            alert('Erro ao acessar a câmera. Verifique as permissões.');
            setModalCameraAberto(false);
        }
    };

    // Fechar Câmera
    const fecharCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setModalCameraAberto(false);
    };

    // Capturar Foto e Enviar IA
    const capturarEEnviarEtiqueta = async () => {
        if (!videoRef.current) return;
        setCarregandoCamera(true);

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64Image = canvas.toDataURL('image/jpeg', 0.8);

        try {
            const response = await api.post('/api/entregador/encomendas/camera', {
                imagemBase64: base64Image
            });
            alert(response.data);
            fecharCamera();
            carregarEntregas(); 
        } catch (error) {
            alert('Erro ao ler a etiqueta com a IA.');
        } finally {
            setCarregandoCamera(false);
        }
    };

    function AtualizadorDeCamera({ centro, entregas }) {
        const map = useMap(); // Acessa a instância do mapa do Leaflet

        useEffect(() => {
            // Se houver entregas, ajusta o mapa para mostrar todas na tela
            if (entregas && entregas.length > 0) {
                // Cria os "limites" (bounds) baseados em todas as coordenadas das entregas
                const bounds = L.latLngBounds(entregas.map(enc => [enc.latitude, enc.longitude]));
                
                // Opcional: Adicionar a posição atual do entregador se disponível
                // (Assumindo que você passaria gpsAoVivo como prop também)

                // Faz o mapa dar um "zoom out/in" suave para enquadrar todos os pontos
                map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 }); 
            } else if (centro) {
                // Fallback para centralizar se não houver bounds
                map.flyTo(centro, 14, { duration: 1.5 });
            }
        }, [centro, entregas, map]); // Re-executa sempre que 'entregas' ou 'centro' mudarem

        return null; // Não renderiza nada visualmente
    }

    const limparRota = () => {
        const confirmar = window.confirm("Deseja apagar o traçado da rota atual do mapa?");
        if (confirmar) {
            setRotaGeoJson(null); // Tira a linha do mapa
            localStorage.removeItem('rota_cache'); // Apaga do cache para não voltar no F5
        }
    };

    // =========================================================================
    // TELA DE BLOQUEIO SE A ASSINATURA ESTIVER PENDENTE, VENCIDA OU INATIVA
    // =========================================================================
    if (usuario && isBloqueado) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <img src="/RoutrizAzul.png" alt="Routriz Logo" className="h-30 w-auto mb-8" />
                
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
                    <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                        🔒
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Acesso Bloqueado</h2>
                    <p className="text-gray-500 mb-6 font-medium text-sm">
                        Sua assinatura {assinatura?.status === 'PENDENTE' ? 'está aguardando pagamento' : 'expirou ou foi cancelada'}. 
                        Para continuar usando o app, assine o plano PRO.
                    </p>
                    
                    <button 
                        onClick={() => navigate('/assinar')}
                        className="bg-routriz-blue w-full hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                        Assinar Routriz PRO
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className="mt-4 text-gray-400 font-bold text-sm hover:text-gray-600 underline cursor-pointer"
                    >
                        Sair do aplicativo
                    </button>
                </div>
            </div>
        );
    }
    // =========================================================================

    // Posição padrão do mapa (Se não tiver entregas, centraliza em Belo Jardim)
    const centroDoMapa = entregas.length > 0 
        ? [entregas[0].latitude, entregas[0].longitude] 
        : [-8.337, -36.425];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
            
            {/* CABEÇALHO DO APP */}
            <header className="bg-routriz-blue text-white p-4 flex justify-between items-center shadow-md rounded-b-2xl relative z-40">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMenuAberto(!menuAberto)}
                        className="text-white focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <img src="/routrizNAV.png" alt="Routriz Logo" className="h-7 w-auto object-contain" />
                </div>
                <button 
                    onClick={handleLogout} 
                    className="bg-routriz-red hover:bg-opacity-80 text-white text-sm font-bold py-1.5 px-4 rounded-full shadow transition-all cursor-pointer"
                >
                    Sair
                </button>
            </header>

            {/* MENU LATERAL (DRAWER) */}
            {menuAberto && (
                <div className="absolute top-16 left-0 w-72 bg-white shadow-2xl z-50 rounded-r-2xl border-r border-gray-200 p-5 flex flex-col gap-4 animate-fadeIn">
                    <div className="border-b pb-3">
                        <h3 className="font-extrabold text-gray-800 text-lg">Menu de Opções</h3>
                        <p className="text-xs text-gray-500">Gerencie suas rotas e pacotes</p>
                    </div>

                    <button 
                        onClick={() => { setModalLoteAberto(true); setMenuAberto(false); }}
                        className="text-left font-semibold text-gray-700 hover:text-routriz-blue py-2 px-3 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        📋 Cadastrar Lote (Copia & Cola)
                    </button>

                    <button 
                        onClick={() => { iniciarCamera(); setMenuAberto(false); }}
                        className="text-left font-semibold text-gray-700 hover:text-routriz-blue py-2 px-3 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        📷 Ler Etiqueta por Câmera
                    </button>

                    <button 
                        onClick={() => { setModalEntregasAberto(true); setMenuAberto(false); }}
                        className="text-left font-semibold text-gray-700 hover:text-routriz-blue py-2 px-3 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        📦 Minhas Entregas do Dia 
                        <span className="ml-auto bg-routriz-blue text-white text-xs px-2 py-1 rounded-full">
                            {entregas.length}
                        </span>
                    </button>

                    <button 
                        onClick={() => { navigate('/assinar'); setMenuAberto(false); }}
                        className="text-left font-semibold text-gray-700 hover:text-routriz-blue py-2 px-3 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer mt-4 border-t pt-4"
                    >
                        💳 Minha Assinatura
                    </button>
                </div>
            )}

            {/* CORPO DO APP */}
            <main className="flex-1 p-5 flex flex-col gap-5 max-w-2xl w-full mx-auto relative z-0">
                
                {isTrial && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Período de Teste
                            </span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">
                                Restam <span className="font-bold text-amber-600">{diasRestantes} dias</span> para o fim do seu trial.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/assinar')}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-all cursor-pointer"
                        >
                            Assinar Agora
                        </button>
                    </div>
                )}

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-extrabold text-routriz-dark">
                        Olá, {usuario?.nome || 'Entregador'}! 👋
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Você tem <span className="text-routriz-blue font-bold">{entregas.length} pacotes</span> pendentes para entrega.
                    </p>
                </div>

                {/* ÁREA DO MAPA (REACT-LEAFLET) */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[500px] shadow-sm relative z-0">
                    <MapContainer 
                        center={centroDoMapa} 
                        zoom={14} 
                        style={{ height: '500px', width: '100%', zIndex: 0 }}    

                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />

                        {/* 👇 INSERINDO O CONTROLADOR DE CÂMERA AQUI 👇 */}
                        <AtualizadorDeCamera centro={centroDoMapa} entregas={entregas} />

                        {gpsAoVivo && (
                            <Marker 
                                position={gpsAoVivo} 
                                icon={iconeEntregador} 
                            >
                                <Popup>Você está aqui!</Popup>
                            </Marker>
                        )}

                        {/* RENDERIZAÇÃO INTELIGENTE DA ROTA (Próximo destino vs Restante) */}
                        {rotaGeoJson && rotaGeoJson.type === "FeatureCollection" ? (
                            rotaGeoJson.features.map((feature, index) => (
                                <GeoJSON 
                                    // A key com entregas.length garante que o Leaflet redesenhe a linha corretamente ao dar baixa num pacote
                                    key={`rota-${index}-${entregas.length}`} 
                                    data={feature} 
                                    style={{ 
                                        // index === 0 é a rota do motorista até a PRIMEIRA entrega pendente
                                        color: index === 0 ? '#1D4ED8' : '#93C5FD', // Azul forte vs Azul claro
                                        weight: index === 0 ? 6 : 4, // Linha mais grossa no destino atual
                                        opacity: index === 0 ? 1 : 0.7,
                                        dashArray: index === 0 ? '' : '10, 10', // Efeito tracejado (Waze-style) nos próximos destinos!
                                        lineCap: 'round',
                                        lineJoin: 'round'
                                    }} 
                                />
                            ))
                        ) : (
                            // Fallback de segurança: se o backend mandar tudo como uma linha única em vez de trechos separados
                            rotaGeoJson && (
                                <GeoJSON 
                                    key={`rota-unica-${entregas.length}`}
                                    data={rotaGeoJson} 
                                    style={{ color: '#1D4ED8', weight: 5, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }} 
                                />
                            )
                        )}
                        
                    {entregas.map((enc) => (
                        <Marker 
                            key={enc.id} 
                            position={[enc.latitude, enc.longitude]} 
                            icon={criarIconeNumerado(enc.ordemRota)}
                        >
                            <Popup>
                                <div className="font-sans text-sm flex flex-col gap-2">
                                    <div>
                                        <p className="font-bold mb-1">
                                            {enc.ordemRota ? `Parada #${enc.ordemRota}` : '📍 Pacote'}
                                        </p>
                                        <p className="text-gray-600 leading-tight">{enc.textoEndereco}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => finalizarEntrega(enc.id)}
                                        className="bg-green-500 text-white font-bold py-2 px-2 rounded-lg hover:bg-green-600 w-full text-center shadow-sm cursor-pointer"
                                    >
                                        ✅ Confirmar Entrega
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    </MapContainer>
                </div>

                {rotaGeoJson && (
                        <button 
                            onClick={limparRota} 
                            className="bg-white border-2 border-red-500 text-red-500 font-bold text-sm py-3 rounded-xl shadow-sm hover:bg-red-50 transition-all w-full cursor-pointer"
                        >
                            🗑️ Limpar Traçado da Rota
                        </button>
                )}

                <button 
                    onClick={calcularRotaOtimizada} 
                    disabled={carregandoRota}
                    className="bg-routriz-blue text-white font-extrabold text-lg py-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all w-full mt-auto mb-2 cursor-pointer relative z-10 disabled:bg-gray-400"
                >
                    {carregandoRota ? 'Calculando trajeto mágico...' : 'Calcular Rota Otimizada'}
                </button>

            </main>

            {/* MODAL DE CADASTRO POR LOTE */}
            {modalLoteAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Cadastrar Lote (Copia & Cola)</h3>
                        <p className="text-xs text-gray-500">Cole a lista de endereços abaixo. Cada linha será processada como um pacote.</p>
                        
                        <form onSubmit={handleCadastrarLote} className="flex flex-col gap-4">
                            <textarea
                                rows="6"
                                value={textoLote}
                                onChange={(e) => setTextoLote(e.target.value)}
                                placeholder="Ex: Rua A, 123 - Centro&#10;Av B, 456 - Bairro"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-routriz-blue"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalLoteAberto(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={carregandoLote}
                                    className="px-4 py-2 bg-routriz-blue text-white text-sm font-bold rounded-lg cursor-pointer hover:bg-opacity-90"
                                >
                                    {carregandoLote ? 'Processando...' : 'Salvar Lote'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DA CÂMERA */}
            {modalCameraAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-4 shadow-2xl flex flex-col items-center gap-4 relative">
                        <h3 className="text-lg font-bold text-gray-800">Enquadre a Etiqueta</h3>
                        
                        <div className="w-full bg-black rounded-xl overflow-hidden aspect-[3/4] relative flex items-center justify-center">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-8 border-2 border-dashed border-white/70 rounded-xl pointer-events-none flex flex-col items-center justify-center">
                                <div className="w-0.5 h-16 bg-routriz-blue animate-pulse"></div>
                                <span className="absolute bottom-3 text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full shadow">
                                    Centralize a etiqueta aqui
                                </span>
                            </div>
                        </div>

                        <div className="flex w-full gap-2">
                            <button
                                type="button"
                                onClick={fecharCamera}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={capturarEEnviarEtiqueta}
                                disabled={carregandoCamera}
                                className="flex-1 py-3 bg-routriz-blue text-white font-bold rounded-xl cursor-pointer hover:bg-opacity-90"
                            >
                                {carregandoCamera ? 'Lendo IA...' : 'Capturar Foto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE LISTA DE ENTREGAS */}
            {modalEntregasAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-800">Minhas Entregas</h3>
                            <button onClick={() => setModalEntregasAberto(false)} className="text-gray-500 hover:text-red-500 font-bold text-xl cursor-pointer">×</button>
                        </div>
                        
                        {entregas.length === 0 ? (
                            <p className="text-gray-500 text-center py-5">Você não tem pacotes pendentes.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {entregas.map((enc) => (
                                    <li key={enc.id} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-1 bg-gray-50 relative">
                                        {enc.ordemRota && (
                                            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                #{enc.ordemRota}
                                            </span>
                                        )}
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{enc.status}</p>
                                        <p className="text-sm font-semibold text-gray-700 pr-8">{enc.textoEndereco}</p>
                                        
                                        <button 
                                            onClick={() => removerPacote(enc.id)}
                                            className="mt-2 text-xs font-bold text-red-500 self-end hover:underline cursor-pointer"
                                        >
                                            Remover Pacote
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}