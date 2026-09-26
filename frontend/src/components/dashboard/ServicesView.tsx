import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Clock, Tag, Scissors, Loader2 } from 'lucide-react';
import { fetchServices, type ServiceApi } from '../../lib/api';
import { getLocalizedServiceDescription } from '../../features/timeline/serviceLocalization';

export const ServicesView: React.FC = () => {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: services, isLoading, error } = useQuery<ServiceApi[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
  });

  const allServices = services ?? [];
  const categories = ['all', ...Array.from(new Set(allServices.map((s) => s.category).filter(Boolean) as string[]))];

  const filteredServices = allServices.filter((s) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(q);
    const descMatch = s.description?.toLowerCase().includes(q) ?? false;
    const categoryMatch = selectedCategory === 'all' || s.category === selectedCategory;
    return (nameMatch || descMatch) && categoryMatch;
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-paper-100 overflow-hidden select-none">
      <div className="px-8 py-6 border-b border-line bg-paper-50 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase tracking-widest block">
            CATALOGUE
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-serif text-display font-bold text-charcoal-900">
              Services
            </h1>
            <span className="px-2.5 py-0.5 border border-line bg-paper-200 text-charcoal-700 text-micro font-mono rounded-sm">
              {filteredServices.length} offerings
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
              placeholder="Search treatments..."
              className="w-full pl-9 pr-4 py-2 bg-paper-100 border border-line rounded-sm text-body text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-charcoal-900 font-sans"
            />
          </div>

          <div className="flex border border-line bg-paper-100 p-0.5 rounded-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-micro font-mono uppercase rounded-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-charcoal-900 text-paper-50 font-bold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-charcoal-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-terracotta-500" />
            <span className="text-label font-mono">Loading service catalogue...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-status-cancelled-bg border border-status-cancelled-border text-status-cancelled-text text-label rounded-sm font-mono">
            Failed to load services catalogue.
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="h-64 border border-dashed border-line rounded-sm flex flex-col items-center justify-center text-charcoal-500">
            <Scissors className="w-8 h-8 text-charcoal-300 mb-2" />
            <p className="font-serif text-headline text-charcoal-700">No services found</p>
            <p className="text-body text-charcoal-400 mt-1">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="border border-line rounded-sm bg-paper-50 overflow-hidden">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-line bg-paper-200 text-micro font-mono text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Service Treatment</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Assigned Specialists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-paper-100 transition-colors">
                    <td className="py-4 px-4 max-w-sm">
                      <span className="font-semibold text-charcoal-900 block text-body">
                        {service.name}
                      </span>
                      {service.description && (
                        <span className="text-label text-charcoal-500 block mt-0.5 leading-snug line-clamp-2">
                          {getLocalizedServiceDescription(service, i18n.language)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-label">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-paper-200 border border-line text-charcoal-700 font-mono text-micro uppercase">
                        <Tag className="w-3 h-3 text-terracotta-500" />
                        <span>{service.category || 'General'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-label font-mono text-charcoal-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                        <span>{service.durationMin} min</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-body font-mono font-semibold text-charcoal-900">
                      {service.price} zł
                    </td>
                    <td className="py-4 px-4 text-label font-mono">
                      <div className="flex flex-wrap gap-1.5">
                        {(service.barbers ?? []).length > 0 ? (
                          service.barbers?.map((barber) => (
                            <span
                              key={barber.id}
                              className="px-2 py-0.5 bg-paper-100 border border-line rounded-sm text-charcoal-800 text-micro"
                            >
                              {barber.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-charcoal-400 text-micro italic">All stylists</span>
                        )}
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
