
import { Testimonial } from './types';

export const products = []; // Source of truth is now Supabase

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Verified Buyer',
    content: 'The personalized wallet exceeded my expectations. The quality of the leather is superb and the packaging was beautiful.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Gift Enthusiast',
    content: 'SS Creations makes finding the perfect gift so easy. The AI assistant suggested exactly what my sister wanted for her birthday!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'Event Planner',
    content: 'I use SS Creations for all my corporate gifting needs. Reliable delivery and top-notch products every single time.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    rating: 4
  }
];
