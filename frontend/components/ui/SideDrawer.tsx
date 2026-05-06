"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type FormEvent,
} from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

function CustomToggle({ isChecked, onChange, isDisabled }: { isChecked: boolean, onChange: () => void, isDisabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={isDisabled}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isChecked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}

interface DrawerFormCtx {
  values: Record<string, any>;
  setValue: (name: string, value: any) => void;
  readOnly: boolean;
}

const DrawerFormContext = createContext<DrawerFormCtx>({
  values: {},
  setValue: () => {},
  readOnly: false,
});

export function useDrawerField(name: string, defaultValue?: any) {
  const ctx = useContext(DrawerFormContext);
  const value = ctx.values[name] !== undefined ? ctx.values[name] : (defaultValue ?? '');

  useEffect(() => {
    if (ctx.values[name] === undefined && defaultValue !== undefined) {
      ctx.setValue(name, defaultValue);
    }
  }, [name, defaultValue, ctx]);

  return {
    value,
    onChange: (v: any) => ctx.setValue(name, v),
    readOnly: ctx.readOnly,
  };
}

export interface SideDrawerProps {
  formKey: string;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  submitDanger?: boolean;
  width?: number | string;
  footerExtra?: ReactNode;
  readOnly?: boolean;
  children: ReactNode;
}

export function SideDrawer({
  formKey,
  title,
  subtitle,
  isOpen,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  submitDanger = false,
  width = 520,
  footerExtra,
  readOnly = false,
  children,
}: SideDrawerProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [prevFormKey, setPrevFormKey] = useState(formKey);
  const panelRef = useRef<HTMLDivElement>(null);

  if (formKey !== prevFormKey) {
    setValues({});
    setError(null);
    setSubmitState('idle');
    setPrevFormKey(formKey);
  }

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (readOnly || !onSubmit) return;
    
    setError(null);
    setSubmitState('loading');
    
    try {
      await onSubmit(values);
      setSubmitState('success');
      setTimeout(() => {
        setSubmitState('idle');
        onClose();
      }, 600);
    } catch (err: any) {
      setSubmitState('idle');
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  }

  const panelWidth = typeof width === 'number' ? `${width}px` : width;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed top-0 right-0 bottom-0 flex flex-col bg-white shadow-2xl border-l border-slate-200 z-[1001] transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{
          width: panelWidth,
          maxWidth: '100vw',
          transform: isOpen ? 'translateX(0)' : `translateX(100%)`,
        }}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#343a40] m-0 leading-tight tracking-tight">
                {title}
              </h2>
              {readOnly && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                  View Only
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-[#6c757d] mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="w-10 h-10 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 border border-[#e9ebec] bg-white text-[#adb5bd] hover:bg-[#f8f8fb] hover:text-[#343a40] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="side-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto flex flex-col bg-white"
        >
          <DrawerFormContext.Provider value={{ values, setValue, readOnly }}>
            <div className="px-8 py-8 flex flex-col gap-8 flex-1">
              {children}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
            </div>
          </DrawerFormContext.Provider>

          <div className="px-8 py-6 border-t border-slate-100 bg-white flex-shrink-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {footerExtra}
            </div>
            <div className="flex items-center gap-4">
              {!readOnly ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitState !== 'idle'}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-[#6c757d] hover:bg-[#f8f8fb] hover:text-[#343a40] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="side-drawer-form"
                    disabled={submitState !== 'idle'}
                    className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl transition-all
                      ${submitState === 'success' 
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                        : submitDanger 
                          ? 'bg-red-600 text-white shadow-red-600/20 disabled:opacity-50' 
                          : 'bg-primary text-white shadow-primary/30 disabled:opacity-50 hover:bg-primary/90 hover:scale-[1.02]'}`}
                  >
                    {submitState === 'loading' && <Loader2 size={18} className="animate-spin" />}
                    {submitState === 'success' && <CheckCircle2 size={18} />}
                    {submitState === 'loading' ? 'Saving…' : submitState === 'success' ? 'Saved!' : submitLabel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl text-sm font-bold border border-[#e9ebec] bg-white text-[#343a40] hover:bg-[#f8f8fb] transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

const labelClasses = "block text-xs font-extrabold uppercase tracking-widest text-[#6c757d] mb-2";
const inputClasses = "w-full px-4 py-3 rounded-xl text-sm font-bold border border-[#e9ebec] bg-[#f8f8fb] text-[#343a40] placeholder:text-[#adb5bd] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all";

export function DrawerInput({
  name, label, placeholder, isRequired = false, type = 'text', defaultValue,
}: {
  name: string; label: string; placeholder?: string; isRequired?: boolean;
  type?: string; defaultValue?: string;
}) {
  const { value, onChange, readOnly } = useDrawerField(name, defaultValue);

  if (readOnly) {
    return <DrawerViewField label={label} value={value} />;
  }

  return (
    <div>
      <label className={labelClasses}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={isRequired}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={inputClasses}
      />
    </div>
  );
}

export function DrawerTextarea({
  name, label, placeholder, rows = 4, defaultValue,
}: {
  name: string; label: string; placeholder?: string; rows?: number; defaultValue?: string;
}) {
  const { value, onChange, readOnly } = useDrawerField(name, defaultValue);

  if (readOnly) {
    return <DrawerViewField label={label} value={value} />;
  }

  return (
    <div>
      <label className={labelClasses}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`${inputClasses} resize-y leading-relaxed`}
      />
    </div>
  );
}

export function DrawerSelect({
  name, label, options, isRequired = false, defaultValue,
}: {
  name: string; label: string;
  options: { label: string; value: string }[];
  isRequired?: boolean; defaultValue?: string;
}) {
  const { value, onChange, readOnly } = useDrawerField(name, defaultValue);

  if (readOnly) {
    const selectedLabel = options.find(o => o.value === value)?.label || value;
    return <DrawerViewField label={label} value={selectedLabel} />;
  }

  return (
    <div>
      <label className={labelClasses}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        required={isRequired}
        onChange={e => onChange(e.target.value)}
        className={`${inputClasses} cursor-pointer appearance-auto`}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function DrawerImageUpload({
  name, label, defaultValue,
}: {
  name: string; label: string; defaultValue?: string;
}) {
  const { onChange, readOnly } = useDrawerField(name);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (defaultValue) setPreview(defaultValue);
  }, [defaultValue]);

  if (readOnly) {
    return <DrawerImageView label={label} src={preview || undefined} />;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
    setPreview(URL.createObjectURL(file));
  }

  function remove() {
    onChange(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div>
      <label className={labelClasses}>
        {label}
      </label>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFile}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group">
          <img src={preview} alt="preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-900 hover:bg-slate-100"
            >
              Change
            </button>
            <button
              type="button"
              onClick={remove}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full py-10 rounded-2xl border-2 border-dashed text-center cursor-pointer border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary dark:hover:border-primary hover:bg-primary/5 transition-all"
        >
          <p className="text-sm font-bold text-primary mb-1">Click to upload image</p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">JPG, PNG or WEBP (max. 2MB)</p>
        </div>
      )}
    </div>
  );
}

export function DrawerDivider({ label }: { label?: string }) {
  if (!label) {
    return <div className="h-px bg-slate-200 dark:border-white/10 my-4" />;
  }
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-slate-200 dark:border-white/10" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200 dark:border-white/10" />
    </div>
  );
}

export function DrawerViewField({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <p className={labelClasses}>
        {label}
      </p>
      <div className="text-sm text-[#343a40] font-bold leading-relaxed min-h-[48px] px-4 py-3 rounded-xl bg-[#f8f8fb] border border-[#e9ebec] flex items-center">
        {value || <span className="text-[#adb5bd] italic font-medium">No data available</span>}
      </div>
    </div>
  );
}

export function DrawerImageView({ label, src }: { label: string; src?: string }) {
  return (
    <div>
      <p className={labelClasses}>
        {label}
      </p>
      {src ? (
        <img src={src} className="w-full h-48 object-cover rounded-2xl border border-[#e9ebec] shadow-sm" />
      ) : (
        <div className="w-full h-48 rounded-2xl bg-[#f8f8fb] flex items-center justify-center text-[#adb5bd] border border-dashed border-[#e9ebec] font-bold text-sm">
          No image provided
        </div>
      )}
    </div>
  );
}

export function DrawerToggle({
  name, label, description, defaultValue = true,
}: {
  name: string; label: string; description?: string; defaultValue?: boolean;
}) {
  const { value, onChange, readOnly } = useDrawerField(name, defaultValue);

  return (
    <div className={`flex items-center justify-between p-6 bg-[#f8f8fb] rounded-2xl border border-[#e9ebec] ${readOnly ? 'opacity-80' : ''}`}>
      <div className="flex-1 mr-6">
        <div className="text-sm font-bold text-[#343a40] leading-tight">{label}</div>
        {description && <div className="text-[11px] font-medium text-[#6c757d] mt-1.5">{description}</div>}
      </div>
      <CustomToggle 
        isChecked={!!value} 
        onChange={() => !readOnly && onChange(!value)} 
        isDisabled={readOnly}
      />
    </div>
  );
}
