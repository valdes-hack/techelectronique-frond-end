import React, { useState } from 'react';
import { 
    MessageCircle, X, Phone, Send, Sparkles, Clock, 
    CheckCircle2, HelpCircle, Package, ArrowRight, MessageSquare
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * BOUTON FLOTTANT D'ASSISTANCE & CONSULTATION CLIENT
 * Permet au client de joindre directement le vendeur / service client via WhatsApp, 
 * appel téléphonique direct, suivi de commande ou formulaire d'aide.
 */
const ChatWidget = () => {
    const { settings } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [bubbleDismissed, setBubbleDismissed] = useState(false);

    const supportPhone = settings?.contactPhone || '+237 686 669 222';
    const cleanPhone = supportPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Bonjour PEOC, j'ai une question concernant un produit ou un élevage.")}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            
            {/* ── FENÊTRE DE CONSULTATION CLIENT (AU CLIC) ── */}
            {isOpen && (
                <div className="mb-4 w-[340px] sm:w-[380px] bg-white dark:bg-[#121522] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
                    
                    {/* Header Dégradé */}
                    <div className="p-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                                    🐣
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wide">
                                        Conseil & Support PEOC
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 font-bold">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Conseiller en ligne disponible</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-white/80 mt-3 font-medium">
                            Besoin d'un devis, d'un conseil pour vos couveuses ou de suivre votre colis ? Choisissez un canal direct :
                        </p>
                    </div>

                    {/* Canaux de Consultation Directe */}
                    <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
                        
                        {/* 1. WHATSAPP DIRECT */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                <MessageCircle size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider">Discussion WhatsApp</span>
                                    <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Recommandé</span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                                    Réponse instantanée par notre expert avicole
                                </p>
                            </div>
                        </a>

                        {/* 2. APPEL TÉLÉPHONIQUE */}
                        <a
                            href={`tel:${supportPhone}`}
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-indigo-500/10 border border-gray-100 dark:border-white/5 hover:border-indigo-500/20 text-slate-900 dark:text-white transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                                <Phone size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-black uppercase tracking-wider block">Appeler directement</span>
                                <p className="text-[11px] text-indigo-500 font-bold truncate mt-0.5">
                                    {supportPhone}
                                </p>
                            </div>
                        </a>

                        {/* 3. SUIVRE UNE COMMANDE */}
                        <a
                            href="/track"
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-white/10 border border-gray-100 dark:border-white/5 text-slate-800 dark:text-gray-200 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                                <Package size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-black uppercase tracking-wider block">Suivre un colis</span>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                                    Avec votre code de suivi ou jeton
                                </p>
                            </div>
                            <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </a>

                        {/* 4. CENTRE D'AIDE */}
                        <a
                            href="/support"
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-white/10 border border-gray-100 dark:border-white/5 text-slate-800 dark:text-gray-200 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                                <HelpCircle size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-black uppercase tracking-wider block">Assistance & FAQ</span>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                                    Garanties, livraisons et modes d'emploi
                                </p>
                            </div>
                            <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 text-center text-[10px] text-gray-400 font-medium">
                        PEOC Bafoussam • Service Clientèle 7j/7
                    </div>
                </div>
            )}

            {/* ── BULLE D'INVITATION (SI NON FERMÉE) ── */}
            {!isOpen && !bubbleDismissed && (
                <div className="mb-3 mr-1 bg-white dark:bg-[#161926] text-slate-800 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-300 max-w-[260px]">
                    <span className="text-lg">👋</span>
                    <span className="flex-1 text-[11px] leading-tight">
                        Besoin d'aide ? <strong>Consultez un expert en 1 clic !</strong>
                    </span>
                    <button
                        onClick={() => setBubbleDismissed(true)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5"
                    >
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* ── BOUTON FLOTTANT PRINCIPAL ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Contacter le support client"
            >
                {/* Pastille verte en ligne */}
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0b0e14] shadow-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>

                {isOpen ? (
                    <X size={24} className="animate-in spin-in-90 duration-200" />
                ) : (
                    <MessageSquare size={26} className="group-hover:rotate-6 transition-transform" />
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
