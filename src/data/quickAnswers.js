// Fixed replies for the chat's suggestion buttons. They answer instantly without the AI,
// so they work even when no Anthropic key is set. Links use the chat's Markdown link format.
import { MAPS_URL } from './googleBusiness.js'
import { HOURS_TEXT } from './schedule.js'

export const quickAnswers = [
  {
    question: 'When are you open?',
    answer: `We're open ${HOURS_TEXT} (closed on weekends). You can [book a time](/services/vehicle-repair-shop#booking) online, or call [+976 8885 6529](tel:+97688856529).`,
  },
  {
    question: 'Where is the garage?',
    answer: `Garage 84 is in Gachuurt, just outside Ulaanbaatar: BZD 20 Khoroo, 10 ail 1-7 toot (plus code W5H4+JV). [Open in Google Maps](${MAPS_URL}) for directions.`,
  },
  {
    question: 'Can you import parts?',
    answer: 'Yes. If a part is not available in Mongolia, Justin can import it for you. Send your vehicle details and the part you need through the [general request form](/#contact), or call [+976 8885 6529](tel:+97688856529).',
  },
  {
    question: 'I want to book a repair',
    answer: 'Great! Pick a day and time in the [repair booking form](/services/vehicle-repair-shop#booking). Justin will call you to confirm.',
  },
]

export const findQuickAnswer = (text) => quickAnswers.find((item) => item.question === text.trim())?.answer
