import { Button } from './Button';

type PagerProps = {
  page: number; // zero based, as the services use it
  totalPages: number;
  onPage: (page: number) => void;
};

export const Pager = ({ page, totalPages, onPage }: PagerProps) => {
  if (totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pages">
      <Button variant="secondary" disabled={page <= 0} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </nav>
  );
};
