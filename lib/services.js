export const services = [
  {
    slug: 'repair-diagnostics',
    number: '01',
    title: 'Repair & diagnostics',
    short: 'Fault finding, servicing and practical mechanical repair for SUVs, 4x4s and everyday vehicles.',
    intro: 'We start with the symptom, test the vehicle properly, and explain what actually needs attention before parts are changed.',
    bullets: ['Engine and drivability diagnosis', 'Diesel SUV and 4x4 troubleshooting', 'Brake, suspension and steering work', 'Cooling, charging and starting systems', 'Routine service and maintenance'],
    photoIndex: 0,
  },
  {
    slug: 'pre-purchase-inspection',
    number: '02',
    title: 'Pre-purchase inspection',
    short: 'A proper second opinion before money changes hands.',
    intro: 'Buying a used vehicle in Mongolia can be difficult to judge from photos and a short test drive. We inspect the condition, road-test it and tell you where the risk is.',
    bullets: ['Mechanical condition check', 'Road test', 'Warning lights and diagnostics', 'Visible accident or repair concerns', 'Practical repair-cost discussion'],
    photoIndex: 1,
  },
  {
    slug: 'vehicle-sourcing',
    number: '03',
    title: 'Find & source a vehicle',
    short: 'Tell us the vehicle, budget and use. We help narrow down the right cars and inspect the promising ones.',
    intro: 'Instead of sending random listings, we use real-world experience to shortlist vehicles worth your time and check them before you commit.',
    bullets: ['Vehicle search and shortlist', 'Seller communication', 'Condition assessment', 'Pre-purchase check', 'Practical advice for Mongolia use'],
    photoIndex: 2,
  },
  {
    slug: 'buy-sell-consignment',
    number: '04',
    title: 'Buy, sell & consignment',
    short: 'Support from preparing the vehicle through showing it to serious buyers.',
    intro: 'If you do not want to spend your week answering calls, arranging viewings and explaining the car, JK Mongolia can manage the process with you.',
    bullets: ['Vehicle preparation', 'Condition review', 'Listing and buyer enquiries', 'Viewings by arrangement', 'Consignment-sale support'],
    photoIndex: 3,
  },
  {
    slug: 'parts-sourcing',
    number: '05',
    title: 'Parts sourcing',
    short: 'New or used parts sourced around the actual vehicle and problem, not guesswork.',
    intro: 'Give us the VIN, part number or the problem you are trying to solve. We help identify and source a sensible option.',
    bullets: ['VIN and part-number matching', 'New and used parts', 'Hard-to-find component sourcing', 'Compatibility checks', 'Repair + parts coordination'],
    photoIndex: 4,
  },
  {
    slug: 'paperwork-export',
    number: '06',
    title: 'Paperwork & export support',
    short: 'Practical help with vehicle sale paperwork, transfer steps and export preparation.',
    intro: 'For customers who are busy, overseas or simply unfamiliar with the process, we can help coordinate the vehicle side of the paperwork.',
    bullets: ['Sale-document preparation support', 'Ownership-transfer guidance', 'Export preparation', 'Vehicle handover coordination', 'Storage by prior arrangement'],
    photoIndex: 5,
  },
  {
    slug: 'musso-rental',
    number: '07',
    title: 'Musso rental',
    short: 'A focused 4x4 rental choice maintained by our own workshop.',
    intro: 'We keep the rental fleet simple: Musso. Tough, straightforward vehicles that suit work and travel without unnecessary complexity.',
    bullets: ['Musso 4x4 rental', 'Workshop-maintained vehicles', 'Short and longer arrangements', 'Practical Mongolia use', 'Availability by request'],
    photoIndex: 6,
  },
  {
    slug: 'road-test-condition-check',
    number: '08',
    title: 'Road test & condition check',
    short: 'A second opinion when something feels wrong but the problem is not obvious.',
    intro: 'Noise, vibration, shifting, braking or steering issues often need a drive with someone experienced before parts are ordered.',
    bullets: ['Road-test assessment', 'Noise and vibration checks', 'Transmission behaviour', 'Steering and brake feel', 'Recommended next diagnostic step'],
    photoIndex: 7,
  }
];

export function getService(slug) {
  return services.find((s) => s.slug === slug);
}
