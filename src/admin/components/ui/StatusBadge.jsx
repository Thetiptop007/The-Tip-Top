export default function StatusBadge({ status, className = '' }) {
  const getStatusConfig = (status) => {
    const statusMap = {
      // Order statuses
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      preparing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Preparing' },
      ready: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Ready' },
      out_for_delivery: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Out for Delivery' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      
      // Payment statuses
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      unpaid: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unpaid' },
      refunded: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' },
      
      // User statuses
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Blocked' },
      
      // Default
      default: { bg: 'bg-gray-100', text: 'text-gray-800', label: status },
    };

    return statusMap[status?.toLowerCase()] || statusMap.default;
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
