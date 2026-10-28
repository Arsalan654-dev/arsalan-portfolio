'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  fields = [],
  initialValues = {},
  title = 'Form',
  loading = false,
  submitText = 'Save',
  size = 'md'
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const defaults = {};
      fields.forEach(f => {
        defaults[f.name] = initialValues[f.name] ?? f.default ?? '';
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(defaults);
      setErrors({});
    }
  }, [isOpen, fields, initialValues]);

  const validate = () => {
    const newErrors = {};
    fields.forEach(f => {
      if (f.required && !formData[f.name]?.toString().trim()) {
        newErrors[f.name] = `${f.label || f.name} is required`;
      }
      if (f.validate) {
        const err = f.validate(formData[f.name], formData);
        if (err) newErrors[f.name] = err;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const renderField = (field) => {
    const { name, label, type = 'text', options, placeholder, accept, min, max, rows, disabled } = field;
    const value = formData[name] ?? '';
    const hasError = errors[name];

    const inputStyle = {
      background: 'var(--bs)',
      color: 'var(--tp)',
      borderColor: hasError ? '#dc3545' : 'var(--bdr)',
      borderRadius: '8px'
    };

    switch (type) {
      case 'select':
        return (
          <select
            className={`form-select ${hasError ? 'is-invalid' : ''}`}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            style={inputStyle}
            disabled={disabled}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options?.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            placeholder={placeholder || `Enter ${label}`}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            rows={rows || 4}
            style={inputStyle}
            disabled={disabled}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            accept={accept || '*/*'}
            onChange={(e) => handleChange(name, e.target.files[0])}
            style={inputStyle}
            disabled={disabled}
          />
        );

      default:
        return (
          <input
            type={type}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            placeholder={placeholder || `Enter ${label}`}
            value={type === 'file' ? undefined : value}
            onChange={(e) => handleChange(name, type === 'number' ? Number(e.target.value) : e.target.value)}
            min={min}
            max={max}
            accept={accept}
            style={inputStyle}
            disabled={disabled}
          />
        );
    }
  };

  const footer = (
    <>
      <button
        type="button"
        className="btn"
        onClick={onClose}
        disabled={loading}
        style={{ background: 'var(--bs)', color: 'var(--tp)', border: '1px solid var(--bdr)' }}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn"
        disabled={loading}
        form="form-modal-form"
        style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Saving...
          </>
        ) : submitText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} footer={footer}>
      <form id="form-modal-form" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div className="mb-3" key={field.name}>
            {field.type !== 'checkbox' && field.label && (
              <label className="form-label" style={{ color: 'var(--tp)', fontWeight: 500 }}>
                {field.label}
                {field.required && <span className="text-danger ms-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <div className="invalid-feedback d-block">{errors[field.name]}</div>
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
}
