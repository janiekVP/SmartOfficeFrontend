'use client';

import FloorplanPOICrud from '@/lib/components/ui/FloorplanPOICrud.client';

export default function FloorplanPageClient({ floorplanId, imageUrl }: { floorplanId: number; imageUrl: string }) {
  return <FloorplanPOICrud floorplanId={floorplanId} imageUrl={imageUrl}/>;
}
