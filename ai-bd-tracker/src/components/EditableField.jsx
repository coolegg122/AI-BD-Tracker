import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable inline editable field with admin protection.
 * @param {Object} props
 * @param {any} props.value - Current value
 * @param {Function} props.onSave - Callback function(newValue)
 * @param {string} props.label - Optional label for accessibility
 * @param {string} props.className - Custom classes for the container
 * @param {string} props.textClassName - Constant classes for the text/input
 * @param {string} props.type - 'text' | 'textarea' | 'select' | 'date'
 * @param {Array} props.options - [{id, label}] for select type
 */
export default function EditableField({ 
  value, 
  onSave, 
  label, 
  className = "", 
  textClassName = "", 
  type = "text",
  options = [],
  placeholder = "--"
}) {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = async () => {
    if (currentValue === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(currentValue);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save field:", err);
      // Revert on error? Or keep editing? 
      // For now, let's keep editing so user can try again or cancel
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className={`group flex items-center gap-2 ${className}`}>
        <span className={`${textClassName} transition-colors`}>
          {type === 'select' 
            ? (options.find(o => o.id === value)?.label || value || placeholder)
            : (value || placeholder)}
        </span>
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1 text-ui-text-muted hover:text-ui-accent hover:bg-ui-accent/10 rounded transition-all"
            title={`Edit ${label || 'field'}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {type === 'textarea' ? (
        <textarea
          className={`flex-1 bg-ui-input border border-ui-accent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text min-h-[80px] ${textClassName}`}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : type === 'select' ? (
        <select
          className={`flex-1 bg-ui-input border border-ui-accent rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text ${textClassName}`}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          autoFocus
        >
          {options.map(opt => (
            <option key={opt.id} value={opt.id} className="bg-ui-card">{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={`flex-1 bg-ui-input border border-ui-accent rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-ui-accent/20 outline-none text-ui-text ${textClassName}`}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      )}

      <div className="flex items-center gap-1">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="p-1.5 bg-ui-success/10 text-ui-success hover:bg-ui-success/20 rounded-lg transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button 
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1.5 bg-ui-error/10 text-ui-error hover:bg-ui-error/20 rounded-lg transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
