import React from 'react';
import { ChevronRight } from 'lucide-react';

const StatCard = ({ title, value, sub, icon, color, theme, unit="" }) => (
    <div className={`p-6 rounded-[2.2rem] border transition-all shadow-xl group ${
        theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-white shadow-slate-200'
    }`}>
        <div className="flex justify-between items-start mb-6">
            <div>
                <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mb-1.5">{title}</p>
                <div className={`text-2xl md:text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {value}<span className="text-sm ml-1 opacity-20 italic">{unit}</span>
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 shadow-inner" style={{color}}>{icon}</div>
        </div>
        <p className="text-[10px] font-bold opacity-30 flex items-center uppercase tracking-tight">
            <ChevronRight size={14} className="mr-1 text-indigo-500" /> {sub}
        </p>
    </div>
);

export default StatCard;