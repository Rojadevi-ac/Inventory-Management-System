import { useRef } from 'react'
import { MdCameraAlt, MdClose, MdUploadFile } from 'react-icons/md'
import Avatar from './Avatar'

/**
 * ImageUploadPicker component allowing users to click on the picture to select
 * an image directly from desktop/device with live preview and remove option.
 */
export default function ImageUploadPicker({
  value,
  onChange,
  name,
  label = 'Picture',
  shape = 'rounded-2xl',
  size = 'xl',
  helperText = 'Click picture or choose file to select from desktop.',
}) {
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP, GIF)')
      return
    }

    // Convert file to Base64 data URL
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      onChange(uploadEvent.target.result)
    }
    reader.readAsDataURL(file)
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  function handleClear(e) {
    e.stopPropagation()
    onChange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="form-label mb-0 text-xs font-semibold">{label}</label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 transition-colors"
          >
            <MdClose size={14} /> Remove Picture
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Clickable Picture with Camera Hover Overlay */}
        <div
          onClick={triggerFileInput}
          title="Click to choose an image from your desktop"
          className="relative group cursor-pointer flex-shrink-0"
        >
          <Avatar
            src={value}
            name={name || 'Item'}
            size={size}
            rounded={shape}
            className="ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all duration-200"
          />

          {/* Camera hover overlay */}
          <div className={`absolute inset-0 bg-black/60 ${shape} flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]`}>
            <MdCameraAlt size={22} className="animate-bounce" />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5">Change</span>
          </div>
        </div>

        {/* Desktop upload trigger button & helper text */}
        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-medium hover:border-indigo-500/50"
            >
              <MdUploadFile size={16} className="text-indigo-500" />
              <span>Choose from Desktop</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {helperText}
          </p>
        </div>
      </div>
    </div>
  )
}
