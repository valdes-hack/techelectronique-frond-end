import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../../services/auth.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { UserPlus, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("Les mots de passe ne sont pas identiques, bébé. 🙊");
        }

        setLoading(true);
        try {
            await AuthService.register(formData);
            alert("Compte TechStore créé avec succès ! 😍");
            navigate('/login');
        } catch (err) {
            const msg = err.message || err.error || "Erreur lors de l'inscription.";
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-apple-white flex flex-col items-center justify-center px-6 py-20">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl bg-white p-12 rounded-[2.5rem] shadow-2xl border border-apple-border/50">
                
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-apple-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-apple-blue">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tighter text-apple-dark">Créer un profil.</h2>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-apple text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Prénom" name="firstName" placeholder="Valdes" onChange={handleChange} required />
                    <Input label="Nom" name="lastName" placeholder="Hack" onChange={handleChange} required />
                    <div className="md:col-span-2">
                        <Input label="Adresse e-mail" name="email" type="email" placeholder="valdes@gmail.com" onChange={handleChange} required />
                    </div>
                    <div className="md:col-span-2">
                        <Input label="Téléphone" name="phone" placeholder="+237 6xx xxx xxx" onChange={handleChange} required />
                    </div>
                    <Input label="Mot de passe" name="password" type="password" onChange={handleChange} required />
                    <Input label="Confirmer" name="confirmPassword" type="password" onChange={handleChange} required />

                    <div className="md:col-span-2 pt-6">
                        <Button type="submit" className="w-full py-4 text-lg" loading={loading}>
                            Rejoindre TechStore
                        </Button>
                    </div>
                </form>

                <div className="mt-10 pt-8 border-t border-apple-border text-center">
                    <p className="text-sm text-apple-dark/50 italic mb-4 flex justify-center items-center">
                        <ShieldCheck size={16} className="mr-2 text-green-500" /> Vos données sont protégées.
                    </p>
                    <Link to="/login" className="text-apple-blue font-bold hover:underline">
                        Déjà un compte ? Se connecter.
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;