import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import { FiPlus, FiX, FiTag, FiCalendar, FiSettings } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const CreatePoll = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: [{ text: '' }, { text: '' }],
    category: 'General',
    tags: [],
    allowMultipleVotes: false,
    allowAnonymousVotes: false,
    isPublic: true,
    expiresAt: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { createPoll } = usePoll();
  const navigate = useNavigate();

  const categories = ['General', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { text: '' }]
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    const validOptions = formData.options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    if (formData.expiresAt && new Date(formData.expiresAt) <= new Date()) {
      newErrors.expiresAt = 'Expiration date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const pollData = {
      ...formData,
      options: formData.options.filter(option => option.text.trim())
    };

    const result = await createPoll(pollData);
    setLoading(false);

    if (result) {
      navigate(`/poll/${result._id}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Creating your poll..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Poll</h1>
        <p className="text-gray-600">Share your question with the community and get real-time results.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Poll Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="What would you like to ask?"
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`input ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Add more context to your poll..."
                maxLength={1000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Poll Options */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Poll Options</h2>
          
          <div className="space-y-4">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="input flex-1"
                  placeholder={`Option ${index + 1}`}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            {errors.options && (
              <p className="text-sm text-red-600">{errors.options}</p>
            )}

            {formData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Option
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
          
          <div className="space-y-4">
            <form onSubmit={addTag} className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="input flex-1"
                placeholder="Add tags to help others find your poll..."
              />
              <button
                type="submit"
                className="btn btn-outline"
              >
                Add
              </button>
            </form>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    <FiTag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Poll Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className={`input ${errors.expiresAt ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.expiresAt && (
                <p className="mt-1 text-sm text-red-600">{errors.expiresAt}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowMultipleVotes"
                  name="allowMultipleVotes"
                  checked={formData.allowMultipleVotes}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowMultipleVotes" className="ml-3 text-sm text-gray-700">
                  Allow multiple votes per user
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowAnonymousVotes"
                  name="allowAnonymousVotes"
                  checked={formData.allowAnonymousVotes}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowAnonymousVotes" className="ml-3 text-sm text-gray-700">
                  Allow anonymous votes (no login required)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-3 text-sm text-gray-700">
                  Make poll public (visible to everyone)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Poll
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;




