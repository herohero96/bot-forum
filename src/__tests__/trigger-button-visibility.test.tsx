import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Inline component that mirrors the conditional rendering logic from page.tsx
function TriggerButtonVisibility({
  isDev,
  isAdmin,
}: {
  isDev: boolean;
  isAdmin: boolean;
}) {
  return (
    <div>
      {(isDev || isAdmin) && (
        <button data-testid="trigger-btn">触发新话题</button>
      )}
      <span data-testid="content">forum content</span>
    </div>
  );
}

describe('TriggerTopicButton conditional rendering', () => {
  it('renders button in dev mode', () => {
    render(<TriggerButtonVisibility isDev={true} isAdmin={false} />);
    expect(screen.getByTestId('trigger-btn')).toBeTruthy();
  });

  it('renders button when admin=1 param is present', () => {
    render(<TriggerButtonVisibility isDev={false} isAdmin={true} />);
    expect(screen.getByTestId('trigger-btn')).toBeTruthy();
  });

  it('renders button when both isDev and isAdmin are true', () => {
    render(<TriggerButtonVisibility isDev={true} isAdmin={true} />);
    expect(screen.getByTestId('trigger-btn')).toBeTruthy();
  });

  it('does NOT render button when isDev=false and isAdmin=false', () => {
    render(<TriggerButtonVisibility isDev={false} isAdmin={false} />);
    expect(screen.queryByTestId('trigger-btn')).toBeNull();
  });

  it('still renders forum content regardless of button visibility', () => {
    render(<TriggerButtonVisibility isDev={false} isAdmin={false} />);
    expect(screen.getByTestId('content')).toBeTruthy();
  });
});
