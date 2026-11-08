import React from 'react';

const Input = ({ label, value, onChange, name, type = "text", error, theme, rightElement, ...props }) => {
    return (
        <div className="flex flex-col space-y-2 w-full text-left">
            {label && (
                <label className="text-[10px] font-black uppercase text-indigo-500/60 ml-4 tracking-widest">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                <input
                    type={type}
                    name={name}
                    value={value || ""} // ✨ IMPORTANT : permet de lire l'état
                    onChange={onChange} // ✨ IMPORTANT : permet d'écrire
                    {...props}
                    className={`w-full px-5 py-4 rounded-apple text-sm font-bold transition-all duration-300 border-2 outline-none
                        ${theme === 'dark' 
                            ? 'bg-white/5 border-transparent text-white focus:border-indigo-500' 
                            : 'bg-slate-50 border-transparent text-slate-900 focus:bg-white focus:border-indigo-600 shadow-sm'}
                        ${error ? 'border-red-500 bg-red-50' : ''}
                    `}
                />
                {/* Emplacement pour l'icône de l'œil ✨ */}
                {rightElement && (
                    <div className="absolute right-4 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <span className="text-[10px] text-red-500 ml-4 font-bold italic">{error}</span>}
        </div>
    );
};

export default Input;