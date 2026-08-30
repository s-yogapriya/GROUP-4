import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, FileCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1: Personal Details
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    gender: 'MALE',
    dateOfBirth: '',
    mobileNumber: '',
    alternateMobile: '',
    email: '',

    // Section 2: Address Details
    address: {
      houseNumber: '',
      street: '',
      area: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
    },

    // Section 3: Government ID
    governmentId: {
      idType: 'AADHAAR',
      idNumber: '',
      documentUrl: '',
    },
  });

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
    if (fieldErrors[`address.${name}`]) {
      setFieldErrors((prev) => ({ ...prev, [`address.${name}`]: null }));
    }
  };

  const handleGovIdChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      governmentId: { ...prev.governmentId, [name]: value },
    }));
    if (fieldErrors[`governmentId.${name}`]) {
      setFieldErrors((prev) => ({ ...prev, [`governmentId.${name}`]: null }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.age || formData.age < 18) errors.age = 'Age must be at least 18';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.mobileNumber || !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.address.houseNumber.trim()) errors['address.houseNumber'] = 'House number is required';
    if (!formData.address.street.trim()) errors['address.street'] = 'Street is required';
    if (!formData.address.area.trim()) errors['address.area'] = 'Area is required';
    if (!formData.address.city.trim()) errors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) errors['address.state'] = 'State is required';
    if (!formData.address.pinCode || !/^[1-9][0-9]{5}$/.test(formData.address.pinCode)) {
      errors['address.pinCode'] = 'Enter a valid 6-digit PIN code';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFieldErrors((prev) => ({ ...prev, 'governmentId.documentUrl': null }));
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/public/upload-document', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const docUrl = typeof res === 'string' ? res : (res?.data || res);
      setFormData((prev) => ({
        ...prev,
        governmentId: { ...prev.governmentId, documentUrl: docUrl },
      }));
      setUploadedFileName(file.name);
    } catch (err) {
      console.error('Document upload error:', err);
      const errorMsg = typeof err === 'string' ? err : (err?.response?.data?.message || 'Upload failed. Please try again.');
      setFieldErrors((prev) => ({ ...prev, 'governmentId.documentUrl': errorMsg }));
    } finally {
      setUploading(false);
    }
  };

  const validateStep3 = () => {
    const errors = {};
    if (!formData.governmentId.documentUrl) {
      errors['governmentId.documentUrl'] = 'Please upload your government ID document';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10),
      };

      const res = await api.post('/auth/register', payload);
      showToast(res.message || 'Registration submitted successfully! Pending Admin approval.', 'success');
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      if (typeof err === 'object' && err !== null) {
        setFieldErrors(err);
      } else {
        showToast(err.toString(), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete the 3-step registration form to request portal access
          </p>
        </div>

        {/* Wizard Step Indicator Header */}
        <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto px-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </div>
            <span className="hidden sm:inline text-xs">Personal Details</span>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </div>
            <span className="hidden sm:inline text-xs">Address</span>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <span className="hidden sm:inline text-xs">Government ID</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-card p-6 sm:p-10 rounded-2xl border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: PERSONAL DETAILS */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-5 h-5 text-emerald-400" /> Section 1: Personal Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handlePersonalChange}
                      placeholder="e.g. John"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors.firstName && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors.firstName}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handlePersonalChange}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handlePersonalChange}
                      placeholder="e.g. Doe"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors.lastName && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors.lastName}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handlePersonalChange}
                      placeholder="e.g. 25"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors.age && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors.age}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handlePersonalChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handlePersonalChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors.dateOfBirth && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors.dateOfBirth}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handlePersonalChange}
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors.mobileNumber && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors.mobileNumber}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Alternate Mobile</label>
                    <input
                      type="text"
                      name="alternateMobile"
                      value={formData.alternateMobile}
                      onChange={handlePersonalChange}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handlePersonalChange}
                      placeholder="user@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors.email && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors.email}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ADDRESS DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <MapPin className="w-5 h-5 text-emerald-400" /> Section 2: Address Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">House / Flat Number *</label>
                    <input
                      type="text"
                      name="houseNumber"
                      value={formData.address.houseNumber}
                      onChange={handleAddressChange}
                      placeholder="e.g. Flat 302, Green Acres"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors['address.houseNumber'] && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['address.houseNumber']}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Street *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.address.street}
                      onChange={handleAddressChange}
                      placeholder="e.g. 5th Main Road"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors['address.street'] && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['address.street']}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Area / Sector *</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.address.area}
                      onChange={handleAddressChange}
                      placeholder="e.g. HSR Layout"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors['address.area'] && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['address.area']}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.address.landmark}
                      onChange={handleAddressChange}
                      placeholder="e.g. Near Metro Station"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors['address.city'] && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['address.city']}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors['address.state'] && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['address.state']}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.address.pinCode}
                      onChange={handleAddressChange}
                      placeholder="6-digit PIN"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    />
                    {fieldErrors['address.pinCode'] && <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['address.pinCode']}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: GOVERNMENT ID */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <FileCheck className="w-5 h-5 text-emerald-400" /> Section 3: Government Identity Verification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Government ID Type *</label>
                    <select
                      name="idType"
                      value={formData.governmentId.idType}
                      onChange={handleGovIdChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    >
                      <option value="AADHAAR">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="VOTER_ID">Voter ID Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Upload ID Document *</label>
                    <label className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border ${
                      fieldErrors['governmentId.documentUrl'] ? 'border-rose-500' : 'border-slate-800'
                    } hover:border-emerald-500 cursor-pointer transition-colors`}>
                      <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm truncate text-slate-400">
                        {uploading ? 'Uploading...' : uploadedFileName || 'Choose file (JPG, PNG, PDF)'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {uploadedFileName && !uploading && (
                      <span className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Document uploaded successfully
                      </span>
                    )}
                    {fieldErrors['governmentId.documentUrl'] && (
                      <span className="text-xs text-rose-400 mt-1 block">{fieldErrors['governmentId.documentUrl']}</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-emerald-400">Important Registration Note:</p>
                  <p>
                    Upon clicking <strong>Submit Registration</strong>, your record will be created in PostgreSQL with status <strong className="text-amber-400">PENDING</strong>.
                  </p>
                  <p>
                    The Administrator will review your government identity details. Upon approval, temporary login credentials will be emailed to <span className="text-white font-mono">{formData.email || 'your email'}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous Step
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/40 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Registration'}
                </button>
              )}
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
