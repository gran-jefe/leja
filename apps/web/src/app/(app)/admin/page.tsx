'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminGate } from '@/components/admin/AdminGate';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ListRow } from '@/components/ui/ListRow';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Users,
  Building2,
  FileText,
  ShieldCheck,
  Wallet,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import api from '@/lib/api';
import { formatNaira, getErrorMessage } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalProperties: number;
  activeAgreements: number;
  draftAgreements: number;
  pendingProviders: number;
  activeProviders: number;
  successfulPayments: number;
  totalRevenue: number;
}

function OverviewContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load admin stats'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const quickLinks = [
    { href: '/admin/providers', label: 'Verify providers & onboard staff', icon: ShieldCheck },
    { href: '/admin/users', label: 'Browse users', icon: Users },
    { href: '/admin/agreements', label: 'Browse agreements', icon: FileText },
    { href: '/admin/payments', label: 'Browse payments', icon: Wallet },
  ];

  return (
    <div className="max-w-wide mx-auto space-y-6">
      <PageHeader title="Admin overview" icon={LayoutDashboard} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
            <StatCard label="Landlords" value={stats.totalLandlords} icon={Users} />
            <StatCard label="Tenants" value={stats.totalTenants} icon={Users} />
            <StatCard label="Properties listed" value={stats.totalProperties} icon={Building2} />
            <StatCard label="Active agreements" value={stats.activeAgreements} icon={FileText} />
            <StatCard label="Draft agreements" value={stats.draftAgreements} icon={FileText} />
            <StatCard label="Pending providers" value={stats.pendingProviders} icon={ShieldCheck} />
            <StatCard label="Active providers" value={stats.activeProviders} icon={ShieldCheck} />
          </div>

          <Card tone="dark" className="grain-overlay">
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-label uppercase text-on-dark-muted mb-2">
                  Total platform revenue
                </p>
                <p className="font-mono tabular-nums text-display-md font-medium text-brass-500">
                  {formatNaira(stats.totalRevenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-label uppercase text-on-dark-muted mb-2">
                  Successful payments
                </p>
                <p className="font-mono tabular-nums text-display-sm text-on-dark">
                  {stats.successfulPayments}
                </p>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="font-display text-title font-semibold text-navy-900 mb-3">Quick links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <ListRow key={href} href={href} icon={Icon} iconTone="brass" title={label} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <AdminGate>
      <OverviewContent />
    </AdminGate>
  );
}
