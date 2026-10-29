import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

// Shown when a page crashes or a route fails to load. Without it the person would see a blank screen.
export const RouteError = () => {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div role="alert">
      <h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p>
        {notFound
          ? 'This address does not exist.'
          : 'An unexpected error stopped this page. Please try again. If it keeps happening, tell us what you were doing.'}
      </p>
      <p>
        <button type="button" className="link-button" onClick={() => window.location.reload()}>
          Try again
        </button>
        {' · '}
        <Link to="/orders">Go to Orders</Link>
      </p>
    </div>
  );
};
