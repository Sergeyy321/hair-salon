import React, { useState } from 'react';
import { Search, Calendar, Clock, X, CalendarClock } from 'lucide-react';
import type { BookingApi } from '../../lib/api';

interface AppointmentsViewProps {
  bookings: BookingApi[];
  onOpenReschedule: (booking: BookingApi) => void;
  onRequestCancel: (booking: BookingApi) => void;
  onOpenAddModal: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  bookings,
  onOpenReschedule,
  onRequestCancel,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = b.client.name?.toLowerCase().includes(q) ?? false;
    const emailMatch = b.client.email.toLowerCase().includes(q);
    const serviceMatch = b.service.name.toLowerCase().includes(q);
    const barberMatch = b.barber.name?.toLowerCase().includes(q) ?? false;
    const matchesSearch = nameMatch || emailMatch || serviceMatch || barberMatch;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-paper-100 overflow-hidden select-none">
      <div className="px-8 py-6 border-b border-line bg-paper-50 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
            RESERVATIONS
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-serif text-display font-bold text-charcoal-900">
              Appointments
            </h1>
            <span className="px-2.5 py-0.5 border border-line bg-paper-200 text-charcoal-700 text-micro font-mono rounded-sm">
              {filtered.length} total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64 relative">
            <Search className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reservations..."
              className="w-full pl-9 pr-4 py-2 bg-paper-100 border border-line rounded-sm text-body text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-charcoal-900 font-sans"
            />
          </div>

          <div className="flex border border-line bg-paper-100 p-0.5 rounded-sm">
            {['all', 'CONFIRMED', 'PENDING'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-micro font-mono uppercase rounded-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-charcoal-900 text-paper-50 font-bold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-charcoal-900 text-paper-50 rounded-sm text-label font-medium hover:bg-charcoal-700 transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {filtered.length === 0 ? (
          <div className="h-64 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-charcoal-500">
            <Calendar className="w-8 h-8 text-charcoal-300 mb-2" />
            <p className="font-serif text-headline text-charcoal-700">No appointments found</p>
            <p className="text-body text-charcoal-400 mt-1">There are no bookings matching the selected criteria.</p>
          </div>
        ) : (
          <div className="border border-line rounded-sm bg-paper-50 overflow-hidden">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-line bg-paper-200 text-micro font-mono text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Time Slot</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Service</th>
                  <th className="py-3 px-4 font-medium">Stylist</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-paper-100 transition-colors">
                    <td className="py-3.5 px-4 text-label font-mono text-charcoal-900 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                        <span>{formatTime(b.startTime)} — {formatTime(b.endTime)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-charcoal-900 block text-body">
                        {b.client.name ?? 'Client'}
                      </span>
                      <span className="text-micro text-charcoal-500 font-mono block">
                        {b.client.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-label text-charcoal-800">
                      {b.service.name}
                    </td>
                    <td className="py-3.5 px-4 text-label text-charcoal-700">
                      {b.barber.name}
                    </td>
                    <td className="py-3.5 px-4 text-label font-mono font-semibold text-charcoal-900">
                      {b.service.price} zł
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-micro font-mono uppercase font-semibold border ${
                        b.status === 'CONFIRMED'
                          ? 'bg-status-confirmed-bg text-status-confirmed-text border-status-confirmed-border'
                          : 'bg-status-pending-bg text-status-pending-text border-status-pending-border'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenReschedule(b)}
                          className="p-1.5 border border-line bg-paper-100 hover:bg-paper-300 rounded-sm text-charcoal-700 transition-colors"
                          title="Reschedule"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestCancel(b)}
                          className="p-1.5 border border-status-cancelled-border bg-status-cancelled-bg text-status-cancelled-text hover:bg-red-100 rounded-sm transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
