import { createContext, useContext, useState, useEffect } from 'react'
import { LANGUAGES, translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('ims_lang') || 'en'
  })

  const setLanguage = (langCode) => {
    const valid = LANGUAGES.find((l) => l.code === langCode)
    const code = valid ? valid.code : 'en'
    setLanguageState(code)
    localStorage.setItem('ims_lang', code)
  }

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  useEffect(() => {
    // Update HTML dir and lang attributes
    document.documentElement.lang = currentLanguageObj.code
    document.documentElement.dir = currentLanguageObj.dir || 'ltr'
  }, [currentLanguageObj])

  /**
   * Translate key with optional fallback
   */
  const t = (key, fallback = '') => {
    const langDict = translations[language] || translations.en
    if (langDict && langDict[key] !== undefined) {
      return langDict[key]
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key]
    }
    return fallback || key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageObj,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
