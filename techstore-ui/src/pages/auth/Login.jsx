import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ChevronRight, Eye, EyeOff } from 'lucide-react'; // Ajout des icônes ✨

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // État pour l'œil ✨
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login: saveAuth } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        // Cette fonction met à jour l'état quand tu tapes au clavier
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await AuthService.login(formData);
            if (res && res.data) {
                const { user, token } = res.data;
                saveAuth(user, token);
                
                setTimeout(() => {
                    if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/profile');
                    }
                }, 50);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Identifiants invalides.";
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-apple-border/50">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black italic tracking-tighter text-apple-dark leading-none">Connectez-vous.</h2>
                    <p className="text-apple-dark/50 mt-4 font-bold uppercase text-[10px] tracking-widest">TechStore par Valdes.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input 
                        label="Adresse e-mail" 
                        name="email" 
                        type="email" 
                        value={formData.email} // Ajout de value ✨
                        onChange={handleChange} 
                        placeholder="valdes@example.com"
                        required 
                    />
                    
                    <Input 
                        label="Mot de passe" 
                        name="password" 
                        type={showPassword ? "text" : "password"} // Type dynamique ✨
                        value={formData.password} // Ajout de value ✨
                        onChange={handleChange} 
                        placeholder="••••••••"
                        required 
                        rightElement={ // Ajout de l'œil ✨
                            <div onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </div>
                        }
                    />

                    <div className="pt-4">
                        <Button type="submit" className="w-full py-5 text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-100" loading={loading}>
                            Se connecter <ChevronRight className="ml-2" size={18} strokeWidth={3} />
                        </Button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <button onClick={() => navigate('/register')} className="text-indigo-600 font-black text-sm uppercase tracking-tight hover:underline">
                        Créer un profil gratuit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;