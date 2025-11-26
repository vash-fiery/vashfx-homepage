import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the App component', () => {
    render(<App />);
    expect(screen.getByText('Vite + React + Hono + Cloudflare')).toBeInTheDocument();
  });

  it('increments the count when the button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(button);
    expect(button).toHaveTextContent('count is 1');
  });
});
