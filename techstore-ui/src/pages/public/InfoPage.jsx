import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * Pages d'information du pied de page : /support, /shipping, /terms, /privacy.
 * Contenu volontairement sobre : à relire / compléter par PEOC (notamment les mentions légales).
 */
const WHATSAPP = '237686669222';

const PAGES = {
    '/support': {
        title: 'SAV & Garantie',
        intro: "Un souci avec une commande, un produit ou un animal livré ? Contactez-nous, nous traitons chaque demande rapidement.",
        sections: [
            { h: 'Comment nous joindre', p: "Par téléphone, WhatsApp ou e-mail (coordonnées ci-dessous). Indiquez votre numéro de commande ou votre code de suivi pour accélérer le traitement." },
            { h: 'Réclamations', p: "Signalez toute anomalie le plus tôt possible après la réception, avec des photos si possible. Notre équipe reviendra vers vous avec une solution adaptée (échange, geste commercial ou remboursement selon le cas)." },
        ],
    },
    '/shipping': {
        title: 'Zones de livraison',
        intro: "PEOC livre depuis Bafoussam (Ouest-Cameroun). Le retrait en boutique est également possible.",
        sections: [
            { h: 'Livraison à domicile', p: "Les frais de livraison dépendent de la zone et sont affichés lors de la commande. Vous pouvez renseigner votre adresse ou utiliser la géolocalisation." },
            { h: 'Retrait en boutique', p: "Choisissez « Retrait boutique » lors de la commande : aucun frais de livraison n'est appliqué." },
            { h: 'Paiement', p: "Le règlement s'effectue à la livraison ou au retrait." },
        ],
    },
    '/terms': {
        title: 'Mentions légales & conditions',
        intro: "Informations générales sur l'utilisation du site PEOC (Petit Éleveur de l'Ouest Cameroun).",
        sections: [
            { h: 'Éditeur du site', p: "PEOC - Petit Éleveur de l'Ouest Cameroun, Bafoussam, Ouest - Cameroun." },
            { h: 'Commandes', p: "Toute commande passée sur le site vaut acceptation des présentes conditions. Les prix sont indiqués en FCFA ; les disponibilités peuvent évoluer jusqu'à la confirmation de la commande." },
            { h: 'Produits vivants', p: "Les animaux vendus sont soumis aux aléas du vivant : signalez tout problème dès la réception pour que nous puissions agir rapidement." },
        ],
    },
    '/privacy': {
        title: 'Confidentialité',
        intro: "Nous collectons uniquement les données nécessaires au traitement de vos commandes et à la gestion de votre compte.",
        sections: [
            { h: 'Données collectées', p: "Nom, e-mail, téléphone et adresse de livraison, utilisés pour traiter, livrer et suivre vos commandes." },
            { h: 'Utilisation', p: "Vos données ne sont ni vendues ni cédées à des tiers, hors prestataires strictement nécessaires (hébergement, envoi d'e-mails de confirmation)." },
            { h: 'Vos droits', p: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en nous contactant." },
        ],
    },
};

const InfoPage = () => {
    const { pathname } = useLocation();
    const { settings } = useAppContext();
    const page = PAGES[pathname.replace(/\/+$/, '')];
    if (!page) return null;

    const phone = settings?.contactPhone || '+237 686 669 222';
    const email = settings?.contactEmail || 'contact@peoc.cm';
    const address = settings?.contactAddress || 'Bafoussam, Ouest - Cameroun';

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-apple-dark dark:text-white">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-500 hover:underline mb-8">
                <ArrowLeft size={14} /> Accueil
            </Link>
            <h1 className="text-4xl font-black tracking-tighter mb-4">{page.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">{page.intro}</p>

            <div className="space-y-8">
                {page.sections.map(s => (
                    <section key={s.h}>
                        <h2 className="text-lg font-black mb-2">{s.h}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{s.p}</p>
                    </section>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3 text-sm">
                <p className="flex items-center gap-2"><Phone size={15} className="text-indigo-500" /> {phone}</p>
                <p className="flex items-center gap-2"><Mail size={15} className="text-indigo-500" /> {email}</p>
                <p className="flex items-center gap-2"><MapPin size={15} className="text-indigo-500" /> {address}</p>
                <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
                >
                    <MessageCircle size={15} /> Écrire sur WhatsApp
                </a>
            </div>
        </div>
    );
};

export default InfoPage;
