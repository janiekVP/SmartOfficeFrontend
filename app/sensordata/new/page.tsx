import CreateSensorDataForm from '@/features/sensordata/CreateSensorDataForm.client';

export default function NewSensorDataPage() {
  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Nieuwe sensor meting</h1>

      <CreateSensorDataForm />
    </section>
  );
}
