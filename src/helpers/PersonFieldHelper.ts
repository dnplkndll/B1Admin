import { DateHelper, Locale } from "@churchapps/apphelper";
import { type PersonFieldChoice, type PersonFieldInterface } from "./Interfaces";

export const parseFieldChoices = (raw: string | null | undefined): PersonFieldChoice[] | undefined => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

// Human-readable value for a person custom field: choice text for Multiple Choice,
// Yes/No for booleans, a short date for Date, the raw string otherwise.
export const formatFieldValue = (field: PersonFieldInterface, value: string | null | undefined): string => {
  if (!value) return "";
  switch (field.fieldType) {
    case "Yes/No":
      if (value === "True") return Locale.label("common.yes") || "Yes";
      if (value === "False") return Locale.label("common.no") || "No";
      return "";
    case "Multiple Choice": {
      const match = parseFieldChoices(field.choices)?.find((c) => c.value === value);
      return match?.text ?? value;
    }
    case "Date":
      try {
        const d = new Date(value);
        return DateHelper.getShortDate(new Date(d.getTime() + d.getTimezoneOffset() * 60000));
      } catch {
        return value;
      }
    default:
      return value;
  }
};
