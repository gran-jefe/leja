import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream flex items-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-5xl font-bold text-navy mb-6">
            Rent with confidence. No agent required.
          </h1>
          <p className="font-body text-xl text-muted mb-8 max-w-2xl mx-auto">
            Leja cuts out informal agents and brings structure to Nigeria's rental market.
            Create agreements, manage payments, and build your rental history—all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Sign up as Landlord
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="lg">
                Sign up as Tenant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
