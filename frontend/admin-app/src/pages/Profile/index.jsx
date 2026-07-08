import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';

export default function UserProfile() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Basavaraj H G',
    phone: '9741212888',
    email: user?.email || 'basavaraj@gmail.com'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    setUser({ ...user, name: profileForm.name, email: profileForm.email });
    toast.success('Profile details updated!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <Card className="md:col-span-1 p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left text-sm py-2 px-3.5 rounded-large font-bold transition-all ${
              activeTab === 'profile' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`w-full text-left text-sm py-2 px-3.5 rounded-large font-bold transition-all ${
              activeTab === 'address' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left text-sm py-2 px-3.5 rounded-large font-bold transition-all ${
              activeTab === 'payments' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Payment Methods
          </button>
        </Card>

        {/* Main Panels */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {activeTab === 'profile' && (
            <Card>
              <h3 className="font-bold text-gray-800 text-sm border-b pb-3 mb-5">Personal Details</h3>
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <Input label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                <Input label="Email Address" type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
                <Input label="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                <Button type="submit" className="w-fit self-end mt-2">Save Changes</Button>
              </form>
            </Card>
          )}

          {activeTab === 'address' && (
            <Card>
              <div className="flex justify-between items-center border-b pb-3 mb-5">
                <h3 className="font-bold text-gray-800 text-sm">Saved Addresses</h3>
                <Button size="sm" variant="outline">Add New</Button>
              </div>
              <div className="border border-gray-100 p-4 rounded-large bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-sm">Basavaraj H G (Home)</h4>
                  <span className="text-[10px] bg-primary-light text-primary px-2 py-0.5 rounded font-bold uppercase">Default</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  Davangere Main Road, Davangere, Karnataka, India - 577004
                </p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Phone: 9741212888</p>
              </div>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card>
              <div className="flex justify-between items-center border-b pb-3 mb-5">
                <h3 className="font-bold text-gray-800 text-sm">Saved Payment Methods</h3>
                <Button size="sm" variant="outline">Link UPI</Button>
              </div>
              <div className="border border-gray-100 p-4 rounded-large flex items-center justify-between bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">UPI Account (GPay)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">basavaraj@okaxis</p>
                </div>
                <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-0.5 rounded font-bold">CONNECTED</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}