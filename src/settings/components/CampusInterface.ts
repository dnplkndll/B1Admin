import { type CampusInterface as BaseCampusInterface } from "@churchapps/helpers";

// Temporary local extension; fields move to @churchapps/helpers when published.
export interface CampusInterface extends BaseCampusInterface {
  churchId?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  timezone?: string;
  website?: string;
  importKey?: string;
}
