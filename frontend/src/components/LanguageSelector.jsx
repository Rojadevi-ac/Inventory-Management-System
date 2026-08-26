import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { MdTranslate, MdKeyboardArrowDown, MdCheck } from 'react-icons/md'

export default function LanguageSelector({ variant = 'default' }) {
  const { language, setLanguage, languages, currentLanguageObj, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
          variant === 'auth'
            ? 'bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm hover:border-indigo-500'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10'
        }`}
        title={t('selectLanguage', 'Select Language')}
      >
        <span className="text-sm">{currentLanguageObj.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLanguageObj.native}</span>
        <span className="sm:hidden font-mono uppercase">{currentLanguageObj.code}</span>
        <MdKeyboardArrowDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
            <MdTranslate size={14} className="text-indigo-500" />
            <span>{t('selectLanguage', 'Select Language')}</span>
          </div>

          <div className="py-1 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = lang.code === language
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{lang.native}</span>
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <MdCheck size={16} className="text-indigo-500" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
