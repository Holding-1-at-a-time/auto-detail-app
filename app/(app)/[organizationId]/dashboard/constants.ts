export const ASSESSMENT_STATUSES = [
  "pending",
  "reviewed",
  "complete",
] as const;

export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export type TableHeader = {
  label: string;
  className?: string;
};

export const ASSESSMENT_TABLE_HEADERS: TableHeader[] = [
  { label: "Client", className: "w-[250px]" },
  { label: "Vehicle" },
  { label: "Status" },
  { label: "Date" },
  { label: "Actions", className: "text-right" },
];
