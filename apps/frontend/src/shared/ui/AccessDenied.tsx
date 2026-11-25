import React, { useId } from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied(): React.ReactElement {
  const titleId = useId();
  return (
    <section className="access-denied" role="alert" aria-labelledby={titleId}>
      <p className="access-denied__code">403</p>
      <h1 id={titleId}>Not authorized</h1>
      <p>You don’t have permission to view this page.</p>
      <Link className="access-denied__link" to="/main">
        Back to employees
      </Link>
    </section>
  );
}
