import React from 'react';
import { Trip, Participant, ItineraryItem, GearItem, EmergencyContact } from '@/types';
import { format } from 'date-fns';

interface PrintableTripReportProps {
  trip: Trip;
  participants: Participant[];
  itinerary: ItineraryItem[];
  gearItems: GearItem[];
  emergencyContacts: EmergencyContact[];
}

const PrintableTripReport = React.forwardRef<HTMLDivElement, PrintableTripReportProps>(
  ({ trip, participants, itinerary, gearItems, emergencyContacts }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black font-sans">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{trip.title}</h1>
          <p className="text-lg text-gray-600">
            {format(trip.startDate, 'PPP')} - {format(trip.endDate, 'PPP')}
          </p>
          <p className="text-lg text-gray-600">{trip.location}</p>
        </div>

        {/* Participants */}
        <section className="mb-6 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Participants ({participants.length})</h2>
          <ul className="list-disc list-inside columns-2">
            {participants.map(p => <li key={p.id} className="mb-1">{p.name}</li>)}
          </ul>
        </section>

        {/* Itinerary */}
        <section className="mb-6 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Itinerary</h2>
          {itinerary.map(item => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              <h3 className="text-xl font-semibold">Day {item.day}: {item.location || 'N/A'}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.activity || 'No activities planned.'}</p>
            </div>
          ))}
        </section>

        {/* Gear Checklist */}
        <section className="mb-6 page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Gear Checklist ({gearItems.length})</h2>
          <div className="columns-2">
            {gearItems.map(item => (
              <div key={item.id} className="flex items-center mb-1 break-inside-avoid">
                <span className={`mr-2 font-bold ${item.status === 'Packed' ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.status === 'Packed' ? '✓' : '☐'}
                </span>
                <span>{item.name} {item.assigned_to && item.assigned_to !== 'unassigned' ? `(${item.assigned_to})` : ''}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="page-break-before">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Emergency Contacts</h2>
          {emergencyContacts.map(contact => (
            <div key={contact.id} className="mb-3 break-inside-avoid">
              <p className="font-semibold">{contact.name} ({contact.type})</p>
              <p className="text-gray-700">{contact.contact_number}</p>
            </div>
          ))}
        </section>
      </div>
    );
  }
);

export default PrintableTripReport;