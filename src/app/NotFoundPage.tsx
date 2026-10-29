import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div>
    <h1>Page not found</h1>
    <p>This address does not exist. Check the link, or start again from the main page.</p>
    <p>
      <Link to="/orders">Go to Orders</Link>
    </p>
  </div>
);
