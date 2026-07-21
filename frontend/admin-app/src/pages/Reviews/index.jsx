import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, Table, Badge } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { FiRefreshCw, FiCheck, FiX, FiMessageSquare, FiMessageCircle, FiSmile, FiMeh, FiFrown } from 'react-icons/fi';
import { io } from 'socket.io-client';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0
  });

  // Reply state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews', {
        params: {
          page,
          limit: 10,
          sentiment: sentimentFilter,
          status: statusFilter
        }
      });
      setReviews(res.data.reviews || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalReviews(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all reviews without limit to calculate stats
      const res = await api.get('/reviews', { params: { limit: 2000 } });
      const all = res.data.reviews || [];
      const pos = all.filter(r => r.aiSentiment === 'Positive').length;
      const neu = all.filter(r => r.aiSentiment === 'Neutral').length;
      const neg = all.filter(r => r.aiSentiment === 'Negative').length;
      setStats({
        total: all.length,
        positive: pos,
        neutral: neu,
        negative: neg
      });
    } catch (err) {
      console.error('Error fetching review stats:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, sentimentFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [reviews]); // update stats when reviews list modifications occur

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_BASE);

    socket.on('review_added', () => {
      console.log('Socket.io: Review changed. Reloading reviews...');
      fetchReviews();
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, [page, sentimentFilter, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/reviews/${id}/status`, { status: newStatus });
      toast.success(`Review ${newStatus.toLowerCase()} successfully`);
      fetchReviews();
    } catch (err) {
      console.error('Error changing review status:', err);
      toast.error('Failed to update review status');
    }
  };

  const handleRefreshAI = async (id) => {
    try {
      toast.loading('Analyzing review with Groq AI...', { id: 'ai-toast' });
      await api.post(`/reviews/${id}/analyze`);
      toast.success('AI Re-analysis completed!', { id: 'ai-toast' });
      fetchReviews();
    } catch (err) {
      console.error('Error refreshing AI review:', err);
      toast.error('AI analysis failed', { id: 'ai-toast' });
    }
  };

  const handlePostReply = async (id, text) => {
    try {
      if (!text.trim()) {
        toast.error('Reply content cannot be empty');
        return;
      }
      await api.put(`/reviews/${id}/reply`, { reply: text });
      toast.success('Merchant reply posted!');
      setActiveReplyId(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Failed to post reply');
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return <FiSmile className="text-green-500" />;
      case 'Neutral': return <FiMeh className="text-yellow-500" />;
      case 'Negative': return <FiFrown className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Reviews Management</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase">Moderate user opinions & leverage AI sentiment analysis</p>
      </div>

      {/* AI Sentiment Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between border-l-4 border-primary">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Reviews</span>
          <span className="text-2xl font-black text-gray-800 mt-1">{stats.total}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between border-l-4 border-green-500">
          <span className="text-[10px] uppercase font-bold text-gray-400">Positive (AI analyzed)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-green-600">{stats.positive}</span>
            <span className="text-xs font-semibold text-gray-400">
              {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
            </span>
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-between border-l-4 border-yellow-500">
          <span className="text-[10px] uppercase font-bold text-gray-400">Neutral (AI analyzed)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-yellow-600">{stats.neutral}</span>
            <span className="text-xs font-semibold text-gray-400">
              {stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0}%
            </span>
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-between border-l-4 border-red-500">
          <span className="text-[10px] uppercase font-bold text-gray-400">Negative (AI analyzed)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-red-600">{stats.negative}</span>
            <span className="text-xs font-semibold text-gray-400">
              {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
            </span>
          </div>
        </Card>
      </div>

      {/* Filter Options */}
      <Card className="p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <div>
            <label className="block text-[9px] uppercase font-extrabold text-gray-400 mb-1">Filter by Sentiment</label>
            <select
              value={sentimentFilter}
              onChange={(e) => { setSentimentFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-large text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-extrabold text-gray-400 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-large text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-semibold">
          Showing {reviews.length} of {totalReviews} Reviews
        </div>
      </Card>

      {/* Reviews Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 gap-2 text-primary font-bold">
            <FiRefreshCw className="animate-spin" size={20} />
            <span>Loading reviews...</span>
          </div>
        ) : (
          <Table
            headers={['Product', 'Customer', 'Rating', 'Review Details', 'AI Analysis', 'Status', 'Actions']}
            data={reviews}
            renderRow={(row) => (
              <React.Fragment key={row._id}>
                  <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <img 
                        src={row.product?.thumbnailUrl || 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp'} 
                        alt={row.product?.name || 'Product'} 
                        className="w-12 h-12 object-cover rounded-large border bg-gray-50 flex-shrink-0 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                        }}
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">
                          {row.product?.name || 'N/A'}
                        </p>
                        {row.product?.sku && (
                          <p className="text-[9px] text-gray-400 font-mono font-bold mt-1 tracking-wider">{row.product.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-700 text-sm">{row.user?.name || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{row.user?.email || ''}</div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-yellow-500 text-xs font-bold tracking-wider">
                      {'★'.repeat(row.rating)}
                      <span className="text-gray-200">{'★'.repeat(5 - row.rating)}</span>
                    </span>
                  </td>

                  {/* Comment */}
                  <td className="px-6 py-4 text-xs text-gray-650 max-w-[220px]">
                    <div className="line-clamp-2 leading-relaxed font-medium italic" title={row.comment}>
                      "{row.comment}"
                    </div>
                  </td>

                  {/* AI Analysis */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 max-w-[160px]">
                      <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 border border-gray-100">
                        {getSentimentIcon(row.aiSentiment)}
                        <span className={
                          row.aiSentiment === 'Positive' ? 'text-green-600' :
                          row.aiSentiment === 'Negative' ? 'text-red-600' : 'text-yellow-600'
                        }>
                          {row.aiSentiment}
                        </span>
                      </div>
                      {row.aiReasoning && (
                        <p className="text-[9px] text-gray-400 leading-tight line-clamp-2" title={row.aiReasoning}>
                          {row.aiReasoning}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <Badge status={
                      row.status === 'Approved' ? 'success' :
                      row.status === 'Rejected' ? 'danger' : 'warning'
                    }>
                      {row.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                      {row.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(row._id, 'Approved')}
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-large border border-green-150 transition-colors flex items-center justify-center"
                          title="Approve Review"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      {row.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(row._id, 'Rejected')}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-large border border-red-150 transition-colors flex items-center justify-center"
                          title="Reject Review"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRefreshAI(row._id)}
                        className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-large border border-purple-150 transition-colors flex items-center justify-center"
                        title="Re-run AI Analysis"
                      >
                        <FiRefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveReplyId(activeReplyId === row._id ? null : row._id);
                          setReplyText(row.merchantReply || row.aiReply || '');
                        }}
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-large border transition-all flex items-center gap-1 ${
                          row.merchantReply 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                            : 'bg-primary-light/10 border-primary/20 text-primary hover:bg-primary-light/20'
                        }`}
                      >
                        <FiMessageSquare size={11} />
                        <span>{row.merchantReply ? 'Edit Reply' : 'Draft Reply'}</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Reply Panel */}
                {activeReplyId === row._id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan="7" className="px-6 py-4 border-b border-gray-100">
                      <div className="flex flex-col gap-3 max-w-3xl bg-white p-4 rounded-large border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-extrabold text-gray-400">Merchant Reply Management</span>
                          {row.aiReply && !row.merchantReply && (
                            <span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                              AI-Drafted Response Available
                            </span>
                          )}
                        </div>

                        {/* AI Draft preview if merchant reply hasn't been posted yet */}
                        {row.aiReply && !row.merchantReply && (
                          <div className="bg-purple-50/30 border border-purple-100 rounded-large p-3 text-xs text-gray-600 italic">
                            <span className="font-bold text-purple-700 not-italic block mb-1">AI Reply Draft:</span>
                            "{row.aiReply}"
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Response Content</label>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type a custom reply or customize the AI draft..."
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-large text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-large text-xs font-semibold hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          {row.aiReply && !row.merchantReply && (
                            <button
                              onClick={() => handlePostReply(row._id, row.aiReply)}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-large text-xs font-semibold hover:bg-purple-700"
                            >
                              Approve & Send AI Reply
                            </button>
                          )}
                          <button
                            onClick={() => handlePostReply(row._id, replyText)}
                            className="px-3 py-1.5 bg-primary text-white rounded-large text-xs font-semibold hover:bg-primary-dark"
                          >
                            {row.merchantReply ? 'Update Reply' : 'Send Custom Reply'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )}
          />
        )}

        {/* Empty state */}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiMessageCircle size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No reviews found matching the filters.</p>
          </div>
        )}
      </Card>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-2">
          <span className="text-xs text-gray-400 font-semibold">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-200 rounded-large text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-200 rounded-large text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}