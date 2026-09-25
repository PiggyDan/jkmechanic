export const services = [
  {
    slug: 'vehicle-rental',
    accent: '01',
    title: 'Vehicle rental (Musso)',
    summary:
      'Rent a reliable Musso for work, travel, and everyday use without the hassle of a confusing process.',
    intro:
      'The Musso is a practical choice when you need more room, stronger road presence, and dependable everyday driving. We keep the rental process clear: choose your dates, confirm the vehicle, and get a simple, honest rental experience built around real use.',
    overview: [
      'Flexible daily and long-term rental',
      'Practical SUV for work and travel',
      'Straightforward and transparent process',
      'Vehicle checked before handover',
    ],
    points: [
      'Reliable SUV for work, group travel, and daily use',
      'Simple booking process with honest information',
      'Vehicle checked before handover and return',
      'Helpful support for rental dates and trip planning',
      'A better option when a smaller car is not enough',
      'Clear terms so you know what to expect',
    ],
    process: [
      {
        title: 'Choose your dates',
        description: 'Tell us when you need the vehicle and what kind of driving it will be used for.',
      },
      {
        title: 'Check the car',
        description: 'We confirm the condition, paperwork, and rental details before the keys are handed over.',
      },
      {
        title: 'Drive and return',
        description: 'Use it for your trip or work needs, then return it with a simple, clear process.',
      },
    ],
    formTitle: 'Book a Musso rental',
    formIntro: 'Tell us your dates and what you need the vehicle for.',
    formFields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+976 ...', required: true },
      {
        name: 'vehicleType',
        label: 'Vehicle type',
        type: 'select',
        placeholder: 'Choose vehicle type',
        required: true,
        options: ['Musso', 'SUV', 'Pickup truck', 'Sedan', 'Van', 'Truck', 'Other'],
      },{ name: 'fromDate', label: 'From', type: 'date', placeholder: 'Select start date', required: true },
      { name: 'toDate', label: 'To', type: 'date', placeholder: 'Select end date', required: true },
      { name: 'pickupTime', label: 'Pickup time', type: 'time', placeholder: 'Select pickup time', required: true },
      { name: 'purpose', label: 'Purpose of rental', type: 'text', placeholder: 'Work, trip, family, etc.', required: true },
      { name: 'pickup', label: 'Pickup location', type: 'text', placeholder: 'Ulaanbaatar or other', required: false },
      { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any important details...', required: false },
    ],
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'vehicle-repair-shop',
    accent: '02',
    title: 'Vehicle repair shop',
    summary:
      'A practical workshop service that checks the car, test drives it, and tells you exactly what needs to change.',
    intro:
      'This is where the real work starts. We check the car all over, drive it, test what is not right, and then explain what needs to be fixed first. The aim is to make the problem clear and avoid unnecessary guesswork or wasted money.',
    overview: [
      'Full vehicle inspection',
      'Test drive and road check',
      'Clear repair advice',
      'Honest recommendation list',
    ],
    points: [
      'Check the car all over',
      'Test drive the vehicle to understand the problem',
      'See what needs to change and what can wait',
      'Explain the issue in simple, honest language',
      'Recommend practical next steps before spending money',
      'Focus on reliability, safety, and daily use',
    ],
    process: [
      {
        title: 'Inspect the vehicle',
        description: 'We go through the condition, warning signs, and anything that looks worn or out of place.',
      },
      {
        title: 'Test drive',
        description: 'The road test helps confirm the real issue and how it behaves in normal driving.',
      },
      {
        title: 'Recommend the fix',
        description: 'We explain what needs to change first, what can wait, and what matters most for safety and reliability.',
      },
    ],
    formTitle: 'Book a repair check',
    // Shows the day/time picker; 'required' or 'optional'.
    appointment: 'required',
    formIntro: 'Tell us what vehicle you need checked and when you are available.',
    formFields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+976 ...', required: true },
      { name: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'Make, model, year', required: true },
      { name: 'issue', label: 'Problem or issue', type: 'text', placeholder: 'What is happening?', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Tell us more about the issue...', required: false },
    ],
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'buy-sell-car',
    accent: '03',
    title: 'Buy a car / Sell a car',
    summary:
      'Buying: a mechanic checks the car before you pay. Selling: an honest price, buyers found for you, and the paperwork handled.',
    intro:
      'Buying: Justin inspects and test-drives the cars you are considering and tells you what is wrong, what repairs would cost, and whether the price is fair. Selling: we check the car, agree a realistic asking price based on its condition and the Mongolian market, prepare it, find serious buyers, show the car by arrangement, and help with the sale documents and handover. The selling fee is a percentage of the final sale price, agreed before we start. Buying help is quoted per job.',
    overview: [
      'Pre-purchase inspection and test drive',
      'Honest valuation of your car',
      'Buyers found and viewings handled',
      'Paperwork and handover support',
    ],
    points: [
      'Engine, gearbox, suspension, brakes and diagnostic checks',
      'Signs of accident repair, rust or flood damage',
      'Price based on year, import year, mileage, condition and demand',
      'Listing, buyer calls and viewings handled for sellers',
      'Help with sale documents and ownership transfer',
      'Selling fee: a percentage of the final sale price',
    ],
    process: [
      { title: 'Tell us your goal', description: 'Buying or selling, the car, and your budget or price in mind.' },
      { title: 'Check the car', description: 'Justin inspects it as a mechanic and we look at what similar cars sell for.' },
      { title: 'Close the deal', description: 'Negotiate with facts, then finish paperwork and handover properly.' },
    ],
    formTitle: 'Tell us what you want to buy or sell',
    formIntro: 'Share details about the vehicle and the kind of help you need.',
    formFields: [],
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'other',
    accent: '04',
    title: 'Other',
    summary:
      'Support for other vehicle concerns, paperwork needs, and practical questions that do not fit neatly into one category.',
    intro:
      'If your issue is not a full repair, rental, or buy/sell job, we can still help. This category covers the extra questions and vehicle-related problems that need a real answer, honest advice, and practical next steps.',
    overview: [
      'General automotive support',
      'Vehicle and paperwork guidance',
      'Problem-solving and advice',
      'Fast answer to unusual cases',
    ],
    points: [
      'Help with vehicle questions that do not fit standard services',
      'Guidance on paperwork, ownership, and practical decisions',
      'Support for unusual or mixed vehicle problems',
      'Friendly advice when you are not sure where to begin',
      'A direct conversation before the wrong move is made',
      'Flexible help for real-world vehicle situations',
    ],
    process: [
      {
        title: 'Explain the situation',
        description: 'Tell us what the issue is and what you are trying to solve.',
      },
      {
        title: 'Review the practical options',
        description: 'We look at the vehicle issue, urgency, and the best next step based on reality.',
      },
      {
        title: 'Move forward with clarity',
        description: 'You leave with a clearer answer and a better plan than guessing alone.',
      },
    ],
    formTitle: 'Ask about your vehicle concern',
    appointment: 'optional',
    formIntro: 'Let us know what you need help with and when you are available.',
    formFields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+976 ...', required: true },
      {
        name: 'preferredLanguage',
        label: 'Preferred language',
        type: 'select',
        placeholder: 'Choose language',
        required: true,
        options: ['English', 'Mongolian', 'Chinese', 'Korean', 'Deutsch', 'Russian'],
      },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'What do you need help with?', required: true },
      { name: 'vehicle', label: 'Vehicle details', type: 'text', placeholder: 'Make, model, or year', required: false },
      { name: 'notes', label: 'Details', type: 'textarea', placeholder: 'Tell us more...', required: false },
    ],
    image:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  },
]
