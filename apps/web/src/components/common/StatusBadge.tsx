import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'CONFIRMED':
      case 'ACCEPTED':
      case 'VERIFIED':
      case 'COMPLETED':
      case 'CAPTURED':
        return {
          container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'IN_PROGRESS':
      case 'PROVIDER_EN_ROUTE':
      case 'MATCHING':
        return {
          container: 'bg-blue-50 text-blue-800 border-blue-200/80',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'REQUESTED':
      case 'QUOTATIONS_RECEIVED':
      case 'SUBMITTED':
      case 'PENDING':
      case 'COMPLETION_SUBMITTED':
        return {
          container: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'DISPUTED':
      case 'REFUND_PENDING':
      case 'OPEN':
        return {
          container: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dot: 'bg-purple-500 animate-ping',
        };
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
      case 'SUSPENDED':
        return {
          container: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dot: 'bg-rose-500',
        };
      default:
        return {
          container: 'bg-slate-50 text-slate-700 border-slate-200/80',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${style.container}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{normalized.replace(/_/g, ' ')}</span>
    </span>
  );
}
