import { Testimonial } from './types';

export const products = []; // Source of truth is now Supabase

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Verified Buyer',
    content: 'The personalized wallet exceeded my expectations. The quality of the leather is superb and the packaging was beautiful.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Gift Enthusiast',
    content: 'SS Creations makes finding the perfect gift so easy. The AI assistant suggested exactly what my sister wanted for her birthday!',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'Event Planner',
    content: 'I use SS Creations for all my corporate gifting needs. Reliable delivery and top-notch products every single time.',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    rating: 4
  }
];