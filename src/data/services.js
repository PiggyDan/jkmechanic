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
    formIntro: 'Tell us what vehicle you need checked and when you are available.',
    formFields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+976 ...', required: true },
      { name: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'Make, model, year', required: true },
      { name: 'issue', label: 'Problem or issue', type: 'text', placeholder: 'What is happening?', required: true },
      { name: 'time', label: 'Preferred time', type: 'text', placeholder: 'Date or time', required: true },
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
      'Simple guidance for buying and selling cars, with honest advice on what is easy, what is hard, and what matters most.',
    intro:
      'Buying or selling a vehicle can be easy if you know what to check and what to expect. It can also become difficult fast if the condition is unclear, the price is wrong, or the paperwork is not organized. We help make both sides clearer and more practical.',
    overview: [
      'Buying guidance and value checks',
      'Selling support and honest pricing',
      'Paperwork and decision support',
      'Clear process from start to finish',
    ],
    points: [
      'How to buy a car without rushing the decision',
      'How to sell a car with honest positioning and value',
      'What is easy and what is difficult in each process',
      'Advice on condition, price, and buyer confidence',
      'Support with paperwork and next-step planning',
      'Practical guidance for real Mongolian market conditions',
    ],
    process: [
      {
        title: 'Explain your goal',
        description: 'We start by understanding whether you want to buy, sell, or both.',
      },
      {
        title: 'Check the value and condition',
        description: 'We review the vehicle, market value, and the practical realities of the deal.',
      },
      {
        title: 'Guide the next move',
        description: 'You get a realistic plan for how to buy or sell without unnecessary stress or surprises.',
      },
    ],
    formTitle: 'Tell us what you want to buy or sell',
    formIntro: 'Share details about the vehicle and the kind of help you need.',
    formFields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+976 ...', required: true },
      {
        name: 'goal',
        label: 'I want to',
        type: 'select',
        placeholder: 'Choose an option',
        required: true,
        options: ['Buy a car', 'Sell a car'],
      },
      { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Anything important to know...', required: false },
    ],
    image:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
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
      { name: 'time', label: 'Preferred time', type: 'text', placeholder: 'Any date or time', required: false },
      { name: 'notes', label: 'Details', type: 'textarea', placeholder: 'Tell us more...', required: false },
    ],
    image:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  },
]
