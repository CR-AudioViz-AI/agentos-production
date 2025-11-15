// ============================================================
// AGENTOS - TRANSACTIONS PAGE - DEAL TRACKING & PIPELINE
// ============================================================
// TIMESTAMP: Saturday, November 15, 2025 - 1:48 PM EST

'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, FileText, PlusCircle, Search, Filter, Eye, Edit2,
  Trash2, Calendar, TrendingUp, Clock, CheckCircle, XCircle,
  AlertCircle, Home, User, Building, Phone, Mail, MapPin
} from 'lucide-react';

interface Transaction {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  transaction_type: string;
  status: string;
  purchase_price: number;
  earnest_money?: number;
  down_payment?: number;
  loan_amount?: number;
  commission_rate?: number;
  commission_split?: number;
  gross_commission?: number;
  agent_commission?: number;
  contract_date?: string;
  inspection_date?: string;
  appraisal_date?: string;
  financing_contingency_date?: string;
  closing_date?: string;
  actual_closing_date?: string;
  mls_number?: string;
  escrow_number?: string;
  title_company?: string;
  lender_name?: string;
  notes?: string;
  created_at: string;
  property?: {
    address_line1: string;
    address_city: string;
    list_price: number;
  };
  listing_agent?: {
    first_name: string;
    last_name: string;
  };
  buying_agent?: {
    first_name: string;
    last_name: string;
  };
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [stats, setStats] = useState({
    total_volume: 0,
    total_commission: 0,
    active_deals: 0,
    closed_deals: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = '/api/transactions?limit=200';
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions || []);
        setStats(data.stats || { total_volume: 0, total_commission: 0, active_deals: 0, closed_deals: 0 });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchTransactions();
      } else {
        alert(data.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const searchLower = searchTerm.toLowerCase();
    return (
      txn.client_name.toLowerCase().includes(searchLower) ||
      txn.client_email?.toLowerCase().includes(searchLower) ||
      txn.mls_number?.toLowerCase().includes(searchLower) ||
      txn.escrow_number?.toLowerCase().includes(searchLower)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        color: 'bg-gray-100 text-gray-800', 
        icon: Clock,
        label: 'Pending'
      },
      under_contract: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: FileText,
        label: 'Under Contract'
      },
      inspection: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: Search,
        label: 'Inspection'
      },
      appraisal: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: DollarSign,
        label: 'Appraisal'
      },
      financing: { 
        color: 'bg-orange-100 text-orange-800', 
        icon: AlertCircle,
        label: 'Financing'
      },
      closing: { 
        color: 'bg-teal-100 text-teal-800', 
        icon: Home,
        label: 'Closing'
      },
      closed: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle,
        label: 'Closed'
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle,
        label: 'Cancelled'
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const pipelineStages = [
    { id: 'pending', label: 'Pending', deals: filteredTransactions.filter(t => t.status === 'pending') },
    { id: 'under_contract', label: 'Under Contract', deals: filteredTransactions.filter(t => t.status === 'under_contract') },
    { id: 'inspection', label: 'Inspection', deals: filteredTransactions.filter(t => t.status === 'inspection') },
    { id: 'appraisal', label: 'Appraisal', deals: filteredTransactions.filter(t => t.status === 'appraisal') },
    { id: 'financing', label: 'Financing', deals: filteredTransactions.filter(t => t.status === 'financing') },
    { id: 'closing', label: 'Closing', deals: filteredTransactions.filter(t => t.status === 'closing') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1C2833' }}>
                Transactions & Deals
              </h1>
              <p className="text-gray-600 mt-1">Track your pipeline from contract to close</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#5EA8A7' }}
            >
              <PlusCircle className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                  {formatPrice(stats.total_volume)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: '#5EA8A7' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Commission</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                  {formatPrice(stats.total_commission)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Deals</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{stats.active_deals}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Closed Deals</p>
                <p className="text-2xl font-bold" style={{ color: '#1C2833' }}>{stats.closed_deals}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by client, MLS#, or escrow#..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_contract">Under Contract</option>
              <option value="inspection">Inspection</option>
              <option value="appraisal">Appraisal</option>
              <option value="financing">Financing</option>
              <option value="closing">Closing</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'pipeline' ? 'bg-white shadow-sm' : ''
                }`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#5EA8A7' }}></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-6">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Add your first transaction to get started</p>
          </div>
        ) : viewMode === 'pipeline' ? (
          <div className="mt-6 overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {pipelineStages.map((stage) => (
                <div key={stage.id} className="flex-shrink-0" style={{ width: '300px' }}>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold" style={{ color: '#1C2833' }}>
                          {stage.label}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {stage.deals.length}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                      {stage.deals.map((deal) => {
                        const statusConfig = getStatusConfig(deal.status);
                        return (
                          <div
                            key={deal.id}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm" style={{ color: '#1C2833' }}>
                                {deal.client_name}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded ${statusConfig.color}`}>
                                {deal.transaction_type}
                              </span>
                            </div>

                            <div className="text-lg font-bold mb-2" style={{ color: '#5EA8A7' }}>
                              {formatPrice(deal.purchase_price)}
                            </div>

                            {deal.property && (
                              <div className="flex items-start text-xs text-gray-600 mb-2">
                                <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">
                                  {deal.property.address_line1}, {deal.property.address_city}
                                </span>
                              </div>
                            )}

                            {deal.agent_commission && (
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-gray-600">Commission:</span>
                                <span className="font-semibold text-green-600">
                                  {formatPrice(deal.agent_commission)}
                                </span>
                              </div>
                            )}

                            {deal.closing_date && (
                              <div className="flex items-center text-xs text-gray-600 mb-2">
                                <Calendar className="w-3 h-3 mr-1" />
                                Closing: {formatDate(deal.closing_date)}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <button
                                onClick={() => setSelectedTransaction(deal)}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs border border-gray-300 hover:bg-gray-50"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTransaction(deal);
                                  setShowAddModal(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs border hover:bg-gray-50"
                                style={{ borderColor: '#5EA8A7', color: '#5EA8A7' }}
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {stage.deals.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No deals in this stage
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Closing</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((txn) => {
                    const statusConfig = getStatusConfig(txn.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold" style={{ color: '#1C2833' }}>
                            {txn.client_name}
                          </div>
                          <div className="text-sm text-gray-500">{txn.client_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {txn.property ? (
                            <>
                              <div>{txn.property.address_line1}</div>
                              <div className="text-gray-500">{txn.property.address_city}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: '#5EA8A7' }}>
                          {formatPrice(txn.purchase_price)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {txn.agent_commission ? formatPrice(txn.agent_commission) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(txn.closing_date || '')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTransaction(txn)}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setShowAddModal(true);
                              }}
                              className="p-2 rounded-lg border hover:bg-gray-50"
                              style={{ borderColor: '#5EA8A7', color: '#5EA8A7' }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(txn.id)}
                              className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold" style={{ color: '#1C2833' }}>
                {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Transaction form will be implemented here</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white font-semibold transition-colors"
                style={{ backgroundColor: '#5EA8A7' }}
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
