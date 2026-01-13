'use client';

import FloorplanPOICrud from '@/lib/components/ui/FloorplanPOICrud.client';

export default function FloorplanPageClient({ floorplanId }: { floorplanId: number }) {
  return <FloorplanPOICrud floorplanId={floorplanId} />;
}
