import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Table, Badge, Button, Modal, Input, Textarea } from '../../../../shared/components/Common';
import { FiPlus, FiTrash2, FiToggleLeft, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

export default function Coupons() {
  const { coupons, fetchCoupons } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '0',
    expiryDate: '',
    description: '',
    aiGenerated: false,
    aiCampaignGoal: ''
  });

  // AI Generator Panel Inputs
  const [aiGoal, setAiGoal] = useState('Clear Inventory');
  const [aiType, setAiType] = useState('percentage');
  const [aiContext, setAiContext] = useState('');

  const handleToggle = async (id) => {
    try {
      await api.put(`/coupons/${id}/status`);
      toast.success('Coupon status toggled!');
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle coupon status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coupon');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      toast.error('Please fill in Code, Discount Value, and Expiry Date.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/coupons', {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase || 0)
      });
      toast.success('Coupon created successfully!');
      setCreateModalOpen(false);
      // Reset form
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '0',
        expiryDate: '',
        description: '',
        aiGenerated: false,
        aiCampaignGoal: ''
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to create coupon';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAICoupon = async () => {
    try {
      setAiLoading(true);
      toast.loading('Consulting Groq AI Coupon Strategist...', { id: 'ai-coupon-toast' });
      const res = await api.post('/coupons/generate-ai', {
        campaignGoal: aiGoal,
        discountType: aiType,
        additionalContext: aiContext
      });

      const data = res.data;
      setFormData({
        code: data.code,
        discountType: aiType,
        discountValue: data.discountValue.toString(),
        minPurchase: aiType === 'percentage' ? '3000' : '5000', // intelligent default mins
        expiryDate: data.expiryDate,
        description: data.description,
        aiGenerated: true,
        aiCampaignGoal: aiGoal
      });

      toast.success(`AI suggested a high-converting code: ${data.code}!`, { id: 'ai-coupon-toast' });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to generate coupon with AI';
      toast.error(errMsg, { id: 'ai-coupon-toast' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Coupons</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">Manage discounts</p>
        </div>
        <Button
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setCreateModalOpen(true)}
        >
          <FiPlus size={16} /> Create Coupon
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table
          headers={['Promo Code', 'Discount Offer', 'Expiry Date', 'Status', 'Actions']}
          data={coupons}
          renderRow={(row) => (
            <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-primary">{row.code}</span>
                  {row.description && (
                    <span className="text-[10px] text-gray-400 font-medium italic block max-w-xs truncate" title={row.description}>
                      ({row.description})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 font-semibold text-gray-700">{row.discount}</td>
              <td className="px-6 py-4 text-gray-500">{row.expiry}</td>
              <td className="px-6 py-4">
                <Badge status={row.status === 'Active' ? 'success' : 'danger'}>
                  {row.status}
                </Badge>
              </td>
              <td className="px-6 py-4 flex gap-4">
                <button
                  onClick={() => handleToggle(row.id)}
                  className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                  title="Toggle status"
                >
                  <FiToggleLeft /> Toggle Status
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-xs font-bold text-danger hover:underline flex items-center gap-1"
                  title="Delete Coupon"
                >
                  <FiTrash2 /> Delete
                </button>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Promo Coupon"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          
          {/* AI Section (Accordion style / prominent card) */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-large p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-purple-700 font-extrabold text-xs uppercase tracking-wider">
              <FiCpu /> AI Smart Coupon Generator
            </div>
            <p className="text-[10px] text-purple-500 font-medium">
              Let the AI formulate marketing names, discount amounts, and parameters.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Campaign Goal</label>
                <select
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-large text-xs font-semibold focus:outline-none"
                >
                  <option value="Clear Inventory">Clear Inventory</option>
                  <option value="Retain Inactive Customers">Retain Customers</option>
                  <option value="Holiday Season Sale">Holiday Promo</option>
                  <option value="Welcome Special">Welcome Special</option>
                  <option value="Flash Sale">Flash Sale</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Strategy Type</label>
                <select
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-large text-xs font-semibold focus:outline-none"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Cash Discount</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Context / Details (Optional)</label>
              <input
                type="text"
                placeholder="e.g. For luxury teak beds or weekend event"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-large text-xs font-semibold focus:outline-none"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={aiLoading}
              onClick={handleGenerateAICoupon}
              className="mt-1 bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              Generate Strategy with AI
            </Button>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Promo Code"
              placeholder="e.g. SUMMER20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Cash Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount Value"
              type="number"
              placeholder="e.g. 20"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />
            <Input
              label="Min Purchase (₹)"
              type="number"
              placeholder="e.g. 5000"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
            />
          </div>

          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            required
          />

          <Textarea
            label="Marketing Description / Terms"
            placeholder="e.g. Valid on all orders above ₹5000"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}