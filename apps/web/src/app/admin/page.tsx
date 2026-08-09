'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { AdminGate } from '@/components/admin/AdminGate';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Users, Building2, FileText, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
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

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted font-body">{label}</p>
          <p className="font-display text-2xl font-bold text-navy">{value}</p>
        </div>
        <Icon size={22} className="text-forest" />
      </div>
    </Card>
  );
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
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Admin overview</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
            <StatCard label="Landlords" value={stats.totalLandlords} icon={Users} />
            <StatCard label="Tenants" value={stats.totalTenants} icon={Users} />
            <StatCard label="Properties listed" value={stats.totalProperties} icon={Building2} />
            <StatCard label="Active agreements" value={stats.activeAgreements} icon={FileText} />
            <StatCard label="Draft agreements" value={stats.draftAgreements} icon={FileText} />
            <StatCard label="Pending providers" value={stats.pendingProviders} icon={ShieldCheck} />
            <StatCard label="Active providers" value={stats.activeProviders} icon={ShieldCheck} />
          </div>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted font-body">Total platform revenue</p>
                <p className="font-display text-3xl font-bold text-forest">
                  {formatNaira(stats.totalRevenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted font-body">Successful payments</p>
                <p className="font-display text-xl font-semibold text-navy">
                  {stats.successfulPayments}
                </p>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="font-display text-lg font-semibold text-navy mb-3">Quick links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-forest" />
                        <span className="font-body text-sm font-semibold text-charcoal">{label}</span>
                      </div>
                      <ArrowRight size={16} className="text-muted" />
                    </div>
                  </Card>
                </Link>
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
    <ProtectedPageWrapper>
      <DashboardShell>
        <AdminGate>
          <OverviewContent />
        </AdminGate>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
