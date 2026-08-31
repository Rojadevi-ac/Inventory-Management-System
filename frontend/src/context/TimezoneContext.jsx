import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'

const TimezoneContext = createContext()

export function TimezoneProvider({ children }) {
  const [timezone, setTimezone] = useState(localStorage.getItem('ims_timezone') || 'Asia/Kolkata')
  const [utcOffset, setUtcOffset] = useState('UTC+05:30')
  const [timezoneLabel, setTimezoneLabel] = useState('India Standard Time (Asia/Kolkata)')
  const [supportedTimezones, setSupportedTimezones] = useState([])
  const [manualDatetime, setManualDatetime] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTimezone = useCallback(async () => {
    try {
      const res = await adminAPI.getTimezone()
      if (res.data && res.data.timezone) {
        setTimezone(res.data.timezone)
        localStorage.setItem('ims_timezone', res.data.timezone)
        setUtcOffset(res.data.utc_offset || 'UTC+00:00')
        setTimezoneLabel(res.data.timezone_label || res.data.timezone)
        setSupportedTimezones(res.data.supported_timezones || [])
        setManualDatetime(res.data.manual_datetime || null)
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTimezone()
  }, [fetchTimezone])

  const updateTimezoneConfig = async (newTimezone, manualTime = null) => {
    const res = await adminAPI.updateTimezone({
      timezone: newTimezone,
      manual_datetime: manualTime,
    })
    if (res.data) {
      setTimezone(res.data.timezone)
      localStorage.setItem('ims_timezone', res.data.timezone)
      setUtcOffset(res.data.utc_offset)
      setTimezoneLabel(res.data.timezone_label)
      setManualDatetime(res.data.manual_datetime || null)
    }
    return res
  }

  return (
    <TimezoneContext.Provider
      value={{
        timezone,
        utcOffset,
        timezoneLabel,
        supportedTimezones,
        manualDatetime,
        loading,
        refreshTimezone: fetchTimezone,
        updateTimezoneConfig,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  return useContext(TimezoneContext)
}
