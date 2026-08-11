import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status">
      <Spinner size="lg" label="Loading page" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
