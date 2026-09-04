// src/pages/Dashboard.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';


// Importações do Mapbox 3D
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Função matemática para forçar o mapa a "olhar" para o próximo pacote
const calcularAngulo = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
};

export default function Dashboard() {
    const { usuario, setUsuario } = useContext(AuthContext);
    const navigate = useNavigate();

    // 👇 ESTADO DO TEMA (Claro/Escuro)
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [gpsAoVivo, setGpsAoVivo] = useState(null);
    const [gpsHeading, setGpsHeading] = useState(0); 
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
    
    const [pacoteSelecionado, setPacoteSelecionado] = useState(null);
    const [autoCentralizar, setAutoCentralizar] = useState(true);
    
    // Controle de visualização do mapa
    const [viewState, setViewState] = useState({
        latitude: -8.337,
        longitude: -36.425,
        zoom: 14,
        pitch: 65, // Ângulo para efeito 3D (Waze)
        bearing: 0
    });

    const [rotaGeoJson, setRotaGeoJson] = useState(() => {
        const rotaSalva = localStorage.getItem('rota_cache');
        return rotaSalva ? JSON.parse(rotaSalva) : null;
    });    
    const [carregandoRota, setCarregandoRota] = useState(false);

    const assinatura = usuario?.dataAssinatura;
    const diasRestantes = assinatura?.dataVencimento;
    const isTrial = assinatura?.status === 'TRIAL';

    const isBloqueado = !assinatura ||
                        assinatura.status === 'INATIVA' ||
                        assinatura.status === 'PENDENTE' ||
                        assinatura.status === 'VENCIDA' ||
                        assinatura.status === 'EXPIRADO';

    const carregarEntregas = async () => {
        try {
            const response = await api.get('/api/entregador/encomendas/minhas-ativas');
            setEntregas(response.data);
            
            if (response.data.length > 0 && !gpsAoVivo && autoCentralizar) {
                setViewState(v => ({
                    ...v,
                    latitude: response.data[0].latitude,
                    longitude: response.data[0].longitude,
                    zoom: 15
                }));
            }
        } catch (error) {
            console.error("Erro ao carregar entregas:", error);
        }
    };

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

    const handleCadastrarLote = async (e) => {
        e.preventDefault();
        setCarregandoLote(true);
        try {
            const response = await api.post('/api/entregador/encomendas/lote', { textoBruto: textoLote });
            alert(`Sucesso! ${response.data.length} pacotes processados.`);
            setTextoLote('');
            setModalLoteAberto(false);
            setAutoCentralizar(true);
            carregarEntregas();
        } catch (error) {
            alert('Erro ao processar lote. Verifique o formato.');
        } finally {
            setCarregandoLote(false);
        }
    };

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
                setAutoCentralizar(true); 
                await carregarEntregas();
                calcularRotaOtimizada();
                setModalEntregasAberto(false);
                setPacoteSelecionado(null); 
                
            } catch (error) {
                console.error("Erro ao finalizar entrega:", error);
                alert("Erro ao confirmar entrega.");
            }
        }, (err) => {
            alert("Você precisa permitir o GPS para registrar a entrega exata.");
        });
    };

    useEffect(() => {
        if (!navigator.geolocation || isBloqueado) return;

        const radar = navigator.geolocation.watchPosition(
            (pos) => {
                setGpsAoVivo([pos.coords.longitude, pos.coords.latitude]); // [lng, lat]
                
                if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
                    setGpsHeading(pos.coords.heading);
                }
            },
            (erro) => console.error("Erro no GPS ao vivo:", erro),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(radar);
    }, [isBloqueado]);

    // CAMERA APONTA PRO PACOTE SE ESTIVER PARADO E SEGUE O GPS
    useEffect(() => {
        if (autoCentralizar && gpsAoVivo) {
            let direcao = gpsHeading;
            
            if ((!gpsHeading || gpsHeading === 0) && entregas.length > 0) {
                direcao = calcularAngulo(gpsAoVivo[1], gpsAoVivo[0], entregas[0].latitude, entregas[0].longitude);
            }

            setViewState({
                longitude: gpsAoVivo[0],
                latitude: gpsAoVivo[1],
                zoom: 17.5,
                pitch: 65,
                bearing: direcao,
                transitionDuration: 800
            });
        }
    }, [gpsAoVivo, autoCentralizar, gpsHeading, entregas]);

    const removerPacote = async (idPacote) => {
        const confirmar = window.confirm("Tem certeza que deseja remover este pacote da sua rota?");
        if (!confirmar) return;

        try {
            await api.delete(`/api/entregador/encomendas/${idPacote}`);
            carregarEntregas();
            setPacoteSelecionado(null);
        } catch (error) {
            alert("Erro ao remover pacote.");
            console.error(error);
        }
    };

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
                const response = await api.post(`/api/entregador/rotas/otimizar?latitudeAtual=${lat}&longitudeAtual=${lng}`);
                const geoJsonObj = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                setRotaGeoJson(geoJsonObj);
                localStorage.setItem('rota_cache', JSON.stringify(geoJsonObj));
                setAutoCentralizar(true); 
                carregarEntregas();
                alert("Rota calculada com sucesso!");
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

    const fecharCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setModalCameraAberto(false);
    };

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

    const limparRota = () => {
        const confirmar = window.confirm("Deseja apagar o traçado da rota atual do mapa?");
        if (confirmar) {
            setRotaGeoJson(null);
            localStorage.removeItem('rota_cache');
        }
    };

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
                        Sua assinatura expirou ou foi cancelada. Assine o plano PRO.
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

    return (
        <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            
            <header className={`p-4 flex justify-between items-center shadow-md relative z-40 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700 text-white' : 'bg-blue-600 text-white rounded-b-2xl'}`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMenuAberto(!menuAberto)}
                        className={`focus:outline-none cursor-pointer p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-blue-700 text-white'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <img src="/routrizNAV.png" alt="Routriz Logo" className={`h-7 w-auto object-contain ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 invert'}`} />
                </div>
                <div className="flex items-center gap-4">
                    {/* 👇 BOTÃO CLARO/ESCURO */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="text-2xl hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                        title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-1.5 px-4 rounded-full shadow transition-all cursor-pointer"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* DRAWER MENU */}
            {menuAberto && (
                <div className={`absolute top-16 left-0 w-72 shadow-2xl z-50 rounded-r-2xl p-5 flex flex-col gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
                    <div className={`border-b pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`font-extrabold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Menu de Opções</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gerencie suas rotas e pacotes</p>
                    </div>

                    <button
                        onClick={() => { setModalLoteAberto(true); setMenuAberto(false); }}
                        className={`text-left font-semibold py-2 px-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                    >
                        📋 Cadastrar Lote (Copia & Cola)
                    </button>

                    <button
                        onClick={() => { iniciarCamera(); setMenuAberto(false); }}
                        className={`text-left font-semibold py-2 px-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                    >
                        📷 Ler Etiqueta por Câmera
                    </button>

                    <button
                        onClick={() => { setModalEntregasAberto(true); setMenuAberto(false); }}
                        className={`text-left font-semibold py-2 px-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                    >
                        📦 Minhas Entregas do Dia
                        <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {entregas.length}
                        </span>
                    </button>

                    <button
                        onClick={() => { navigate('/assinar'); setMenuAberto(false); }}
                        className={`text-left font-semibold py-2 px-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700 text-gray-300 hover:text-blue-400 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                    >
                        💳 Minha Assinatura
                    </button>
                </div>
            )}

            <main className="flex-1 p-3 flex flex-col gap-3 max-w-2xl w-full mx-auto relative z-0 h-[calc(100vh-60px)]">
                
                {isTrial && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex justify-between items-center shrink-0">
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

                <div className={`p-4 rounded-2xl shadow-sm border shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h2 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Olá, {usuario?.nome || 'Entregador'}! 👋
                    </h2>
                    <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Você tem <span className="text-blue-500 font-bold">{entregas.length} pacotes</span> pendentes para entrega.
                    </p>
                </div>

                {/* 👇 MAPA COM TROCA DE ESTILO CLARO/ESCURO */}
                <div className={`w-full h-[500px] relative z-0 rounded-2xl overflow-hidden shadow-lg border transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                    
                    {!autoCentralizar && (
                        <button
                            onClick={() => setAutoCentralizar(true)}
                            className="absolute bottom-6 right-4 z-[400] bg-blue-600 text-white font-bold py-3 px-5 rounded-full shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-white flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            Centralizar
                        </button>
                    )}

                    <Map
                        {...viewState}
                        onMove={evt => setViewState(evt.viewState)}
                        onDragStart={() => setAutoCentralizar(false)}
                        onZoomStart={() => setAutoCentralizar(false)}
                        style={{ width: '100%', height: '100%' }}
                        // A MÁGICA DO TEMA ACONTECE AQUI 👇
                        mapStyle={isDarkMode ? "mapbox://styles/mapbox/navigation-night-v1" : "mapbox://styles/mapbox/navigation-day-v1"} 
                        mapboxAccessToken={MAPBOX_TOKEN}
                        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                    >
                        <NavigationControl position="top-right" />

                        {/* Camada 3D para erguer prédios */}
                        <Layer
                            id="3d-buildings"
                            source="composite"
                            source-layer="building"
                            filter={['==', 'extrude', 'true']}
                            type="fill-extrusion"
                            minzoom={15}
                            paint={{
                                'fill-extrusion-color': isDarkMode ? '#1f2937' : '#d1d5db', 
                                'fill-extrusion-height': ['get', 'height'],
                                'fill-extrusion-base': ['get', 'min_height'],
                                'fill-extrusion-opacity': 0.8
                            }}
                        />

                        {gpsAoVivo && (
                            <Marker longitude={gpsAoVivo[0]} latitude={gpsAoVivo[1]} anchor="center">
                                {/* Seta de Navegação Automotiva (Branca à noite, Azul de dia) */}
                                <div style={{
                                    width: '0',
                                    height: '0',
                                    borderLeft: '12px solid transparent',
                                    borderRight: '12px solid transparent',
                                    borderBottom: `24px solid ${isDarkMode ? 'white' : '#2563EB'}`,
                                    filter: 'drop-shadow(0px 0px 8px rgba(0,0,0,0.5))',
                                }} />
                            </Marker>
                        )}

                        {/* Traçado NEON Luminoso */}
                        {rotaGeoJson && rotaGeoJson.type === "FeatureCollection" ? (
                            rotaGeoJson.features.map((feature, index) => (
                                <Source key={`rota-src-${index}`} id={`rota-src-${index}`} type="geojson" data={feature}>
                                    <Layer
                                        id={`camada-rota-glow-${index}`}
                                        type="line"
                                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                        paint={{
                                            'line-color': index === 0 ? '#3B82F6' : '#93C5FD',
                                            'line-width': index === 0 ? 14 : 10,
                                            'line-opacity': 0.4,
                                            'line-blur': 10
                                        }}
                                    />
                                    <Layer
                                        id={`camada-rota-${index}`}
                                        type="line"
                                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                        paint={{
                                            'line-color': index === 0 ? '#60A5FA' : '#93C5FD',
                                            'line-width': index === 0 ? 6 : 4,
                                            'line-opacity': index === 0 ? 1 : 0.8,
                                            ...(index !== 0 && { 'line-dasharray': [2, 2] })
                                        }}
                                    />
                                </Source>
                            ))
                        ) : (
                            rotaGeoJson && (
                                <Source id="rota-unica" type="geojson" data={rotaGeoJson}>
                                    <Layer
                                        id="camada-unica"
                                        type="line"
                                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                        paint={{ 'line-color': '#3B82F6', 'line-width': 8, 'line-opacity': 0.9 }}
                                    />
                                </Source>
                            )
                        )}

                        {entregas.map((enc) => (
                            <Marker key={enc.id} longitude={enc.longitude} latitude={enc.latitude} anchor="bottom">
                                <div style={{
                                    backgroundColor: enc.ordemRota ? '#2563EB' : (isDarkMode ? '#4B5563' : '#9CA3AF'),
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    fontWeight: '900',
                                    fontSize: '14px',
                                    border: '3px solid white',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                                    cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setPacoteSelecionado(enc);
                                }}
                                >
                                    {enc.ordemRota ? enc.ordemRota : '📦'}
                                </div>
                            </Marker>
                        ))}

                        {pacoteSelecionado && (
                            <Popup
                                longitude={pacoteSelecionado.longitude}
                                latitude={pacoteSelecionado.latitude}
                                anchor="bottom"
                                offset={40}
                                onClose={() => setPacoteSelecionado(null)}
                                closeOnClick={false}
                                className="z-50"
                            >
                                <div className="font-sans text-sm flex flex-col gap-2 min-w-[200px] p-1">
                                    <div>
                                        <p className="font-bold mb-1 text-gray-800">
                                            {pacoteSelecionado.ordemRota ? `Parada #${pacoteSelecionado.ordemRota}` : '📍 Pacote'}
                                        </p>
                                        <p className="text-gray-600 leading-tight">{pacoteSelecionado.textoEndereco}</p>
                                    </div>
                                    
                                    <button
                                        onClick={() => finalizarEntrega(pacoteSelecionado.id)}
                                        className="bg-green-500 text-white font-bold py-2 px-2 rounded-lg hover:bg-green-600 w-full text-center shadow-sm cursor-pointer mt-1"
                                    >
                                        ✅ Confirmar Entrega
                                    </button>
                                </div>
                            </Popup>
                        )}
                    </Map>
                </div>

                {/* BOTÕES INFERIORES */}
                <div className="flex gap-2 shrink-0">
                    {rotaGeoJson && (
                        <button
                            onClick={limparRota}
                            className={`border font-bold text-sm py-4 rounded-2xl shadow-sm transition-all flex-1 cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-red-500 hover:bg-gray-50'}`}
                        >
                            🗑️ Limpar Rota
                        </button>
                    )}

                    <button
                        onClick={calcularRotaOtimizada}
                        disabled={carregandoRota}
                        className={`bg-blue-600 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg transition-all flex-[2] cursor-pointer ${carregandoRota ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                    >
                        {carregandoRota ? 'Processando...' : 'Calcular Rota'}
                    </button>
                </div>

            </main>

            {/* MODAL DE LOTE */}
            {modalLoteAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-transparent'}`}>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Cadastrar Lote (Copia & Cola)</h3>
                        <form onSubmit={handleCadastrarLote} className="flex flex-col gap-4">
                            <textarea
                                rows="6"
                                value={textoLote}
                                onChange={(e) => setTextoLote(e.target.value)}
                                placeholder="Rua A, 123 - Centro"
                                className={`w-full rounded-lg p-3 text-sm border focus:outline-none ${isDarkMode ? 'bg-gray-900 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-800 focus:border-blue-500'}`}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setModalLoteAberto(false)} className={`px-4 py-2 rounded-lg font-semibold ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CÂMERA */}
            {modalCameraAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
                    <div className={`rounded-2xl max-w-md w-full p-4 shadow-2xl flex flex-col items-center gap-4 relative border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-transparent'}`}>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Enquadre a Etiqueta</h3>
                        <div className="w-full bg-black rounded-xl overflow-hidden aspect-[3/4] relative flex items-center justify-center border border-gray-600">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        </div>
                        <div className="flex w-full gap-2">
                            <button onClick={fecharCamera} className={`flex-1 py-3 font-bold rounded-xl ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Cancelar</button>
                            <button onClick={capturarEEnviarEtiqueta} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500">Capturar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE LISTA DE ENTREGAS */}
            {modalEntregasAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-transparent'}`}>
                        <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Minhas Entregas</h3>
                            <button onClick={() => setModalEntregasAberto(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl cursor-pointer">×</button>
                        </div>
                        
                        {entregas.length === 0 ? (
                            <p className="text-gray-400 text-center py-5">Você não tem pacotes pendentes.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {entregas.map((enc) => (
                                    <li key={enc.id} className={`rounded-xl p-3 flex flex-col gap-1 relative border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        {enc.ordemRota && (
                                            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                #{enc.ordemRota}
                                            </span>
                                        )}
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{enc.status}</p>
                                        <p className={`text-sm font-semibold pr-8 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{enc.textoEndereco}</p>
                                        
                                        <button
                                            onClick={() => removerPacote(enc.id)}
                                            className="mt-2 text-xs font-bold text-red-400 self-end hover:underline cursor-pointer"
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