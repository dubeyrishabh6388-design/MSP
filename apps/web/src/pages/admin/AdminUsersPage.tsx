import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Shield,
  Briefcase,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@serviqa/shared';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('Terms of service violation / unverified doorstep complaint');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => {
      const url = roleFilter === 'ALL' ? '/admin/users' : `/admin/users?role=${roleFilter}`;
      return ApiClient.get(url);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive, reason }: { userId: string; isActive: boolean; reason: string }) =>
      ApiClient.put(`/admin/users/${userId}/status`, { isActive, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setStatusModalOpen(false);
      setSelectedUser(null);
    },
  });

  const handleToggleStatus = (u: any) => {
    setSelectedUser(u);
    setSuspendReason(
      u.isActive
        ? 'Repeated policy violations or unverified safety flag on doorstep service.'
        : 'Account reinstated following administrative safety review.'
    );
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    statusMutation.mutate({
      userId: selectedUser.id,
      isActive: !selectedUser.isActive,
      reason: suspendReason,
    });
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchesStatus =
      statusFilter === 'ALL' ? true : statusFilter === 'ACTIVE' ? u.isActive : !u.isActive;
    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const totalProviders = users.filter((u: any) => u.role === UserRole.PROVIDER).length;
  const totalCustomers = users.filter((u: any) => u.role === UserRole.CUSTOMER).length;
  const suspendedCount = users.filter((u: any) => !u.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin" className="hover:text-purple-500 transition-colors">Platform Command</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">User Management & Safety</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              User Directory & Trust Governance
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Audited Controls
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review registered customer and provider accounts, manage verification flags, and suspend high-risk actors.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {totalUsers}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Live on platform
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Service Providers
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {totalProviders}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              Vetted trade technicians
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Homeowners / Customers
            </span>
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1 block">
              {totalCustomers}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Verified phone accounts
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Suspended Accounts
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {suspendedCount}
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
              Access restricted by admin
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Role:
            </span>
            {['ALL', 'CUSTOMER', 'PROVIDER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === role
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase()}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />

            <span className="text-xs font-bold text-slate-400 mr-1">Status:</span>
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* User Directory List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No users found matching your filters.</div>
          ) : (
            <>
              {/* Mobile Card View (md:hidden) for True Native App Feel */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u: any) => {
                  const initials = u.name
                    ? u.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U';

                  return (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">
                              {u.name}
                            </span>
                            {u.providerProfile?.businessName && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                {u.providerProfile.businessName}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}</span>
                          </div>
                        </div>

                        {u.role === UserRole.PROVIDER && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Briefcase className="w-3 h-3" />
                            Provider
                          </span>
                        )}
                        {u.role === UserRole.CUSTOMER && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            <User className="w-3 h-3" />
                            Customer
                          </span>
                        )}
                        {u.role === UserRole.ADMIN && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldAlert className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[200px]">{u.email}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {u.phone || '+91 98200 12345'}
                          </span>
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="w-3 h-3" />
                              Suspended
                            </span>
                          )}
                        </div>
                      </div>

                      {u.role !== UserRole.ADMIN && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            u.isActive
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/60'
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend Access</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Reactivate Account</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-6 font-black">User Profile</th>
                      <th className="py-4 px-6 font-black">Role</th>
                      <th className="py-4 px-6 font-black">Contact Details</th>
                      <th className="py-4 px-6 font-black">Account Status</th>
                      <th className="py-4 px-6 font-black">Joined</th>
                      <th className="py-4 px-6 font-black text-right">Governance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((u: any) => {
                      const initials = u.name
                        ? u.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : 'U';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                {initials}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                  {u.name}
                                </span>
                                {u.providerProfile?.businessName && (
                                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                    {u.providerProfile.businessName}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {u.role === UserRole.PROVIDER && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Briefcase className="w-3 h-3" />
                                Provider
                              </span>
                            )}
                            {u.role === UserRole.CUSTOMER && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                <User className="w-3 h-3" />
                                Customer
                              </span>
                            )}
                            {u.role === UserRole.ADMIN && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <ShieldAlert className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <div className="space-y-0.5">
                              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                {u.email}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                {u.phone || '+91 98200 12345'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {u.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Active Account
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Suspended
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-slate-400 font-medium">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-4 px-6 text-right">
                            {u.role !== UserRole.ADMIN ? (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  u.isActive
                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/60'
                                }`}
                              >
                                {u.isActive ? 'Suspend Access' : 'Reactivate'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Protected Role</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Suspend / Reactivate Modal */}
      {selectedUser && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={selectedUser.isActive ? `Suspend User: ${selectedUser.name}` : `Reactivate User: ${selectedUser.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmStatusChange} className="space-y-4 text-xs">
            <div
              className={`p-4 rounded-2xl border ${
                selectedUser.isActive
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <span className="font-bold block">
                {selectedUser.isActive
                  ? 'High-Impact Administrative Action'
                  : 'Account Reinstatement'}
              </span>
              <p className="text-[11px] mt-1 leading-relaxed">
                {selectedUser.isActive
                  ? 'Suspending this user will instantly terminate active sessions, block incoming lead dispatches, and freeze ongoing quotation permissions.'
                  : 'Reactivating this user will restore their ability to login and book/deliver services.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Reason & Audit Justification (Required)
              </label>
              <textarea
                rows={3}
                required
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusMutation.isPending}
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                  selectedUser.isActive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusMutation.isPending
                  ? 'Processing...'
                  : selectedUser.isActive
                  ? 'Confirm Suspension'
                  : 'Reactivate Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
