import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    const currentLanguage = i18n.language || 'en';

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 hover:text-green-100 transition">
                <Globe size={20} />
                <span className="text-sm uppercase">{currentLanguage}</span>
            </button>

            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition rounded-t-lg ${currentLanguage === 'en' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                        }`}
                >
                    English
                </button>
                <button
                    onClick={() => changeLanguage('hi')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition rounded-b-lg ${currentLanguage === 'hi' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                        }`}
                >
                    हिन्दी (Hindi)
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
