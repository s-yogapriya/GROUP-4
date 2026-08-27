import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Edit3, Save, Upload, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const text = (value) => value || 'Not provided';
const photoSource = (url) => url && (url.startsWith('http') ? url : `http://localhost:8080${url}`);
const emptyAddress = { houseNumber: '', street: '', area: '', landmark: '', city: '', state: '', country: '', pinCode: '' };

export default function MyProfilePage() {
  const { updateUser, showToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => () => { if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  async function loadProfile() {
    setLoading(true); setMessage('');
    try { const response = await api.get('/user/profile'); setProfile(response.data); setForm(response.data); }
    catch (error) { setMessage(error.message || 'Unable to load profile.'); }
    finally { setLoading(false); }
  }

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const changeAddress = (key, value) => setForm((current) => ({ ...current, address: { ...emptyAddress, ...current.address, [key]: value } }));
  const startEditing = () => { setForm({ ...profile, address: { ...emptyAddress, ...profile.address } }); setEditing(true); setMessage(''); setSelectedPhoto(null); setPhotoPreview(''); setRemovePhoto(false); };
  const cancelEditing = () => { setForm(profile); setEditing(false); setSelectedPhoto(null); setPhotoPreview(''); setRemovePhoto(false); setMessage(''); };

  function validate() {
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim()) return 'First name, last name, and email are required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.mobileNumber && !/^[6-9]\d{9}$/.test(form.mobileNumber)) return 'Enter a valid 10-digit mobile number.';
    if (form.alternateMobile && !/^[6-9]\d{9}$/.test(form.alternateMobile)) return 'Enter a valid alternate mobile number.';
    if (form.age !== null && form.age !== undefined && form.age !== '' && (Number(form.age) < 18 || Number(form.age) > 120)) return 'Age must be between 18 and 120.';
    return '';
  }

  async function saveProfile() {
    const validationError = validate();
    if (validationError) { setMessage(validationError); return; }
    setSaving(true); setMessage('');
    try {
      const payload = { ...form, age: form.age ? Number(form.age) : null, firstName: form.firstName.trim(), middleName: form.middleName?.trim() || '', lastName: form.lastName.trim(), email: form.email.trim(), mobileNumber: form.mobileNumber?.trim() || '', alternateMobile: form.alternateMobile?.trim() || '', address: form.address ? { ...form.address } : null };
      let updated = (await api.put('/user/profile', payload)).data;
      if (selectedPhoto) { const body = new FormData(); body.append('file', selectedPhoto); updated = (await api.post('/user/profile/photo', body)).data; }
      else if (removePhoto && profile.profilePhotoUrl) updated = (await api.delete('/user/profile/photo')).data;
      setProfile(updated); setForm(updated); setEditing(false); setSelectedPhoto(null); setPhotoPreview(''); setRemovePhoto(false);
      updateUser({ email: updated.email, firstName: updated.firstName, lastName: updated.lastName });
      showToast('Profile updated successfully.');
    } catch (error) { setMessage(error.data ? Object.values(error.data)[0] : error.message || 'Unable to update profile. Please try again.'); }
    finally { setSaving(false); }
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) { setMessage('Choose a JPEG or PNG image no larger than 5 MB.'); event.target.value = ''; return; }
    setSelectedPhoto(file); setPhotoPreview(URL.createObjectURL(file)); setRemovePhoto(false);
  }

  if (loading) return <main className="p-8 text-slate-400">Loading profile…</main>;
  if (!profile) return <main className="p-8 text-rose-300">{message || 'Profile unavailable.'}</main>;
  const fields = [['firstName', 'First Name'], ['middleName', 'Middle Name'], ['lastName', 'Last Name'], ['age', 'Age'], ['gender', 'Gender'], ['dateOfBirth', 'Date of Birth'], ['mobileNumber', 'Mobile Number'], ['alternateMobile', 'Alternate Mobile'], ['email', 'Email']];
  const addressFields = [['houseNumber', 'House Number'], ['street', 'Street'], ['area', 'Area'], ['landmark', 'Landmark'], ['city', 'City'], ['state', 'State'], ['country', 'Country'], ['pinCode', 'Pincode']];
  const avatar = removePhoto ? '' : photoPreview || photoSource(profile.profilePhotoUrl);

  return <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 lg:px-8">
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6"><div className="flex flex-wrap items-center gap-5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500/20 text-3xl font-black text-emerald-400">{avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : <UserRound />}</div>
      <div className="flex-1"><h1 className="text-2xl font-extrabold text-white">{profile.firstName} {profile.lastName}</h1><p className="text-slate-400">@{profile.username} · {profile.email}</p></div>
      <button disabled={saving} onClick={editing ? cancelEditing : startEditing} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{editing ? <><X className="h-4 w-4" />Cancel</> : <><Edit3 className="h-4 w-4" />Edit Profile</>}</button>
    </div></div>
    {message && <p className="rounded-lg bg-rose-950/50 p-3 text-sm text-rose-200">{message}</p>}
    {editing && <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6"><h2 className="mb-4 font-bold text-white">Profile Photo</h2><div className="flex flex-wrap items-center gap-3"><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200"><Upload className="h-4 w-4" />Choose Photo<input type="file" accept="image/jpeg,image/png" onChange={choosePhoto} className="hidden" /></label>{(profile.profilePhotoUrl || selectedPhoto) && <button type="button" onClick={() => { setRemovePhoto(true); setSelectedPhoto(null); setPhotoPreview(''); }} className="rounded-xl border border-rose-500/50 px-4 py-2 text-sm font-semibold text-rose-300">Remove Photo</button>}<span className="text-xs text-slate-400">JPEG or PNG, up to 5 MB. Photo changes when you save.</span></div></section>}
    <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6"><h2 className="mb-5 font-bold text-white">Personal Details</h2><div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label]) => <label key={key} className="text-sm text-slate-400">{label}{editing ? key === 'gender' ? <select value={form[key] || ''} onChange={(event) => change(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-white"><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select> : <input value={form[key] || ''} type={key === 'dateOfBirth' ? 'date' : key === 'age' ? 'number' : key === 'email' ? 'email' : 'text'} min={key === 'age' ? '18' : undefined} max={key === 'age' ? '120' : undefined} onChange={(event) => change(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-white" /> : <b className="mt-1 block text-white">{text(profile[key])}</b>}</label>)}
      <label className="text-sm text-slate-400">Username<b className="mt-1 block text-white">{text(profile.username)}</b><span className="mt-1 block text-xs">Username is tied to your current sign-in.</span></label>
    </div></section>
    <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6"><h2 className="mb-5 font-bold text-white">Contact & Residential Address</h2><div className="grid gap-4 sm:grid-cols-2">{addressFields.map(([key, label]) => <label key={key} className="text-sm text-slate-400">{label}{editing ? <input value={form.address?.[key] || ''} onChange={(event) => changeAddress(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-white" /> : <b className="mt-1 block text-white">{text(profile.address?.[key])}</b>}</label>)}</div></section>
    {editing && <button disabled={saving} onClick={saveProfile} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Profile'}</button>}
    <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-sm"><h2 className="mb-3 font-bold text-white">Verification Details</h2><p className="text-slate-300">{profile.governmentId?.idType ? `${profile.governmentId.idType} verification is on file.` : 'No verification details available.'}</p></section>
  </main>;
}