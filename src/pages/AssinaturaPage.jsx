import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function AssinaturaPage() {
    const navigate = useNavigate();
    const { usuario, setUsuario } = useContext(AuthContext); // Adicionei o setUsuario para atualizar o contexto

    const [planos, setPlanos] = useState([]);
    const [planoSelecionado, setPlanoSelecionado] = useState('');
    const [loading, setLoading] = useState(false);
    const [scriptCarregado, setScriptCarregado] = useState(false);

    const efiCheckoutRef = useRef(null);

    const [formData, setFormData] = useState({
        cpf: '', rua: '', numero: '', bairro: '', cep: '', cidade: '', estado: '',
        numeroCartao: '', cvv: '', mesVencimento: '', anoVencimento: '', bandeira: 'visa',
    });

    // Verifica se o usuário já tem uma assinatura ativa ou trial
    const assinatura = usuario?.dataAssinatura;
    const temAssinaturaAtiva = assinatura?.status === 'ATIVA' || assinatura?.status === 'TRIAL';

    // =======================================================
    // INJEÇÃO DA EFÍ DO JEITO OFICIAL (Só injeta se precisar assinar)
    // =======================================================
    useEffect(() => {
        if (temAssinaturaAtiva) return; // Não carrega Efí se já for PRO

        const carregarPlanos = async () => {
            try {
                const response = await api.get('/api/public/planos');
                setPlanos(response.data);
            } catch (error) {
                console.error("Erro ao buscar planos:", error);
            }
        };
        carregarPlanos();

        if (!document.getElementById('efi-script')) {
            window.$gn = {
                validForm: true,
                processed: false,
                done: {},
                ready: function(fn) { window.$gn.done = fn; }
            };

            window.$gn.ready(function(checkoutPronto) {
                console.log("✅ Efí Pay armada! Recebemos a instância com sucesso.");
                efiCheckoutRef.current = checkoutPronto;
                setScriptCarregado(true);
            });

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = 'efi-script';
            const v = parseInt(Math.random() * 1000000);
            script.src = `https://sandbox.gerencianet.com.br/v1/cdn/0defb5e4e4e3b49e86bce8176e65bc0c/${v}`;
            script.async = false;
            document.head.appendChild(script);
        } else {
            setScriptCarregado(true);
        }
    }, [temAssinaturaAtiva]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // =======================================================
    // AÇÃO DE ASSINAR
    // =======================================================
    const handleAssinar = async (e) => {
        e.preventDefault();
        if (!efiCheckoutRef.current) {
            alert("Aguarde um segundo, finalizando conexão com o banco...");
            return;
        }

        setLoading(true);
        const { bandeira, numeroCartao, cvv, mesVencimento, anoVencimento } = formData;

        efiCheckoutRef.current.getPaymentToken({
            brand: bandeira, 
            number: numeroCartao.replace(/\D/g, ''), 
            cvv: cvv,
            expiration_month: mesVencimento, 
            expiration_year: anoVencimento   
        }, async function(error, response) {
            if (error) {
                console.error("Erro na Efí:", error);
                alert("Erro ao validar o cartão. Verifique os dados.");
                setLoading(false);
                return;
            }

            const paymentToken = response.data.payment_token;
            console.log("🔥 TOKEN GERADO COM SUCESSO:", paymentToken);

            try {
                // await api.post('/api/assinaturas/assinar', { ... });
                alert("Assinatura realizada com sucesso!");
                navigate('/dashboard');
            } catch (err) {
                console.error("Erro no Backend:", err);
                alert("Erro ao processar assinatura no nosso servidor.");
            } finally {
                setLoading(false);
            }
        }); 
    };

    // =======================================================
    // AÇÃO DE CANCELAR ASSINATURA
    // =======================================================
    const handleCancelarAssinatura = async () => {
        const confirmar = window.confirm(
            "Tem certeza que deseja cancelar sua assinatura PRO? Você perderá acesso às rotas ilimitadas."
        );

        if (!confirmar) return;

        setLoading(true);
        try {
            // Chamada para o endpoint do backend (que deve comunicar com a Efí)
            // await api.put('/api/assinaturas/cancelar');
            
            alert("Sua assinatura foi cancelada com sucesso.");
            // Força um recarregamento para o sistema atualizar o usuário e bloquear a tela
            window.location.reload(); 
            
        } catch (error) {
            console.error("Erro ao cancelar:", error);
            alert("Houve um problema ao cancelar a assinatura. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-10">
            {/* CABEÇALHO */}
            <header className="bg-routriz-blue text-white p-4 flex items-center shadow-md rounded-b-2xl">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="mr-4 text-white hover:bg-blue-700 p-2 rounded-full cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold">Minha Assinatura</h1>
            </header>

            <main className="flex-1 p-5 max-w-lg w-full mx-auto mt-4">
                
                {/* 
                  ====================================================
                  TELA 1: SE JÁ TIVER ASSINATURA (PAINEL DE GERENCIAMENTO)
                  ====================================================
                */}
                {temAssinaturaAtiva ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-5 text-center">
                        <div className="w-20 h-20 bg-blue-100 text-routriz-blue rounded-full flex items-center justify-center text-4xl mx-auto mb-2 shadow-inner">
                            🚀
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-800">Você é PRO!</h2>
                        <p className="text-gray-500 font-medium">Sua conta tem rotas ilimitadas liberadas.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left mt-2">
                            <p className="text-sm text-gray-500 mb-1">Status atual:</p>
                            <p className="font-bold text-green-600 text-lg uppercase">{assinatura.status}</p>
                            <p className="text-sm text-gray-500 mt-3 mb-1">Renova / Vence em:</p>
                            <p className="font-bold text-gray-800">{assinatura.dataVencimento} dias</p>
                        </div>

                        <button 
                            onClick={handleCancelarAssinatura}
                            disabled={loading}
                            className="w-full bg-white border-2 border-red-500 text-red-500 p-4 rounded-xl font-extrabold mt-4 shadow-sm hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Processando cancelamento...' : 'Cancelar Assinatura'}
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                            Ao cancelar, suas futuras cobranças serão suspensas imediatamente.
                        </p>
                    </div>

                ) : (

                /* 
                  ====================================================
                  TELA 2: SE NÃO TIVER ASSINATURA (FORMULÁRIO DE PAGAMENTO)
                  ====================================================
                */
                    <form onSubmit={handleAssinar} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-5">
                        
                        {/* ESCOLHA DO PLANO */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">1. Escolha seu Plano</h3>
                            <div className="flex flex-col gap-3">
                                {planos.length === 0 ? (
                                    <p className="text-sm text-gray-500">Carregando planos...</p>
                                ) : (
                                    planos.map(p => (
                                        <label key={p.id} className={`border p-4 rounded-xl cursor-pointer transition-all flex justify-between items-center ${planoSelecionado === p.id.toString() ? 'border-routriz-blue bg-blue-50 ring-2 ring-blue-200' : 'border-gray-300'}`}>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="radio" name="plano" value={p.id} 
                                                    onChange={(e) => setPlanoSelecionado(e.target.value)}
                                                    className="w-5 h-5 text-routriz-blue" required
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-800">{p.nome}</p>
                                                    <p className="text-xs text-gray-500">{p.descricao}</p>
                                                </div>
                                            </div>
                                            <p className="font-extrabold text-routriz-blue">
                                                R$ {p.valor.toFixed(2).replace('.', ',')}
                                            </p>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* DADOS DO CLIENTE */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">2. Dados de Faturamento</h3>
                            <div className="flex flex-col gap-3">
                                <input type="text" name="cpf" placeholder="Seu CPF" onChange={handleInputChange} required className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                <div className="flex gap-2">
                                    <input type="text" name="cep" placeholder="CEP" onChange={handleInputChange} required className="w-1/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                    <input type="text" name="rua" placeholder="Rua / Avenida" onChange={handleInputChange} required className="w-2/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" name="numero" placeholder="Número" onChange={handleInputChange} required className="w-1/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                    <input type="text" name="bairro" placeholder="Bairro" onChange={handleInputChange} required className="w-2/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" name="cidade" placeholder="Cidade" onChange={handleInputChange} required className="w-2/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                    <input type="text" name="estado" placeholder="UF (Ex: SP)" maxLength="2" onChange={handleInputChange} required className="w-1/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* DADOS DO CARTÃO */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">3. Cartão de Crédito</h3>
                            <div className="flex flex-col gap-3">
                                <input type="text" name="numeroCartao" placeholder="Número do Cartão" onChange={handleInputChange} required className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue" />
                                
                                <div className="flex gap-2">
                                    <input type="text" name="mesVencimento" placeholder="Mês (Ex: 12)" maxLength="2" onChange={handleInputChange} required className="w-1/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue text-center" />
                                    <input type="text" name="anoVencimento" placeholder="Ano (Ex: 2030)" maxLength="4" onChange={handleInputChange} required className="w-1/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue text-center" />
                                    <input type="text" name="cvv" placeholder="CVV" maxLength="4" onChange={handleInputChange} required className="w-1/3 border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue text-center" />
                                </div>

                                <select name="bandeira" onChange={handleInputChange} required className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:border-routriz-blue">
                                    <option value="visa">Visa</option>
                                    <option value="mastercard">Mastercard</option>
                                    <option value="elo">Elo</option>
                                    <option value="amex">American Express</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !planoSelecionado || !scriptCarregado}
                            className="w-full bg-routriz-blue text-white p-4 rounded-xl font-extrabold mt-4 shadow-lg hover:bg-blue-700 transition-all cursor-pointer disabled:bg-gray-400"
                        >
                            {!scriptCarregado ? 'Conectando Banco...' : loading ? 'Processando Pagamento...' : 'Confirmar Assinatura'}
                        </button>
                        
                        <p className="text-xs text-center text-gray-400 font-medium flex items-center justify-center gap-1 mt-2">
                            <span>🔒</span> Pagamento 100% seguro processado por Efí Pay
                        </p>
                    </form>
                )}
            </main>
        </div>
    );
}