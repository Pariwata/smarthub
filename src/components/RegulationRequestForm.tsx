import React, { useState } from 'react';
import { RegulationRequest } from '../types/regulation';
import { regulationService } from '../services/regulationService';
import {
  REGULATION_CATEGORIES,
  COMPLIANCE_FRAMEWORKS,
  REQUEST_TYPES,
  PRIORITY_LEVELS,
  TARGET_AUDIENCES,
} from '../utils/constants';

interface FormErrors {
  [key: string]: string;
}

const RegulationRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<RegulationRequest>({
    title: '',
    description: '',
    requestType: 'generate',
    regulationCategory: '',
    targetAudience: '',
    complianceFramework: '',
    priority: 'medium',
    deadline: '',
    additionalNotes: '',
    template: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      template: file,
    }));
    setFileName(file?.name || '');
    if (errors.template) {
      setErrors((prev) => ({ ...prev, template: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.regulationCategory) {
      newErrors.regulationCategory = 'Please select a regulation category';
    }

    if (!formData.targetAudience) {
      newErrors.targetAudience = 'Please select a target audience';
    }

    if (formData.template && formData.template.size > 10 * 1024 * 1024) {
      newErrors.template = 'File size must be less than 10MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await regulationService.submitRequest(formData);

      if (response.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          requestType: 'generate',
          regulationCategory: '',
          targetAudience: '',
          complianceFramework: '',
          priority: 'medium',
          deadline: '',
          additionalNotes: '',
          template: null,
        });
        setFileName('');

        // Clear success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(response.message || 'Failed to submit request');
      }
    } catch (error) {
      setSubmitError('An error occurred while submitting the request. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Regulation Library Request</h1>
        <p>Submit a request to generate regulation library output</p>
      </div>

      {submitSuccess && (
        <div className="alert alert-success">
          <strong>Success!</strong> Your regulation request has been submitted successfully.
        </div>
      )}

      {submitError && (
        <div className="alert alert-error">
          <strong>Error:</strong> {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="regulation-form">
        {/* Request Type */}
        <div className="form-group">
          <label htmlFor="requestType">
            Request Type <span className="required">*</span>
          </label>
          <select
            id="requestType"
            name="requestType"
            value={formData.requestType}
            onChange={handleInputChange}
            className="form-control"
          >
            {REQUEST_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-control ${errors.title ? 'error' : ''}`}
            placeholder="Enter regulation title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Provide detailed description of the regulation requirements"
            rows={4}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Regulation Category */}
        <div className="form-group">
          <label htmlFor="regulationCategory">
            Regulation Category <span className="required">*</span>
          </label>
          <select
            id="regulationCategory"
            name="regulationCategory"
            value={formData.regulationCategory}
            onChange={handleInputChange}
            className={`form-control ${errors.regulationCategory ? 'error' : ''}`}
          >
            <option value="">Select a category</option>
            {REGULATION_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.regulationCategory && (
            <span className="error-message">{errors.regulationCategory}</span>
          )}
        </div>

        {/* Target Audience */}
        <div className="form-group">
          <label htmlFor="targetAudience">
            Target Audience <span className="required">*</span>
          </label>
          <select
            id="targetAudience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleInputChange}
            className={`form-control ${errors.targetAudience ? 'error' : ''}`}
          >
            <option value="">Select target audience</option>
            {TARGET_AUDIENCES.map((audience) => (
              <option key={audience} value={audience}>
                {audience}
              </option>
            ))}
          </select>
          {errors.targetAudience && (
            <span className="error-message">{errors.targetAudience}</span>
          )}
        </div>

        {/* Compliance Framework (Optional) */}
        <div className="form-group">
          <label htmlFor="complianceFramework">Compliance Framework (Optional)</label>
          <select
            id="complianceFramework"
            name="complianceFramework"
            value={formData.complianceFramework}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select a framework (optional)</option>
            {COMPLIANCE_FRAMEWORKS.map((framework) => (
              <option key={framework.id} value={framework.id}>
                {framework.name} ({framework.abbreviation})
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="form-group">
          <label htmlFor="priority">
            Priority <span className="required">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="form-control"
          >
            {PRIORITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label htmlFor="deadline">Deadline (Optional)</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="form-control"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Template Upload */}
        <div className="form-group">
          <label htmlFor="template">Upload Template (Optional)</label>
          <div className="file-upload-wrapper">
            <input
              type="file"
              id="template"
              name="template"
              onChange={handleFileChange}
              className="file-input"
              accept=".pdf,.doc,.docx,.txt,.md"
            />
            <label htmlFor="template" className="file-label">
              <span className="file-icon">📁</span>
              <span className="file-text">
                {fileName || 'Choose a template file'}
              </span>
            </label>
            {fileName && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, template: null }));
                  setFileName('');
                }}
                className="file-clear"
              >
                ✕
              </button>
            )}
          </div>
          <small className="help-text">
            Supported formats: PDF, DOC, DOCX, TXT, MD (Max 10MB)
          </small>
          {errors.template && <span className="error-message">{errors.template}</span>}
        </div>

        {/* Additional Notes */}
        <div className="form-group">
          <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Any additional information or special requirements"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                requestType: 'generate',
                regulationCategory: '',
                targetAudience: '',
                complianceFramework: '',
                priority: 'medium',
                deadline: '',
                additionalNotes: '',
                template: null,
              });
              setFileName('');
              setErrors({});
              setSubmitError('');
              setSubmitSuccess(false);
            }}
            className="btn btn-secondary"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegulationRequestForm;
