import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';
import { appRoutes } from './routes';

// These tests cover routing only; stub the pages so their heavy dependencies aren't loaded.
jest.mock('./pages/MainPage', () => () => null);
jest.mock('./pages/TextPage', () => () => null);
jest.mock('./pages/PdfPage', () => () => null);
jest.mock('./pages/ApiTester', () => () => null);
jest.mock('./pages/TaskBoard', () => () => null);
jest.mock('./pages/TransferPage', () => () => null);

let currentLocation = '';
function LocationProbe() {
  const location = useLocation();
  currentLocation = location.pathname + location.search;
  return null;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
      <LocationProbe />
    </MemoryRouter>
  );
}

test('renders a navigation link for every route', () => {
  renderAt('/');
  appRoutes.forEach(route => {
    expect(screen.getByRole('link', { name: route.label })).toHaveAttribute('href', route.path);
  });
});

test('marks only the current route as active', () => {
  renderAt('/');
  expect(screen.getByRole('link', { name: 'Main Page' })).toHaveClass('active');
  expect(screen.getByRole('link', { name: 'Transfer' })).not.toHaveClass('active');
});

test('redirects unknown paths to the home page', () => {
  renderAt('/does-not-exist');
  expect(currentLocation).toBe('/');
});

test('redirects legacy transfer QR links to the transfer page', async () => {
  // async act lets the lazily loaded transfer page settle before the test ends.
  await act(async () => {
    renderAt('/?transfer=ABC123');
  });
  expect(currentLocation).toBe('/transfer?code=ABC123');
});
