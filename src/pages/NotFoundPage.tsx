import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { StateMessage } from "@/components/StateMessage";
import { usePageTitle } from "@/hooks/use-page-title";

export default function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <StateMessage title="That page doesn't exist" action={<Link to="/" className={buttonVariants()}>Back to the catalog</Link>}>
      Check the address, or head back to the catalog.
    </StateMessage>
  );
}
