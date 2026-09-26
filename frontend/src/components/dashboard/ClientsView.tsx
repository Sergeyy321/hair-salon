import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import { fetchClients, type ClientApi } from '../../lib/api';

export const ClientsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clients, isLoading, error } = useQuery<ClientApi[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const filteredClients = (clients ?? []).filter((c) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(q) ?? false;
    const emailMatch = c.email.toLowerCase().includes(q);
    const phoneMatch = c.phone?.toLowerCase().includes(q) ?? false;
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-paper-100 overflow-hidden select-none">
      <div className="px-8 py-6 border-b border-line bg-paper-50 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
            DIRECTORY
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-serif text-display font-bold text-charcoal-900">
              Clients
            </h1>
            <span className="px-2.5 py-0.5 border border-line bg-paper-200 text-charcoal-700 text-micro font-mono rounded-sm">
              {filteredClients.length} registered
            </span>
          </div>
        </div>

        <div className="w-72 relative">
          <Search className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-paper-100 border border-line rounded-sm text-body text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-charcoal-900 font-sans"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-charcoal-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-terracotta-500" />
            <span className="text-label font-mono">Loading clients from database...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-status-cancelled-bg border border-status-cancelled-border text-status-cancelled-text text-label rounded-sm font-mono">
            Failed to load client directory.
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="h-64 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-charcoal-500">
            <User className="w-8 h-8 text-charcoal-300 mb-2" />
            <p className="font-serif text-headline text-charcoal-700">No clients found</p>
            <p className="text-body text-charcoal-400 mt-1">Clients will appear here once bookings are recorded.</p>
          </div>
        ) : (
          <div className="border border-line rounded-sm bg-paper-50 overflow-hidden">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-line bg-paper-200 text-micro font-mono text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Total Bookings</th>
                  <th className="py-3 px-4 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredClients.map((client) => {
                  const joinDate = new Date(client.createdAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <tr key={client.id} className="hover:bg-paper-100 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              client.avatarUrl ??
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={client.name ?? 'Client'}
                            className="w-9 h-9 rounded-full object-cover border border-line-dark shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-charcoal-900 block text-body">
                              {client.name || 'Anonymous Client'}
                            </span>
                            <span className="text-micro text-charcoal-500 font-mono block">
                              ID: {client.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-label">
                        <div className="space-y-1 font-mono text-charcoal-700">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                            <span>{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-label font-mono">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-paper-200 border border-line text-charcoal-900 font-medium">
                          {client._count?.clientBookings ?? 0} visits
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-label font-mono text-charcoal-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                          <span>{joinDate}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
