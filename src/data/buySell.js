// Buy / sell content shared by the website page and the mobile app.
// `icon` values are Lucide icon names; each app maps them to its own icon components.

// Selling commission shown on the page, e.g. '5%'. Leave null to say it is agreed per car.
export const SELL_COMMISSION = null

export const reasons = [
  { icon: 'Wrench', title: 'A mechanic looks at the car', text: 'Justin checks the vehicle the way a workshop does, not the way a seller describes it. Problems show up before money changes hands.' },
  { icon: 'HandCoins', title: 'Honest prices', text: 'Prices are based on the real condition of the car and what similar cars sell for in Mongolia, not on hope or pressure.' },
  { icon: 'CalendarRange', title: 'Your time saved', text: 'Calls, viewings, test drives and back-and-forth with strangers: we handle the tiring parts for you.' },
  { icon: 'FileText', title: 'Paperwork and handover', text: 'Help with sale documents, ownership transfer steps and a clean handover, so the deal finishes properly.' },
]

export const buyChecks = [
  'Engine, gearbox and drivetrain',
  'Suspension, steering and brakes',
  'Warning lights and diagnostic scan',
  'Signs of accident repair, rust or flood damage',
  'A proper test drive, cold start included',
  'Documents and VIN match the car',
]

export const buySteps = [
  { title: 'Tell us what you need', text: 'Type of car, budget, and how you will use it: city, countryside, work or travel.' },
  { title: 'We shortlist and check', text: 'Send us listings you like, or we look for you. Promising cars get inspected and test-driven.' },
  { title: 'You get a straight answer', text: 'What is good, what is wrong, what repairs would cost, and whether the price is fair.' },
  { title: 'Buy with confidence', text: 'Negotiate with facts, then finish the paperwork and handover without surprises.' },
]

export const sellSteps = [
  { icon: 'ClipboardCheck', title: 'Check and value', text: 'Justin inspects the car and we agree a realistic asking price together.' },
  { icon: 'Sparkles', title: 'Prepare the car', text: 'Small fixes and a proper clean often pay for themselves in a faster, better sale.' },
  { icon: 'Megaphone', title: 'Find buyers', text: 'We list the car, answer the calls and show it to serious buyers by arrangement.' },
  { icon: 'Handshake', title: 'Close the deal', text: 'Negotiation, sale documents and handover, handled with you step by step.' },
]

export const priceFactors = [
  { icon: 'CalendarRange', title: 'Manufacture year', text: 'Newer cars hold more value, but only if the condition matches the age.' },
  { icon: 'FileText', title: 'Import year', text: 'In Mongolia, buyers look closely at when the car was imported and how long it has been used here.' },
  { icon: 'Gauge', title: 'Mileage', text: 'High mileage lowers the price, and a mileage that does not match the wear lowers trust.' },
  { icon: 'Wrench', title: 'Mechanical condition', text: 'Engine, gearbox, suspension and anything a buyer would have to fix soon.' },
  { icon: 'ShieldCheck', title: 'Body and accident history', text: 'Paintwork, panel gaps, rust and any signs of past repairs.' },
  { icon: 'BadgeCheck', title: 'Service history and papers', text: 'Records, receipts and clean documents make buyers pay more and decide faster.' },
  { icon: 'TrendingUp', title: 'Demand for the model', text: 'Popular models with easy parts and good cold-weather reputations sell faster.' },
  { icon: 'Search', title: 'What similar cars sell for', text: 'We compare with real listings for the same model, year and condition.' },
]

export const buyFields = [
  { name: 'lookingFor', label: 'What kind of car?', placeholder: 'e.g. Toyota Land Cruiser, SUV, pickup', required: true },
  { name: 'budget', label: 'Budget', type: 'money', required: true },
  { name: 'use', label: 'How will you use it?', placeholder: 'City, countryside, work, travel…' },
  { name: 'when', label: 'When do you need it?', placeholder: 'e.g. within a month' },
]

export const sellFields = [
  { name: 'makeModel', label: 'Make and model', placeholder: 'e.g. Toyota Prius 30', required: true },
  { name: 'manufacturedYear', label: 'Manufacture year', placeholder: 'e.g. 2015', required: true, inputMode: 'numeric' },
  { name: 'importedYear', label: 'Import year', placeholder: 'e.g. 2019', inputMode: 'numeric' },
  { name: 'mileage', label: 'Mileage (km)', placeholder: 'e.g. 145,000', inputMode: 'numeric' },
  { name: 'askingPrice', label: 'Price you have in mind', type: 'money' },
  { name: 'negotiable', label: 'Negotiable?', type: 'select', options: ['Yes', 'No', 'Not sure'] },
]
