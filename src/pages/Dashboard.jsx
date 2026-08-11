// src/pages/Dashboard.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

// Importações do Mapa
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigindo o ícone padrão do Leaflet no React (Usando um ícone externo bonitinho)
const iconePinoMapeado = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png', // Ícone de pino azul
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

export default function Dashboard() {
    const { usuario, setUsuario } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Estado para controlar a abertura do Menu Hambúrguer
    const [menuAberto, setMenuAberto] = useState(false);

    // Estado para guardar a lista de entregas do backend
    const [entregas, setEntregas] = useState([]);

    // Estados para controle do Modal de Lote
    const [modalLoteAberto, setModalLoteAberto] = useState(false);
    const [textoLote, setTextoLote] = useState('');
    const [carregandoLote, setCarregandoLote] = useState(false);

    // Estados para controle do Modal da Câmera / OCR
    const [modalCameraAberto, setModalCameraAberto] = useState(false);
    const [carregandoCamera, setCarregandoCamera] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Estado para controle do Modal da Lista de Entregas
    const [modalEntregasAberto, setModalEntregasAberto] = useState(false);

    const [rotaGeoJson, setRotaGeoJson] = useState(null);
    const [carregandoRota, setCarregandoRota] = useState(false);

    // Função para Buscar as entregas ativas no Backend
    const carregarEntregas = async () => {
        try {
            const response = await api.get('/api/entregador/encomendas/minhas-ativas');
            setEntregas(response.data);
        } catch (error) {
            console.error("Erro ao carregar entregas:", error);
        }
    };

    // Buscar entregas assim que a página carregar
    useEffect(() => {
        carregarEntregas();
    }, []);

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
            const response = await api.post('/api/entregador/encomendas/lote', {
                textoBruto: textoLote
            });
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

    // Função para chamar o OSRM e desenhar a rota nas ruas
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
                
                // O axios as vezes converte JSON automaticamente, as vezes não. Isso garante a conversão:
                const geoJsonObj = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                
                setRotaGeoJson(geoJsonObj);
                carregarEntregas(); // Recarrega a lista para mostrar a "# Ordem" atualizada nas tags verdes
                
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
            carregarEntregas(); // Atualiza o mapa na hora
        } catch (error) {
            alert('Erro ao ler a etiqueta com a IA.');
        } finally {
            setCarregandoCamera(false);
        }
    };


    const assinatura = usuario?.dataAssinatura;
    const diasRestantes = assinatura?.dataVencimento;
    const isTrial = assinatura?.status === 'TRIAL';

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
                        <button className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-all cursor-pointer">
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
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[400px] shadow-sm relative z-0">
                    <MapContainer 
                        center={centroDoMapa} 
                        zoom={14} 
                        style={{ height: '400px', width: '100%', zIndex: 0 }}     

                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />

                        {rotaGeoJson && (
                            <GeoJSON 
                                data={rotaGeoJson} 
                                style={{ color: '#2563EB', weight: 5, opacity: 0.8 }} 
                            />
                        )}
                        
                        {entregas.map((enc) => (
                            <Marker 
                                key={enc.id} 
                                position={[enc.latitude, enc.longitude]} 
                                icon={iconePinoMapeado}
                            >
                                <Popup>
                                    <div className="font-sans text-sm">
                                        <p className="font-bold mb-1">
                                            {enc.ordemRota ? `Parada #${enc.ordemRota}` : '📍 Pacote'}
                                        </p>
                                        <p className="text-gray-600">{enc.textoEndereco}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

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
                                        
                                        <button className="mt-2 text-xs font-bold text-red-500 self-end hover:underline">
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