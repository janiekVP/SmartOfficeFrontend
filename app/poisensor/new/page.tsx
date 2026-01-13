import CreatePOISensorForm from '@/features/poisensor/CreatePOISensorForm.client';

export default function NewPOISensorPage() {
  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Nieuwe sensor</h1>

      <CreatePOISensorForm />
    </section>
  );
}
