'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const FloorplanMap = dynamic(() => import('@/lib/FloorplanMap'), { ssr: false });

export default function Page() {
  const [selectedPOI, setSelectedPOI] = useState<null | {
    title: string;
    desc: string;
    status: string;
    type: string;
    battery: string,
    temp: string,
    noise: string,
    light: string,
    humidity: string,
    co2: string,
    lastComDate: string,
  }>(null);

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-sky-900 pb-8">
        <header className="text-white p-4 flex items-center max-w-7xl mx-auto">
          <button className="mr-4 text-xl">←</button>
          <h1 className="text-lg font-semibold">View Floor Plans</h1>
        </header>

        {/* Search & Filters */}
        <section className="bg-white shadow p-4 rounded-lg max-w-7xl mx-auto mt-4 flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Search room name"
            className="border rounded px-4 py-2 w-full md:w-1/3"
          />
          <select className="border rounded px-4 py-2">
            <option>Floor 3</option>
            <option>Floor 2</option>
          </select>
        </section>
      </div>

      {/* Map and Info */}
      <section className="flex-1 pt-4 max-w-7xl mx-auto w-full px-4 md:px-0">
        <div className="bg-white shadow rounded-lg p-4 h-[780px] flex flex-col md:flex-row gap-4">
          <aside className="md:w-72 w-full md:flex-none overflow-auto border rounded-lg p-4 bg-gray-50/70">
            {selectedPOI ? (
              <div>
                <h2 className="text-xl font-semibold">{selectedPOI.title}</h2>
                <p className="mt-1">{selectedPOI.desc}</p>
                <p className="mt-2">
                  Status:{' '}
                  <span
                    className={`font-bold ${
                      selectedPOI.status === 'available' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {selectedPOI.status}
                  </span>
                </p>
                <p className="mt-1">Battery: {selectedPOI.battery} %</p>
                <p className="mt-1">Temperature: {selectedPOI.temp} °C</p>
                <p className="mt-1">Noise: {selectedPOI.noise} dB</p>
                <p className="mt-1">Light: {selectedPOI.light} lx</p>
                <p className="mt-1">Humidity: {selectedPOI.humidity} %</p>
                <p className="mt-1">CO2: {selectedPOI.co2} ppm</p>
                <p className="mt-1">Last Communication Date: {selectedPOI.lastComDate}</p>
              </div>
            ) : (
              <p className="text-gray-500">Click a point on the map to see details</p>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            <div className="h-full w-full">
              <FloorplanMap onPOIClick={setSelectedPOI} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
