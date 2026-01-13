'use client';

import { useRouter } from 'next/navigation';
import { deletePOI} from '@/lib/clients/poisClient';

type Props = {
  id: number;
};

export default function DeletePOIButton({ id }: Props) {
  const router = useRouter();

  const onDelete = async () => {
    const confirmed = window.confirm(
      'Weet je zeker dat je deze POI wilt verwijderen?'
    );

    if (!confirmed) return;

    try {
      await deletePOI(String(id));
      router.replace('/poi');
    } catch (e) {
      alert((e as Error).message ?? 'Verwijderen mislukt');
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      className="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
    >
      Verwijderen
    </button>
  );
}
